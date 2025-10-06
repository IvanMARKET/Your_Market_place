import store from 'app/store';
import { renderModal, showToast } from 'app/utils';
import { canWrite } from 'app/auth';

let products = [];
const hasWriteAccess = canWrite('stock');

function renderStockTable(container) {
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock Actual</th>
                    ${hasWriteAccess ? '<th>Acciones</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${products.map(p => `
                    <tr class="${p.stock < 10 ? 'low-stock-warning' : ''}">
                        <td>${p.name}</td>
                        <td>${p.category}</td>
                        <td>${p.stock}</td>
                        ${hasWriteAccess ? `
                        <td class="actions-cell">
                            <button class="btn btn-success btn-sm adjust-stock-btn" data-id="${p.id}"><i class="fas fa-plus-minus"></i> Ajustar Stock</button>
                        </td>
                        ` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <style>.low-stock-warning { background-color: #fcf8e3; }</style>
    `;

    if (hasWriteAccess) {
        container.querySelectorAll('.adjust-stock-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handleAdjustStock(e.currentTarget.dataset.id));
        });
    }
}

function handleAdjustStock(productId) {
    const product = store.getItemById('products', productId);
    const { closeModal } = renderModal({
        title: `Ajustar Stock de ${product.name}`,
        content: `
            <p>Stock actual: <strong>${product.stock}</strong></p>
            <form id="stock-form">
                <div class="form-group">
                    <label for="adjustment">Cantidad a añadir (usar negativo para restar)</label>
                    <input type="number" id="adjustment" name="adjustment" class="form-control" value="0" required>
                </div>
            </form>
        `,
        footerButtons: [
            { id: 'cancel-btn', text: 'Cancelar', class: 'btn-secondary' },
            { id: 'save-btn', text: 'Guardar Ajuste', class: 'btn-primary' },
        ]
    });

    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('save-btn').addEventListener('click', () => {
        const adjustment = parseInt(document.getElementById('adjustment').value, 10);
        if (!isNaN(adjustment)) {
            store.updateStock(productId, adjustment);
            showToast('Stock actualizado con éxito');
            closeModal();
            refreshDataAndRender();
        } else {
            showToast('Por favor, introduce un número válido', 'error');
        }
    });
}

let mainContainer;
function refreshDataAndRender() {
    products = store.getItems('products');
    render(mainContainer);
}

export function render(container) {
    mainContainer = container;
    products = store.getItems('products');
    
    container.innerHTML = `
        <div class="page-header">
            <h2>Gestión de Stock</h2>
        </div>
        <div class="card" id="stock-list">
        </div>
    `;

    renderStockTable(document.getElementById('stock-list'));
}
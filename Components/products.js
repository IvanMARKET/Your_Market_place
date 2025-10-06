import store from 'app/store';
import { renderModal, formatCurrency, showToast } from 'app/utils';
import { canWrite } from 'app/auth';

let products = [];
let suppliers = [];
const hasWriteAccess = canWrite('products');

function renderProductTable(container) {
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Proveedor</th>
                    ${hasWriteAccess ? '<th>Acciones</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${products.map(p => `
                    <tr>
                        <td>${p.name}</td>
                        <td>${p.category}</td>
                        <td>${formatCurrency(p.price)}</td>
                        <td>${p.stock}</td>
                        <td>${store.getItemById('suppliers', p.supplierId)?.name || 'N/A'}</td>
                        ${hasWriteAccess ? `
                        <td class="actions-cell">
                            <button class="edit-btn" data-id="${p.id}"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" data-id="${p.id}"><i class="fas fa-trash"></i></button>
                        </td>
                        ` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    container.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => handleEdit(e.currentTarget.dataset.id)));
    container.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => handleDelete(e.currentTarget.dataset.id)));
}

function renderProductForm(product = {}) {
    return `
        <form id="product-form">
            <input type="hidden" name="id" value="${product.id || ''}">
            <div class="form-group">
                <label for="name">Nombre del Producto</label>
                <input type="text" id="name" name="name" class="form-control" value="${product.name || ''}" required>
            </div>
            <div class="form-group">
                <label for="category">Categoría</label>
                <input type="text" id="category" name="category" class="form-control" value="${product.category || ''}" required>
            </div>
            <div class="form-group">
                <label for="price">Precio (XAF)</label>
                <input type="number" id="price" name="price" class="form-control" step="1" value="${product.price || ''}" required>
            </div>
            <div class="form-group">
                <label for="stock">Stock Inicial</label>
                <input type="number" id="stock" name="stock" class="form-control" value="${product.stock || ''}" required ${product.id ? 'disabled' : ''}>
            </div>
            <div class="form-group">
                <label for="supplierId">Proveedor</label>
                <select id="supplierId" name="supplierId" class="form-control" required>
                    <option value="">Seleccione un proveedor</option>
                    ${suppliers.map(s => `<option value="${s.id}" ${product.supplierId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                </select>
            </div>
        </form>
    `;
}

function handleSave(form, closeModal) {
    const formData = new FormData(form);
    const product = {
        id: formData.get('id'),
        name: formData.get('name'),
        category: formData.get('category'),
        price: parseFloat(formData.get('price')),
        supplierId: formData.get('supplierId'),
    };
    
    if (product.id) {
        store.updateItem('products', product);
        showToast('Producto actualizado con éxito');
    } else {
        product.stock = parseInt(formData.get('stock'));
        store.addItem('products', product);
        showToast('Producto añadido con éxito');
    }
    
    closeModal();
    refreshDataAndRender();
}

function handleAdd() {
    const { closeModal } = renderModal({
        title: 'Añadir Producto',
        content: renderProductForm(),
        footerButtons: [
            { id: 'cancel-btn', text: 'Cancelar', class: 'btn-secondary' },
            { id: 'save-btn', text: 'Guardar', class: 'btn-primary' },
        ],
    });

    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('save-btn').addEventListener('click', () => {
        const form = document.getElementById('product-form');
        if (form.checkValidity()) {
            handleSave(form, closeModal);
        } else {
            form.reportValidity();
        }
    });
}

function handleEdit(id) {
    const product = store.getItemById('products', id);
    const { closeModal } = renderModal({
        title: 'Editar Producto',
        content: renderProductForm(product),
        footerButtons: [
            { id: 'cancel-btn', text: 'Cancelar', class: 'btn-secondary' },
            { id: 'save-btn', text: 'Guardar Cambios', class: 'btn-primary' },
        ],
    });

    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('save-btn').addEventListener('click', () => {
        const form = document.getElementById('product-form');
         if (form.checkValidity()) {
            handleSave(form, closeModal);
        } else {
            form.reportValidity();
        }
    });
}

function handleDelete(id) {
    const product = store.getItemById('products', id);
    const { closeModal } = renderModal({
        title: 'Confirmar Eliminación',
        content: `<p>¿Estás seguro de que quieres eliminar el producto "<strong>${product.name}</strong>"? Esta acción no se puede deshacer.</p>`,
        footerButtons: [
            { id: 'cancel-delete-btn', text: 'Cancelar', class: 'btn-secondary' },
            { id: 'confirm-delete-btn', text: 'Eliminar', class: 'btn-danger' },
        ],
    });
    document.getElementById('cancel-delete-btn').addEventListener('click', closeModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', () => {
        store.deleteItem('products', id);
        showToast('Producto eliminado', 'error');
        closeModal();
        refreshDataAndRender();
    });
}

let mainContainer;
function refreshDataAndRender() {
    products = store.getItems('products');
    suppliers = store.getItems('suppliers');
    render(mainContainer);
}


export function render(container) {
    mainContainer = container;
    products = store.getItems('products');
    suppliers = store.getItems('suppliers');
    
    container.innerHTML = `
        <div class="page-header">
            <h2>Gestión de Productos</h2>
            ${hasWriteAccess ? '<button class="btn btn-primary" id="add-product-btn"><i class="fas fa-plus"></i> Añadir Producto</button>' : ''}
        </div>
        <div class="card" id="product-list">
            <!-- La tabla de productos se renderizará aquí -->
        </div>
    `;

    renderProductTable(document.getElementById('product-list'));
    if (hasWriteAccess) {
        document.getElementById('add-product-btn').addEventListener('click', handleAdd);
    }
}
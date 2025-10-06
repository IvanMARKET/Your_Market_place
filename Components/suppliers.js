import store from 'app/store';
import { renderModal, showToast } from 'app/utils';
import { canWrite } from 'app/auth';

let suppliers = [];
const hasWriteAccess = canWrite('suppliers');

function renderSupplierTable(container) {
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nombre Proveedor</th>
                    <th>Contacto</th>
                    <th>Teléfono</th>
                    ${hasWriteAccess ? '<th>Acciones</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${suppliers.map(s => `
                    <tr>
                        <td>${s.name}</td>
                        <td>${s.contact}</td>
                        <td>${s.phone}</td>
                        ${hasWriteAccess ? `
                        <td class="actions-cell">
                            <button class="edit-btn" data-id="${s.id}"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" data-id="${s.id}"><i class="fas fa-trash"></i></button>
                        </td>
                        ` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    if(hasWriteAccess) {
        container.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => handleEdit(e.currentTarget.dataset.id)));
        container.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => handleDelete(e.currentTarget.dataset.id)));
    }
}

function renderSupplierForm(supplier = {}) {
    return `
        <form id="supplier-form">
            <input type="hidden" name="id" value="${supplier.id || ''}">
            <div class="form-group">
                <label for="name">Nombre del Proveedor</label>
                <input type="text" id="name" name="name" class="form-control" value="${supplier.name || ''}" required>
            </div>
            <div class="form-group">
                <label for="contact">Persona de Contacto</label>
                <input type="text" id="contact" name="contact" class="form-control" value="${supplier.contact || ''}">
            </div>
            <div class="form-group">
                <label for="phone">Teléfono</label>
                <input type="tel" id="phone" name="phone" class="form-control" value="${supplier.phone || ''}" required>
            </div>
        </form>
    `;
}

function handleSave(form, closeModal) {
    const formData = new FormData(form);
    const supplier = {
        id: formData.get('id'),
        name: formData.get('name'),
        contact: formData.get('contact'),
        phone: formData.get('phone'),
    };
    
    if (supplier.id) {
        store.updateItem('suppliers', supplier);
        showToast('Proveedor actualizado con éxito');
    } else {
        store.addItem('suppliers', supplier);
        showToast('Proveedor añadido con éxito');
    }
    
    closeModal();
    refreshDataAndRender();
}

function handleAdd() {
    const { closeModal } = renderModal({
        title: 'Añadir Proveedor',
        content: renderSupplierForm(),
        footerButtons: [
            { id: 'cancel-btn', text: 'Cancelar', class: 'btn-secondary' },
            { id: 'save-btn', text: 'Guardar', class: 'btn-primary' },
        ],
    });

    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('save-btn').addEventListener('click', () => {
        const form = document.getElementById('supplier-form');
        if (form.checkValidity()) {
            handleSave(form, closeModal);
        } else {
            form.reportValidity();
        }
    });
}

function handleEdit(id) {
    const supplier = store.getItemById('suppliers', id);
    const { closeModal } = renderModal({
        title: 'Editar Proveedor',
        content: renderSupplierForm(supplier),
        footerButtons: [
            { id: 'cancel-btn', text: 'Cancelar', class: 'btn-secondary' },
            { id: 'save-btn', text: 'Guardar Cambios', class: 'btn-primary' },
        ],
    });

    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('save-btn').addEventListener('click', () => {
        const form = document.getElementById('supplier-form');
        if (form.checkValidity()) {
            handleSave(form, closeModal);
        } else {
            form.reportValidity();
        }
    });
}

function handleDelete(id) {
    const supplier = store.getItemById('suppliers', id);
    const { closeModal } = renderModal({
        title: 'Confirmar Eliminación',
        content: `<p>¿Estás seguro de que quieres eliminar al proveedor "<strong>${supplier.name}</strong>"?</p>`,
        footerButtons: [
            { id: 'cancel-delete-btn', text: 'Cancelar', class: 'btn-secondary' },
            { id: 'confirm-delete-btn', text: 'Eliminar', class: 'btn-danger' },
        ],
    });
    document.getElementById('cancel-delete-btn').addEventListener('click', closeModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', () => {
        store.deleteItem('suppliers', id);
        showToast('Proveedor eliminado', 'error');
        closeModal();
        refreshDataAndRender();
    });
}


let mainContainer;
function refreshDataAndRender() {
    suppliers = store.getItems('suppliers');
    render(mainContainer);
}


export function render(container) {
    mainContainer = container;
    suppliers = store.getItems('suppliers');
    
    container.innerHTML = `
        <div class="page-header">
            <h2>Gestión de Proveedores</h2>
            ${hasWriteAccess ? `<button class="btn btn-primary" id="add-supplier-btn"><i class="fas fa-plus"></i> Añadir Proveedor</button>` : ''}
        </div>
        <div class="card" id="supplier-list">
        </div>
    `;

    renderSupplierTable(document.getElementById('supplier-list'));
    if (hasWriteAccess) {
        document.getElementById('add-supplier-btn').addEventListener('click', handleAdd);
    }
}
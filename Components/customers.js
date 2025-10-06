import store from 'app/store';
import { renderModal, showToast } from 'app/utils';
import { canWrite } from 'app/auth';

let customers = [];
const hasWriteAccess = canWrite('customers');

function renderCustomerTable(container) {
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Teléfono</th>
                    ${hasWriteAccess ? '<th>Acciones</th>' : ''}
                </tr>
            </thead>
            <tbody>
                ${customers.map(c => `
                    <tr>
                        <td>${c.name}</td>
                        <td>${c.email || 'N/A'}</td>
                        <td>${c.phone || 'N/A'}</td>
                        ${hasWriteAccess ? `
                        <td class="actions-cell">
                            <button class="edit-btn" data-id="${c.id}"><i class="fas fa-edit"></i></button>
                            <button class="delete-btn" data-id="${c.id}"><i class="fas fa-trash"></i></button>
                        </td>
                        ` : ''}
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    if (hasWriteAccess) {
        container.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', (e) => handleEdit(e.currentTarget.dataset.id)));
        container.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', (e) => handleDelete(e.currentTarget.dataset.id)));
    }
}

function renderCustomerForm(customer = {}) {
    return `
        <form id="customer-form">
            <input type="hidden" name="id" value="${customer.id || ''}">
            <div class="form-group">
                <label for="name">Nombre</label>
                <input type="text" id="name" name="name" class="form-control" value="${customer.name || ''}" required>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" class="form-control" value="${customer.email || ''}">
            </div>
            <div class="form-group">
                <label for="phone">Teléfono</label>
                <input type="tel" id="phone" name="phone" class="form-control" value="${customer.phone || ''}">
            </div>
        </form>
    `;
}

function handleSave(form, closeModal) {
    const formData = new FormData(form);
    const customer = {
        id: formData.get('id'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
    };
    
    if (customer.id) {
        store.updateItem('customers', customer);
        showToast('Cliente actualizado con éxito');
    } else {
        store.addItem('customers', customer);
        showToast('Cliente añadido con éxito');
    }
    
    closeModal();
    refreshDataAndRender();
}

function handleAdd() {
    const { closeModal } = renderModal({
        title: 'Añadir Cliente',
        content: renderCustomerForm(),
        footerButtons: [
            { id: 'cancel-btn', text: 'Cancelar', class: 'btn-secondary' },
            { id: 'save-btn', text: 'Guardar', class: 'btn-primary' },
        ],
    });

    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('save-btn').addEventListener('click', () => {
        const form = document.getElementById('customer-form');
        if (form.checkValidity()) {
            handleSave(form, closeModal);
        } else {
            form.reportValidity();
        }
    });
}

function handleEdit(id) {
    const customer = store.getItemById('customers', id);
    const { closeModal } = renderModal({
        title: 'Editar Cliente',
        content: renderCustomerForm(customer),
        footerButtons: [
            { id: 'cancel-btn', text: 'Cancelar', class: 'btn-secondary' },
            { id: 'save-btn', text: 'Guardar Cambios', class: 'btn-primary' },
        ],
    });

    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    document.getElementById('save-btn').addEventListener('click', () => {
        const form = document.getElementById('customer-form');
        if (form.checkValidity()) {
            handleSave(form, closeModal);
        } else {
            form.reportValidity();
        }
    });
}

function handleDelete(id) {
    const customer = store.getItemById('customers', id);
    // Prevent deleting 'Cliente General'
    if (customer.name === 'Cliente General') {
        showToast('No se puede eliminar el cliente general', 'error');
        return;
    }
    const { closeModal } = renderModal({
        title: 'Confirmar Eliminación',
        content: `<p>¿Estás seguro de que quieres eliminar al cliente "<strong>${customer.name}</strong>"?</p>`,
        footerButtons: [
            { id: 'cancel-delete-btn', text: 'Cancelar', class: 'btn-secondary' },
            { id: 'confirm-delete-btn', text: 'Eliminar', class: 'btn-danger' },
        ],
    });
    document.getElementById('cancel-delete-btn').addEventListener('click', closeModal);
    document.getElementById('confirm-delete-btn').addEventListener('click', () => {
        store.deleteItem('customers', id);
        showToast('Cliente eliminado', 'error');
        closeModal();
        refreshDataAndRender();
    });
}

let mainContainer;
function refreshDataAndRender() {
    customers = store.getItems('customers');
    render(mainContainer);
}

export function render(container) {
    mainContainer = container;
    customers = store.getItems('customers');
    
    container.innerHTML = `
        <div class="page-header">
            <h2>Gestión de Clientes</h2>
            ${hasWriteAccess ? `<button class="btn btn-primary" id="add-customer-btn"><i class="fas fa-user-plus"></i> Añadir Cliente</button>` : ''}
        </div>
        <div class="card" id="customer-list">
            <!-- La tabla de clientes se renderizará aquí -->
        </div>
    `;

    renderCustomerTable(document.getElementById('customer-list'));
    if (hasWriteAccess) {
        document.getElementById('add-customer-btn').addEventListener('click', handleAdd);
    }
}
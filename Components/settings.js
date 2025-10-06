import store from 'app/store';
import { showToast } from 'app/utils';
import { canWrite } from 'app/auth';

const hasWriteAccess = canWrite('settings');

function handleSave() {
    const newSettings = {
        companyName: document.getElementById('companyName').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        email: document.getElementById('email').value,
        logoUrl: document.getElementById('logoUrl').value,
    };
    store.updateSettings(newSettings);
    showToast('Configuración guardada. La página se recargará.');
}

function handleReset() {
    store.resetSettings();
    showToast('Configuración restaurada. La página se recargará.');
}

export function render(container) {
    const settings = store.getSettings();

    container.innerHTML = `
        <div class="page-header">
            <h2>Configuración de la Aplicación</h2>
        </div>
        <div class="card">
            <form id="settings-form">
                <div class="form-group">
                    <label for="companyName">Nombre de la Empresa</label>
                    <input type="text" id="companyName" class="form-control" value="${settings.companyName}" ${!hasWriteAccess ? 'disabled' : ''}>
                </div>
                <div class="form-group">
                    <label for="address">Dirección</label>
                    <input type="text" id="address" class="form-control" value="${settings.address}" ${!hasWriteAccess ? 'disabled' : ''}>
                </div>
                <div class="form-group">
                    <label for="phone">Teléfono</label>
                    <input type="tel" id="phone" class="form-control" value="${settings.phone}" ${!hasWriteAccess ? 'disabled' : ''}>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" class="form-control" value="${settings.email}" ${!hasWriteAccess ? 'disabled' : ''}>
                </div>
                <div class="form-group">
                    <label for="logoUrl">URL del Logotipo</label>
                    <input type="text" id="logoUrl" class="form-control" value="${settings.logoUrl}" ${!hasWriteAccess ? 'disabled' : ''}>
                    <small>Puede usar la URL local 'logo.png' o una URL externa (ej: https://example.com/logo.png)</small>
                </div>
                
                ${hasWriteAccess ? `
                <div class="form-actions" style="margin-top: 20px; display: flex; justify-content: flex-end; gap: 10px;">
                    <button type="button" class="btn btn-secondary" id="reset-settings-btn">Restaurar por Defecto</button>
                    <button type="button" class="btn btn-primary" id="save-settings-btn">Guardar Cambios</button>
                </div>
                ` : '<p>No tiene permisos para modificar la configuración.</p>'}
            </form>
        </div>
    `;

    if (hasWriteAccess) {
        document.getElementById('save-settings-btn').addEventListener('click', handleSave);
        document.getElementById('reset-settings-btn').addEventListener('click', handleReset);
    }
}


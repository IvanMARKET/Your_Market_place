export function generateId(prefix = '') {
    return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).substr(2, 5)}`;
}

export function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-CM', { style: 'currency', currency: 'XAF' }).format(amount);
}

export function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Simple Toast Notification
export function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}

// Modal Component
export function renderModal({ title, content, footerButtons }) {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    ${footerButtons.map(btn => `<button class="btn ${btn.class}" id="${btn.id}">${btn.text}</button>`).join('')}
                </div>
            </div>
        </div>
    `;

    const closeModal = () => {
        modalContainer.innerHTML = '';
    };

    modalContainer.querySelector('.close-modal').addEventListener('click', closeModal);
    modalContainer.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            closeModal();
        }
    });

    return { closeModal };
}
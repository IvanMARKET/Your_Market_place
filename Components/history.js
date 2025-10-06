import store from 'app/store';
import { formatCurrency } from 'app/utils';
import { renderInvoiceModal, generateInvoicePdf } from 'app/components/invoice';

let sales = [];

function renderHistoryTable(container) {
    container.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Nº Factura</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${sales.map(sale => {
                    const customer = store.getItemById('customers', sale.customerId);
                    return `
                    <tr>
                        <td>${sale.invoiceNumber}</td>
                        <td>${new Date(sale.date).toLocaleString()}</td>
                        <td>${customer ? customer.name : 'Cliente Eliminado'}</td>
                        <td>${formatCurrency(sale.total)}</td>
                        <td class="actions-cell">
                            <button class="view-btn btn btn-sm btn-info" data-id="${sale.id}" title="Ver Factura"><i class="fas fa-eye"></i></button>
                            <button class="pdf-btn btn btn-sm btn-danger" data-id="${sale.id}" title="Descargar PDF"><i class="fas fa-file-pdf"></i></button>
                        </td>
                    </tr>
                `}).join('')}
            </tbody>
        </table>
    `;
    
    if (sales.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding: 20px;">No hay ventas registradas.</p>';
    }

    container.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sale = store.getItemById('sales', e.currentTarget.dataset.id);
            if (sale) renderInvoiceModal(sale);
        });
    });

    container.querySelectorAll('.pdf-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sale = store.getItemById('sales', e.currentTarget.dataset.id);
            if (sale) generateInvoicePdf(sale);
        });
    });
}

export function render(container) {
    sales = store.getItems('sales').slice().reverse();
    
    container.innerHTML = `
        <div class="page-header">
            <h2>Historial de Facturas</h2>
        </div>
        <div class="card" id="history-list">
        </div>
    `;

    renderHistoryTable(document.getElementById('history-list'));
}
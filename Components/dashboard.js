import store from 'app/store';
import { formatCurrency } from 'app/utils';

export function render(container) {
    const state = store.getState();
    const totalSales = state.sales.reduce((sum, sale) => sum + sale.total, 0);
    const productCount = state.products.length;
    const customerCount = state.customers.length;
    const lowStockCount = state.products.filter(p => p.stock < 10).length;

    container.innerHTML = `
        <div class="page-header">
            <h2>Dashboard</h2>
        </div>
        <div class="stats-grid">
            <div class="stat-card">
                <i class="fas fa-money-bill-wave"></i>
                <div class="stat-info">
                    <h3>Ventas Totales</h3>
                    <p>${formatCurrency(totalSales)}</p>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-box-open"></i>
                <div class="stat-info">
                    <h3>Productos</h3>
                    <p>${productCount}</p>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-users"></i>
                <div class="stat-info">
                    <h3>Clientes</h3>
                    <p>${customerCount}</p>
                </div>
            </div>
            <div class="stat-card">
                <i class="fas fa-exclamation-triangle"></i>
                <div class="stat-info">
                    <h3>Bajo Stock</h3>
                    <p>${lowStockCount}</p>
                </div>
            </div>
        </div>
        <div class="card" style="margin-top: 30px;">
            <h3>Ventas Recientes</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nº Factura</th>
                        <th>Cliente</th>
                        <th>Fecha</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${state.sales.slice(-5).reverse().map(sale => `
                        <tr>
                            <td>${sale.invoiceNumber}</td>
                            <td>${store.getItemById('customers', sale.customerId)?.name || 'N/A'}</td>
                            <td>${new Date(sale.date).toLocaleString('es-ES')}</td>
                            <td>${formatCurrency(sale.total)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}
import store from 'app/store';
import { formatCurrency } from 'app/utils';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

let chartInstance = null;
let currentPeriod = 'day';

function getStartOf(period, date = new Date()) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    if (period === 'week') {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
        d.setDate(diff);
    } else if (period === 'month') {
        d.setDate(1);
    }
    return d;
}

function getFilteredSales(period) {
    const now = new Date();
    let startDate;

    if (period === 'day') {
        startDate = getStartOf('day', now);
    } else if (period === 'week') {
        startDate = getStartOf('week', now);
    } else if (period === 'month') {
        startDate = getStartOf('month', now);
    }

    const sales = store.getItems('sales');
    return sales.filter(sale => new Date(sale.date) >= startDate);
}

function processReportData(sales) {
    const products = store.getItems('products');
    let totalRevenue = 0;
    const categorySales = {};

    sales.forEach(sale => {
        totalRevenue += sale.total;
        sale.items.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            if (product) {
                const category = product.category || 'Sin Categoría';
                if (!categorySales[category]) {
                    categorySales[category] = 0;
                }
                categorySales[category] += item.price * item.quantity;
            }
        });
    });

    const bestSellingCategory = Object.entries(categorySales).sort(([,a],[,b]) => b-a)[0] || ['N/A', 0];

    return {
        totalSales: sales.length,
        totalRevenue,
        categorySales,
        bestSellingCategory: {
            name: bestSellingCategory[0],
            revenue: bestSellingCategory[1]
        }
    };
}


function renderChart(categorySales) {
    const chartContainer = document.getElementById('reports-chart-container');
    if (!chartContainer) return;
    chartContainer.innerHTML = '<canvas id="sales-chart"></canvas>';
    const ctx = document.getElementById('sales-chart').getContext('2d');
    
    if (chartInstance) {
        chartInstance.destroy();
    }
    
    const labels = Object.keys(categorySales);
    const data = Object.values(categorySales);
    
    if(labels.length === 0) {
        chartContainer.innerHTML = '<p style="text-align:center; padding: 40px;">No hay datos de ventas para el período seleccionado.</p>';
        return;
    }

    chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas por Categoría',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 206, 86, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(153, 102, 255, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Ventas por Categoría de Producto'
                }
            }
        }
    });
}

function renderReport() {
    const filteredSales = getFilteredSales(currentPeriod);
    const reportData = processReportData(filteredSales);

    document.getElementById('total-revenue').textContent = formatCurrency(reportData.totalRevenue);
    document.getElementById('total-sales').textContent = reportData.totalSales;
    document.getElementById('best-category').textContent = reportData.bestSellingCategory.name;
    document.getElementById('best-category-revenue').textContent = formatCurrency(reportData.bestSellingCategory.revenue);

    renderChart(reportData.categorySales);
}

export function render(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2>Reportes de Ventas</h2>
        </div>
        <div class="card">
            <div class="reports-controls">
                <button class="btn btn-secondary report-period-btn" data-period="day">Diario</button>
                <button class="btn btn-secondary report-period-btn" data-period="week">Semanal</button>
                <button class="btn btn-secondary report-period-btn" data-period="month">Mensual</button>
            </div>
            <div class="report-summary">
                <div class="summary-card">
                    <h4>Ingresos Totales</h4>
                    <p id="total-revenue"></p>
                </div>
                <div class="summary-card">
                    <h4>Nº de Ventas</h4>
                    <p id="total-sales"></p>
                </div>
                <div class="summary-card">
                    <h4>Categoría Estrella</h4>
                    <p id="best-category"></p>
                </div>
                 <div class="summary-card">
                    <h4>Ingresos Categoría Estrella</h4>
                    <p id="best-category-revenue"></p>
                </div>
            </div>
             <div id="reports-chart-container">
                <canvas id="sales-chart"></canvas>
            </div>
        </div>
    `;

    const periodButtons = container.querySelectorAll('.report-period-btn');
    periodButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            currentPeriod = e.target.dataset.period;
            periodButtons.forEach(b => b.classList.remove('btn-primary'));
            e.target.classList.add('btn-primary');
            renderReport();
        });
    });

    container.querySelector(`.report-period-btn[data-period="${currentPeriod}"]`).classList.add('btn-primary');
    renderReport();
}
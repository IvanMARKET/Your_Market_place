import store from 'app/store';
import { formatCurrency, showToast } from 'app/utils';
import { renderInvoiceModal } from 'app/components/invoice';
import { canWrite } from 'app/auth';

let products = [];
let customers = [];
let cart = [];
const hasWriteAccess = canWrite('sales');

function renderSalesPage(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2>Terminal de Punto de Venta (TPV)</h2>
        </div>
        <div class="sales-layout">
            <div class="card">
                <h3>Productos Disponibles</h3>
                <input type="text" id="product-search" class="form-control" placeholder="Buscar productos...">
                <div id="product-list-pos" style="max-height: 500px; overflow-y: auto; margin-top: 15px;"></div>
            </div>
            <div class="card">
                <h3>Carrito de Compra</h3>
                <div class="form-group">
                    <label for="customer-select">Cliente</label>
                    <select id="customer-select" class="form-control">
                        ${customers.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                    </select>
                </div>
                <div class="cart-summary" id="cart-summary"></div>
                <button class="btn btn-success" id="checkout-btn" style="width: 100%; margin-top: 15px;" ${!hasWriteAccess ? 'disabled' : ''}><i class="fas fa-check"></i> Finalizar Compra</button>
            </div>
        </div>
        <div class="card" style="margin-top:20px;">
            <h3>Últimas 5 Ventas</h3>
            <div id="sales-history"></div>
            <a href="#history" style="display: block; text-align: right; margin-top: 15px;">Ver historial completo...</a>
        </div>
    `;

    document.getElementById('product-search').addEventListener('input', (e) => renderProductList(e.target.value));
    document.getElementById('checkout-btn').addEventListener('click', handleCheckout);

    renderProductList();
    renderCart();
    renderSalesHistory();
}

function renderProductList(filter = '') {
    const listContainer = document.getElementById('product-list-pos');
    const filteredProducts = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) && p.stock > 0);
    
    if (filteredProducts.length === 0) {
        listContainer.innerHTML = '<p>No se encontraron productos.</p>';
        return;
    }
    
    listContainer.innerHTML = `
        <table class="data-table">
            <tbody>
            ${filteredProducts.map(p => `
                <tr>
                    <td>${p.name} <br><small>Stock: ${p.stock}</small></td>
                    <td>${formatCurrency(p.price)}</td>
                    <td><button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${p.id}" ${!hasWriteAccess ? 'disabled' : ''}><i class="fas fa-plus"></i></button></td>
                </tr>
            `).join('')}
            </tbody>
        </table>
    `;

    listContainer.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', (e) => addToCart(e.currentTarget.dataset.id));
    });
}

function addToCart(productId) {
    if (!hasWriteAccess) {
        showToast('No tiene permisos para realizar esta acción.', 'error');
        return;
    }
    const product = store.getItemById('products', productId);
    const cartItem = cart.find(item => item.productId === productId);
    
    if (cartItem) {
        if (cartItem.quantity < product.stock) {
            cartItem.quantity++;
        } else {
            showToast('No hay más stock disponible para este producto', 'warning');
        }
    } else {
        if (product.stock > 0) {
            cart.push({ productId: product.id, name: product.name, price: product.price, quantity: 1 });
        } else {
            showToast('Producto sin stock', 'error');
        }
    }
    renderCart();
}

function updateCartItem(productId, newQuantity) {
    const cartItem = cart.find(item => item.productId === productId);
    const product = store.getItemById('products', productId);
    
    if (cartItem) {
        if (newQuantity > 0 && newQuantity <= product.stock) {
            cartItem.quantity = newQuantity;
        } else if (newQuantity > product.stock) {
            cartItem.quantity = product.stock;
            showToast(`Solo quedan ${product.stock} unidades en stock`, 'warning');
        } else {
            cart = cart.filter(item => item.productId !== productId);
        }
    }
    renderCart();
}

function renderCart() {
    const cartContainer = document.getElementById('cart-summary');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="empty-cart">El carrito está vacío</p>';
        checkoutBtn.disabled = true;
    } else {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartContainer.innerHTML = `
            ${cart.map(item => `
                <div class="cart-item">
                    <span>${item.name}</span>
                    <span>
                        <input type="number" value="${item.quantity}" min="1" class="cart-quantity-input" data-id="${item.productId}" style="width: 50px; text-align: center;" ${!hasWriteAccess ? 'readonly' : ''}>
                        x ${formatCurrency(item.price)}
                    </span>
                    <strong>${formatCurrency(item.price * item.quantity)}</strong>
                </div>
            `).join('')}
            <div class="cart-total">
                Total: ${formatCurrency(total)}
            </div>
        `;
        checkoutBtn.disabled = false;
        cartContainer.querySelectorAll('.cart-quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                updateCartItem(e.target.dataset.id, parseInt(e.target.value));
            });
        });
    }
}

function handleCheckout() {
    if (!hasWriteAccess) {
        showToast('No tiene permisos para realizar ventas.', 'error');
        return;
    }
    const customerId = document.getElementById('customer-select').value;
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const newSale = {
        customerId,
        items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        })),
        total
    };
    
    store.addSale(newSale);
    showToast('Venta realizada con éxito');
    
    // Show invoice
    renderInvoiceModal(store.getItemById('sales', newSale.id));

    // Reset
    cart = [];
    refreshDataAndRender();
}

function renderSalesHistory() {
    const historyContainer = document.getElementById('sales-history');
    const sales = store.getItems('sales').slice(-5).reverse();
    historyContainer.innerHTML = `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${sales.map(sale => `
                    <tr>
                        <td>${new Date(sale.date).toLocaleString()}</td>
                        <td>${store.getItemById('customers', sale.customerId)?.name || 'N/A'}</td>
                        <td>${formatCurrency(sale.total)}</td>
                        <td class="actions-cell">
                            <button class="view-btn" data-id="${sale.id}"><i class="fas fa-eye"></i></button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;

    historyContainer.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sale = store.getItemById('sales', e.currentTarget.dataset.id);
            renderInvoiceModal(sale);
        });
    });
}

function renderInvoice(sale) {
    const customer = store.getItemById('customers', sale.customerId);
    const { closeModal } = renderModal({
        title: `Factura: ${sale.id}`,
        content: `
            <div id="invoice-content">
                <div class="invoice-header">
                    <div class="invoice-logo">
                        <img src="logo.png" alt="IVANMARKET Logo">
                        <h3>IVANMARKET</h3>
                        <p>Calle Falsa 123, Ciudad</p>
                    </div>
                    <div class="invoice-info text-right">
                        <h2>FACTURA</h2>
                        <p><strong>Nº Factura:</strong> ${sale.id}</p>
                        <p><strong>Fecha:</strong> ${new Date(sale.date).toLocaleDateString()}</p>
                    </div>
                </div>
                <div class="invoice-details">
                    <div>
                        <strong>Facturar a:</strong>
                        <p>${customer.name}</p>
                        <p>${customer.email || ''}</p>
                        <p>${customer.phone || ''}</p>
                    </div>
                </div>
                <table class="invoice-table">
                    <thead>
                        <tr>
                            <th>Producto</th>
                            <th class="text-right">Cantidad</th>
                            <th class="text-right">Precio Unitario</th>
                            <th class="text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${sale.items.map(item => {
                            const product = store.getItemById('products', item.productId);
                            return `
                            <tr>
                                <td>${product.name}</td>
                                <td class="text-right">${item.quantity}</td>
                                <td class="text-right">${formatCurrency(item.price)}</td>
                                <td class="text-right">${formatCurrency(item.quantity * item.price)}</td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
                <div class="invoice-totals">
                    <table>
                        <tr>
                            <td>Subtotal:</td>
                            <td class="text-right">${formatCurrency(sale.total)}</td>
                        </tr>
                        <tr>
                            <td>IVA (0%):</td>
                            <td class="text-right">${formatCurrency(0)}</td>
                        </tr>
                        <tr class="grand-total">
                            <td>TOTAL:</td>
                            <td class="text-right">${formatCurrency(sale.total)}</td>
                        </tr>
                    </table>
                </div>
                <div class="invoice-footer">
                    <p>Gracias por su compra en IVANMARKET.</p>
                </div>
            </div>
        `,
        footerButtons: [
            { id: 'print-btn', text: '<i class="fas fa-print"></i> Imprimir', class: 'btn-primary' },
            { id: 'close-invoice-btn', text: 'Cerrar', class: 'btn-secondary' },
        ]
    });
    
    document.getElementById('close-invoice-btn').addEventListener('click', closeModal);
    document.getElementById('print-btn').addEventListener('click', () => {
        const printContent = document.getElementById('invoice-content').innerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Factura IVANMARKET</title>');
        printWindow.document.write('<link rel="stylesheet" href="style.css">');
        printWindow.document.write('</head><body >');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
    });
}


let mainContainer;
function refreshDataAndRender() {
    products = store.getItems('products');
    customers = store.getItems('customers');
    render(mainContainer);
}


export function render(container) {
    mainContainer = container;
    products = store.getItems('products');
    customers = store.getItems('customers');
    
    renderSalesPage(container);
}
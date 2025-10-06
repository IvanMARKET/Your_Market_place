import store from 'app/store';
import { renderModal, formatCurrency, showToast } from 'app/utils';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export function generateInvoiceHTML(sale) {
    const customer = store.getItemById('customers', sale.customerId) || { name: 'Cliente Eliminado' };
    const products = store.getItems('products');
    const settings = store.getSettings();

    return `
        <div id="invoice-content-${sale.id}" class="invoice-container">
            <div class="invoice-header">
                <div class="invoice-logo">
                    <img src="${settings.logoUrl}" alt="${settings.companyName} Logo" style="max-height: 60px;">
                    <h3>${settings.companyName}</h3>
                    <p>${settings.address}</p>
                    <p>${settings.phone}</p>
                    <p>${settings.email}</p>
                </div>
                <div class="invoice-info text-right">
                    <h2>FACTURA</h2>
                    <p><strong>Nº Factura:</strong> ${sale.invoiceNumber}</p>
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
                        const product = products.find(p => p.id === item.productId) || { name: 'Producto Eliminado' };
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
                <p>Gracias por su compra en ${settings.companyName}.</p>
            </div>
        </div>
        <style>
            .invoice-container { background: #fff; padding: 40px; margin: 0 auto; max-width: 800px; }
        </style>
    `;
}

export function renderInvoiceModal(sale) {
    const { closeModal } = renderModal({
        title: `Factura: ${sale.invoiceNumber}`,
        content: generateInvoiceHTML(sale).replace(`id="invoice-content-${sale.id}"`, `id="invoice-content-modal"`),
        footerButtons: [
            { id: 'print-btn', text: '<i class="fas fa-print"></i> Imprimir', class: 'btn-primary' },
            { id: 'download-pdf-btn', text: '<i class="fas fa-file-pdf"></i> Descargar PDF', class: 'btn-success' },
            { id: 'close-invoice-btn', text: 'Cerrar', class: 'btn-secondary' },
        ]
    });
    
    document.getElementById('close-invoice-btn').addEventListener('click', closeModal);

    document.getElementById('print-btn').addEventListener('click', () => {
        const printContent = document.getElementById('invoice-content-modal').innerHTML;
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

    document.getElementById('download-pdf-btn').addEventListener('click', () => {
        generateInvoicePdf(sale);
    });
}


export async function generateInvoicePdf(sale) {
    showToast('Generando PDF...', 'info');
    
    // Create a temporary, off-screen container for the invoice HTML
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.innerHTML = generateInvoiceHTML(sale);
    document.body.appendChild(container);
    
    const invoiceElement = document.getElementById(`invoice-content-${sale.id}`);
    
    try {
        const canvas = await html2canvas(invoiceElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`factura-${sale.invoiceNumber.replace(' ', '_')}.pdf`);
    } catch (error) {
        console.error('Error generating PDF:', error);
        showToast('Error al generar el PDF', 'error');
    } finally {
        // Clean up the temporary container
        document.body.removeChild(container);
    }
}
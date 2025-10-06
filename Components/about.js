export function render(container) {
    container.innerHTML = `
        <div class="page-header">
            <h2>Acerca de IVANMARKET Manager</h2>
        </div>
        <div class="card">
            <h3>Bienvenido a IVANMARKET Manager</h3>
            <p>Esta aplicación está diseñada para ser un sistema de punto de venta (TPV) y gestión integral para el supermercado IVANMARKET. Permite administrar ventas, productos, stock, clientes y proveedores de una manera sencilla y eficiente.</p>
        </div>

        <div class="card">
            <h3>¿Cómo se utiliza?</h3>
            <p>La navegación se realiza a través del menú lateral. Cada sección tiene una función específica:</p>
            
            <div style="margin-top: 20px;">
                <h4><i class="fas fa-tachometer-alt fa-fw"></i> Dashboard</h4>
                <p>Es la pantalla principal. Muestra un resumen rápido del estado del negocio, incluyendo ventas totales, número de productos, clientes registrados y productos con bajo stock.</p>
            </div>

            <div style="margin-top: 20px;">
                <h4><i class="fas fa-cash-register fa-fw"></i> Ventas (TPV)</h4>
                <p>Aquí se registran las ventas. Puedes buscar productos, añadirlos al carrito, seleccionar un cliente y finalizar la compra. Al finalizar, se genera una factura automáticamente que puedes imprimir o descargar en PDF.</p>
            </div>

            <div style="margin-top: 20px;">
                <h4><i class="fas fa-box-open fa-fw"></i> Productos</h4>
                <p>En esta sección puedes gestionar tu catálogo de productos. Añade nuevos productos, edita su información (nombre, precio, categoría, proveedor) o elimínalos.</p>
            </div>

            <div style="margin-top: 20px;">
                <h4><i class="fas fa-warehouse fa-fw"></i> Stock</h4>
                <p>Controla el inventario de tus productos. Esta vista te muestra el stock actual de cada artículo. Puedes realizar ajustes manuales de stock para corregir cualquier discrepancia (por ejemplo, por mermas o recepciones de mercancía).</p>
            </div>
            
            <div style="margin-top: 20px;">
                <h4><i class="fas fa-users fa-fw"></i> Clientes</h4>
                <p>Administra tu base de datos de clientes. Puedes añadir nuevos clientes, modificar su información de contacto o eliminarlos.</p>
            </div>

            <div style="margin-top: 20px;">
                <h4><i class="fas fa-truck fa-fw"></i> Proveedores</h4>
                <p>Gestiona la información de tus proveedores. Mantén un registro de los proveedores con sus datos de contacto.</p>
            </div>

            <div style="margin-top: 20px;">
                <h4><i class="fas fa-chart-pie fa-fw"></i> Reportes</h4>
                <p>Visualiza reportes de ventas filtrados por día, semana o mes. Los datos se presentan en un gráfico de tarta que muestra las ventas por categoría de producto, ayudándote a entender qué se vende más.</p>
            </div>

            <div style="margin-top: 20px;">
                <h4><i class="fas fa-history fa-fw"></i> Historial</h4>
                <p>Consulta un registro completo de todas las ventas realizadas. Desde aquí puedes ver los detalles de cada factura, volver a imprimirla o descargarla en formato PDF.</p>
            </div>

            <div style="margin-top: 20px;">
                <h4><i class="fas fa-info-circle fa-fw"></i> Informate</h4>
                <p>Esta sección es la que estás viendo ahora mismo. Ofrece una guía sobre el funcionamiento de la aplicación.</p>
            </div>
        </div>

        <div class="card">
            <h3>Información Adicional</h3>
            <p><strong>Moneda:</strong> Todas las transacciones se realizan en Francos CFA de África Central (XAF).</p>
            <p><strong>Datos:</strong> La información se guarda de forma persistente y duradera localmente en tu navegador (LocalStorage). Esto significa que tus datos permanecerán guardados incluso si cierras y vuelves a abrir el navegador. Sin embargo, si borras los datos de navegación o usas el modo incógnito, la información de la aplicación se perderá. Se recomienda realizar copias de seguridad si se usa en un entorno real.</p>
            <p><strong>Versión:</strong> 1.0.0</p>
        </div>
    `;
}


import { generateId } from 'app/utils';

const STORE_KEY = 'ivanmarket_data';

let state = {
    products: [],
    customers: [],
    suppliers: [],
    sales: [],
    invoiceCounter: 0,
    settings: {},
};

function getSampleData() {
    return {
        products: [
            { id: 'p1', name: 'Leche Entera', category: 'Lácteos', price: 1.20, stock: 150, supplierId: 's1' },
            { id: 'p2', name: 'Pan de Molde', category: 'Panadería', price: 2.50, stock: 80, supplierId: 's2' },
            { id: 'p3', name: 'Manzanas (kg)', category: 'Frutas y Verduras', price: 1.99, stock: 120, supplierId: 's3' },
            { id: 'p4', name: 'Pollo (kg)', category: 'Carnicería', price: 5.50, stock: 50, supplierId: 's1' },
            { id: 'p5', name: 'Arroz (kg)', category: 'Alimentación', price: 0.90, stock: 200, supplierId: 's2' },
        ],
        customers: [
            { id: 'c1', name: 'Juan Pérez', email: 'juan.perez@email.com', phone: '611223344' },
            { id: 'c2', name: 'Ana García', email: 'ana.garcia@email.com', phone: '655667788' },
            { id: 'c3', name: 'Cliente General', email: '', phone: '' },
        ],
        suppliers: [
            { id: 's1', name: 'Proveedor Lácteo S.L.', contact: 'Carlos Ruiz', phone: '911234567' },
            { id: 's2', name: 'Distribuciones Nacionales', contact: 'Laura Marín', phone: '933216548' },
            { id: 's3', name: 'Campo Fresco Coop.', contact: 'Miguel Ángel', phone: '954789123' },
        ],
        sales: [
            { id: 'sale1', invoiceNumber: 'FACT 001', date: new Date(Date.now() - 86400000).toISOString(), customerId: 'c1', items: [{ productId: 'p1', quantity: 2, price: 1.20 }, { productId: 'p3', quantity: 1.5, price: 1.99 }], total: 5.38 },
            { id: 'sale2', invoiceNumber: 'FACT 002', date: new Date().toISOString(), customerId: 'c2', items: [{ productId: 'p2', quantity: 1, price: 2.50 }, { productId: 'p4', quantity: 2, price: 5.50 }], total: 13.50 }
        ],
        invoiceCounter: 2,
        settings: {
            companyName: 'IVANMARKET',
            address: 'Avda. HASSAN II, MALABO',
            phone: '+240 123 456 789',
            email: 'contacto@ivanmarket.com',
            logoUrl: 'logo.png',
        }
    };
}

function saveState() {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function loadState() {
    const savedState = localStorage.getItem(STORE_KEY);
    const defaults = getSampleData();
    if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState.invoiceCounter === undefined) {
            parsedState.invoiceCounter = parsedState.sales.length;
            // Retroactively add invoice numbers
            parsedState.sales.forEach((sale, index) => {
                if (!sale.invoiceNumber) {
                    sale.invoiceNumber = `FACT ${(index + 1).toString().padStart(3, '0')}`;
                }
            });
        }
        // Merge settings to handle new settings fields added in updates
        parsedState.settings = { ...defaults.settings, ...parsedState.settings };
        return parsedState;
    }
    return defaults;
}

const store = {
    init() {
        state = loadState();
        saveState();
    },
    
    getState() {
        return state;
    },

    // Generic CRUD operations
    getItems(type) {
        return state[type];
    },

    getSettings() {
        return state.settings;
    },

    updateSettings(newSettings) {
        state.settings = { ...state.settings, ...newSettings };
        saveState();
        // Force reload to apply changes globally (like logo and title)
        location.reload();
    },
    
    resetSettings() {
        state.settings = getSampleData().settings;
        saveState();
        location.reload();
    },

    getItemById(type, id) {
        return state[type].find(item => item.id === id);
    },

    addItem(type, item) {
        if (!item.id) {
            item.id = generateId();
        }
        state[type].push(item);
        saveState();
    },

    updateItem(type, updatedItem) {
        const index = state[type].findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
            state[type][index] = { ...state[type][index], ...updatedItem };
            saveState();
        }
    },

    deleteItem(type, id) {
        state[type] = state[type].filter(item => item.id !== id);
        saveState();
    },

    // Specific logic
    updateStock(productId, quantityChange) {
        const product = this.getItemById('products', productId);
        if (product) {
            product.stock += quantityChange;
            this.updateItem('products', product);
        }
    },
    
    addSale(sale) {
        sale.id = generateId('sale');
        sale.date = new Date().toISOString();
        
        state.invoiceCounter++;
        sale.invoiceNumber = `FACT ${state.invoiceCounter.toString().padStart(3, '0')}`;

        this.addItem('sales', sale);
        // Update stock for each item sold
        sale.items.forEach(item => {
            this.updateStock(item.productId, -item.quantity);
        });
        saveState(); // Save state again to persist the new invoiceCounter
    }
};

export default store;
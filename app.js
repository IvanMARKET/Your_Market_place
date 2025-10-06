import store from 'app/store';
import { isLoggedIn, logout, getCurrentUser } from 'app/auth';
import { render as renderDashboard } from 'app/components/dashboard';
import { render as renderSales } from 'app/components/sales';
import { render as renderProducts } from 'app/components/products';
import { render as renderStock } from 'app/components/stock';
import { render as renderCustomers } from 'app/components/customers';
import { render as renderSuppliers } from 'app/components/suppliers';
import { render as renderReports } from 'app/components/reports';
import { render as renderHistory } from 'app/components/history';
import { render as renderAbout } from 'app/components/about';
import { render as renderSettings } from 'app/components/settings';

// Check login status first
if (!isLoggedIn()) {
    window.location.href = 'login.html';
}

const routes = {
    'dashboard': renderDashboard,
    'sales': renderSales,
    'products': renderProducts,
    'stock': renderStock,
    'customers': renderCustomers,
    'suppliers': renderSuppliers,
    'reports': renderReports,
    'history': renderHistory,
    'about': renderAbout,
    'settings': renderSettings,
};

const mainContent = document.getElementById('main-content');

function router() {
    const hash = window.location.hash.substring(1) || 'dashboard';
    const renderFunction = routes[hash] || renderDashboard;
    
    // Clear previous content and render new view
    mainContent.innerHTML = '';
    renderFunction(mainContent);
    updateActiveLink(hash);
}

function updateActiveLink(activeRoute) {
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.href.endsWith(`#${activeRoute}`)) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function setupEventListeners() {
    // Navigation
    window.addEventListener('hashchange', router);
    window.addEventListener('load', router);

    // Menu toggle for mobile/tablet
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const appContainer = document.querySelector('.app-container');
    const logoutBtn = document.getElementById('logout-btn');

    logoutBtn.addEventListener('click', logout);

    let isMobileView = window.innerWidth <= 768;

    const toggleSidebar = () => {
        if (isMobileView) {
             sidebar.classList.toggle('open');
        } else {
            appContainer.classList.toggle('sidebar-collapsed');
        }
    };
    
    menuToggle.addEventListener('click', toggleSidebar);

    window.addEventListener('resize', () => {
        const wasMobile = isMobileView;
        isMobileView = window.innerWidth <= 768;
        if(wasMobile !== isMobileView) {
            // Reset states when switching between mobile and desktop view
            appContainer.classList.remove('sidebar-collapsed');
            sidebar.classList.remove('open');
        }
    });
}


// Initialize the app
function init() {
    console.log("IVANMARKET application initialized.");

    // Check login status again in case of direct access
    if (!isLoggedIn()) {
        window.location.href = 'login.html';
        return; // Stop initialization
    }

    const user = getCurrentUser();
    document.getElementById('user-display').textContent = `${user.username} (${user.role})`;

    store.init();

    const settings = store.getSettings();
    document.getElementById('app-title').textContent = settings.companyName;
    document.getElementById('app-logo').src = settings.logoUrl;
    
    setupEventListeners();
    router(); // Initial route
}

init();
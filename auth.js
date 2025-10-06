const SESSION_KEY = 'ivanmarket_user_session';

const users = {
    // case-insensitive usernames by checking lowercased version
    administrador: { password: 'Enzema2025', role: 'admin', displayName: 'Administrador' },
    vendedor: { password: 'Vendedor2025', role: 'seller', displayName: 'Vendedor' },
    usuario: { password: 'Usuario2025', role: 'user', displayName: 'Usuario' },
};

const permissions = {
    admin: {
        sales: 'write',
        products: 'write',
        stock: 'write',
        customers: 'write',
        suppliers: 'write',
        settings: 'write',
    },
    seller: {
        sales: 'write',
        products: 'read',
        stock: 'read',
        customers: 'read',
        suppliers: 'read',
    },
    user: {
        sales: 'read',
        products: 'read',
        stock: 'read',
        customers: 'read',
        suppliers: 'read',
    }
};

export function login(username, password) {
    const userKey = username.toLowerCase();
    const userCredentials = users[userKey];

    if (userCredentials && userCredentials.password === password) {
        const userSession = {
            username: userCredentials.displayName,
            role: userCredentials.role,
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(userSession));
        return userSession;
    }
    return null;
}

export function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = 'login.html';
}

export function getCurrentUser() {
    try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY));
    } catch (e) {
        return null;
    }
}

export function isLoggedIn() {
    return getCurrentUser() !== null;
}

export function canWrite(module) {
    const user = getCurrentUser();
    if (!user) return false;

    const rolePermissions = permissions[user.role];
    return rolePermissions && rolePermissions[module] === 'write';
}
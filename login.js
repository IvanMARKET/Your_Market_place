import { login } from 'app/auth';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        errorMessage.textContent = '';

        const username = loginForm.username.value.trim();
        const password = loginForm.password.value;

        const user = login(username, password);

        if (user) {
            window.location.href = 'index.html';
        } else {
            errorMessage.textContent = 'Usuario o contraseña incorrectos.';
            loginForm.password.value = '';
        }
    });
});


// js/login.js
import { auth } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const errorMessageDiv = document.getElementById('error-message');

    // Se já estiver logado, redireciona para o dashboard
    if (auth.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    loginBtn.addEventListener('click', async () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        errorMessageDiv.style.display = 'none'; // Esconde mensagens de erro anteriores

        if (!email || !password) {
            errorMessageDiv.textContent = 'Por favor, preencha todos os campos.';
            errorMessageDiv.style.display = 'block';
            return;
        }

        const result = await auth.login(email, password);

        if (result.success) {
            // Login bem-sucedido, auth.login já redireciona
        } else {
            errorMessageDiv.textContent = result.message || 'Erro de autenticação.';
            errorMessageDiv.style.display = 'block';
        }
    });
});
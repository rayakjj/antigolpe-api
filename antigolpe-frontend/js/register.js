// js/register.js
import { auth } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const firstnameInput = document.getElementById('firstname');
    const lastnameInput = document.getElementById('lastname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const registerBtn = document.getElementById('register-btn');
    const errorMessageDiv = document.getElementById('error-message');

    // Se já estiver logado, redireciona para o dashboard
    if (auth.isLoggedIn()) {
        window.location.href = 'dashboard.html';
        return;
    }

    registerBtn.addEventListener('click', async () => {
        const firstname = firstnameInput.value;
        const lastname = lastnameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        errorMessageDiv.style.display = 'none'; // Esconde mensagens de erro anteriores

        if (!firstname || !lastname || !email || !password || !confirmPassword) {
            errorMessageDiv.textContent = 'Por favor, preencha todos os campos.';
            errorMessageDiv.style.display = 'block';
            return;
        }

        if (password !== confirmPassword) {
            errorMessageDiv.textContent = 'As senhas não coincidem.';
            errorMessageDiv.style.display = 'block';
            return;
        }

        const result = await auth.register(firstname, lastname, email, password);

        if (result.success) {
            alert('Cadastro realizado com sucesso! Faça login para continuar.');
            window.location.href = 'index.html'; // Redireciona para a tela de login
        } else {
            errorMessageDiv.textContent = result.message || 'Erro ao realizar o cadastro.';
            errorMessageDiv.style.display = 'block';
        }
    });
});
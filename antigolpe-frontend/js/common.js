// js/common.js
import { auth } from './auth.js';

export function loadNavbar() {
    const body = document.querySelector('body');
    const navbarHtml = `
        <nav class="navbar">
            <div class="logo-nav">
                <img src="img/shield-icon.png" alt="Logo AntiGolpe">
                <span>AntiGolpe</span>
            </div>
            <div class="nav-links">
                <a href="dashboard.html">Dashboard</a>
                <a href="cards.html">Meus Cartões</a>
                <a href="transactions.html">Minhas Transações</a>
                <a href="#">Configurações</a>
            </div>
            <div class="user-profile">
                <span>Olá, ${localStorage.getItem('userEmail') || 'Usuário'}!</span>
                <div class="profile-icon" id="logout-btn">
                   Sair
                </div>
            </div>
        </nav>
    `;
    body.insertAdjacentHTML('afterbegin', navbarHtml);

    // Adiciona evento de logout
    document.getElementById('logout-btn').addEventListener('click', () => {
        auth.logout();
    });
}

// Chamar esta função em todas as páginas protegidas
// Isso é um exemplo, cada página deve importar e chamar loadNavbar
// E também chamar auth.requireAuth() no DOMContentLoaded
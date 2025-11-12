// js/common.js (Corrigido para mostrar só o nome)
import { auth } from './auth.js';

export function loadNavbar() {
    const body = document.querySelector('body');

    // --- INÍCIO DA MUDANÇA ---
    const userEmail = localStorage.getItem('userEmail');
    let displayName = userEmail; // Padrão é o email completo

    if (userEmail && userEmail.includes('@')) {
        // Pega apenas a parte antes do "@"
        displayName = userEmail.split('@')[0];
    }
    // --- FIM DA MUDANÇA ---

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
            </div>
            <div class="user-profile">
                <span id="user-display-name">Olá, ${displayName}</span>
                <div id="logout-btn" class="profile-icon">
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
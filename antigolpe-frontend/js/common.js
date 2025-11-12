// js/common.js (Corrigido com Menu Hamburger)
import { auth } from './auth.js';

export function loadNavbar() {
    const body = document.querySelector('body');

    // Pega o nome de usuário do e-mail
    const userEmail = localStorage.getItem('userEmail');
    let displayName = userEmail; 

    if (userEmail && userEmail.includes('@')) {
        displayName = userEmail.split('@')[0];
    }

    // --- MUDANÇA 1: Adicionamos o botão "hamburger-btn" ---
    const navbarHtml = `
        <nav class="navbar" id="main-navbar">
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
                <div id="logout-btn-desktop" class="profile-icon">
                    Sair
                </div>
            </div>

            <button class="hamburger-menu" id="hamburger-btn">
                &#9776; </button>
        </nav>

        <div class="mobile-menu" id="mobile-menu">
            <a href="dashboard.html">Dashboard</a>
            <a href="cards.html">Meus Cartões</a>
            <a href="transactions.html">Minhas Transações</a>
            <hr>
            <div class="mobile-user-info">
                <span>Olá, ${displayName}</span>
                <a href="#" id="logout-btn-mobile">Sair</a>
            </div>
        </div>
    `;

    body.insertAdjacentHTML('afterbegin', navbarHtml);

    // --- MUDANÇA 2: Adiciona os Event Listeners ---

    // Listener para o botão Sair (Desktop)
    document.getElementById('logout-btn-desktop').addEventListener('click', () => {
        auth.logout();
    });

    // Listener para o botão Sair (Mobile)
    document.getElementById('logout-btn-mobile').addEventListener('click', (e) => {
        e.preventDefault(); // Impede o link de navegar
        auth.logout();
    });

    // Listener para o botão Hamburger
    document.getElementById('hamburger-btn').addEventListener('click', () => {
        // Alterna a classe 'open' no navbar e no menu mobile
        document.getElementById('main-navbar').classList.toggle('open');
        document.getElementById('mobile-menu').classList.toggle('open');
    });
}
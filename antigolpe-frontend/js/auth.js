// js/auth.js
import { authApi } from './api.js';

export const auth = {
    isLoggedIn: () => {
        return localStorage.getItem('jwtToken') !== null;
    },

    getToken: () => {
        return localStorage.getItem('jwtToken');
    },

    saveToken: (token) => {
        localStorage.setItem('jwtToken', token);
    },

    removeToken: () => {
        localStorage.removeItem('jwtToken');
    },

    async login(email, password) {
        try {
            const data = await authApi.authenticate(email, password);
            this.saveToken(data.token);
            // Salva o email ou nome do usuário também para exibir no navbar
            localStorage.setItem('userEmail', email);

            // --- ESTA É A LINHA ADICIONADA/CORRIGIDA ---
            window.location.href = 'dashboard.html'; // Redireciona para o dashboard após login bem-sucedido
            // ------------------------------------------
            
            return { success: true }; // Retorna sucesso para o chamador
        } catch (error) {
            console.error('Erro no login:', error);
            // Captura a mensagem de erro do backend se disponível
            return { success: false, message: error.data ? error.data.message : 'Credenciais inválidas' };
        }
    },

    async register(firstname, lastname, email, password) {
        try {
            await authApi.register(firstname, lastname, email, password);
            return { success: true };
        } catch (error) {
            console.error('Erro no registro:', error);
            return { success: false, message: error.data ? error.data.message : 'Erro ao registrar' };
        }
    },

    logout() {
        this.removeToken();
        localStorage.removeItem('userEmail'); // Remove também o email do usuário
        window.location.href = 'index.html'; // Redireciona para a tela de login
    },

    // Garante que o usuário está logado em páginas protegidas
    requireAuth() {
        if (!this.isLoggedIn()) {
            this.logout(); // Redireciona para o login se não estiver autenticado
            return false;
        }
        return true;
    }
};
// js/api.js (CORRIGIDO)
const API_BASE_URL = 'https://antigolpe-api.onrender.com/api/v1';

// Função auxiliar para fazer chamadas à API
async function callApi(endpoint, method = 'GET', body = null, requiresAuth = true) {
    
    const config = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (requiresAuth) {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
    }

    if (body) {
        config.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // --- ESTA É A CORREÇÃO ---
    // Verifica se a resposta foi bem-sucedida (status 200-299) ANTES de tentar ler o JSON
    if (!response.ok) {
        // Se a resposta for 401, 403, 500 etc., ela pode não ter um corpo JSON.
        // Nós criamos nosso próprio objeto de erro.
        const errorMessage = response.status === 401 ? "Credenciais Inválidas" : `Erro ${response.status}`;
        const error = new Error(errorMessage);
        error.status = response.status;
        
        // Tenta ler a resposta como texto para ver se o backend deu mais detalhes
        try {
            error.data = await response.json(); 
        } catch (e) {
            error.data = { message: errorMessage };
        }
        
        throw error;
    }
    // --- FIM DA CORREÇÃO ---

    // Se a resposta for 204 No Content (como na deleção), não tenta parsear JSON
    if (response.status === 204) {
        return { status: 204 };
    }

    // Só tenta ler o JSON se tivermos certeza que a resposta foi OK (ex: 200)
    const data = await response.json();
    return data;
}

// Funções específicas para o módulo de autenticação
export const authApi = {
    register: (firstname, lastname, email, password) =>
        callApi('/auth/register', 'POST', { firstname, lastname, email, password }, false), // Não requer autenticação
    authenticate: (email, password) =>
        callApi('/auth/authenticate', 'POST', { email, password }, false), // Não requer autenticação
};

// Funções para os cartões (protegidas)
export const cardApi = {
    getCards: () =>
        callApi('/cards', 'GET', null, true), // Requer autenticação
    addCard: (cardData) =>
        callApi('/cards', 'POST', cardData, true), // Requer autenticação
    deleteCard: (cardId) =>
        callApi(`/cards/${cardId}`, 'DELETE', null, true), // Requer autenticação
};

// Funções para as transações (protegidas)
export const transactionApi = {
    getAllMyTransactions: () =>
        callApi('/transactions', 'GET', null, true), // Requer autenticação
    getTransactionsByCard: (cardId) =>
        callApi(`/transactions/cartao/${cardId}`, 'GET', null, true), // Requer autenticação
    addTransaction: (cardId, transactionData) =>
        callApi(`/transactions/cartao/${cardId}`, 'POST', transactionData, true), // Requer autenticação
};
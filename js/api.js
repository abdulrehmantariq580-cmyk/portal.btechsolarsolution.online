const API_BASE_URL = 'http://localhost:8080/api';

const api = {
    async get(endpoint) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`);
            if (!response.ok) throw new Error('Network response failed');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return []; // Return empty array to prevent crashes
        }
    },

    async post(endpoint, data) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Network response failed');
            return await response.json();
        } catch (error) {
            console.error(`Error posting to ${endpoint}:`, error);
            return null;
        }
    }
};

// Global Exposure
window.api = api;

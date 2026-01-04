import api from './api';

const analyticsService = {
    // Get dashboard overview
    getOverview: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        const response = await api.get(`/analytics/overview?${params.toString()}`);
        return response.data;
    },

    // Get issues by category
    getByCategory: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        const response = await api.get(`/analytics/by-category?${params.toString()}`);
        return response.data;
    },

    // Get issues by area
    getByArea: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        const response = await api.get(`/analytics/by-area?${params.toString()}`);
        return response.data;
    },

    // Get issues by status
    getByStatus: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        const response = await api.get(`/analytics/by-status?${params.toString()}`);
        return response.data;
    },

    // Get trend data
    getTrends: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        const response = await api.get(`/analytics/trends?${params.toString()}`);
        return response.data;
    },

    // Get top issues
    getTopIssues: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        const response = await api.get(`/analytics/top-issues?${params.toString()}`);
        return response.data;
    },
};

export default analyticsService;

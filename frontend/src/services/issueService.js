import api from './api';

const issueService = {
    // Create new issue
    create: async (formData) => {
        const response = await api.post('/issues', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Get all issues with filters
    getAll: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
                params.append(key, filters[key]);
            }
        });

        const response = await api.get(`/issues?${params.toString()}`);
        return response.data;
    },

    // Get issue by ID
    getById: async (id) => {
        const response = await api.get(`/issues/${id}`);
        return response.data;
    },

    // Update issue
    update: async (id, updates) => {
        const response = await api.put(`/issues/${id}`, updates);
        return response.data;
    },

    // Update issue status
    updateStatus: async (id, status, comment) => {
        const response = await api.post(`/issues/${id}/status`, { status, comment });
        return response.data;
    },

    // Add comment to issue
    addComment: async (id, comment) => {
        const response = await api.post(`/issues/${id}/comment`, { comment });
        return response.data;
    },

    // Delete issue
    delete: async (id) => {
        const response = await api.delete(`/issues/${id}`);
        return response.data;
    },

    // Get issue statistics
    getStatistics: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        const response = await api.get(`/issues/stats/overview?${params.toString()}`);
        return response.data;
    },
};

export default issueService;

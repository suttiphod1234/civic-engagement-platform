import { Navigate } from 'react-router-dom';

const roleHierarchy = {
    CITIZEN: 1,
    COORDINATOR: 2,
    ADMIN: 3,
};

function ProtectedRoute({ children, user, minRole = 'CITIZEN' }) {
    if (!user) {
        return <Navigate to="/login" />;
    }

    const userLevel = roleHierarchy[user.role] || 0;
    const requiredLevel = roleHierarchy[minRole] || 0;

    if (userLevel < requiredLevel) {
        return <Navigate to="/dashboard" />;
    }

    return children;
}

export default ProtectedRoute;

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import authService from './services/authService';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SubmitIssue from './pages/SubmitIssue';
import IssueList from './pages/IssueList';
import IssueDetail from './pages/IssueDetail';
import MyIssues from './pages/MyIssues';
import UserManagement from './pages/UserManagement';
import CategoryManagement from './pages/CategoryManagement';
import AreaManagement from './pages/AreaManagement';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
        <div className="spinner spinner-primary"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        {user && <Navbar user={user} onLogout={handleLogout} />}

        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={
            user ? <Navigate to="/dashboard" /> : <Login setUser={setUser} />
          } />
          <Route path="/register" element={
            user ? <Navigate to="/dashboard" /> : <Register setUser={setUser} />
          } />

          {/* Protected Routes - All Users */}
          <Route path="/dashboard" element={
            <ProtectedRoute user={user}>
              <Dashboard />
            </ProtectedRoute>
          } />

          <Route path="/submit-issue" element={
            <ProtectedRoute user={user}>
              <SubmitIssue />
            </ProtectedRoute>
          } />

          <Route path="/my-issues" element={
            <ProtectedRoute user={user}>
              <MyIssues />
            </ProtectedRoute>
          } />

          <Route path="/issues" element={
            <ProtectedRoute user={user} minRole="COORDINATOR">
              <IssueList />
            </ProtectedRoute>
          } />

          <Route path="/issues/:id" element={
            <ProtectedRoute user={user}>
              <IssueDetail />
            </ProtectedRoute>
          } />

          {/* Admin Only Routes */}
          <Route path="/users" element={
            <ProtectedRoute user={user} minRole="ADMIN">
              <UserManagement />
            </ProtectedRoute>
          } />

          <Route path="/categories" element={
            <ProtectedRoute user={user} minRole="ADMIN">
              <CategoryManagement />
            </ProtectedRoute>
          } />

          <Route path="/areas" element={
            <ProtectedRoute user={user} minRole="ADMIN">
              <AreaManagement />
            </ProtectedRoute>
          } />

          {/* Default Route */}
          <Route path="/" element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

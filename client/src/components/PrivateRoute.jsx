import React, { useContext } from 'react';
import { AuthContext } from '../main';
import { Navigate } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { auth } = useContext(AuthContext);

    if (auth.loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <Spinner animation="border" />
            </div>
        );
    }

    if (!auth.isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (adminOnly && auth.user.role !== 'admin') {
        return <Navigate to="/" />; // Not an admin, redirect to dashboard
    }

    return children;
};
export default PrivateRoute;
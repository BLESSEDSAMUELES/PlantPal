import React, { useState, useContext } from 'react';
import { AuthContext } from '../main';
import { useNavigate, Navigate } from 'react-router-dom';
import { Container, Form, Button, Alert } from 'react-bootstrap';

const Login = () => {
    const { login, auth } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState(null);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError(null);
        try {
            await login(formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.msg || 'Login failed');
        }
    };

    if (auth.isAuthenticated) {
        return <Navigate to="/" />;
    }

    return (
        <Container style={{ maxWidth: '500px' }} className="mt-5">
            <h2 className="text-center mb-4">Login</h2>
            <Form onSubmit={onSubmit}>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form.Group className="mb-3" controlId="email">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        name="email"
                        type="email"
                        onChange={onChange}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        name="password"
                        type="password"
                        onChange={onChange}
                        required
                    />
                </Form.Group>
                <Button type="submit" variant="success" className="w-100">
                    Login
                </Button>
            </Form>
        </Container>
    );
};
export default Login;
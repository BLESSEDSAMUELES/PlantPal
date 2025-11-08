import React, { useContext } from 'react';
import { AuthContext } from '../main';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Button, Container, Image } from 'react-bootstrap';

const AppNavbar = () => {
    const { auth, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const onLogout = () => {
        logout();
        navigate('/login');
    };

    const authLinks = (
        <Nav className="ms-auto align-items-center">
            {/* --- Shows Profile Picture --- */}
            {auth.user?.profilePictureUrl ? (
                <Image
                    src={auth.user.profilePictureUrl}
                    alt={auth.user.username}
                    roundedCircle
                    style={{ width: '40px', height: '40px', objectFit: 'cover', marginRight: '10px' }}
                />
            ) : (
                <Nav.Link as={Link} to="/profile" className="text-dark">
                    Hi, {auth.user?.username}
                </Nav.Link>
            )}

            <Nav.Link as={Link} to="/profile" className="text-dark d-none d-md-block">
                Profile
            </Nav.Link>

            {auth.user?.role === 'admin' && (
                <Nav.Link as={Link} to="/admin" className="fw-bold text-danger">
                    Admin Panel
                </Nav.Link>
            )}
            <Button onClick={onLogout} variant="danger" className="ms-2">Logout</Button>
        </Nav>
    );

    const guestLinks = (
        <Nav className="ms-auto">
            <Nav.Link as={Link} to="/login">
                <Button variant="outline-success">Login</Button>
            </Nav.Link>
            <Nav.Link as={Link} to="/register">
                <Button variant="success">Sign Up</Button>
            </Nav.Link>
        </Nav>
    );

    return (
        <Navbar bg="light" expand="lg" className="shadow-sm">
            <Container>
                <Navbar.Brand as={Link} to="/" className="fw-bold text-success">
                    🪴 PlantPal
                </Navbar.Brand>
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    {auth.isAuthenticated ? authLinks : guestLinks}
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};
export default AppNavbar;
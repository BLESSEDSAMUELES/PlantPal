// client/src/components/AdminPanel.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Spinner, Alert, Row, Col, Card, Table, Badge } from 'react-bootstrap';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminPanel = () => {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, statsRes] = await Promise.all([
                    axios.get('/api/admin/users'),
                    axios.get('/api/admin/stats')
                ]);
                setUsers(usersRes.data);
                setStats(statsRes.data);
            } catch (err) { setError('Could not fetch admin data.'); } finally { setLoading(false); }
        };
        fetchData();
    }, []);

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="light" /></div>;
    if (error) return <Alert variant="danger" className="mt-5">{error}</Alert>;

    return (
        <Container className="mt-5">
            <h2 className="mb-4 text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>📊 Admin Analytics Dashboard</h2>

            <Row className="mb-4 g-4">
                <Col md={6}>
                    <Card className="text-center p-4 shadow border-0">
                        <h3 className="text-muted">👥 Total Users</h3>
                        <h1 className="text-primary display-3 fw-bold">{stats?.counts.users || 0}</h1>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="text-center p-4 shadow border-0">
                        <h3 className="text-muted">🌱 Plants Saved</h3>
                        <h1 className="text-success display-3 fw-bold">{stats?.counts.plants || 0}</h1>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-5 g-4">
                <Col lg={6}>
                    <Card className="p-3 shadow border-0 h-100">
                        <Card.Body>
                            <Card.Title className="text-center mb-4">📈 User Growth Timeline</Card.Title>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <LineChart data={stats?.timeline}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={6}>
                    <Card className="p-3 shadow border-0 h-100">
                        <Card.Body>
                            <Card.Title className="text-center mb-4">🏆 Top Popular Plants</Card.Title>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={stats?.popular}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-15} textAnchor="end" height={60} />
                                        <YAxis allowDecimals={false} />
                                        <Tooltip />
                                        <Bar dataKey="count" fill="#82ca9d" name="Times Saved" radius={[5, 5, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="p-4 border-0 shadow">
                <h4 className="mb-3">Recent Users</h4>
                <Table striped hover responsive>
                    <thead className="table-dark">
                        <tr><th>Username</th><th>Email</th><th>Role</th><th>Joined Date</th></tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td><Badge bg={user.role === 'admin' ? 'danger' : 'primary'}>{user.role}</Badge></td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card>
        </Container>
    );
};
export default AdminPanel;
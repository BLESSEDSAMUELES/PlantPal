// client/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container, Form, Button, Image, Spinner, Alert, Card, Stack, Table, Badge
} from 'react-bootstrap';

function Dashboard() {
    // --- State ---
    const [selectedFile, setSelectedFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [healthData, setHealthData] = useState(null);
    const [isLoading, setIsLoading] = useState(false); // For Identify
    const [isCheckingHealth, setIsCheckingHealth] = useState(false); // For Health
    const [error, setError] = useState(null);
    const [myGarden, setMyGarden] = useState([]);
    const [gardenLoading, setGardenLoading] = useState(true);
    const [alert, setAlert] = useState(null); // For success/info messages

    // --- Fetch Garden ---
    const fetchGarden = async () => {
        try {
            setGardenLoading(true);
            const res = await axios.get('/api/garden');
            setMyGarden(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setGardenLoading(false);
        }
    };
    useEffect(() => { fetchGarden(); }, []);

    // --- File Select ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
            // Reset all result states
            setHealthData(null);
            setError(null);
            setAlert(null);
        }
    };

    // --- IDENTIFY & SAVE ---
    const handleIdentify = async (e) => {
        e.preventDefault();
        if (!selectedFile) return;
        setIsLoading(true);
        setError(null);
        setAlert(null);
        setHealthData(null);

        const formData = new FormData();
        formData.append('image', selectedFile);

        try {
            // Call our new all-in-one endpoint
            const res = await axios.post('/api/identify', formData);
            setAlert({ type: 'success', msg: `Success! Added ${res.data.plant.commonName} to your garden.` });
            fetchGarden(); // Refresh table
            setPreview(null); // Clear form
            setSelectedFile(null);
        } catch (err) {
            setError(err.response?.data?.error || 'Error identifying plant.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- HEALTH CHECK ---
    const handleHealthCheck = async () => {
        if (!selectedFile) return;
        setIsCheckingHealth(true);
        setHealthData(null);
        setError(null);
        setAlert(null);

        const formData = new FormData();
        formData.append('image', selectedFile);
        try {
            const res = await axios.post('/api/health', formData);
            setHealthData(res.data); // Set health data to show the card
        } catch (err) {
            setError(err.response?.data?.error || 'Error checking health.');
        } finally {
            setIsCheckingHealth(false);
        }
    };

    // --- DELETE PLANT ---
    const handleDelete = async (id) => {
        try {
            await axios.delete(`/api/garden/${id}`);
            fetchGarden();
            setAlert({ type: 'info', msg: 'Plant removed from garden.' });
        } catch (err) {
            setAlert({ type: 'danger', msg: 'Could not remove plant.' });
        }
    };

    return (
        <Container className="my-5" style={{ maxWidth: '800px' }}>
            <Stack gap={4}>
                {/* --- Header --- */}
                <div className="text-center mb-3">
                    <h1 className="fw-bold text-success">🪴 PlantPal Dashboard</h1>
                    <p className="text-muted">Identify plants, check their health, and build your digital garden.</p>
                </div>

                {/* --- Alerts --- */}
                {alert && <Alert variant={alert.type} onClose={() => setAlert(null)} dismissible>{alert.msg}</Alert>}
                {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

                {/* --- Main Action Card --- */}
                <Card className="shadow border-0">
                    <Card.Body className="p-4 p-md-5">
                        <Form>
                            <Form.Group controlId="fileUpload" className="mb-4">
                                <Form.Label className="fw-bold h5">📸 Snap a Photo</Form.Label>
                                <Form.Control type="file" accept="image/*" size="lg" onChange={handleFileChange} />
                            </Form.Group>

                            {preview && (
                                <div className="text-center mb-4 p-3 bg-light rounded">
                                    <Image src={preview} alt="Preview" fluid rounded style={{ maxHeight: '350px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                                </div>
                            )}

                            <Stack direction="horizontal" gap={3}>
                                <Button variant="success" size="lg" className="w-100 fw-bold" onClick={handleIdentify} disabled={!selectedFile || isLoading || isCheckingHealth}>
                                    {isLoading ? <Spinner as="span" animation="border" size="sm" /> : '🌱 Identify & Save'}
                                </Button>
                                <Button variant="primary" size="lg" className="w-100 fw-bold" onClick={handleHealthCheck} disabled={!selectedFile || isLoading || isCheckingHealth}>
                                    {isCheckingHealth ? <Spinner as="span" animation="border" size="sm" /> : '🩺 Is it Sick?'}
                                </Button>
                            </Stack>
                        </Form>
                    </Card.Body>
                </Card>

                {/* --- Health Results (Crash-Proof) --- */}
                {healthData && (
                    <Card className={`shadow-sm border-0 border-top-0 border-bottom-0 border-5 border-start ${healthData.is_healthy ? 'border-success' : 'border-danger'}`}>
                        <Card.Header className={`p-3 border-0 ${healthData.is_healthy ? 'bg-success-light' : 'bg-danger-light'}`}>
                            <h4 className={`fw-bold mb-0 ${healthData.is_healthy ? 'text-success' : 'text-danger'}`}>
                                {healthData.is_healthy ? '✅ Healthy Plant' : '⚠️ Potential Issues Detected'}
                            </h4>
                        </Card.Header>
                        {!healthData.is_healthy && (
                            <Card.Body>
                                {healthData.diseases && healthData.diseases.length > 0 ? (
                                    healthData.diseases.map(disease => (
                                        <div key={disease.id} className="mb-3 p-3 bg-light rounded border">
                                            <h5>{disease.disease_details.common_names?.[0] || disease.name}</h5>
                                            <p className="mb-2">{disease.disease_details?.description}</p>
                                            <Badge bg="info" className="text-dark p-2">Treatment: {disease.disease_details.treatment?.chemical?.[0] || 'N/A'}</Badge>
                                        </div>
                                    ))
                                ) : (
                                    <p>Health issue detected, but no specific diseases were returned by the API.</p>
                                )}
                            </Card.Body>
                        )}
                    </Card>
                )}

                {/* --- My Garden Table --- */}
                <div className="mt-4">
                    <h2 className="fw-bold mb-4 border-bottom pb-2">🏡 My Garden</h2>
                    {gardenLoading ? (
                        <div className="text-center p-5"><Spinner animation="grow" variant="success" /></div>
                    ) : (
                        <Card className="shadow-sm border-0">
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="py-3 ps-4">Plant</th>
                                        <th>Name</th>
                                        <th>Scientific Name</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myGarden.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center p-5 text-muted fst-italic">Your garden is empty. Start by identifying a plant!</td></tr>
                                    ) : (
                                        myGarden.map(plant => (
                                            <tr key={plant._id}>
                                                <td className="ps-4">
                                                    <Image src={plant.imageUrl} roundedCircle style={{ width: '60px', height: '60px', objectFit: 'cover', border: '3px solid #fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }} />
                                                </td>
                                                <td className="fw-bold text-success">{plant.commonName}</td>
                                                <td className="fst-italic text-muted">{plant.scientificName}</td>
                                                <td className="text-end pe-4">
                                                    <Button variant="outline-danger" size="sm" onClick={() => handleDelete(plant._id)}>🗑️ Remove</Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card>
                    )}
                </div>
            </Stack>
        </Container>
    );
}
export default Dashboard;
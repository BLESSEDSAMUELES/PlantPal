import React, { useState, useContext } from 'react';
import { AuthContext } from '../main';
import axios from 'axios';
import { Container, Form, Button, Alert, Card, Image } from 'react-bootstrap';

const Profile = () => {
    const { auth, updateUser } = useContext(AuthContext);

    // State for username form
    const [username, setUsername] = useState(auth.user?.username || '');
    const [userAlert, setUserAlert] = useState(null);

    // State for picture form
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(auth.user?.profilePictureUrl || null);
    const [picAlert, setPicAlert] = useState(null);
    const [uploading, setUploading] = useState(false);

    // --- Username Form Handler ---
    const onUserSubmit = async (e) => {
        e.preventDefault();
        setUserAlert(null);
        try {
            const res = await axios.put('/api/profile', { username });
            updateUser(res.data);
            setUserAlert({ type: 'success', msg: 'Profile Updated!' });
        } catch (err) {
            setUserAlert({ type: 'danger', msg: 'Could not update profile.' });
        }
    };

    // --- Picture File Change Handler ---
    const onFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    // --- Picture Form Submit Handler ---
    const onPicSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            return setPicAlert({ type: 'warning', msg: 'Please select a file first.' });
        }
        setPicAlert(null);
        setUploading(true);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('/api/profile/picture', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            updateUser(res.data); // Update context with new user data (inc. URL)
            setPicAlert({ type: 'success', msg: 'Profile picture updated!' });
        } catch (err) {
            setPicAlert({ type: 'danger', msg: 'Upload failed.' });
        } finally {
            setUploading(false);
        }
    };

    return (
        <Container style={{ maxWidth: '600px' }} className="mt-5">
            <h2 className="text-center mb-4">Edit Profile</h2>

            {/* --- Form 1: Edit Username --- */}
            <Card className="p-4 mb-4 shadow-sm">
                <Form onSubmit={onUserSubmit}>
                    <h4 className="mb-3">Update Details</h4>
                    {userAlert && <Alert variant={userAlert.type}>{userAlert.msg}</Alert>}
                    <Form.Group className="mb-3" controlId="email">
                        <Form.Label>Email (cannot be changed)</Form.Label>
                        <Form.Control value={auth.user?.email || ''} readOnly disabled />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="username">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </Form.Group>
                    <Button type="submit" variant="success" className="w-100">
                        Save Changes
                    </Button>
                </Form>
            </Card>

            {/* --- Form 2: Upload Profile Picture --- */}
            <Card className="p-4 shadow-sm">
                <Form onSubmit={onPicSubmit}>
                    <h4 className="mb-3">Update Profile Picture</h4>
                    {picAlert && <Alert variant={picAlert.type}>{picAlert.msg}</Alert>}

                    {preview && (
                        <Image
                            src={preview}
                            alt="Profile Preview"
                            roundedCircle
                            style={{ width: '150px', height: '150px', objectFit: 'cover', display: 'block', margin: '0 auto 20px' }}
                        />
                    )}

                    <Form.Group className="mb-3" controlId="picture">
                        <Form.Control type="file" accept="image/*" onChange={onFileChange} />
                    </Form.Group>
                    <Button type="submit" variant="primary" className="w-100" disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Upload Picture'}
                    </Button>
                </Form>
            </Card>
        </Container>
    );
};
export default Profile;
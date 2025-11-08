import axios from 'axios';

// Set the base URL for all Axios requests
axios.defaults.baseURL = 'http://localhost:5000'; // Your backend

const setAuthToken = (token) => {
    if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
        delete axios.defaults.headers.common['x-auth-token'];
    }
};

export default setAuthToken;
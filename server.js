const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet'); // Import helmet module

const app = express();

// Enable CORS for the specified domain
app.use(cors({
    origin: 'https://nativerus-bridge.vercel.app' // Replace with your actual main app domain
}));

// Use helmet to set security-related HTTP headers
app.use(helmet({
    frameguard: {
        action: 'allow-from',
        domain: 'https://nativerus-bridge.vercel.app' // Replace with your actual main app domain
    }
}));

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Handles any requests that don't match the ones above
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


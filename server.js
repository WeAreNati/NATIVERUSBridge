const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();

app.use(cors({
    origin: 'https://nati-web-pi.vercel.app/' // Replace with your actual main app domain
}));

// Use helmet to set security-related HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        useDefaults: true,
        directives: {
            frameAncestors: ["'self'", "https://nati-web-pi.vercel.app/"], // Allow framing from your main site
        }
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


const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const mysql = require('./mysql');
const routes = require('./routes');
const secondPaymntRoute = require('./pay2Route');
const firstPayRoute = require('./pay1Route');
const fs = require('fs');
const uploadDir = 'uploads';

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
const app = express();

// Middleware to parse incoming request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json()); // Add this to parse JSON bodies as well
app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Set up multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Destination folder for uploaded files
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname); // Unique filename for uploaded files
    }
});

// File filter to allow only jpeg, jfif, and pdf files
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|jfif|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
        return cb(null, true);
    }
    cb(new Error('Only .jpeg, .jpg, .jfif, and .pdf files are allowed!'));
};

// Create multer instance with storage and file filter
const upload = multer({ storage: storage, fileFilter: fileFilter });

// Serve HTML files
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/app_payment', (req, res) => res.sendFile(path.join(__dirname, 'public', 'app_payment.html')));
app.get('/apply', (req, res) => res.sendFile(path.join(__dirname, 'public', 'apply.html')));
app.get('/firstpay', (req, res) => res.sendFile(path.join(__dirname, 'public', 'firstpay.html')));
app.get('/secondPay', (req, res) => res.sendFile(path.join(__dirname, 'public', 'secondPay.html')));

// Use routes defined and pass the upload instance
routes(app);
secondPaymntRoute(app);
firstPayRoute(app);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

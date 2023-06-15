const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');
require('dotenv').config();

// Environment Variables
const smtpUsername = process.env.SMTP_USERNAME;
const smtpPassword = process.env.SMTP_PASSWORD;

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static('./'));

// Generate a random 6-digit OTP
const generateOTP = () => otpGenerator.generate(6, { digits: true, lowerCaseAlphabets : false, upperCaseAlphabets: false, specialChars: false });

// Store the generated OTP
let otp = null;

// GET request handler to retrieve the OTP
app.get('/getOTP', (req, res) => {
    // Generate a new OTP
    otp = generateOTP();

    if (otp) {
        // Send a success response with the OTP as JSON
        res.status(201).json({ otp: otp });
    } else {
        // Send an error response with a custom error message
        res.status(500).json({ error: 'Failed to generate OTP' });
    }
});

// POST request handler to send email
app.post('/sendEmail', (req, res) => {
    const { email, emailBody } = req.body;

    // Define a regular expression pattern to match the domain '.dso.org.sg'
    const domainPattern = /@gmail\.com$/i;
    // const domainPattern = /@.*\.dso\.org\.sg$/i;

    // Configure Nodemailer transporter
    const transporter = nodemailer.createTransport({
        // Replace with your SMTP settings, in my case I had used Gmail and Gmail App Password
        service: 'gmail',
        auth: {
            user: smtpUsername,
            pass: smtpPassword
        }
    });

    // Define the email options
    let mailOptions;
    if (domainPattern.test(email)) {
        mailOptions = {
            from: smtpUsername,
            to: email,
            subject: 'Email OTP',
            html: `<p>Your OTP Code is <strong>${emailBody}</strong>. The code is valid for 1 minute.</p>`
        };
    } else {
        mailOptions = {
            from: smtpUsername,
            to: email,
            subject: 'Invalid Email Address',
            text: `The following email address is invalid: ${email}\n\n${emailBody}`
        };
    }

    // Send the email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error occurred while sending email:', error);
            res.status(500).send('Failed to send email');
        } else {
            console.log('Email sent successfully');
            res.status(200).send('Email sent successfully');
        }
    });
});

// Display server running
app.get('/', (req, res) => {
    res.send(`Server running on port ${PORT}`);
});

app.listen(PORT, () => {
    console.log(`App listening to port ${PORT}`);
});

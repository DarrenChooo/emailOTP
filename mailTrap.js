const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const { MailtrapClient } = require('mailtrap')

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Serve static files from the current directory
app.use(express.static('./'));

// Define a route to handle the email sending
app.post('/sendEmail', async (req, res) => {
    const { email, otp } = req.body;

    const client = new MailtrapClient({ token: '85e3b4f3d425d2f99d60473830e56f70' });

    const sender = {
        email: 'mailtrap@hello12305213.com',
        name: 'Mailtrap Test',
    };

    try {
        const response = await client.send({
        from: sender,
        to: [{ email: email }],
        subject: 'Email OTP',
        text: `Your OTP is: ${otp}`
        });
    
        console.log('Email sent successfully');
        console.log('Message ID:', response.id);
        res.status(200).send('Email sent successfully');
    } catch (error) {
        console.error('Error occurred while sending email:', error);
        res.status(500).send('Failed to send email');
    }
});

// Display server running
app.get('/', (req, res) => {
    res.send(`Server running on port ${PORT}`);
});

app.listen(PORT, () => {
    console.log(`App listening to port ${PORT}`);
});

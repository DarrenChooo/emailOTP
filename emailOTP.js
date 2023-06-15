// Get the email form and its elements
const emailForm = document.getElementById('emailForm');
const emailInput = document.getElementById('emailInput');
const successVerification = document.getElementById('successVerification')
const failedVerification = document.getElementById('failedVerification')
const reloadBtn = document.getElementById('reloadBtn'); 

// Get the verify OTP form and its elements
const verifyOTPForm = document.getElementById('verifyOTPForm');
const otpInput = document.getElementById('otpInput');
const verifyOTPBtn = document.getElementById('verifyOTPBtn');
const otpErrorMessage = document.getElementById('otpErrorMessage'); 
const countdownTimer = document.getElementById('countdownTimer');

// Global variables to store the generated OTP, the number of tries, and the timer interval
let generatedOTP;
let tryCount = 0;

// Add an event listener to the form's submit button
emailForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting and refreshing the page

    // Get the user's email address
    const userEmail = document.getElementById('emailInput').value;

    // Define a regular expression pattern to match the domain '.dso.org.sg'
    // const domainPattern = /@.*\.dso\.org\.sg$/i;
    
    const domainPattern = /@gmail\.com$/i; // This pattern is for '@gmail.com' for testing purposes.

    // Check if the email domain matches the pattern
    if (domainPattern.test(userEmail)) {
        // Send a GET request to retrieve the OTP from the server
        fetch('/getOTP')
            .then(response => response.json())
            .then(data => {
                const otp = data.otp; // Extract the OTP from the response

                // Send a request to your server-side endpoint to send the email
                sendEmailToServer(userEmail, otp);

                // Hide the first form
                emailForm.classList.add('d-none');

                // Show the second form
                verifyOTPForm.classList.remove('d-none');

                // Start the timer for OTP validity
                startTimer()                
            })
            .catch(error => {
                console.error('An error occurred while retrieving the OTP:', error);
            });
    } else {
        // Email address doesn't match the required pattern
        const invalidEmailMessage = "Please enter an email address ending with '.dso.org.sg'.";
        sendEmailToServer(userEmail, invalidEmailMessage);

        // Hide the first form
        emailForm.classList.add('d-none');

        // Show the error message
        failedVerification.classList.remove('d-none');
        reloadBtn.classList.remove('d-none');
    }
});

// Function to send a request to the server to send the email
function sendEmailToServer(email, otp) {
    generatedOTP = otp;

    // Send an HTTP request to your server-side endpoint
    // Pass the email and otp as data in the request body
    fetch('/sendEmail', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            emailBody: otp
        })
    })
    .then(response => {
        if (response.ok) {
            console.log('Email containing OTP has been sent successfully.');
        } else {
            console.error('Email address is invalid');
        }
    })
    .catch(error => {
        console.error('Email address does not exist or sending to the email has failed');
    });
}

// Function to start the timer for OTP validity
function startTimer() {
    secondsRemaining = 60; // Set the initial seconds remaining to 60

    // Update the countdown timer every second
    const timerInterval = setInterval(() => {
    secondsRemaining--; // Decrement the seconds remaining

    if (secondsRemaining <= 0) {
        // OTP validity has expired
        clearInterval(timerInterval);
        countdownTimer.textContent = ''; // Clear the timer text

        // Hide the verify OTP form
        verifyOTPForm.classList.add('d-none');

        // Show the email form
        emailForm.classList.remove('d-none');

        // Reload the page
        location.reload();
    } else {
        countdownTimer.textContent = `OTP is valid for ${secondsRemaining} seconds`; // Update the timer text
    }
    }, 1000);
}

// Add an event listener to the verify OTP form's submit button
verifyOTPForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent the form from submitting and refreshing the page

    // Get the user's entered OTP
    const userOTP = otpInput.value;

    // Check if the user entered the correct OTP
    if (userOTP === generatedOTP) {
        // Show the success message
        successVerification.classList.remove('d-none')

        // Hide the verify OTP form
        verifyOTPForm.classList.add('d-none');
    } else {
        // OTP is incorrect
        tryCount++;
        if (tryCount >= 10) {
            // Maximum number of tries exceeded
            alert('Maximum number of tries exceeded. OTP validation failed.');

            // Reset tryCount
            tryCount = 0;

            // Hide the verify OTP form
            verifyOTPForm.classList.add('d-none');

            // Show the email form
            emailForm.classList.remove('d-none');
            
            // Clear the email input
            emailInput.value = '';
        } else {
            // Display an error message and allow the user to try again
            otpErrorMessage.textContent = `Invalid OTP. Please try again. Tries left: ${10 - tryCount}.`// Update the error message text
            otpErrorMessage.classList.remove('d-none'); 
        }
    }
})

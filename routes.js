const db = require('./mysql');

module.exports = function (app) {
    // Handle form submission
    app.post('/submit', (req, res) => {
        const { surname, firstName, lastName, address, emailAddress, phoneNumber, dob, highestQualification, courseApplied, hasComputerCertificate, picture, primaryCert, secondaryCert, higherCert, computerCert } = req.body;
        // Check if the email or phone number already exists in the database
        const checkIfExistsQuery = 'SELECT * FROM form_data WHERE emailAddress = ? OR phoneNumber = ?';
        db.query(checkIfExistsQuery, [emailAddress, phoneNumber], (checkErr, checkResult) => {
            if (checkErr) {
                console.error('Error checking for existing email or phone number:', checkErr);
                return res.status(500).send('An error occurred while processing the form');
            }

            if (checkResult.length > 0) {
                // Email or phone number already exists in the database
                return res.status(400).send('Email address or phone number already registered');
            }
    // Calculate application fee and determine duration based on the course applied
    let applicationFee = 0;
    let duration = '';
    switch (courseApplied.toLowerCase()) {
        case 'web development':
            applicationFee = 100;
            duration = 'four months';
            break;
        case 'computer application':
            applicationFee = 110;
            duration = 'six weeks';
            break;
        default:
            applicationFee = 0;
            duration = 'to be determined';
            break;
    }

    // Generate temporary application number
    let initials = '';
    let courseAbbreviation = '';
    switch (courseApplied.toLowerCase()) {
        case 'web development':
            initials = 'F';
            courseAbbreviation = 'WEB';
            break;
        case 'computer application':
            initials = 'F';
            courseAbbreviation = 'CA';
            break;
        default:
            initials = 'O';
            courseAbbreviation = 'OTH';
            break;
    }
    const uniqueNumber = Math.floor(Math.random() * 10000);
    const applicationNumber = initials + courseAbbreviation + uniqueNumber;

    // Insert form data into MySQL database with empty reference number and no admission number
    const insertQuery = 'INSERT INTO form_data (applicationNumber, surname, firstName, lastName, address, emailAddress, phoneNumber, dob, highestQualification, courseApplied, hasComputerCertificate, picture, primaryCert, secondaryCert, higherCert, computerCert, applicationFee, referenceNumber, admissionNumber, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(insertQuery, [applicationNumber, surname, firstName, lastName, address, emailAddress, phoneNumber, dob, highestQualification, courseApplied, hasComputerCertificate, picture, primaryCert, secondaryCert, higherCert, computerCert, applicationFee, '', '', '', ''], (insertErr, insertResult) => {
        if (insertErr) {
            console.error('Error inserting data into MySQL:', insertErr);
            return res.status(500).send('An error occurred while submitting the form');
        }
        console.log('Data inserted into MySQL table:', insertResult);

        // Send response with application details
        const welcomeMessage = `Dear ${firstName}, Congratulations! You have applied to study ${courseApplied} at CompuTech Nexus Academy. The duration of the course is ${duration}. Your application number is ${applicationNumber}. The application fee is ${applicationFee}. Please download your application form and proceed to payment.`;
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Form Submission</title>
                <style>
                    body {
                        display: flex;
                        justify-content: left;
                        align-items: center;
                        height: 100vh;
                        margin: 0;
                        text-align: center;
                    }
                    .message {
                        width: 80%;
                        max-width: 600px;
                        margin: auto;
                    }
                </style>
            </head>
            <body>
                <div class="message">
                <p>${welcomeMessage}</p>
                <p>Click <a href="/application_form/${applicationNumber}" target="_blank">here</a> to download or print your application_form.</p>
                <p>Click continue to proceed to payment of application Fee</p>
                <form action="/app_payment" method="GET">
                    <input type="hidden" name="applicationNumber" value="${applicationNumber}">
                    <button type="submit">Continue</button>
                </form>
                </div>
            </body>
            </html>
        `);
    });
});
});

// Serve the application form based on application number
app.get('/application_form/:applicationNumber', (req, res) => {
    const applicationNumber = req.params.applicationNumber;

    // Query the database to fetch student details based on the application number
    const query = 'SELECT * FROM form_data WHERE applicationNumber = ?';
    db.query(query, [applicationNumber], (err, result) => {
        if (err) {
            console.error('Error fetching student details:', err);
            return res.status(500).send('An error occurred while fetching student details');
        }

        if (result.length === 1) {
            const studentDetails = result[0];
            // Generate the content of the application form
            const applicationForm = `
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Application Form</title>
                <style>
                    body {
                        text-align: auto;
                        font-family: Arial, sans-serif;
                    }
                    .school-name {
                        font-size: 24px;
                        font-weight: bold;
                        margin-top: 40px; /* Adjust margin to push the school name down */
                        margin-bottom: 40px;
                    }
                    .school-logo {
                        margin-bottom: 15px;
                        width: 110px; /* Adjust the width and height to your preference */
                        height: 110px;
                        border-radius: 50%; /* Make the image circular */
                        object-fit: cover; /* Ensure the image covers the circular area */
                    }
                    .application-form {
                        margin:auto;
                        max-width: 600px;
                        padding: 20px;
                        border: 2px solid #000;
                    }
                   .letterHead{
                    text-align: center;
                   }
                   
                </style>
            </head>
            <body>
            <div class="letterHead">
                <div class="school-name"><h1>CompuTech Nexus Academy</h1></div>
                <h3>32Km, Maiduguri Road, Gano 2 Primary School, Dawakin Kudu L.G.A, Kano, Nigeria<br></h3>
                <h4>Contact: shamsusabocom@gmail.com, 1440shamsusabo@gmail.com</h4>
                <center><h4>08030909793</h4></center>
                <img src="logo.jpg" class="school-logo" alt="Logo"></div>
                <div class="application-form">
                <center><h1>Application Form</h1></center> 
                <p>Application Number: <strong>${applicationNumber}</strong></p>
                <p>First Name: <strong>${studentDetails.firstName}</strong></p>
                <p>Surname: <strong>${studentDetails.surname}</strong></p>
                <p>Address: <strong>${studentDetails.address}</strong></p>
                <p>Email Address: <strong>${studentDetails.emailAddress}</strong></p>
                <p>Phone Number: <strong>${studentDetails.phoneNumber}</strong></p>
                <p>Highest Qualification: <strong>${studentDetails.highestQualification}</strong></p>
                <p>Course Applied: <strong>${studentDetails.courseApplied}</strong></p>
                <p>Have a Computer Certificate?: <strong>${studentDetails.hasComputerCertificate}</strong></p>
                <p>Primary Certificate: <strong>${studentDetails.primaryCert}</strong></p>
                <p>Secondary School Certificate: <strong>${studentDetails.secondaryCert}</strong></p>
                <p>Higher Institution Certificate: <strong>${studentDetails.higherCert}</strong></p>
                <p>Computer Certificate: <strong>${studentDetails.computerCert}</strong></p>
                </div>
            </body>
            </html>
            `;
            // Send the application form as a downloadable file
            res.setHeader('Content-disposition', `attachment; filename=application_form_${applicationNumber}.html`);
            res.setHeader('Content-type', 'text/html');
            res.write(applicationForm);
            res.end();
        } else {
            res.status(404).send('Student not found');
        }
    
});
});

// Handle request to get student details
app.get('/getStudentDetails', (req, res) => {
const applicationNumber = req.query.applicationNumber;

// Query the database to fetch student details based on the application number
const query = 'SELECT * FROM form_data WHERE applicationNumber = ?';
db.query(query, [applicationNumber], (err, result) => {
    if (err) {
        console.error('Error fetching student details:', err);
        return res.status(500).send('An error occurred while fetching student details');
    }

    if (result.length === 1) {
        const studentDetails = result[0];
        res.json(studentDetails);
    } else {
        res.status(404).send('Student not found');
    }
});
});

// Handle verification of payment
app.get('/verifyPayment', (req, res) => {
const referenceNumber = req.query.reference;
const emailAddress = req.query.email; // Email address used for payment
const firstName = req.query.firstName;
const applicationNumber = req.query.applicationNumber;
const applicationFee = req.query.applicationFee;

// Generate admission number
const admissionNumberPrefix = 'CNA240'; // Admission number prefix format
const randomDigit = Math.floor(Math.random() * 1000); // Generate a random digit between 0 and 9
const admissionNumber = `${admissionNumberPrefix}${randomDigit}`; // Concatenate prefix and random digit

// Update the reference number and admission number in the database for the corresponding payment
const updateQuery = 'UPDATE form_data SET referenceNumber = ?, admissionNumber = ? WHERE applicationNumber = ? AND emailAddress = ? AND referenceNumber = ""';
db.query(updateQuery, [referenceNumber, admissionNumber, applicationNumber, emailAddress], (updateErr, updateResult) => {
if (updateErr) {
console.error('Error updating reference number in the database:', updateErr);
return res.status(500).send('An error occurred while verifying payment');
}
if (updateResult.affectedRows === 1) {
const appVerifyMessage = `Dear ${firstName}, Your payment for the application fee of ${applicationFee} with reference number ${referenceNumber} has been verified successfully! Your admission number is ${admissionNumber}. Please check your email for the payment receipt download. Kindly keep it for your records.

Additionally, we kindly request that you proceed to make the payment for the registration fee using your admission number.

Thank you for your cooperation.`;
res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Verification</title>
        <style>
            body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
                text-align: center;
            }
            .appVerifyMessage {
                width: 80%;
                max-width: 600px;
                margin: auto;
            }
        </style>
    </head>
    <body>
        <div class="appVerifyMessage">
            <p>${appVerifyMessage}</p>
            <p>Click <a href="/download_admission_letter/${admissionNumber}" target="_blank">here</a> to download or print your admission number letter.</p>
            <p>Click continue to proceed to pay your school fees</p>
            <form action="/firstPay" method="GET">
                <button type="submit">Continue</button>
            </form>
        </div>
    </body>
    </html>
`);
} else {
res.status(404).send('Payment verification failed');
}
});

// Serve the admission letter based on admission number
app.get('/download_admission_letter/:admissionNumber', (req, res) => {
const admissionNumber = req.params.admissionNumber;

// Query the database to fetch student details based on the admission number
const query = 'SELECT * FROM form_data WHERE admissionNumber = ?';
db.query(query, [admissionNumber], (err, result) => {
if (err) {
    console.error('Error fetching student details:', err);
    return res.status(500).send('An error occurred while fetching student details');
}

if (result.length === 1) {
    const studentDetails = result[0];
    // Generate the content of the admission letter
    const admissionLetter = `
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Admission Letter</title>
            <style>
            body {
                text-align: center;
                font-family: Arial, sans-serif;
            }
            .school-name {
                font-size: 24px;
                font-weight: bold;
                margin-top: 40px; /* Adjust margin to push the school name down */
                margin-bottom: 40px;
            }
            .school-logo {
                margin-bottom: 15px;
                width: 110px; /* Adjust the width and height to your preference */
                height: 110px;
                border-radius: 50%; /* Make the image circular */
                object-fit: cover; /* Ensure the image covers the circular area */
            }
            .admission-letter {
                margin: auto;
                max-width: 600px;
                padding: 20px;
                border: 2px solid #000;
            }
            .signature {
                margin-top: 40px;
                text-align: right;
            }
            .signature img {
                width: 150px; /* Adjust the width of the signature image */
                height: auto;
            }
        </style>
    </head>
    <body>
        <div class="school-name"><h1>CompuTech Nexus Academy</h1></div>
        <h3>32Km, Maiduguri Road, Gano 2 Primary School, Dawakin Kudu L.G.A, Kano, Nigeria<br></h3>
        <h4>Contact: shamsusabocom@gmail.com, 1440shamsusabo@gmail.com</h4>
        <center><h4>08030909793</h4></center>
        <img src="logo.jpg" class="school-logo" alt="Logo">
        <div class="admission-letter">
        <h1>Admission Letter</h1>
        <p>Dear <strong>${studentDetails.firstName} ${studentDetails.surname}</strong>,</p>
        <p>Congratulations! You have been admitted to study ${studentDetails.courseApplied} at CompuTech Nexus Academy.</p>
        <p>Your admission number is <strong>${admissionNumber}</strong>.</p>
        <p>Please keep this letter safe as proof of your admission.</p>
        <p>As a student at our institution, you are required to adhere to the following conditions:</p>
        <ul>
            <li>Ensure you have access to a computer throughout your studies.</li>
            <li>Pay a non-refundable school fee of N50,000 for the Web Development program (to be paid in two installments of N25,000) or N20,000 for the Computer Appreciation program (to be paid in two installments of N10,000).</li>
            <li>Be punctual in submitting your projects as late submissions may result in deductions.</li>
            <li>Dedicate 2-3 hours daily for practical exercises as our programs are 90% practical-based.</li>
            <li>Maintain discipline throughout your studies.</li>
            <li>Ensure your evaluation scores are not less than 65% to be eligible for certificate issuance.</li>
        </ul>
        <p>Please download this admission letter. Bring the hardcopy of your uploaded credentials along with this admission letter, and a duly signed and dated handwritten acceptance letter for documentation at the school.</p>
        <p>We look forward to welcoming you to our institution.</p>
        <p>Please keep this letter safe as proof of your admission.</p> 
        <div class="signature">
            <p>Registrar</p>
            <img src="registrar_signature.jpg" alt="Registrar Signature">
            <p>Jazuli Adam Sulaiman</p>
            <p>CompuTech Nexus Academy</p>
            </div>
        </div>
        </body>
        </html>
    `;
    
    // Set response headers for file download
    res.setHeader('Content-disposition', 'attachment; filename=admission_letter.html');
    res.setHeader('Content-type', 'text/html');
    // Send the admission letter content as a downloadable file
    res.write(admissionLetter);
    res.end();
} else {
    res.status(404).send('Student not found');
}
});
});

});
};
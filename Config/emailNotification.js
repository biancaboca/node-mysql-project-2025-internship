import dotenv from 'dotenv'; // Load environment variables from the .env file.
import express from 'express'; // Import the Express framework for server functionality.
import { SMTPClient } from 'emailjs'; // Import the SMTPClient from emailjs for email functionality.


dotenv.config();

class emailNotification {

   constructor() {
       this.client = new SMTPClient({
           user: process.env.SMTP_USER,
           password: process.env.SMTP_PASS,
           host: process.env.SMTP_HOST,
           ssl: true
       });
   }


   sendEmail(req, res) {
       const { name, subject, email, message } = req.body; // Extract data from request body.

       // Check for the presence of all required fields.
       if (!name || !subject || !email || !message) {
           return res.status(400).json({ status: 'error', message: 'Missing required fields' });
       }

       // Define the email message.
       const messageToSend = {
           from: process.env.SENDER_EMAIL,
           to: `${name} <${email}>`,
           "reply-to": process.env.REPLY_TO,
           subject: subject,
           text: message
       };

       // Send the email using a callback to handle the response.
       this.client.send(messageToSend, (err) => {
           if (err) {
               console.error('Error sending email:', err);
               return res.status(500).json({ status: 'error', message: 'Failed to send email, please try again.' });
           } else {
               return res.status(200).json({ status: 'success', message: 'Email sent successfully' });
           }
       });
   }
}

export default emailNotification;

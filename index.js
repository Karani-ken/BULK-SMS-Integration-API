const express = require('express')
const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config();


const app = express()
const port = process.env.PORT || 4000;

app.use(express.json())

//Bulky SMS sending endpoint
app.post('/send-sms', async (req, res) => {
    const { message, recipients } = req.body;

    // Check if both message and recipients are provided
    if (!message || !recipients || !Array.isArray(recipients)) {
        return res.status(400).json({
            error: "Please provide a message and an array of recipient phone numbers"
        });
    }

   

    try {
        // Loop through recipients and send SMS to each
        const promises = recipients.map((recipient) => {
            const data = {
                SenderId: process.env.ONFON_SENDER_ID,   // Your approved Sender ID
                IsUnicode: false,                        // Set to true if the message is Unicode
                IsFlash: false,                          // Set to true if sending Flash SMS
                ScheduleDateTime: "",                    // Leave empty for immediate send
                MessageParameters: [{
                    Number: recipient,                   // Single recipient
                    Text: message                        // Message content
                }],
                ApiKey: process.env.ONFON_API_KEY,       // Your OnFon API key
                ClientId: process.env.ONFON_USERNAME     // Your OnFon client username
            };

           // console.log('Data being sent:', JSON.stringify(data, null, 2));

            // Make API request to OnFon Media for each recipient
            return axios.post(process.env.ONFON_API_URL, data);
        });

        // Wait for all SMS send operations to complete
        const results = await Promise.all(promises);
        console.log(results)

        res.json({
            message: "SMS sent successfully to all recipients!",
            results: results.map((result) => result.data)
        });

    } catch (error) {
        console.error('Error sending SMS:', error.response ? error.response.data : error.message);
        res.status(500).json({
            error: 'Failed to send SMS',
            details: error.response ? error.response.data : error.message,
        });
    }
});


app.post('/send', async (req, res) => {
    const { message, recipients } = req.body;

    // Check if both message and recipients are provided
    if (!message || !recipients || !Array.isArray(recipients)) {
        return res.status(400).json({
            error: "Please provide a message and an array of recipient phone numbers"
        });
    }

    console.log('Recipients:', recipients);
    console.log('Message:', message);

    try {
        // Prepare the message parameters array
        const messageParameters = recipients.map((recipient) => ({
            Number: recipient, // Recipient phone number
            Text: message      // The message content
        }));

        const data = {
            SenderId: process.env.ONFON_SENDER_ID, // Your approved sender ID
            IsUnicode: false,                      // Set to true if you're sending non-Latin characters
            IsFlash: false,                        // Set to true for flash SMS
            ScheduleDateTime: "",                  // Leave empty for immediate send
            MessageParameters: messageParameters,  // Recipients and their message
            ApiKey: process.env.ONFON_API_KEY,     // Your API key
            ClientId: process.env.ONFON_USERNAME   // Your OnFon client username
        };

        console.log('Data being sent:', JSON.stringify(data, null, 2));

        // Make the API request to OnFon Media
        const result = await axios.post(process.env.ONFON_API_URL, data);

        res.json({
            message: "SMS sent successfully!",
            result: result.data
        });

    } catch (error) {
        console.error('Error response:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        res.status(500).json({
            error: 'Failed to send SMS',
            details: error.response ? error.response.data : error.message,
        });
    }
});



app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
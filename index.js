const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = 3000;
const API_URL = 'https://keyauth.win/api/seller/';
const SELLER_KEY = 'eb2041c6db57f2bd6f9699d7cfc6aabd';
const VMPROTECT_CMD = '"C:\\Program Files\\VMProtect Ultimate\\VMProtect_Con.exe" "C:\\Users\\Admin\\Desktop\\SRC BS\\Node.JS FivemThing\\VMP\\MainLoader.exe"'; // Command to run
const OUTPUT_FILE = 'MainLoader.vmp.exe'; // Initial output file

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Function to generate a random 16-character string
function generateRandomString(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Handle form submission
app.post('/download', async (req, res) => {
    const licenseKey = req.body.licenseKey;

    if (licenseKey) {
        try {
            const response = await axios.get(API_URL, {
                params: {
                    sellerkey: SELLER_KEY,
                    type: 'info',
                    key: licenseKey
                }
            });

            // Process the response from the API
            if (response.data.success) {
                // If the API call is successful, run the system command
                exec(VMPROTECT_CMD, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error executing command: ${error.message}`);
                        return res.status(500).send('Error executing system command');
                    }

                    // Log any output from the command
                    if (stdout) console.log(`stdout: ${stdout}`);
                    if (stderr) console.log(`stderr: ${stderr}`);

                    // Generate a random filename
                    const randomFilename = generateRandomString(16) + '.exe';
                    const newFilePath = path.join(__dirname, randomFilename);

                    // Rename the output file
                    fs.rename(path.join(__dirname, OUTPUT_FILE), newFilePath, (err) => {
                        if (err) {
                            console.error(`Error renaming file: ${err.message}`);
                            return res.status(500).send('Error renaming file');
                        }

                        // Send the file to the client for download
                        res.setHeader('Content-Disposition', `attachment; filename=${randomFilename}`);
                        res.download(newFilePath, randomFilename, (err) => {
                            if (err) {
                                console.log('Error in downloading file: ', err);
                                return res.status(500).send('Error in downloading file');
                            }

                            // Delete the file after download
                            fs.unlink(newFilePath, (err) => {
                                if (err) {
                                    console.error(`Error deleting file: ${err.message}`);
                                } else {
                                    console.log(`Successfully deleted ${randomFilename}`);
                                }
                            });
                        });
                    });
                });
            } else {
                res.status(400).send('Invalid License Key');
            }
        } catch (error) {
            console.log('Error in API request: ', error);
            res.status(500).send('Error in validating license key');
        }
    } else {
        res.status(400).send('License key is required');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

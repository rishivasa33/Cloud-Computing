'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs');
const NodeRSA = require('node-rsa');

const PORT = 8080;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

const BANNER = "B00902815";
const MY_EC2_IP = "3.234.114.83";
const ROBS_APP_IP = "http://44.202.179.158:8080/start"

const privateKey = new NodeRSA(fs.readFileSync('./private_key.txt', 'utf8'));
const publicKey = new NodeRSA(fs.readFileSync('./public_key.txt', 'utf8'));

app.get('/', (req, res) => {
    res.send("Hello, Welcome to Rishi's CSCI 5409 - Assignment 3!");
});

//POST a request to Rob's /start endpoint upon app startup. COMMENT OUT TILL LINE 42 if running on local machine (not EC2 instance)
let newRequest = {
    "banner": BANNER,
    "ip": MY_EC2_IP
}
let config = {
    headers: {
        'Content-Type': 'application/json',
    }
}
axios.post(ROBS_APP_IP, newRequest, config)
    .then(function (response) {
        console.log("Response after Calling Rob's App on startup: " + response.data);
    }).catch((error) => {
        console.log("Error in Calling Rob's App on startup: " + error);
    });

//Reference for RSA Encryption and Decryption: https://www.npmjs.com/package/node-rsa
app.post('/decrypt', (request, response) => {
    console.log("Request Recieved to /decrypt: " + JSON.stringify(request.body));
    if (request.body.message) {
        const encryptedMessage = request.body.message;
        const decryptedMessage = privateKey.decrypt(encryptedMessage, 'binary');
        response.status(200).json({ "response": decryptedMessage });
    } else {
        response.status(400).json({ "response": "Error Occurred!" });
    }
});

app.post('/encrypt', (request, response) => {
    console.log("Request Recieved to /encrypt: " + JSON.stringify(request.body));
    if (request.body.message) {
        const plainText = request.body.message;
        const encryptedMessage = publicKey.encrypt(plainText, 'base64');
        response.status(200).json({ "response": encryptedMessage });
    } else {
        response.status(400).json({ "response": "Error Occurred" });
    }
});

app.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
});
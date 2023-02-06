'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');
const fs = require('fs');

const PORT = 5000;

const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("Hello, Welcome to Rishi's CSCI 5409 - Assignment 1! - Validator Microservice 1");
});

//Reference for sending API Requests in Node: https://www.npmjs.com/package/axios 
app.post('/checksum', (request, response) => {

    console.log("Request Recieved: " + JSON.stringify(request.body));
    if (request.body.file) {

        const filePath = '/files/' + request.body.file;

        if (fs.existsSync(filePath)) {
            console.log('File found');
        } else {
            console.log('File not found');
            return response.json({ "file": request.body.file, "error": "File not found." });
        }

        let config = {
            headers: {
                'Content-Type': 'application/json',
            }
        }
        axios.post('http://checksum-ms-2:8081/', request.body, config)
            .then(function (checksumResponse) {
                return response.send(checksumResponse.data);
            })

    } else {
        response.json({ "file": null, "error": "Invalid JSON input." })
    }
});

app.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
});
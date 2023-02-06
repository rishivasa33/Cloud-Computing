'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const crypto = require('crypto');

const PORT = 8081;

const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//Reference to calculate MD5 hash of a file in Node: https://www.debugpointer.com/nodejs/create-md5-hash-of-file-in-nodejs

app.post('/', (request, response) => {
    console.log("Request Recieved: " + JSON.stringify(request.body));

    const filePath = '/files/' + request.body.file;

    const fileBuffer = fs.readFileSync(filePath);
    const md5Hash = crypto.createHash("md5").update(fileBuffer).digest("hex");
    console.log("MD5 Hash: " + md5Hash);
    return response.json({ "file": request.body.file, "checksum": md5Hash });
});

// starting the server
app.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
});
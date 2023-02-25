'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk');

const PORT = 80;
const app = express();
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//AWS-SDK Reference: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
const BANNER = "B00TESTHAHA";
const MY_EC2_IP = "0.0.0.0/0";
const ROBS_APP_IP = "http://52.91.127.198:8080"
const bucketName = "rishivasa-b00902815";
const fileBaseName = "B00902815_A2_File.txt";

AWS.config.update({
    aws_access_key_id: "ASIAVUSSQ63ZE7CANM7E",
    aws_secret_access_key: "hkl5f3OrCovLwZ2rOzEmet0qBqcPG1Yl7j1Pf4WW",
    aws_session_token: "FwoGZXIvYXdzEJL//////////wEaDCXttBh9ZJJnp/9/OyLAAavp59egoxjvYIPLsxmOpn1S+SZFN/jHf3bZJb2vjzUAsqftfScctFSltf8iSckmD6Em0ffNW8GsE0Uvuf7AlEn+YLnuOzXZ57+mvcy2FMVf58vD5Z52spkBYmM1Ay/5vnpyJRI7RwI2NPiD9MeipZLr6Q7F+zjxTM2mo70rYX4mjPWg1cApUcTRn/pglSiEoJOX1e81dqGjBkZilY3WaBoOHLLJO9O8HDM5V7ZkMwBZ5OP6fQ1Vbg/N8c3vWhvH/CiAiOefBjIt6lhgQsd/aRIBfj5CtKxkSw5rXPoiqnIGhJ6wOBjNL9FN886loc33wTwGFr/k",
    region_name: "us-east-1"
});

var s3 = new AWS.S3();

app.get('/', (req, res) => {
    res.send("Hello, Welcome to Rishi's CSCI 5409 - Assignment 2!");
});

//app.post('/start', (request, response) => {
//console.log("Request Recieved to /start: " + JSON.stringify(request.body));

// let newRequest = {
//     "banner": BANNER,
//     "ip": EC2_IP
// }
// let config = {
//     headers: {
//         'Content-Type': 'application/json',
//     }
// }
// axios.post('http://localhost:80/storedata', newRequest, config);

//.then(function (robsResponse) {
//console.log("Response Recieved from /storedata: " + JSON.stringify(robsResponse.data));
//})
//});

app.post('/storedata', (request, response) => {
    console.log("Request Recieved to storedata: " + JSON.stringify(request.body));
    var params = {
        Bucket: bucketName,
        Body: request.body.data,
        Key: fileBaseName, //+ Date.now(),
        ACL: "public-read-write"
    };
    s3.upload(params, function (err, data) {
        if (err) {
            console.log("Error", err);
            return response.status(500).json({ "error": err });
        }
        if (data) {
            console.log("Uploaded in:", data.Location);
            return response.status(200).json({ "s3uri": data.Location });
        }
    });
});

app.post('/appenddata', (request, response) => {
    console.log("Request Recieved to /appenddata: " + JSON.stringify(request.body));

    var params = {
        Bucket: bucketName,
        Key: fileBaseName // + Date.now()
    };

    s3.getObject(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            return response.status(500).json({ "error": err });
        }
        else {
            console.log("Existing File Data: " + data.Body.toString());
            const existingFileData = data.Body.toString();
            var appendedData = existingFileData;

            if (request.body.data) {
                appendedData = existingFileData + request.body.data.toString();
            }
            console.log("New File Data: " + appendedData);

            params = {
                Bucket: bucketName,
                Body: appendedData,
                Key: fileBaseName,
                ACL: "public-read-write"
            };

            s3.putObject(params, function (err, data) {
                if (err) {
                    console.log(err, err.stack);
                    return response.status(500).json({ "error": err });
                }
                else {
                    console.log("Uploaded in:", data.Location);
                    return response.status(200).json({ "result": data });
                }
            });
        }
    });

});

app.post('/deletefile', (request, response) => {
    console.log("Request Recieved to /deletefile: " + JSON.stringify(request.body));

    var params = {
        Bucket: bucketName,
        Key: fileBaseName // + Date.now()
    };

    s3.deleteObject(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
            return response.status(500).json({ "error": err });
        }
        else {
            console.log("Object Deleted");
            return response.status(200).json({ "result": data });
        }
    });
});

app.listen(PORT, () => {
    console.log(`Running on port: ${PORT}`);
});
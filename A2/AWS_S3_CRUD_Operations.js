'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
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
    aws_access_key_id: "ASIAVUSSQ63ZFD42ZINF",
    aws_secret_access_key: "rDMJIGmxmLY0kBkG2uJBlWQyAZveWSYtmYHwh/2Y",
    aws_session_token: "FwoGZXIvYXdzEI///////////wEaDL+X4AgzDz57WW46NyLAAWcJw8ceYwbU0U93H/xVmYE7NDpAAkAJkAu4wV29ml9GQJYIHEeXGcUn8M7Z5Msky1+4HZEMdt1Bcig82PjrlFqGL65osDff+ykQDZtaelIf1tcdVRGv0eJmKdb0eQx+jlMtpWp9aOoI53sYr6oySrTEmKrkxoVnscQjEgjmIOYAFQAtmYFsAO2TByx0t+Ptm3mp47oAGaAdz3DQ4yxN7CYRp+YAPSH59Wxim0lPEGzpkOEKxuN3u732JuoI//8tTCjGu+afBjItmR92iKbNffXSebLiX+1ZoRVYFkKrLLWDUnZtsiG54y+UEGjRB6p6sZ7b4KGu",
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
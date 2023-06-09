'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const AWS = require('aws-sdk');
const axios = require('axios');

const PORT = 80;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

//AWS-SDK References: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html & https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html
const BANNER = "B00902815";
const MY_EC2_IP = "100.25.41.152";
const ROBS_APP_IP = "http://52.91.127.198:8080/start"
const bucketName = "rishivasa-b00902815";
const fileBaseName = "B00902815_A2_File.txt";

AWS.config.update({
    accessKeyId: "ASIAVUSSQ63ZMMTYBSEV",
    secretAccessKey: "h7W/IiJfExFvJ+2Fahue8CMU2zULPJHn2DdUpa2G",
    sessionToken: "FwoGZXIvYXdzEJr//////////wEaDNtUzBBaj+mHVyni2CLAAT0pA71h/RMxIzD5xyDlO0Ahu9uTY3H5jU4MhccD1BGm84RStWOOPfY4YBaSV2zOz9cVudvs6d11i+rUHY3YoYmGYMvjfkysp5atQD6Fjh0GWhbjjfm5LQNi+g7mGv/uzGBFE9oE0YBdUZ12xGfCwV6s7fYOWh86GW0eJaOpYOScmg56jifDfO3CBuIxlOMZNXdwnH9HchnfKRYOkw9jes75jtXvk6s7K4FCC8FDlj4S09sRA6Q9a0jaDpKTKH4YaSiw/OifBjItVaBBIePMhuAGWXj3Bo25h5fKtBAHMjpKEQ8dsbVnO/c/wBdFh5b6BSKc5SmC",
    region: "us-east-1"
});

var s3 = new AWS.S3();

app.get('/', (req, res) => {
    res.send("Hello, Welcome to Rishi's CSCI 5409 - Assignment 2!");
});

//POST a request to Rob's /start endpoint upon app startup. COMMENT OUT TILL LINE 50 if running on local machine (not EC2 instance)
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
        console.log(response.data);
    }).catch((error) => {
        console.log(error);
    });

app.post('/storedata', (request, response) => {
    console.log("Request Recieved to /storedata: " + JSON.stringify(request.body));
    var params = {
        Bucket: bucketName,
        Body: request.body.data,
        Key: fileBaseName,
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
        Key: fileBaseName
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

    const s3uri = request.body.s3uri;
    const fileName = s3uri.split('/').pop();
    console.log("Object to be Deleted: " + fileName);

    var params = {
        Bucket: bucketName,
        Key: fileName
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
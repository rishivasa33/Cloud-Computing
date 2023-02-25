# CSCI 5409 - Winter 2023 - Assignment 2

## Author

* Rishi Vasa (rishi.vasa@dal.ca) (B00902815)


## To run this app on local machine

1) Install Node.js and npm
2) COMMENT out code from lines 36-50 if running on local machine (not EC2 instance)
3) Change values of following constants as per your details:
```
const BANNER = <Your Banner ID>
const MY_EC2_IP = <Your EC2 Instance's PPublic IPv4 address>
const ROBS_APP_IP = <Rob's app's IP>
const bucketName = <Your S3 Bucket Name>
const fileBaseName = <The hardcoded file name you want to operate on S3>

AWS.config.update({
    accessKeyId: <Your AWS access key ID>
    secretAccessKey: <Your AWS secret access key> 
    sessionToken: <Your AWS session token>
    region: <Your AWS instance region> 
});
```

## Sources Used

1) https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html
2) https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/Config.html
3) Kamran's lab Panopto recording
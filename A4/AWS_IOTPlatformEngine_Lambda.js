const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const sqs = new AWS.SQS({ region: 'us-east-1' });

exports.handler = async (event, context) => {

    const type = event.type;
    console.log("Message type:", type);
    var queueURL;

    //Set Queue URL according to the type of message
    switch (type) {
        case "CONNECT":
            queueURL = "https://sqs.us-east-1.amazonaws.com/387793876722/ConnectQueue";
            break;
        case "SUBSCRIBE":
            queueURL = "https://sqs.us-east-1.amazonaws.com/387793876722/SubscribeQueue";
            break;
        case "PUBLISH":
            queueURL = "https://sqs.us-east-1.amazonaws.com/387793876722/PublishQueue";
            break;
        default:
            return {
                message: "Invalid Message Type. Queue not found."
            };
    }

    //Set params for receiving messages from the queue
    const receiveParams = {
        AttributeNames: [
            "SentTimestamp"
        ],
        MaxNumberOfMessages: 10,
        MessageAttributeNames: [
            "All"
        ],
        QueueUrl: queueURL,
        VisibilityTimeout: 20,
        WaitTimeSeconds: 0
    };

    try {
        //Receive Message from the appropriate queue
        const queueMessageData = await sqs.receiveMessage(receiveParams).promise();

        if (queueMessageData.Messages) {

            const queueMessage = JSON.parse(queueMessageData.Messages[0].Body);

            //Form the response according to the type of message
            var apiResponse = {};
            switch (type) {
                case "CONNECT":
                    apiResponse.type = "CONNACK";
                    apiResponse.returnCode = 0;
                    apiResponse.username = queueMessage.username;
                    apiResponse.password = queueMessage.password;
                    break;
                case "SUBSCRIBE":
                    apiResponse.type = "SUBACK";
                    apiResponse.returnCode = 0;
                    break;
                case "PUBLISH":
                    apiResponse.type = "PUBACK";
                    apiResponse.returnCode = 0;
                    apiResponse.payload = queueMessage.payload;
                    break;
                default:
                    return {
                        message: "Invalid Message Type. Queue not found."
                    };
            }

            //Set params for deleting messages from the queue
            var deleteParams = {
                QueueUrl: queueURL,
                ReceiptHandle: queueMessageData.Messages[0].ReceiptHandle
            };

            try {
                //Delete Message from the appropriate queue
                await sqs.deleteMessage(deleteParams).promise();
            } catch (error) {
                console.log("Error in Deleting Message from SQS Queue", error);
                return {
                    message: error.message
                };
            }

            //Return the previously formed APIResponse
            return {
                ...apiResponse
            };
        }
    } catch (error) {
        console.log("Error in Receiving Message from SQS Queue", error);
        return {
            message: error.message
        };
    }
};
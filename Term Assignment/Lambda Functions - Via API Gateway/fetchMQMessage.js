var AWS = require('aws-sdk');
var sqs = new AWS.SQS();
const queueURL = "https://sqs.us-east-1.amazonaws.com/387793876722/SKCMessageQueueCF";

exports.handler = async (event) => {
  var params = {
    AttributeNames: [
      "SentTimestamp"
    ],
    MaxNumberOfMessages: 10,
    MessageAttributeNames: [
      "All"
    ],
    QueueUrl: queueURL,
    VisibilityTimeout: 1,
    WaitTimeSeconds: 2
  };

  let queueRes = await sqs.receiveMessage(params).promise();
  const response = {
    statusCode: 200,
    body: queueRes,
  };

  return response;
};
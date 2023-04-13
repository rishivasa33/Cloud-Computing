const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const sqs = new AWS.SQS();
const queueURL = "https://sqs.us-east-1.amazonaws.com/387793876722/SKCMessageQueueCF";

const sns = new AWS.SNS();
const topicARN = "arn:aws:sns:us-east-1:387793876722:SKCMessageTopic";

var documentClient = new AWS.DynamoDB.DocumentClient();
var dynamoDBTable = 'SKCMessageLog';

exports.handler = async (event, context) => {
  try {
    const ciphertext = event.ciphertext;
    const key = event.key;
    const name = event.name;
    const phoneNumber = event.phoneNumber;

    //Fetch message from the queue to compare keys
    const receiveParams = {
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

    const queueMessageData = await sqs.receiveMessage(receiveParams).promise();
    if (queueMessageData.Messages) {
      const savedKey = JSON.parse(queueMessageData.Messages[0].Body).key;
      const senderPhoneNumber = JSON.parse(queueMessageData.Messages[0].Body).phoneNumber;

      //If key matches, decrypt message and delete message from the queue
      if (key === savedKey) {
        const decryptedtext = playfairDecrypt(ciphertext, key);

        //Construct an SNS message to send a text message to the sender notifying them of successful retrieval.
        const params = {
          Message: "Your message has been decrypted by " + name + " and deleted from our servers",
          PhoneNumber: senderPhoneNumber
        };
        try {
          await sns.publish(params).promise();
        } catch (error) {
          console.error("Error in publishing message to the sender", error);
          return {
            "message": "Error in publishing message to the sender",
            "error": error.message
          };
        }


        //Update the Log Event on dynamoDB
        let updateLogDynamoResponse;
        updateLogDynamoResponse = await updateLogDynamo(name, phoneNumber);

        //Set params for deleting messages from the queue
        var deleteParams = {
          QueueUrl: queueURL,
          ReceiptHandle: queueMessageData.Messages[0].ReceiptHandle
        };

        try {
          await sqs.deleteMessage(deleteParams).promise();
        } catch (error) {
          console.error("Error in Deleting Message from SQS Queue", error);
          return {
            "message": "Error in Deleting from Queue",
            "error": error.message
          };
        }

        // Remove all subscribers from the SNS topic
        try {
          const listSubscriptionsParams = {
            TopicArn: topicARN,
          };
          const subscriptions = await sns.listSubscriptionsByTopic(listSubscriptionsParams).promise();
          for (const subscription of subscriptions.Subscriptions) {
            const unsubscribeParams = {
              SubscriptionArn: subscription.SubscriptionArn,
            };
            await sns.unsubscribe(unsubscribeParams).promise();
          }
        } catch (error) {
          return {
            "message": "Error in Removing Sender from SNS subscribers",
            "error": error.message
          };
        }

        // Return the ciphertext as the result
        const response = {
          "message": "Your message has been decrypted and deleted from our servers",
          "decryptedtext": decryptedtext,
        };
        return response;
      } else {
        const response = {
          "message": "Incorrect Key! Dont Snoop on other's messages!"
        };
        return response;
      }
    } else {
      const response = {
        "message": "No Messages! Patience Please!"
      };
      return response;
    }

  } catch (error) {
    return {
      "message": "Error in Decrypting Message",
      "error": error.message
    };
  }
};


async function updateLogDynamo(ReceiverName, ReceiverPhNo) {
  try {
    const params = {
      TableName: dynamoDBTable,
      IndexName: "MessageStatusIndex",
      KeyConditionExpression: "#ms = :open",
      ExpressionAttributeNames: {
        "#ms": "MessageStatus",
      },
      ExpressionAttributeValues: {
        ":open": "OPEN",
      },
      ScanIndexForward: false,
      Limit: 1,
    };

    const data = await documentClient.query(params).promise();

    const openMessageData = data.Items[0];

    const updateParams = {
      TableName: dynamoDBTable,
      Key: {
        "Timestamp": openMessageData.Timestamp,
        "MessageID": openMessageData.MessageID
      },
      UpdateExpression: "SET ReceiverName = :receiverName, ReceiverPhNo = :receiverPhNo, MessageStatus = :messageStatus",
      ExpressionAttributeValues: {
        ":receiverName": ReceiverName,
        ":receiverPhNo": ReceiverPhNo,
        ":messageStatus": "CLOSED"
      }
    };

    await documentClient.update(updateParams).promise();
  } catch (error) {
    console.error("Error updating DynamoDB Log:", error);
    throw error;
  }
}


function playfairDecrypt(ciphertext, key) {
  // Convert both ciphertext and key to uppercase
  ciphertext = ciphertext.toUpperCase();
  key = key.toUpperCase();

  // Generate the Playfair square
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
  let keySquare = '';
  let charsProcessed = '';
  for (let i = 0; i < key.length; i++) {
    const char = key[i];
    if (alphabet.includes(char) && !charsProcessed.includes(char)) {
      keySquare += char;
      charsProcessed += char;
    }
  }
  for (let i = 0; i < alphabet.length; i++) {
    const char = alphabet[i];
    if (!keySquare.includes(char)) {
      keySquare += char;
    }
  }

  // Decrypt each pair of letters using the Playfair cipher
  let plaintext = '';
  for (let i = 0; i < ciphertext.length; i += 2) {
    const pair = ciphertext.slice(i, i + 2);
    const a = pair[0];
    const b = pair[1];
    let aIndex = keySquare.indexOf(a);
    let bIndex = keySquare.indexOf(b);

    let aRow = Math.floor(aIndex / 5);
    let aCol = aIndex % 5;
    let bRow = Math.floor(bIndex / 5);
    let bCol = bIndex % 5;

    if (aRow === bRow) {
      aIndex = aRow * 5 + (aCol + 4) % 5;
      bIndex = bRow * 5 + (bCol + 4) % 5;
    } else if (aCol === bCol) {
      aIndex = ((aRow + 4) % 5) * 5 + aCol;
      bIndex = ((bRow + 4) % 5) * 5 + bCol;
    } else {
      aIndex = aRow * 5 + bCol;
      bIndex = bRow * 5 + aCol;
    }

    const newA = keySquare[aIndex];
    const newB = keySquare[bIndex];
    plaintext += newA + newB;
  }

  // Remove trailing X's if present
  if (plaintext.endsWith('X')) {
    plaintext = plaintext.slice(0, plaintext.length - 1);
  }

  return plaintext;
}
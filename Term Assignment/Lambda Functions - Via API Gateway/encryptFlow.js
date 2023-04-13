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
    // Get the plaintext message and key and sender details from the event
    const plaintext = event.plaintext;
    const key = event.key;
    const name = event.name;
    const phoneNumber = event.phoneNumber;

    // Use the playfair-cipher to encrypt the plaintext message
    const ciphertext = playfairEncrypt(plaintext, key);

    // Post the plaintext and key onto an Amazon SQS queue
    const params = {
      MessageBody: JSON.stringify({ ciphertext, key, name, phoneNumber }),
      QueueUrl: queueURL
    };

    await sqs.sendMessage(params).promise();

    //Log the Event on dynamoDB
    let logToDynamoResponse;
    logToDynamoResponse = await logToDynamo(name, phoneNumber);

    // Subscribe the sender's phoneNumber to the SNS topic
    const subscribeParams = {
      Protocol: 'sms',
      TopicArn: topicARN,
      Endpoint: phoneNumber,
      ReturnSubscriptionArn: true
    };

    await sns.subscribe(subscribeParams).promise();

    // Return the ciphertext as the result
    const response = {
      "message": "Your message has been encrypted and saved",
      "ciphertext": ciphertext,
    };
    return response;
  } catch (error) {
    console.error("Error in Encrypting Message", error);
    return {
      "message": "Error in Encrypting Message",
      "error": error.message
    };
  }
};

async function logToDynamo(SenderName, SenderPhNo) {
  try {
    const Timestamp = new Date().toISOString();
    const MessageID = `${SenderName}-${Timestamp}`;

    const params = {
      TableName: dynamoDBTable,
      Item: {
        MessageID: MessageID,
        SenderName: SenderName,
        SenderPhNo: SenderPhNo,
        Timestamp: Timestamp,
        MessageStatus: "OPEN"
      },
    };

    await documentClient.put(params).promise();
    return { success: true, MessageID };
  } catch (error) {
    console.error('Error Connecting to DynamoDB', error);
    return {
      "message": "Error in Connecting to DynamoDB",
      "error": error.message
    };
  }
}

function playfairEncrypt(plaintext, key) {
  // Remove non-alphabetic characters from the plaintext
  plaintext = plaintext.replace(/[^a-zA-Z]/gi, '');

  // Convert both plaintext and key to uppercase
  plaintext = plaintext.toUpperCase();
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

  // Split the plaintext into pairs of two letters
  const pairs = [];
  for (let i = 0; i < plaintext.length; i += 2) {
    let pair = plaintext.slice(i, i + 2);
    if (pair.length < 2) {
      pair += 'X';
    }
    pairs.push(pair);
  }

  // Encrypt each pair of letters using the Playfair cipher
  let ciphertext = '';
  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i];
    const a = pair[0];
    const b = pair[1];
    let aIndex = keySquare.indexOf(a);
    let bIndex = keySquare.indexOf(b);

    let aRow = Math.floor(aIndex / 5);
    let aCol = aIndex % 5;
    let bRow = Math.floor(bIndex / 5);
    let bCol = bIndex % 5;

    if (aRow === bRow) {
      aIndex = aRow * 5 + (aCol + 1) % 5;
      bIndex = bRow * 5 + (bCol + 1) % 5;
    } else if (aCol === bCol) {
      aIndex = ((aRow + 1) % 5) * 5 + aCol;
      bIndex = ((bRow + 1) % 5) * 5 + bCol;
    } else {
      aIndex = aRow * 5 + bCol;
      bIndex = bRow * 5 + aCol;
    }

    const newA = keySquare[aIndex];
    const newB = keySquare[bIndex];
    ciphertext += newA + newB;
  }

  return ciphertext;
}
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-east-1' });
const dynamodb = new AWS.DynamoDB();

exports.handler = async (event, context) => {
  const params = {
    TableName: 'SKCMessageLog',
  };

  try {
    const data = await dynamodb.scan(params).promise();
    console.log('Success', data.Items);
    return data.Items;
  } catch (err) {
    console.log('Error', err);
    throw err;
  }
};
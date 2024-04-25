import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

// Create client outside of handler to reuse
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

// Handler
export const handler = async (event, context, callback) => {
  console.log("## ENVIRONMENT VARIABLES: " + serialize(process.env));
  console.log("## CONTEXT: " + serialize(context));
  console.log("## EVENT: " + serialize(event));
  try {
    const { postBody, postTitle } = JSON.parse(event.body);
    const timestamp = new Date().getTime();
    const command = new PutCommand({
      TableName: process.env.DYNAMO_DB_TABLE_NAME,
      Item: {
        postId: context.awsRequestId,
        title: postTitle,
        body: postBody,
        timestamp,
      },
    });

    const response = await docClient.send(command);
    console.log(response);
    return callback(
      null,
      formatResponse(
        JSON.stringify({
          postId: context.awsRequestId,
          title: postTitle,
          body: postBody,
          timestamp,
        })
      )
    );
  } catch (error) {
    return callback(null, formatError(error));
  }
};

var formatResponse = function (body) {
  var response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    isBase64Encoded: false,
    body: body,
  };
  return response;
};

var formatError = function (error) {
  var response = {
    statusCode: error.statusCode,
    headers: {
      "Content-Type": "text/plain",
      "x-amzn-ErrorType": error.code,
    },
    isBase64Encoded: false,
    body: error.code + ": " + error.message,
  };
  return response;
};
// Use SDK client
var getAccountSettings = function () {
  return lambda.getAccountSettings().promise();
};

var serialize = function (object) {
  return JSON.stringify(object, null, 2);
};

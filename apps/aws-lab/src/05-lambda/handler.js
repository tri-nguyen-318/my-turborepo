/**
 * Sample AWS Lambda Handler
 *
 * This file gets zipped and deployed to Lambda (or LocalStack).
 * Lambda runs this function in response to events.
 *
 * The handler receives:
 *  - event: The input data (from API Gateway, SQS, S3 trigger, etc.)
 *  - context: Runtime info (function name, memory, timeout, request ID)
 *
 * It must return a response (or throw an error).
 */

exports.handler = async (event, context) => {
  console.log('Lambda invoked!');
  console.log('Event:', JSON.stringify(event, null, 2));
  console.log('Function name:', context.functionName);
  console.log('Remaining time (ms):', context.getRemainingTimeInMillis());

  // Simulate some processing
  const name = event.name || 'World';
  const result = {
    statusCode: 200,
    body: JSON.stringify({
      message: `Hello, ${name}! From Lambda.`,
      timestamp: new Date().toISOString(),
      processedBy: context.functionName,
    }),
  };

  console.log('Returning:', JSON.stringify(result));
  return result;
};

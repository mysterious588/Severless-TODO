import 'source-map-support/register'

import { createLogger } from '../../utils/logger'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'

import { createAttachmentPresignedUrl } from '../../businessLogic/todos'

const logger = createLogger('generate upload url')

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  if (!todoId) {
    logger.error('missing todoId')
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing todoId"
      })
    }
  }

  const attachementUrl = createAttachmentPresignedUrl(todoId)

  logger.info('created url: ', {attachementUrl})

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      uploadUrl: attachementUrl
    })

  }
}

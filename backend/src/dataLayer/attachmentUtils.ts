import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

const XAWS = AWSXRay.captureAWS(AWS)

import { createLogger } from '../utils/logger'

const logger = createLogger('attachement utils')

export class AttachmentUtils {
  constructor(
    private readonly s3Client = new XAWS.S3({
      signatureVersion: 'v4'
    }),
    private readonly images_bucket = process.env.TODOS_IMAGES_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) { }

  async createAttachmentPresignedUrl(todoId: string): Promise<string> {
    const signedUrl = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.images_bucket,
      Key: todoId,
      Expires: this.urlExpiration
    })
    logger.info("Signed url: ", { signedUrl, todoId })
    return signedUrl
  }
}
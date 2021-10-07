import * as AWS from 'aws-sdk'
//import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

//const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE
    ) { }


    async getTodos(userId: string): Promise<TodoItem[]> {
        const result = await this.docClient.query({
            TableName: this.todosTable,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()

        logger.info('returned all todos: ', result.Items as TodoItem[])

        return result.Items as TodoItem[]
    }

    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }).promise()

        logger.info('new todo created: ', { todoItem })

        return todoItem
    }

    async deleteTodo(todoId: string, userId: string) {
        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId,
                userId
            },
            ReturnValues: 'ALL_OLD'
        }).promise()

        logger.info('delete todo with id: ', { todoId })
    }

    async updateTodo(todoId: string, userId: string, todoUpdate: TodoUpdate) {
        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: "set #name = :name, #dueDate=:dueDate, #done=:done",
            ExpressionAttributeValues: {
                ":name": todoUpdate.name,
                ":dueDate": todoUpdate.dueDate,
                ":done": todoUpdate.done
            },
            ExpressionAttributeNames: {
                '#name': 'name',
                '#dueDate': 'dueDate',
                '#done': 'done'
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
        logger.info("updated note with id: ", { todoId })
        return todoUpdate
    }

    async updateAttachmentUrl(attachmentUrl: string, todoId: string, userId: string) {
        logger.info('Adding attachement url')
        await this.docClient.update({
            TableName: this.todosTable,
            Key: { todoId, userId },
            UpdateExpression:
                'set #attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            },
            ExpressionAttributeNames: {
                '#attachmentUrl': 'attachmentUrl'
            },
            ReturnValues: "UPDATED_NEW"
        }).promise()
        logger.info("Added attachment Url for: ", { todoId })
        return attachmentUrl
    }
}
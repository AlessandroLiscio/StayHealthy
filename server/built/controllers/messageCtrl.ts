import { Request } from "express";
import { Message, CustomError } from "../models/models";
import { TableCtrl } from "./tableCtrl";

export class MessageCtrl extends TableCtrl {

    public async getMessage(req: Request): Promise<any> {

        this.sql = 'SELECT * FROM messages WHERE uuid = $1';
        this.params = [
            req.query.uuid
        ];
        this.result = await this.dbManager.getQuery(this.sql, this.params);

        if (this.result.rowCount > 0) {
            let message = new Message();
            message.uuid = this.result.rows[0].uuid;
            message.sender = this.result.rows[0].sender;
            message.receiver = this.result.rows[0].receiver;
            message.object = this.result.rows[0].object;
            message.date = this.result.rows[0].date;
            message.content = this.result.rows[0].content;
            this.result = message
        }
        return this.result
    }

    public async postMessage(req: Request): Promise<any> {

        this.sql = "INSERT INTO messages ( uuid, sender, receiver, object, date, content ) VALUES ($1,$2,$3,$4,$5,$6)";
        this.params = [
            req.body.uuid,
            req.body.sender,
            req.body.receiver,
            req.body.object,
            req.body.date,
            req.body.content
        ];
        this.result = await this.dbManager.postQuery(this.sql, this.params);
        return this.result;

    }

    public async deleteMessage(req: Request): Promise<any>{
        
        this.sql = "DELETE FROM messages WHERE uuid = $1 AND receiver = $2";
            this.params = [
                req.query.uuid,
                req.query.receiver
            ]
        this.result = await this.dbManager.deleteQuery(this.sql,this.params);
        return this.result;
    }

    public async getUserMessages(req: Request): Promise<any> {

        this.sql = 'SELECT * FROM messages WHERE receiver = $1 ORDER BY date DESC';
        this.params = [
            req.query.receiver
        ];
        this.result = await this.dbManager.getQuery(this.sql, this.params);

        if (this.result.rowCount > 0) {
            let messagesArray = [];
            for (let row of this.result.rows) {
                let message = new Message();
                message.uuid = row.uuid;
                message.sender = row.sender;
                message.receiver = row.receiver;
                message.object = row.object;
                message.date = row.date;
                message.content = row.content;
                messagesArray.push(message);
            }
            this.result = messagesArray;
        }
        return this.result
    }

}

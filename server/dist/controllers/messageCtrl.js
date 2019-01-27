"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models/models");
const tableCtrl_1 = require("./tableCtrl");
class MessageCtrl extends tableCtrl_1.TableCtrl {
    getMessage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT * FROM messages WHERE uuid = $1';
            this.params = [
                req.query.uuid
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            if (this.result.rowCount > 0) {
                let message = new models_1.Message();
                message.uuid = this.result.rows[0].uuid;
                message.sender = this.result.rows[0].sender;
                message.receiver = this.result.rows[0].receiver;
                message.object = this.result.rows[0].object;
                message.date = this.result.rows[0].date;
                message.content = this.result.rows[0].content;
                this.result = message;
            }
            return this.result;
        });
    }
    postMessage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = "INSERT INTO messages ( uuid, sender, receiver, object, date, content ) VALUES ($1,$2,$3,$4,$5,$6)";
            this.params = [
                req.body.uuid,
                req.body.sender,
                req.body.receiver,
                req.body.object,
                req.body.date,
                req.body.content
            ];
            this.result = yield this.dbManager.postQuery(this.sql, this.params);
            return this.result;
        });
    }
    deleteMessage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = "DELETE FROM messages WHERE uuid = $1 AND receiver = $2";
            this.params = [
                req.query.uuid,
                req.query.receiver
            ];
            this.result = yield this.dbManager.deleteQuery(this.sql, this.params);
            return this.result;
        });
    }
    getUserMessages(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT * FROM messages WHERE receiver = $1';
            this.params = [
                req.query.receiver
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            if (this.result.rowCount > 0) {
                let messagesArray = [];
                for (let row of this.result.rows) {
                    let message = new models_1.Message();
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
            return this.result;
        });
    }
}
exports.MessageCtrl = MessageCtrl;
//# sourceMappingURL=messageCtrl.js.map
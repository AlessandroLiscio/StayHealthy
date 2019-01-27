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
const choiceCtrl_1 = require("./choiceCtrl");
class QuestionCtrl extends tableCtrl_1.TableCtrl {
    getQuestion(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT * FROM questions WHERE id = $1';
            this.params = [
                req.query.id
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            if (this.result.rowCount > 0) {
                let question = new models_1.Question();
                question.id = this.result.rows[0].id;
                question.text = this.result.rows[0].text;
                // each question has his own array of choices, which has to be retrieved from the database
                question.choices = [];
                let choiceCtrl = new choiceCtrl_1.ChoiceCtrl();
                for (let questionChoice of (this.result.rows[0].choices)) {
                    console.log(questionChoice);
                    req.query.id = questionChoice;
                    var choice = yield choiceCtrl.getChoice(req);
                    if (choice instanceof models_1.Choice) {
                        question.choices.push(choice);
                    }
                    else {
                        return choice;
                    }
                }
                this.result = question;
            }
            return this.result;
        });
    }
    postQuestion(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'INSERT INTO questions ( id, text, choices ) VALUES ($1,$2,$3)';
            this.params = [
                req.body.id,
                req.body.text,
                req.body.choices
            ];
            this.result = yield this.dbManager.postQuery(this.sql, this.params);
            return this.result;
        });
    }
}
exports.QuestionCtrl = QuestionCtrl;
//# sourceMappingURL=questionCtrl.js.map
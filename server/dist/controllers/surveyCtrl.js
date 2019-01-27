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
const questionCtrl_1 = require("./questionCtrl");
class SurveyCtrl extends tableCtrl_1.TableCtrl {
    getSurvey(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT * FROM surveys WHERE id = $1';
            this.params = [
                req.query.id
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            if (this.result.rowCount > 0) {
                let survey = new models_1.Survey();
                survey.id = this.result.rows[0].id;
                survey.title = this.result.rows[0].title;
                // each survey has his own array of questions, which has to be retrieved from the database
                survey.questions = [];
                let questionCtrl = new questionCtrl_1.QuestionCtrl();
                for (let surveyQuestion of (this.result.rows[0].questions)) {
                    console.log(surveyQuestion);
                    req.query.id = surveyQuestion;
                    var question = yield questionCtrl.getQuestion(req);
                    if (question instanceof models_1.Question) {
                        survey.questions.push(question);
                    }
                    else {
                        return question;
                    }
                }
                this.result = survey;
            }
            return this.result;
        });
    }
    postSurvey(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = "INSERT INTO surveys ( id, title, questions ) VALUES ($1,$2,$3)";
            let questions = [];
            for (let element of req.body.questions) {
                questions.push(element.id);
            }
            this.params = [
                req.body.id,
                req.body.title,
                questions
            ];
            this.result = yield this.dbManager.postQuery(this.sql, this.params);
            return this.result;
        });
    }
}
exports.SurveyCtrl = SurveyCtrl;
//# sourceMappingURL=surveyCtrl.js.map
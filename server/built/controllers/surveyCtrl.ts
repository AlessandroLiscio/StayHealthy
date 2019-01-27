import { Request } from "express";
import { Survey, CustomError, Question } from "../models/models";
import { TableCtrl } from "./tableCtrl";
import { QuestionCtrl } from "./questionCtrl";

export class SurveyCtrl extends TableCtrl {

    public async getSurvey(req: Request): Promise<any> {

        this.sql = 'SELECT * FROM surveys WHERE id = $1';
        this.params = [
            req.query.id
        ];
        this.result = await this.dbManager.getQuery(this.sql, this.params);

        if (this.result.rowCount > 0) {
            let survey = new Survey();
            survey.id = this.result.rows[0].id;
            survey.title = this.result.rows[0].title;
            // each survey has his own array of questions, which has to be retrieved from the database
            survey.questions = [];
            let questionCtrl = new QuestionCtrl();
            for (let surveyQuestion of (this.result.rows[0].questions)) {
                console.log(surveyQuestion)
                req.query.id = surveyQuestion
                var question = await questionCtrl.getQuestion(req)
                if (question instanceof Question) {
                    survey.questions.push(question);
                } else{
                    return question
                }
            }
            this.result = survey;
        }
        return this.result
    }

    public async postSurvey(req: Request): Promise<string> {

        this.sql = "INSERT INTO surveys ( id, title, questions ) VALUES ($1,$2,$3)";
        let questions: string[] = []
        for (let element of req.body.questions) {
            questions.push(element.id)
        }
        this.params = [
            req.body.id,
            req.body.title,
            questions
        ];
        this.result = await this.dbManager.postQuery(this.sql, this.params);
        return this.result;

    }

}
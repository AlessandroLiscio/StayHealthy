import { Request } from "express"
import { Question, Choice } from "../models/models"
import { TableCtrl } from "./tableCtrl"
import { ChoiceCtrl } from "./choiceCtrl"

export class QuestionCtrl extends TableCtrl {

    public async getQuestion(req: Request): Promise<any> {

        this.sql = 'SELECT * FROM questions WHERE id = $1'
        this.params = [
            req.query.id
        ]
        this.result = await this.dbManager.getQuery(this.sql, this.params)
        if (this.result.rowCount > 0) {
            let question = new Question()
            question.id = this.result.rows[0].id
            question.text = this.result.rows[0].text
            // each question has his own array of choices, which has to be retrieved from the database
            question.choices = await this.getQuestionChoices(this.result.rows[0].choices, req)
            this.result = question
        }
        return this.result
    }

    public async postQuestion(req: Request): Promise<any> {

        this.sql = 'INSERT INTO questions ( id, text, choices ) VALUES ($1,$2,$3)'
        this.params = [
            req.body.id,
            req.body.text,
            req.body.choices
        ]
        this.result = await this.dbManager.postQuery(this.sql, this.params)
        return this.result
    }

    public async getQuestionChoices(questionChoices: string[], req: Request): Promise<any> {
        let choices = []
        let choiceCtrl = new ChoiceCtrl()
        for (let questionChoice of questionChoices) {
            req.query.id = questionChoice
            var choice = await choiceCtrl.getChoice(req)
            if (choice instanceof Choice) {
                choices.push(choice)
            } else{
                return choice
            }
        }
        return choices
    }
}
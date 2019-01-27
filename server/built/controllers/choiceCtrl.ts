import { Request } from "express";
import { Choice } from "../models/models";
import { TableCtrl } from "./tableCtrl";

export class ChoiceCtrl extends TableCtrl {

    public async getChoice(req: Request): Promise<any> {

        this.sql = 'SELECT * FROM choices WHERE id = $1';
        this.params = [
            req.query.id
        ];
        this.result = await this.dbManager.getQuery(this.sql, this.params);

        if (this.result.rowCount > 0) {
            let choice = new Choice();
            choice.id = this.result.rows[0].id;
            choice.value = this.result.rows[0].value;
            choice.text = this.result.rows[0].text;
            this.result = choice
        }
        return this.result
    }

    public async postChoice(req: Request): Promise<any> {

        this.sql = "INSERT INTO choices ( id, text, value ) VALUES ($1,$2,$3)";
            this.params = [
                req.body.id,
                req.body.text,
                req.body.value
            ];
            this.result = await this.dbManager.postQuery(this.sql, this.params);
        return this.result;

    }

}

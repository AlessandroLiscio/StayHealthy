import { Request } from "express";
import { PatientSurvey } from "../models/models";
import { TableCtrl } from "./tableCtrl";

export class PatientSurveyCtrl extends TableCtrl {

    public async getPatientSurvey(req: Request): Promise<any> {

        this.sql = 'SELECT * FROM patients_surveys WHERE (patient_ssn = $1 AND date = $2)';
        this.params = [
            req.query.patient_ssn,
            req.query.date
        ];
        this.result = await this.dbManager.getQuery(this.sql, this.params);

        if (this.result.rowCount > 0) {
            let patientSurvey = new PatientSurvey();
            patientSurvey.patient_ssn = this.result.rows[0].patient_ssn;
            patientSurvey.date = this.result.rows[0].date;
            patientSurvey.survey_id = this.result.rows[0].survey_id;
            patientSurvey.answers = this.result.rows[0].answers;

            this.result = patientSurvey;
        }
        return this.result
    }

    public async getPatientSurveys(req: Request): Promise<any> {
        this.sql = 'SELECT * FROM patients_surveys WHERE patient_ssn = $1';
        this.params = [
            req.query.patient_ssn
        ];
        this.result = await this.dbManager.getQuery(this.sql, this.params);
        if (this.result.rowCount > 0) {
            let patientSurveysArray = [];
            for (let row of this.result.rows) {
                let patientSurvey = new PatientSurvey();
                patientSurvey.patient_ssn = row.patient_ssn;
                patientSurvey.date = row.date;
                patientSurvey.survey_id = row.survey_id;
                patientSurvey.answers = row.answers;

                patientSurveysArray.push(patientSurvey);
            }
            this.result = patientSurveysArray;
        }
        return this.result
    }

    public async postPatientSurvey(req: Request): Promise<string> {

        this.sql = 'INSERT INTO patients_surveys ( patient_ssn, date, survey_id, answers ) VALUES ($1,$2,$3,$4)';
        this.params = [
            req.body.patient_ssn,
            req.body.date,
            req.body.survey_id,
            req.body.answers    
        ];
        this.result = await this.dbManager.postQuery(this.sql, this.params);
        return this.result;

    }
}
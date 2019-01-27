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
class PatientSurveyCtrl extends tableCtrl_1.TableCtrl {
    getPatientSurvey(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT * FROM patients_surveys WHERE (patient_ssn = $1 AND date = $2)';
            this.params = [
                req.query.patient_ssn,
                req.query.date
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            if (this.result.rowCount > 0) {
                let patientSurvey = new models_1.PatientSurvey();
                patientSurvey.patient_ssn = this.result.rows[0].patient_ssn;
                patientSurvey.date = this.result.rows[0].date;
                patientSurvey.survey_id = this.result.rows[0].survey_id;
                patientSurvey.answers = this.result.rows[0].answers;
                this.result = patientSurvey;
            }
            return this.result;
        });
    }
    getPatientSurveys(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT * FROM patients_surveys WHERE patient_ssn = $1';
            this.params = [
                req.query.patient_ssn
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            if (this.result.rowCount > 0) {
                let patientSurveysArray = [];
                for (let row of this.result.rows) {
                    let patientSurvey = new models_1.PatientSurvey();
                    patientSurvey.patient_ssn = row.patient_ssn;
                    patientSurvey.date = row.date;
                    patientSurvey.survey_id = row.survey_id;
                    patientSurvey.answers = row.answers;
                    patientSurveysArray.push(patientSurvey);
                }
                this.result = patientSurveysArray;
            }
            return this.result;
        });
    }
    postPatientSurvey(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'INSERT INTO patients_surveys ( patient_ssn, date, survey_id, answers ) VALUES ($1,$2,$3,$4)';
            this.params = [
                req.body.patient_ssn,
                req.body.date,
                req.body.survey_id,
                req.body.answers
            ];
            this.result = yield this.dbManager.postQuery(this.sql, this.params);
            return this.result;
        });
    }
}
exports.PatientSurveyCtrl = PatientSurveyCtrl;
//# sourceMappingURL=patientSurveyCtrl.js.map
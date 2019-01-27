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
class PatientCtrl extends tableCtrl_1.TableCtrl {
    getPatient(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT * FROM patients WHERE patient_ssn = $1';
            this.params = [
                req.query.patient_ssn
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            if (this.result.rowCount > 0) {
                let patient = new models_1.Patient();
                patient.patient_ssn = this.result.rows[0].patient_ssn;
                patient.first_name = this.result.rows[0].first_name;
                patient.last_name = this.result.rows[0].last_name;
                patient.date_of_birth = this.result.rows[0].date_of_birth;
                patient.doctor_ssn = this.result.rows[0].doctor_ssn;
                patient.last_fetch_date = this.result.rows[0].last_fetch_date;
                this.result = patient;
            }
            return this.result;
        });
    }
    postPatient(req) {
        const _super = Object.create(null, {
            checkSsn: { get: () => super.checkSsn }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (!(_super.checkSsn.call(this, req.body.patient_ssn)))
                return this.error;
            this.sql = 'INSERT INTO patients ( patient_ssn, first_name, last_name, date_of_birth, doctor_ssn, last_fetch_date ) VALUES ($1,$2,$3,$4,$5,$6)';
            this.params = [
                req.body.patient_ssn,
                req.body.first_name,
                req.body.last_name,
                req.body.date_of_birth,
                req.body.doctor_ssn,
                new Date(Date.now())
            ];
            this.result = yield this.dbManager.postQuery(this.sql, this.params);
            return this.result;
        });
    }
    getPatientDoctor(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT D.doctor_ssn, D.first_name, D.last_name, D.date_of_birth \
                     FROM doctors AS D INNER JOIN patients AS P ON (D.doctor_ssn = P.doctor_ssn) \
                     WHERE P.patient_ssn = $1';
            this.params = [
                req.query.patient_ssn
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            if (this.result.rowCount > 0) {
                let doctor = new models_1.Doctor();
                doctor.doctor_ssn = this.result.rows[0].doctor_ssn;
                doctor.first_name = this.result.rows[0].first_name;
                doctor.last_name = this.result.rows[0].last_name;
                doctor.date_of_birth = this.result.rows[0].date_of_birth;
                this.result = doctor;
            }
            return this.result;
        });
    }
}
exports.PatientCtrl = PatientCtrl;
//# sourceMappingURL=patientCtrl.js.map
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
class DoctorCtrl extends tableCtrl_1.TableCtrl {
    getDoctor(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT * FROM doctors WHERE doctor_ssn = $1';
            this.params = [
                req.query.doctor_ssn
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
    postDoctor(req) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(this.checkSsn(req.body.doctor_ssn)))
                return this.error;
            this.sql = 'INSERT INTO doctors ( doctor_ssn, first_name, last_name, date_of_birth ) VALUES ($1,$2,$3,$4)';
            this.params = [
                req.body.doctor_ssn,
                req.body.first_name,
                req.body.last_name,
                req.body.date_of_birth
            ];
            this.result = yield this.dbManager.postQuery(this.sql, this.params);
            return this.result;
        });
    }
    getDoctorPatients(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT * FROM patients WHERE doctor_ssn = $1';
            this.params = [
                req.query.doctor_ssn
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            if (this.result.rowCount > 0) {
                let patientsArray = [];
                for (let row of this.result.rows) {
                    let patient = new models_1.Patient();
                    patient.patient_ssn = row.patient_ssn;
                    patient.first_name = row.first_name;
                    patient.last_name = row.last_name;
                    patient.date_of_birth = row.date_of_birth;
                    patient.doctor_ssn = row.doctor_ssn;
                    patient.last_fetch_date = row.last_fetch_date;
                    patientsArray.push(patient);
                }
                this.result = patientsArray;
            }
            return this.result;
        });
    }
}
exports.DoctorCtrl = DoctorCtrl;
//# sourceMappingURL=doctorCtrl.js.map
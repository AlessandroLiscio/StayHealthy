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
const bcrypt = require("bcrypt");
const models_1 = require("../models/models");
const tableCtrl_1 = require("./tableCtrl");
const patientCtrl_1 = require("./patientCtrl");
const doctorCtrl_1 = require("./doctorCtrl");
class UserCtrl extends tableCtrl_1.TableCtrl {
    getUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT * FROM users WHERE username = $1';
            this.params = [
                req.body.username
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            if (this.result.rowCount > 0) {
                let user = new models_1.User();
                user.username = this.result.rows[0].username;
                user.password = this.result.rows[0].password;
                user.role = this.result.rows[0].role;
                this.result = user;
            }
            return this.result;
        });
    }
    postUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // check request's data correctness
            if (req.body.role == 'patient' && !(yield this.checkPatientUser(req))) {
                return this.error;
            }
            else if (req.body.role == 'doctor' && !(yield this.checkDoctorUser(req))) {
                return this.error;
            }
            else if (req.body.role != 'patient' && req.body.role != 'doctor') {
                this.error.name = "ROLE ERROR";
                this.error.details = "user role incorrect";
                return this.error;
            }
            // add user to the users table
            this.sql = "INSERT INTO users ( username, password, role ) VALUES ($1,$2,$3)";
            this.params = [
                req.body.username,
                bcrypt.hashSync(req.body.password, 8),
                req.body.role
            ];
            this.result = yield this.dbManager.postQuery(this.sql, this.params);
            // add the new patient or doctor to the right table
            if (!(this.result instanceof Error) && !(this.result instanceof models_1.CustomError)) {
                if (req.body.role == 'patient') {
                    let patientCtrl = new patientCtrl_1.PatientCtrl;
                    this.result = yield patientCtrl.postPatient(req);
                }
                else if (req.body.role == 'doctor') {
                    let doctorCtrl = new doctorCtrl_1.DoctorCtrl();
                    this.result = yield doctorCtrl.postDoctor(req);
                }
            }
            return this.result;
        });
    }
    checkPatientUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // check that ssn field is correct
            if (!(this.checkSsn(req.body.patient_ssn)))
                return false;
            // username and patient's ssn must be the same
            if (!(this.checkSsnUsername(req.body.patient_ssn, req.body.username)))
                return false;
            // - check if the patient is already on the db
            let patientCtrl = new patientCtrl_1.PatientCtrl();
            req.query.patient_ssn = req.body.patient_ssn;
            if ((yield patientCtrl.getPatient(req)) instanceof models_1.Patient) {
                this.error.name = "DB ERROR";
                this.error.details = "patient already present in the database";
                return false;
            }
            // - check if his doctor exists in the db
            let doctorCtrl = new doctorCtrl_1.DoctorCtrl();
            req.query.doctor_ssn = req.body.doctor_ssn;
            if (!((yield doctorCtrl.getDoctor(req)) instanceof models_1.Doctor)) {
                this.error.name = "DB ERROR";
                this.error.details = "patient's doctor not present in the database";
                return false;
            }
            return true;
        });
    }
    checkDoctorUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // check that ssn field is correct
            if (!(this.checkSsn(req.body.doctor_ssn)))
                return false;
            // username and doctor's ssn must be the same
            if (!(this.checkSsnUsername(req.body.doctor_ssn, req.body.username)))
                return false;
            // - check if the doctor is already on the db
            let doctorCtrl = new doctorCtrl_1.DoctorCtrl();
            if ((yield doctorCtrl.getDoctor(req)) instanceof models_1.Doctor) {
                this.error.name = "DB ERROR";
                this.error.details = "doctor already present in the database";
                return false;
            }
            return true;
        });
    }
    // password comparison method
    comparePassword(candidatePassword, dbPassword) {
        return bcrypt.compareSync(candidatePassword, dbPassword);
    }
    ;
}
exports.UserCtrl = UserCtrl;
//# sourceMappingURL=userCtrl.js.map
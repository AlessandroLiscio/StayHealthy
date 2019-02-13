import { Request } from "express"
import * as bcrypt from "bcrypt"

import { User, Doctor, Patient, CustomError } from "../models/models"
import { TableCtrl } from './tableCtrl'
import { PatientCtrl } from "./patientCtrl"
import { DoctorCtrl } from "./doctorCtrl"

export class UserCtrl extends TableCtrl {

    public async getUser(req: Request): Promise<any> {

        this.sql = 'SELECT * FROM users WHERE username = $1'
        this.params = [
            req.body.username
        ]
        this.result = await this.dbManager.getQuery(this.sql, this.params)
        if (this.result.rowCount > 0) {
            let user = new User()
            user.username = this.result.rows[0].username
            user.password = this.result.rows[0].password
            user.role = this.result.rows[0].role
            this.result = user
        }
        return this.result
    }

    public async postUser(req: Request): Promise<any> {

        // check request's data correctness
        if (req.body.role == 'patient' && !(await this.checkPatientUser(req))) { return this.error }
        else if (req.body.role == 'doctor' && !(await this.checkDoctorUser(req))) { return this.error }
        else if (req.body.role != 'patient' && req.body.role != 'doctor') {
            this.error.name = "ROLE ERROR"
            this.error.details = "user role incorrect"
            return this.error
        }
        // add user to the users table
        this.sql = "INSERT INTO users ( username, password, role ) VALUES ($1,$2,$3)"
        this.params = [
            req.body.username,
            bcrypt.hashSync(req.body.password, 8),
            req.body.role
        ]
        this.result = await this.dbManager.postQuery(this.sql, this.params)

        // add the new patient or doctor to the right table
        if (!(this.result instanceof Error) && !(this.result instanceof CustomError)) {
            if (req.body.role == 'patient') {
                let patientCtrl = new PatientCtrl
                this.result = await patientCtrl.postPatient(req)
            } else if (req.body.role == 'doctor') {
                let doctorCtrl = new DoctorCtrl()
                this.result = await doctorCtrl.postDoctor(req)
            }
        }
        return this.result
    }

    private async checkPatientUser(req: Request): Promise<boolean> {
        // check that ssn field is correct
        if (!(this.checkSsn(req.body.patient_ssn))) return false
        // username and patient's ssn must be the same
        if (!(this.checkSsnUsername(req.body.patient_ssn, req.body.username))) return false

        // - check if the patient is already on the db
        let patientCtrl = new PatientCtrl()
        req.query.patient_ssn = req.body.patient_ssn
        if ((await patientCtrl.getPatient(req)) instanceof Patient) {
            this.error.name = "DB ERROR"
            this.error.details = "patient already present in the database"
            return false
        }
        // - check if his doctor exists in the db
        let doctorCtrl = new DoctorCtrl()
        req.query.doctor_ssn = req.body.doctor_ssn
        if (!((await doctorCtrl.getDoctor(req)) instanceof Doctor)) {
            this.error.name = "DB ERROR"
            this.error.details = "patient's doctor not present in the database"
            return false
        }
        return true
    }

    private async checkDoctorUser(req: Request): Promise<boolean> {
        // check that ssn field is correct
        if (!(this.checkSsn(req.body.doctor_ssn))) return false
        // username and doctor's ssn must be the same
        if (!(this.checkSsnUsername(req.body.doctor_ssn, req.body.username))) return false
        // - check if the doctor is already on the db
        let doctorCtrl = new DoctorCtrl()
        if ((await doctorCtrl.getDoctor(req)) instanceof Doctor) {
            this.error.name = "DB ERROR"
            this.error.details = "doctor already present in the database"
            return false
        }
        return true
    }

}
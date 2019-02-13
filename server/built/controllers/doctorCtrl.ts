import { Request } from "express"
import { Doctor, Patient } from "../models/models"
import { TableCtrl } from "./tableCtrl"

export class DoctorCtrl extends TableCtrl {

    public async getDoctor(req: Request): Promise<any> {

        this.sql = 'SELECT * FROM doctors WHERE doctor_ssn = $1'
        this.params = [
            req.query.doctor_ssn
        ]
        this.result = await this.dbManager.getQuery(this.sql, this.params)

        if (this.result.rowCount > 0) {
            let doctor = new Doctor()
            doctor.doctor_ssn = this.result.rows[0].doctor_ssn
            doctor.first_name = this.result.rows[0].first_name
            doctor.last_name = this.result.rows[0].last_name
            doctor.date_of_birth = this.result.rows[0].date_of_birth
            this.result = doctor
        }
        return this.result
    }

    public async postDoctor(req: Request): Promise<any> {

        if (!(this.checkSsn(req.body.doctor_ssn))) return this.error
        this.sql = 'INSERT INTO doctors ( doctor_ssn, first_name, last_name, date_of_birth ) VALUES ($1,$2,$3,$4)'
        this.params = [
            req.body.doctor_ssn,
            req.body.first_name,
            req.body.last_name,
            req.body.date_of_birth
        ]
        this.result = await this.dbManager.postQuery(this.sql, this.params)
        return this.result

    }

    public async getDoctorPatients(req: Request) {

        this.sql = 'SELECT * FROM patients WHERE doctor_ssn = $1'
        this.params = [
            req.query.doctor_ssn
        ]
        this.result = await this.dbManager.getQuery(this.sql, this.params)

        if (this.result.rowCount > 0) {
            let patientsArray = []
            for (let row of this.result.rows) {
                let patient = new Patient()
                patient.patient_ssn = row.patient_ssn
                patient.first_name = row.first_name
                patient.last_name = row.last_name
                patient.date_of_birth = row.date_of_birth
                patient.doctor_ssn = row.doctor_ssn
                patient.last_fetch_date = row.last_fetch_date

                patientsArray.push(patient)
            }
            this.result = patientsArray
        }
        return this.result
    }

}
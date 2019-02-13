import { Request } from "express"
import { Patient, Doctor } from "../models/models"
import { TableCtrl } from "./tableCtrl"

export class PatientCtrl extends TableCtrl {

    public async getPatient(req: Request): Promise<any> {
        
        this.sql = 'SELECT * FROM patients WHERE patient_ssn = $1'
        this.params = [
            req.query.patient_ssn
        ]
        this.result = await this.dbManager.getQuery(this.sql, this.params)

        if (this.result.rowCount > 0) {
            let patient = new Patient()
            patient.patient_ssn = this.result.rows[0].patient_ssn
            patient.first_name = this.result.rows[0].first_name
            patient.last_name = this.result.rows[0].last_name
            patient.date_of_birth = this.result.rows[0].date_of_birth
            patient.doctor_ssn = this.result.rows[0].doctor_ssn
            patient.last_fetch_date = this.result.rows[0].last_fetch_date
            this.result = patient
        }
        return this.result

    }

    public async postPatient(req: Request): Promise<any> {

        if (!(super.checkSsn(req.body.patient_ssn))) return this.error
        this.sql = 'INSERT INTO patients ( patient_ssn, first_name, last_name, date_of_birth, doctor_ssn, last_fetch_date ) VALUES ($1,$2,$3,$4,$5,$6)'
        this.params = [
            req.body.patient_ssn,
            req.body.first_name,
            req.body.last_name,
            req.body.date_of_birth,
            req.body.doctor_ssn,
            new Date(Date.now())
        ]
        this.result = await this.dbManager.postQuery(this.sql, this.params)
        return this.result

    }
    
    public async getPatientDoctor(req: Request): Promise<any> {
        
        this.sql = 'SELECT D.doctor_ssn, D.first_name, D.last_name, D.date_of_birth \
                     FROM doctors AS D INNER JOIN patients AS P ON (D.doctor_ssn = P.doctor_ssn) \
                     WHERE P.patient_ssn = $1'
        this.params = [
            req.query.patient_ssn
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
}
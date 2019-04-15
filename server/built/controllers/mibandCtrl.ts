import { Request } from "express"
import { Miband } from "../models/models"
import { TableCtrl } from "./tableCtrl"
import { CustomError } from "../models/customError"


export class MibandCtrl extends TableCtrl {

    public PythonShell = require('python-shell');

    public async getData(req: Request): Promise<any> {

        this.sql = 'SELECT * FROM miband WHERE (patient_ssn = $1 AND (timestamp >= $2 AND timestamp <= $3)) ORDER BY timestamp ASC'
        this.params = [
            req.query.patient_ssn,
            req.query.dayFrom,
            req.query.dayTo
        ]
        this.result = await this.dbManager.getQuery(this.sql, this.params)

        if (this.result.rowCount > 0) {
            let mibandArray = []
            for (let row of this.result.rows) {
                let miband = new Miband()
                miband.patient_ssn = row.patient_ssn
                miband.timestamp = row.timestamp
                miband.activity = row.activity
                miband.intensity = row.intensity
                miband.steps = row.steps
                miband.heart_rate = row.heart_rate
                mibandArray.push(miband)
            }
            this.result = mibandArray
        }
        return this.result
    }

    public async postData(req: Request): Promise<any> {
        //run random forest
        
        // get the user's last fetch date from the db
        var data: any[] = []
        var newLastFetchDate = new Date()
        var currentLastFetchDate = (await this.getLastFetchDate(req)).rows[0].last_fetch_date
        newLastFetchDate = currentLastFetchDate

        this.sql = 'INSERT INTO miband ( patient_ssn, timestamp, activity, intensity, steps, heart_rate ) VALUES ($1,$2,$3,$4,$5,$6)'
        for (let element of req.body) {
            // add only those element whoose date is more recente then the last last fetch date
            if (new Date(element.timestamp) > newLastFetchDate) {
                this.params = [
                    req.query.patient_ssn,
                    element.timestamp,
                    element.activity,
                    element.intensity,
                    element.steps,
                    element.heart_rate
                ]
                data.push(this.params)
                // save newLastFetchDate to update the user's last fetch date on the database
                newLastFetchDate = new Date(element.timestamp)
            }
        }
        // if no data was added to the array, return alert message
        if (!(data[0])) {
            this.error.name = "DATA ERROR"
            this.error.details = ("No data more recent than: " + currentLastFetchDate + ".")
            return this.error
        }
        // else, proceed with the query
        this.result = await this.dbManager.postData(this.sql, data)
        console.log(this.result);
        await this.handleLastFetchDate(this.result, req, currentLastFetchDate, newLastFetchDate)

        return this.result
    }

    public async handleLastFetchDate(result: any, req: Request, currentLastFetchDate: Date, newLastFetchDate: Date) {
        // if no error is returned by the query, then update the user's last fetch date on the database and return the new last fetch date
        if (!(result instanceof Error || result instanceof CustomError)) {
            console.log('currentLastFetchDate: ', currentLastFetchDate)
            result = await this.putLastFetchDate(req.query.patient_ssn, result)
            console.log("newLastFetchDate: ", newLastFetchDate)
            if (!(result instanceof Error || result instanceof CustomError)) { result = newLastFetchDate }
            // else, remoove the data on the database starting from the current last fetch date, and return the current last fetch date
        } else {
            result = await this.deleteFromLastFetchDate(req.query.patient_ssn, currentLastFetchDate)
            if (!(result instanceof Error || result instanceof CustomError)) { result = currentLastFetchDate }
        }
    }

    public async putLastFetchDate(patient_ssn: string, newLastFetchDate: Date): Promise<string> {
        this.sql = 'UPDATE patients SET last_fetch_date = $1 WHERE patient_ssn = $2'
        this.params = [
            newLastFetchDate,
            patient_ssn
        ]
        this.result = await this.dbManager.postQuery(this.sql, this.params)
        if (!(this.result instanceof Error || this.result instanceof CustomError)) { this.result = new Date(newLastFetchDate) }
        return this.result
    }

    public async getLastFetchDate(req: Request): Promise<any> {
        this.sql = 'SELECT last_fetch_date FROM patients WHERE patient_ssn = $1'
        this.params = [
            req.query.patient_ssn
        ]
        this.result = await this.dbManager.getQuery(this.sql, this.params)
        return this.result
    }

    public async deleteFromLastFetchDate(patient_ssn: string, last_fetch_date: Date): Promise<any> {
        this.sql = 'DELETE FROM miband WHERE patient_ssn = $1 AND timestamp > $2'
        this.params = [
            patient_ssn,
            last_fetch_date
        ]
        this.result = await this.dbManager.deleteQuery(this.sql, this.params)
        return this.result
    }

}
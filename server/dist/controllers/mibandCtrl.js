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
const customError_1 = require("../models/customError");
class MibandCtrl extends tableCtrl_1.TableCtrl {
    getData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT * FROM miband WHERE (patient_ssn = $1 AND (timestamp >= $2 AND timestamp <= $3)) ORDER BY timestamp ASC';
            this.params = [
                req.query.patient_ssn,
                req.query.dayFrom,
                req.query.dayTo
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            if (this.result.rowCount > 0) {
                let mibandArray = [];
                for (let row of this.result.rows) {
                    let miband = new models_1.Miband();
                    miband.patient_ssn = row.patient_ssn;
                    miband.timestamp = row.timestamp;
                    miband.activity = row.activity;
                    miband.intensity = row.intensity;
                    miband.steps = row.steps;
                    miband.heart_rate = row.heart_rate;
                    mibandArray.push(miband);
                }
                this.result = mibandArray;
            }
            return this.result;
        });
    }
    postData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // get the user's last fetch date from the db
            var data = [];
            var newLastFetchDate = new Date();
            var currentLastFetchDate = (yield this.getLastFetchDate(req)).rows[0].last_fetch_date;
            newLastFetchDate = currentLastFetchDate;
            this.sql = 'INSERT INTO miband ( patient_ssn, timestamp, activity, intensity, steps, heart_rate ) VALUES ($1,$2,$3,$4,$5,$6)';
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
                    ];
                    data.push(this.params);
                    // save newLastFetchDate to update the user's last fetch date on the database
                    newLastFetchDate = new Date(element.timestamp);
                }
            }
            // if no data was added to the array, return alert message
            if (!(data[0])) {
                console.log("prova");
                this.error.name = "DATA ERROR";
                this.error.details = ("No data more recent than: " + currentLastFetchDate + ".");
                return this.error;
            }
            // else, proceed with the query
            this.result = yield this.dbManager.postData(this.sql, data);
            console.log(this.result);
            // if no error is returned by the query, then update the user's last fetch date on the database and return the new last fetch date
            if (!(this.result instanceof Error || this.result instanceof customError_1.CustomError)) {
                console.log('currentLastFetchDate: ', currentLastFetchDate);
                this.result = yield this.putLastFetchDate(req.query.patient_ssn, this.result);
                console.log("newLastFetchDate: ", newLastFetchDate);
                if (!(this.result instanceof Error || this.result instanceof customError_1.CustomError)) {
                    this.result = newLastFetchDate;
                }
                // else, remoove the data on the database starting from the current last fetch date, and return the current last fetch date
            }
            else {
                this.result = yield this.deleteFromLastFetchDate(req.query.patient_ssn, currentLastFetchDate);
                if (!(this.result instanceof Error || this.result instanceof customError_1.CustomError)) {
                    this.result = currentLastFetchDate;
                }
            }
            return this.result;
        });
    }
    putLastFetchDate(patient_ssn, newLastFetchDate) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'UPDATE patients SET last_fetch_date = $1 WHERE patient_ssn = $2';
            this.params = [
                newLastFetchDate,
                patient_ssn
            ];
            this.result = yield this.dbManager.postQuery(this.sql, this.params);
            if (!(this.result instanceof Error || this.result instanceof customError_1.CustomError)) {
                this.result = new Date(newLastFetchDate);
            }
            return this.result;
        });
    }
    getLastFetchDate(req) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'SELECT last_fetch_date FROM patients WHERE patient_ssn = $1';
            this.params = [
                req.query.patient_ssn
            ];
            this.result = yield this.dbManager.getQuery(this.sql, this.params);
            return this.result;
        });
    }
    deleteFromLastFetchDate(patient_ssn, last_fetch_date) {
        return __awaiter(this, void 0, void 0, function* () {
            this.sql = 'DELETE FROM miband WHERE patient_ssn = $1 AND timestamp > $2';
            this.params = [
                patient_ssn,
                last_fetch_date
            ];
            this.result = yield this.dbManager.deleteQuery(this.sql, this.params);
            return this.result;
        });
    }
}
exports.MibandCtrl = MibandCtrl;
//# sourceMappingURL=mibandCtrl.js.map
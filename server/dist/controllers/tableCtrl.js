"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dbmanager_1 = require("../dbmanager");
const customError_1 = require("../models/customError");
class TableCtrl {
    constructor() {
        // every table controller interacts with the dbmanager
        this.dbManager = new dbmanager_1.default();
        // every table controller will use an sql string for the queries
        this.sql = "";
        // every table controller will need some parameters for the queries
        this.params = [];
        // every table controller will return a result, wich could also be an error
        this.result = null;
        // used to handle some errors caused from the program
        this.error = new customError_1.CustomError();
    }
    // italian social codes are 16 characters long
    checkSsn(ssn) {
        if (!ssn) {
            this.error.name = "SSN ERROR";
            this.error.details = "ssn field is null";
            return false;
        }
        if (ssn.length != 16) {
            this.error.name = "SSN ERROR";
            this.error.details = "ssn field must be 16 characters long";
            return false;
        }
        return true;
    }
    // patients and doctors have their ssn for username, so they must be the equal
    checkSsnUsername(ssn, username) {
        if (ssn != username) {
            this.error.name = "SSN ERROR";
            this.error.details = "ssn and username must have the same value";
            return false;
        }
        return true;
    }
}
exports.TableCtrl = TableCtrl;
//# sourceMappingURL=tableCtrl.js.map
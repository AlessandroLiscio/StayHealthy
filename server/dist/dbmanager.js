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
const pg_1 = require("pg");
const customError_1 = require("./models/customError");
class DbManager {
    constructor() {
        this.error = new customError_1.CustomError();
    }
    // check if the parameters array is correct
    checkParams(params) {
        for (let element of params) {
            if (element == null) {
                this.error.name = "PARAMS ERROR";
                this.error.details = ("important parameter is null or misspelled");
                return false;
            }
        }
        return true;
    }
    // function to connect to the database for a GET query
    getQuery(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            // check that parameters are not null
            if (!(this.checkParams(params))) {
                return this.error;
            }
            // create new clients pool
            let pool = new pg_1.Pool();
            let client = yield pool.connect();
            try {
                let result = yield client.query(sql, params);
                // if data was found on the database
                if (result.rowCount > 0) {
                    console.log('\nResult: ', result.rows, '\n');
                    return result;
                }
                // if data was not found on the database
                else {
                    this.error.name = "DB ERROR";
                    this.error.details = "data not found";
                    return this.error;
                }
            }
            // catch connection error
            catch (err) {
                console.log('getQuery error: ', err);
                return err;
            }
            // always realease client and end connection
            finally {
                client.release();
                yield pool.end();
            }
        });
    }
    // function to connect to the database for a POST query
    postQuery(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            // check that parameters are not null
            if (!(this.checkParams(params))) {
                return this.error;
            }
            // create new clients pool
            let pool = new pg_1.Pool();
            let client = yield pool.connect();
            try {
                let result = yield client.query(sql, params);
                return result;
            }
            // catch connection error
            catch (err) {
                console.log('postQuery error: ', err);
                return err;
            }
            // always realease client and end connection
            finally {
                client.release();
                yield pool.end();
            }
        });
    }
    // function to connect to the database for a DELETE query
    deleteQuery(sql, params) {
        return __awaiter(this, void 0, void 0, function* () {
            // check that parameters are not null
            if (!(this.checkParams(params))) {
                return this.error;
            }
            // create new clients pool
            let pool = new pg_1.Pool();
            let client = yield pool.connect();
            try {
                let result = yield client.query(sql, params);
                // if data was correctly deleted from database
                if (result.rowCount > 0) {
                    console.log('element deleted');
                    return result;
                }
                // if an error was encountered
                else {
                    this.error.name = "DB ERROR";
                    this.error.details = "data not found";
                    return this.error;
                }
            }
            // catch connection error
            catch (err) {
                console.log('deleteQuery error: ', err);
                return err;
            }
            // always realease client and end connection
            finally {
                client.release();
                yield pool.end();
            }
        });
    }
    // function to connect to the database for posting the miband data
    postData(sql, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // create new clients pool
            let pool = new pg_1.Pool();
            let client = yield pool.connect();
            let counter = 0;
            var lastTimeStamp;
            try {
                for (let row of data) {
                    if (row instanceof Array) {
                        // check that parameters are not null
                        if (!(this.checkParams(row))) {
                            return this.error;
                        }
                        lastTimeStamp = row[1];
                        yield client.query(sql, row);
                        counter++;
                        console.log('Added row', counter, ' : ', row);
                    }
                }
                return lastTimeStamp;
            }
            // catch connection error
            catch (err) {
                console.log('postData error: ', err);
                return err;
            }
            // always realease client and end connection
            finally {
                client.release();
                yield pool.end();
            }
        });
    }
}
exports.default = DbManager;
//# sourceMappingURL=dbmanager.js.map
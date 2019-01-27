import DbManager from "../dbmanager";
import { CustomError } from "../models/customError";

export abstract class TableCtrl {

    // every table controller interacts with the dbmanager
    protected dbManager: DbManager = new DbManager();
    // every table controller will use an sql string for the queries
    protected sql: string = "";
    // every table controller will need some parameters for the queries
    protected params: any[] = [];
    // every table controller will return a result, wich could also be an error
    protected result: any = null;
    // used to handle some errors caused from the program
    protected error: CustomError = new CustomError();

    // italian social codes are 16 characters long
    protected checkSsn(ssn: string): boolean {
        if (!ssn) {
            this.error.name = "SSN ERROR"
            this.error.details = "ssn field is null"
            return false;
        }
        if (ssn.length != 16) {
            this.error.name = "SSN ERROR"
            this.error.details = "ssn field must be 16 characters long"
            return false;
        }
        return true
    }

    // patients and doctors have their ssn for username, so they must be the equal
    protected checkSsnUsername(ssn: string, username: string): boolean {
        if (ssn != username) {
            this.error.name = "SSN ERROR"
            this.error.details = "ssn and username must have the same value"
            return false;
        }
        return true
    }
    
}
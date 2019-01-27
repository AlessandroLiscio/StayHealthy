
import { Patient } from '../patient/patient';
import { ResponsePatient } from '../patient/responsePatient';

export class Doctor{
    ssn: string;
    first_name: string;
    last_name: string;
    date_of_birth: string; // dates are treated as strings for a better translation of the time
    patients: ResponsePatient[];

    constructor(ssn: string, first_name: string, last_name: string, date_of_birth: string, patients: ResponsePatient[]){
        this.ssn = ssn;
        this.first_name = first_name;
        this.last_name = last_name;
        this.date_of_birth = date_of_birth;
        this.patients = patients;
    }
}
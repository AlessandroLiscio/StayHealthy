import { Doctor } from '../doctor/doctor';
import { ResponseDoctor } from '../doctor/responseDoctor';

export class Patient{
    ssn: string;
    first_name: string;
    last_name: string;
    date_of_birth: string; // dates are treated as strings for a better translation of the time
    doctor: ResponseDoctor;
    last_fetch_date: string;

    constructor(ssn: string, first_name: string, last_name: string, date_of_birth: string, last_fetch_date: string, doctor: ResponseDoctor){
        this.ssn = ssn;
        this.first_name = first_name;
        this.last_name = last_name;
        this.date_of_birth = date_of_birth;
        this.last_fetch_date = last_fetch_date;
        this.doctor = doctor;
    }
}
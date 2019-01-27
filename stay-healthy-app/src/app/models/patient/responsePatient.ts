export class ResponsePatient{
    patient_ssn: string;
    first_name: string;
    last_name: string;
    date_of_birth: string; // dates are treated as strings for a better translation of the time
    last_fetch_date: string;
    doctor_ssn: string;
}
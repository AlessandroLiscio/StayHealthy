export class UserData {
    username: string;
    password: string;
    role: string;
    patient_ssn: string; // null if it's a doctor
    doctor_ssn: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
}
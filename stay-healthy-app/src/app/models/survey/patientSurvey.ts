export class PatientSurvey {
    patient_ssn: string;
    date: string;
    survey_id: string;
    answers: number[];

    constructor(patient_ssn: string, date: string, survey_id: string, answers: number[]){
        this.patient_ssn = patient_ssn;
        this.date = date;
        this.survey_id = survey_id;
        this.answers = answers;
    }
}
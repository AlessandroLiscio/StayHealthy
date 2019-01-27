
import { Doctor } from '../doctor/doctor';
import { Patient } from '../patient/patient';

export class Message{
    uuid: string;
    sender: string;
    receiver: string;
    object: string;
    date: Date;
    content: string;

}
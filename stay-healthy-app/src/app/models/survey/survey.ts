import { Question } from './question';

export class Survey{
    title: string;
    questions: Question[];

    constructor(title: string, questions: Question[]){
        this.title = title;
        this.questions = questions;
    }
}
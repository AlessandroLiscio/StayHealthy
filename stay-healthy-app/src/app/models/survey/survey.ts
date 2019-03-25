import { Question } from './question';

export class Survey{
    title: string;
    questions: Question[];

    constructor(title: string){
        this.title = title;
        this.questions = [];
    }
}
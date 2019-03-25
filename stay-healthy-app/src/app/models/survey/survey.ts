import { Question } from './question';

export class Survey{
    id: string;
    title: string;
    questions: Question[];

    constructor(id: string, title: string){
        this.id = id;
        this.title = title;
        this.questions = [];
    }
}
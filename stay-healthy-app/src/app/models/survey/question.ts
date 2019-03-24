import { Choice } from './chioce';

export class Question{
    id: number;
    title: string;
    choices: Choice[];

    constructor(id: number, title: string, choices: Choice[]){
        this.id = id;
        this.title = title;
        this.choices = choices;
    }
}
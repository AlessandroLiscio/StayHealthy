import { Choice } from "./chioce";

export class Element{
    type: string;
    name: string;
    title: string;
    isRequired: boolean;
    choices: Choice[];

    constructor(name: string, title: string){
        this.type = "radiogroup";
        this.isRequired = true;
        this.name = name;
        this.title = title;
        this.choices = [];
    }
}
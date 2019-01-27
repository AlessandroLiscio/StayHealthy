export class DisplayableAnswer{
    text: string;
    choice: string;
    value: number;

    constructor(text: string, choice: string, value: number){
        this.text = text;
        this.choice = choice;
        this.value = value;
    }
}
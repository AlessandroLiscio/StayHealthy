import { Page } from "./page";

export class Survey{
    title: string;
    pages: Page[];

    constructor(title: string){
        this.title = title;
        this.pages = [];
    }
}
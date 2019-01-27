import { Element } from "./element";

export class Page{
    name: string;
    elements: Element[];

    constructor(name: string){
        this.name = name;
        this.elements = [];
    }
}
import { Message } from '../messages/message';
import * as moment from 'moment';

export class DisplayableMessage{
    message: Message;
    prettyDate: string;

    constructor(message: Message){
        this.message = message;
        moment.locale('it');
        this.prettyDate = moment(this.message.date).format('ll');
    }
}
import { Utils } from './utils';
import { Buffer } from 'buffer';
import * as moment from 'moment';

export class MiBandTime{

    public year: number;
    public month: number;
    public day: number;
    public hours: number;
    public minutes: number;
    public seconds: number;

    constructor(buf: any, isBuffer: boolean){
        if(isBuffer && buf.byteLength == 6){
            let ab = Utils.toArrayBuffer(buf);
            let view = new DataView(ab);
            //little endian
            this.year = view.getUint16(0, true);
            this.month = view.getInt8(2);
            this.day = view.getInt8(3);
            this.hours = view.getInt8(4);
            this.minutes = view.getInt8(5);
            this.seconds = null;
            //console.log(this.year + " " + this.month + " " + this.day + " " + this.hours + " " + this.minutes);
        }
        else if (!isBuffer && buf.length == 5){
            this.year = buf[0];
            this.month = buf[1];
            this.day = buf[2];
            this.hours = buf[3];
            this.minutes = buf[4];
            this.seconds = null;
        }
        else{
            throw new Error("Miband Date not allowed.");
        }
    }

    
    public incrementMinute(){
        var newDate = moment(this.toString(), "YYYY-MM-DD HH-mm").add(moment.duration({'minutes' : 1}));
        this.year = newDate.get('year');
        //months begin from 0
        this.month = newDate.get('month') + 1;
        this.day = newDate.get('date');
        this.hours = newDate.get('hours');
        this.minutes = newDate.get('minutes');
    }

    public dateToBytes(): Buffer{
        let ab = new ArrayBuffer(6);
        let view = new DataView(ab);
        view.setUint16(0, this.year, true);
        view.setUint8(2, this.month);
        view.setUint8(3, this.day);
        view.setUint8(4, this.hours);
        view.setUint8(5, this.minutes);
        return Utils.toBuffer(ab);
    }

    public toString(): string{
        return this.year + "-" + this.month + "-" + this.day + " " + this.hours + ":" + this.minutes;
    }

    public toISO8601(): string{
        return this.year + "-" + this.month + "-" + this.day + "T" + this.hours + ":" + this.minutes + ":00.000Z";
    }

    public toMillis(): number{
        return Date.parse(this.toISO8601());
    }

    public minutesUntilNow(){
        let now: number = Date.now();
        //from milliseconds to minutes
        return (now - this.toMillis()) / 60000;
    }
}
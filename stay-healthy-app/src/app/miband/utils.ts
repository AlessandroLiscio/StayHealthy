
import { Buffer } from 'buffer';

export class Utils{

    //from buffer to arraybuffer
    static toArrayBuffer(buf: Buffer): ArrayBuffer {
        var ab: ArrayBuffer = new ArrayBuffer(buf.length);
        var view: Uint8Array = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            view[i] = buf[i];
        }
        return ab;
    }

    //from arraybuffer to buffer
    static toBuffer(ab: ArrayBuffer): Buffer {
        var buf: Buffer = new Buffer(ab.byteLength);
        var view: Uint8Array = new Uint8Array(ab);
        for (var i = 0; i < buf.length; ++i) {
            buf[i] = view[i];
        }
        return buf;
    }
}
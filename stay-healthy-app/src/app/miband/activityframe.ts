export class ActivityFrame {
    public timestamp: string;
    public activity: number;
    public intensity: number;
    public steps: number;
    public heart_rate: number;

    constructor(timestamp: string, activity: number, intensity: number, steps: number, heart_rate: number) {
        this.timestamp = timestamp;
        this.activity = activity;
        this.intensity = intensity;
        this.steps = steps;
        this.heart_rate = heart_rate;
    }
}
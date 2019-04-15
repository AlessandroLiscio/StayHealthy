export class ActivityFrame {
    public timestamp: string;
    public activity: number;
    public intensity: number;
    public steps: number;
    public heart_rate: number;
    public is_sleeping: number;

    constructor(timestamp: string, activity: number, intensity: number, steps: number, heart_rate: number, is_sleeping: number) {
        this.timestamp = timestamp;
        this.activity = activity;
        this.intensity = intensity;
        this.steps = steps;
        this.heart_rate = heart_rate;
        this.is_sleeping = is_sleeping;
    }
}
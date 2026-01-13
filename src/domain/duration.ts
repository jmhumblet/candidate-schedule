class Duration {
    constructor(public hours: number, public minutes: number) {
        if (this.minutes > 60) {
            this.hours += Math.floor(this.minutes / 60);
            this.minutes = this.minutes % 60;
        }
    }

    static Parse(time: string): Duration {
        const [hours, minutes] = time.split(':').map(Number);
        return new Duration(hours, minutes);
    }

    public plus(other: Duration): Duration {
        return new Duration(this.hours + other.hours, this.minutes + other.minutes);
    }

    public half(): Duration {
        const totalMinutes = this.hours * 60 + this.minutes;
        const halfMinutes = totalMinutes / 2;
        const hours = ~~(halfMinutes / 60);
        const minutes = halfMinutes % 60;
        return new Duration(hours, minutes);
    }

    public toString(): string {
        return `${this.hours}h${this.minutes.toString().padStart(2, '0')}`;
    }
}

export default Duration
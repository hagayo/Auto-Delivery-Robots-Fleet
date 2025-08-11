/** WallClock uses setInterval - speed adjusts the effective interval. */
export class WallClock {
    baseInterval;
    speedVal;
    timer = null;
    subscribers = new Set();
    constructor(opts = {}) {
        this.baseInterval = Math.max(1, Math.floor(opts.intervalMs ?? 1000));
        this.speedVal = opts.speed ?? 1;
    }
    start() {
        if (this.timer)
            return;
        this.timer = setInterval(() => this.emit(Date.now()), this.effectiveInterval());
    }
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    setSpeed(speed) {
        this.speedVal = Math.max(0.0001, speed);
        if (this.timer) {
            // restart timer with new cadence
            clearInterval(this.timer);
            this.timer = setInterval(() => this.emit(Date.now()), this.effectiveInterval());
        }
    }
    getSpeed() {
        return this.speedVal;
    }
    isRunning() {
        return this.timer != null;
    }
    now() {
        return Date.now();
    }
    onTick(cb) {
        this.subscribers.add(cb);
        return () => this.subscribers.delete(cb);
    }
    effectiveInterval() {
        return Math.max(1, Math.floor(this.baseInterval / this.speedVal));
    }
    emit(now) {
        for (const cb of this.subscribers)
            cb(now);
    }
}
/** FakeClock - manual time advancement for tests. */
export class FakeClock {
    baseInterval;
    speedVal;
    running = false;
    subscribers = new Set();
    nowMs = 0;
    carry = 0; // fractional remainder for partial intervals
    constructor(opts = {}) {
        this.baseInterval = Math.max(1, Math.floor(opts.intervalMs ?? 1000));
        this.speedVal = opts.speed ?? 1;
    }
    start() {
        this.running = true;
    }
    stop() {
        this.running = false;
    }
    setSpeed(speed) {
        this.speedVal = Math.max(0.0001, speed);
    }
    getSpeed() {
        return this.speedVal;
    }
    isRunning() {
        return this.running;
    }
    now() {
        return this.nowMs;
    }
    onTick(cb) {
        this.subscribers.add(cb);
        return () => this.subscribers.delete(cb);
    }
    /** Test helper - advance fake time by ms and emit ticks accordingly. */
    advanceBy(ms) {
        if (!this.running || ms <= 0) {
            this.nowMs += Math.max(0, ms);
            return;
        }
        const step = this.baseInterval / this.speedVal; // ms per tick
        let remaining = this.carry + ms;
        while (remaining + 1e-9 >= step) {
            remaining -= step;
            this.nowMs += step;
            for (const cb of this.subscribers)
                cb(this.nowMs);
        }
        this.carry = remaining;
    }
    /** Test helper - force a tick without time passing. */
    flush() {
        for (const cb of this.subscribers)
            cb(this.nowMs);
    }
}

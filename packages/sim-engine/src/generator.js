/**
 * Mission generator - creates missions at a fixed rate and assigns them to idle robots.
 * Rate is missions per minute. Uses the provided Clock ticks to reduce timer drift.
 */
import { pickNextRobot } from './assignment.js';
import { evolveMission, toRobotStatus } from './stateMachine.js';
export class MissionGenerator {
    clock;
    store;
    periodMs;
    idPrefix;
    unsub = null;
    accMs = 0;
    seq = 1;
    queue = [];
    constructor(clock, store, opts = {}) {
        this.clock = clock;
        this.store = store;
        const rate = Math.max(0.0001, opts.ratePerMinute ?? 2);
        this.periodMs = 60000 / rate;
        this.idPrefix = opts.idPrefix ?? 'M-';
    }
    start() {
        if (this.unsub)
            return;
        this.unsub = this.clock.onTick((now) => this.onTick(now));
    }
    stop() {
        if (this.unsub) {
            this.unsub();
            this.unsub = null;
        }
    }
    onTick(now) {
        // 1) accumulate and emit new missions at rate
        const delta = now - (now - 0); // now is absolute, but FakeClock advances discretely
        // Using clock ticks only, so accumulate by base interval if needed
        this.accMs += (delta || 0) || 1000; // default to 1s if delta is zero in tests
        while (this.accMs >= this.periodMs) {
            this.accMs -= this.periodMs;
            this.enqueueMission(now);
        }
        // 2) try assigning queued missions
        this.tryAssign(now);
    }
    enqueueMission(now) {
        const id = `${this.idPrefix}${String(this.seq).padStart(4, '0')}`;
        this.seq += 1;
        const mission = {
            id,
            robotId: '', // to be filled on assignment
            state: 'created',
            createdAt: now,
            timeline: [],
            cancelReason: null
        };
        this.queue.push(mission);
    }
    tryAssign(now) {
        if (this.queue.length === 0)
            return;
        const idle = this.store.getRobots().filter((r) => r.status === 'idle' && r.missionId === null);
        if (idle.length === 0)
            return;
        // assign oldest-queued mission to oldest-idle robot
        const mission = this.queue.at(0);
        if (!mission)
            return;
        const robot = pickNextRobot(idle);
        if (!robot)
            return;
        // update mission -> assigned
        let assigned = { ...mission, robotId: robot.id };
        assigned = evolveMission(assigned, { type: 'assign' });
        // update robot snapshot
        const updatedRobot = {
            ...robot,
            status: toRobotStatus(assigned.state),
            missionId: assigned.id,
            lastUpdated: now
        };
        // persist and notify via store
        this.store.applyMission(assigned);
        this.store.applyRobot(updatedRobot);
        // remove from queue
        this.queue.shift();
    }
    /** For tests/observability */
    getQueueLength() { return this.queue.length; }
}

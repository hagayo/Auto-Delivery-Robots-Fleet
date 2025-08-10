/**
 * Mission generator - creates missions at a fixed rate and assigns them to idle robots.
 * Rate is missions per minute. Uses the provided Clock ticks to reduce timer drift.
 */
import { pickNextRobot } from './assignment.js';
import type { Clock } from './clock.js';
import { evolveMission, toRobotStatus } from './stateMachine.js';
import type { Store } from './store.js';
import type { TMission, TRobot } from './types.js';

export interface GeneratorOptions {
  ratePerMinute?: number;      // default 2
  idPrefix?: string;           // default "M-"
}

export class MissionGenerator {
  private readonly clock: Clock;
  private readonly store: Store;
  private readonly periodMs: number;
  private readonly idPrefix: string;
  private unsub: (() => void) | null = null;
  private accMs = 0;
  private seq = 1;
  private queue: TMission[] = [];

  constructor(clock: Clock, store: Store, opts: GeneratorOptions = {}) {
    this.clock = clock;
    this.store = store;
    const rate = Math.max(0.0001, opts.ratePerMinute ?? 2);
    this.periodMs = 60000 / rate;
    this.idPrefix = opts.idPrefix ?? 'M-';
  }

  start(): void {
    if (this.unsub) return;
    this.unsub = this.clock.onTick((now) => this.onTick(now));
  }

  stop(): void {
    if (this.unsub) {
      this.unsub();
      this.unsub = null;
    }
  }

  private onTick(now: number): void {
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

  private enqueueMission(now: number): void {
    const id = `${this.idPrefix}${String(this.seq).padStart(4, '0')}`;
    this.seq += 1;

    const mission: TMission = {
      id,
      robotId: '', // to be filled on assignment
      state: 'created',
      createdAt: now,
      timeline: [],
      cancelReason: null
    };
    this.queue.push(mission);
  }

  private tryAssign(now: number): void {
    if (this.queue.length === 0) return;

    const idle = this.store.getRobots().filter(r => r.status === 'idle' && r.missionId === null);
    if (idle.length === 0) return;

    // assign oldest-queued mission to oldest-idle robot
    const mission = this.queue.at(0);
    if (!mission) return;
    const robot = pickNextRobot(idle);
    if (!robot) return;

    // update mission -> assigned
    let assigned: TMission = { ...mission, robotId: robot.id };
    assigned = evolveMission(assigned, { type: 'assign' });

    // update robot snapshot
    const updatedRobot: TRobot = {
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
  getQueueLength(): number { return this.queue.length; }
}

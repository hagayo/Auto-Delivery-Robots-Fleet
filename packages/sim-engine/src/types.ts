const SCHEMA_BASE = 'https://schemas.fleetops.dev';

import { Type, Static } from '@sinclair/typebox';

/** - JSON Schema meta is 2020-12 - */
export const RobotStatus = Type.Union(
  [Type.Literal('idle'), Type.Literal('assigned'), Type.Literal('en_route'), Type.Literal('delivering'), Type.Literal('completed')],
  { $id: `${SCHEMA_BASE}/RobotStatus` }
);

export type TRobotStatus = Static<typeof RobotStatus>;

export const MissionState = Type.Union(
  [
    Type.Literal('created'),
    Type.Literal('assigned'),
    Type.Literal('navigating_to_pickup'),
    Type.Literal('at_pickup'),
    Type.Literal('navigating_to_dropoff'),
    Type.Literal('completed'),
    Type.Literal('aborting'),
    Type.Literal('canceled')
  ],
  { $id: `${SCHEMA_BASE}/MissionState` }
);

export type TMissionState = Static<typeof MissionState>;

export const MissionTimelineEntry = Type.Object(
  { state: MissionState, at: Type.Number({ description: 'epoch millis' }) },
  { $id: `${SCHEMA_BASE}/MissionTimelineEntry` }
);
export type TMissionTimelineEntry = Static<typeof MissionTimelineEntry>;

export const Robot = Type.Object(
  {
    id: Type.String(),
    status: RobotStatus,
    missionId: Type.Union([Type.String(), Type.Null()]),
    batteryPct: Type.Integer({ minimum: 0, maximum: 100 }),
    lastUpdated: Type.Number({ description: 'epoch millis' })
  },
  { $id: `${SCHEMA_BASE}/Robot` }
);
export type TRobot = Static<typeof Robot>;

export const Mission = Type.Object(
  {
    id: Type.String(),
    robotId: Type.String(),
    state: MissionState,
    createdAt: Type.Number(),
    timeline: Type.Array(MissionTimelineEntry),
    cancelReason: Type.Union([Type.Literal('operator'), Type.Null()], { default: null })
  },
  { $id: `${SCHEMA_BASE}/Mission` }
);
export type TMission = Static<typeof Mission>;

export const RobotsSnapshot = Type.Object(
  { robots: Type.Array(Robot) },
  { $id: `${SCHEMA_BASE}/RobotsSnapshot` }
);
export type TRobotsSnapshot = Static<typeof RobotsSnapshot>;

/** SSE event envelopes */
export const RobotUpdatedEvent = Type.Object(
  { entity: Type.Literal('robot'), type: Type.Literal('updated'), data: Robot },
  { $id: `${SCHEMA_BASE}/RobotUpdatedEvent` }
);
export type TRobotUpdatedEvent = Static<typeof RobotUpdatedEvent>;

export const MissionUpdatedEvent = Type.Object(
  { entity: Type.Literal('mission'), type: Type.Literal('updated'), data: Mission },
  { $id: `${SCHEMA_BASE}/MissionUpdatedEvent` }
);
export type TMissionUpdatedEvent = Static<typeof MissionUpdatedEvent>;

/** Optional - aggregate metrics snapshot */
export const Metrics = Type.Object(
  {
    totalsByStatus: Type.Record(Type.String(), Type.Integer({ minimum: 0 })),
    missionsCreatedLast10m: Type.Integer({ minimum: 0 }),
    missionsCompletedLast10m: Type.Integer({ minimum: 0 })
  },
  { $id: `${SCHEMA_BASE}/Metrics` }
);
export type TMetrics = Static<typeof Metrics>;

export const MetricsEvent = Type.Object(
  { entity: Type.Literal('metrics'), type: Type.Literal('snapshot'), data: Metrics },
  { $id: `${SCHEMA_BASE}/MetricsEvent` }
);
export type TMetricsEvent = Static<typeof MetricsEvent>;

/** Union of all SSE events we plan to emit */
export const AnySseEvent = Type.Union(
  [RobotUpdatedEvent, MissionUpdatedEvent, MetricsEvent],
  { $id: `${SCHEMA_BASE}/AnySseEvent` }
);
export type TAnySseEvent = Static<typeof AnySseEvent>;

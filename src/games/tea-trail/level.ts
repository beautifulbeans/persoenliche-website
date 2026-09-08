/** Metres, Y up. Shared by the asset generator, Rapier and regression tests. */
export type Surface = "wood" | "stone" | "cloth" | "vinyl";
export type ContactMaterial = "wood" | "metal" | "porcelain" | "cloth";
export type ObstacleKind =
  | "camera"
  | "lens"
  | "vinyl"
  | "cards"
  | "chips"
  | "weights"
  | "tin"
  | "plant"
  | "spoon";
export interface Obstacle {
  id: string;
  kind: ObstacleKind;
  x: number;
  z: number;
  w: number;
  d: number;
  h: number;
  rotation?: number;
}
export const START = { x: 0, z: 13.2 };
export const GOAL = { x: 0, z: -13.1, radius: 1.45 };
export const ROUND_SECONDS = 15;
export const GENTLE_ROUND_SECONDS = 35;
export const roundDuration = (gentle: boolean, levelId = 0) => {
  const course = COURSES[levelId] ?? COURSES[0];
  return gentle ? course.gentleSeconds : course.seconds;
};
export const PLAYER_RADIUS = 0.36;
export const LEVEL = { width: 18, depth: 32 };
export const OBSTACLES: Obstacle[] = [
  { id: "camera", kind: "camera", x: -1.5, z: 7, w: 4, d: 1.65, h: 1.65 },
  { id: "camera-lens", kind: "lens", x: -4.4, z: 7, w: 1.55, d: 1.8, h: 1.5 },
  { id: "fern-start", kind: "plant", x: -7, z: 7, w: 3.3, d: 1.5, h: 2.2 },
  { id: "lens-right", kind: "lens", x: 7.5, z: 5, w: 1.1, d: 1.1, h: 1.6 },
  {
    id: "vinyl-stack",
    kind: "vinyl",
    x: 5.6,
    z: 0.1,
    w: 6.2,
    d: 1.35,
    h: 1.25,
  },
  {
    id: "records-left",
    kind: "vinyl",
    x: -3.2,
    z: 0.1,
    w: 1.15,
    d: 1.35,
    h: 1.1,
  },
  { id: "plant-left", kind: "plant", x: -8.1, z: 0.1, w: 1.45, d: 1.7, h: 2 },
  { id: "weights", kind: "weights", x: -4.5, z: -6.8, w: 6.5, d: 1.5, h: 0.95 },
  { id: "tea-tin", kind: "tin", x: -0.4, z: -6.8, w: 1.5, d: 1.6, h: 1.7 },
  { id: "gate-left", kind: "cards", x: 2.2, z: -9.1, w: 0.25, d: 1.4, h: 1.65 },
  {
    id: "gate-right",
    kind: "cards",
    x: 5.1,
    z: -9.1,
    w: 0.25,
    d: 1.4,
    h: 1.65,
  },
  { id: "chips-a", kind: "chips", x: 3.8, z: -7.7, w: 0.65, d: 0.65, h: 0.19 },
  { id: "chips-b", kind: "chips", x: 6.1, z: -10.2, w: 0.8, d: 0.8, h: 0.24 },
  {
    id: "spoon",
    kind: "spoon",
    x: 1.2,
    z: -10.9,
    w: 0.35,
    d: 1.45,
    h: 0.15,
    rotation: -0.35,
  },
  { id: "goal-fern", kind: "plant", x: -4.9, z: -12.8, w: 1.8, d: 2, h: 2.8 },
];
export const ROLLER = { x: 4.2, z: 4.25, radius: 0.6, travel: 1.6 };
export const RECORD = { x: -0.55, z: 0.1, radius: 2.05 };
export const SAFE_WAYPOINTS = [
  START,
  { x: 4.4, z: 10 },
  { x: 4.4, z: 6.8 },
  { x: 3.2, z: 3 },
  { x: -5.8, z: 2.6 },
  { x: -5.8, z: -2.6 },
  { x: 2.95, z: -4 },
  { x: 2.95, z: -11.85 },
  { x: 0, z: -12.5 },
  GOAL,
];
export const SHORT_WAYPOINTS = [
  START,
  { x: 2, z: 10 },
  { x: 2, z: 6 },
  { x: 0.6, z: 2.5 },
  { x: 0.6, z: -2.6 },
  { x: 2.95, z: -5 },
  { x: 2.95, z: -8.3 },
  { x: 3.25, z: -10.8 },
  { x: 3.1, z: -12 },
  { x: 0.25, z: -12.6 },
  GOAL,
];
export interface CourseProp {
  kind: "tin" | "chips" | "cards";
  x: number;
  z: number;
  radius: number;
  travel?: number;
  rate?: number;
}
export interface Course {
  name: string;
  description: string;
  seconds: number;
  gentleSeconds: number;
  minimumTea: number;
  pace: number;
  checkpoints: { x: number; z: number; radius: number }[];
  props: CourseProp[];
  path: { x: number; z: number }[];
}
export const COURSES: Course[] = [
  {
    name: "Am Plattenspieler",
    description:
      "Drei Wegmarken, ein rollendes Objektiv und eine lose Teedose. Die Schallplatte spart Zeit, kostet aber Balance.",
    seconds: ROUND_SECONDS,
    gentleSeconds: GENTLE_ROUND_SECONDS,
    minimumTea: 0.8,
    pace: 1.15,
    checkpoints: [
      { x: 2, z: 5.5, radius: 1.25 },
      { x: 0.6, z: -1.8, radius: 1.3 },
      { x: 3.25, z: -10.8, radius: 1.3 },
    ],
    props: [{ kind: "tin", x: 2.4, z: 5.1, radius: 0.45 }],
    path: SHORT_WAYPOINTS,
  },
  {
    name: "Karten im Wind",
    description:
      "Erst außen am Objektiv vorbei, dann zwischen wandernden Karten hindurch. Lose Chips lassen sich verschieben.",
    seconds: 20,
    gentleSeconds: 40,
    minimumTea: 0.85,
    pace: 1.5,
    checkpoints: [
      { x: 5.6, z: 5.5, radius: 1.15 },
      { x: 0.1, z: -1.8, radius: 1.2 },
      { x: 3.25, z: -10.8, radius: 1.1 },
    ],
    props: [
      { kind: "tin", x: 5.2, z: 5.2, radius: 0.45 },
      {
        kind: "cards",
        x: 3.1,
        z: -4.8,
        radius: 0.72,
        travel: 1.25,
        rate: 1.35,
      },
      { kind: "chips", x: 3.1, z: -7.7, radius: 0.38 },
    ],
    path: [
      START,
      { x: 5.6, z: 9 },
      { x: 5.6, z: 5.5 },
      { x: 4, z: 2.5 },
      { x: 0.1, z: 2.2 },
      { x: 0.1, z: -2.5 },
      { x: 3.6, z: -4 },
      { x: 2.95, z: -8.3 },
      { x: 3.25, z: -10.8 },
      { x: 3.1, z: -12 },
      { x: 0.25, z: -12.6 },
      GOAL,
    ],
  },
  {
    name: "Letzter Aufguss",
    description:
      "Der lange Weg über die Stoffbrücke: zwei bewegliche Kartensperren, schwere Teedosen und wenig Platz zum Bremsen.",
    seconds: 25,
    gentleSeconds: 45,
    minimumTea: 0.9,
    pace: 1.85,
    checkpoints: [
      { x: 4.4, z: 5.5, radius: 1.1 },
      { x: -5.8, z: 0, radius: 1.15 },
      { x: 3.25, z: -10.8, radius: 1.1 },
    ],
    props: [
      { kind: "tin", x: 4.2, z: 6, radius: 0.5 },
      { kind: "cards", x: -5.8, z: 0.65, radius: 0.8, travel: 1, rate: 1.65 },
      { kind: "tin", x: -5.5, z: -2.2, radius: 0.48 },
      { kind: "cards", x: 3.2, z: -5.1, radius: 0.8, travel: 1.3, rate: 1.65 },
      { kind: "chips", x: 3.1, z: -7.8, radius: 0.42 },
    ],
    path: SAFE_WAYPOINTS,
  },
];
export function surfaceAt(x: number, z: number): Surface {
  if (Math.hypot(x - RECORD.x, z - RECORD.z) < RECORD.radius) return "vinyl";
  if (z < -4.7 && z > -10.5) return "stone";
  if (x < -3.9 && z < 2.4 && z > -3.3) return "cloth";
  return "wood";
}
export function sectionAt(z: number) {
  return z > 8.5
    ? "Ankommen"
    : z > 3
      ? "Fotografie"
      : z > -3
        ? "Vinyl"
        : z > -9.8
          ? "Training & Karten"
          : "Teezeit";
}

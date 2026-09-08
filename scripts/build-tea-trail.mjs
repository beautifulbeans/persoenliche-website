import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune, weld, meshopt } from "@gltf-transform/functions";
import { MeshoptEncoder } from "meshoptimizer";
import { writeFile, mkdir } from "node:fs/promises";
import { OBSTACLES, RECORD } from "../src/games/tea-trail/level.ts";
// Authored geometry, reproducible seed, no third-party art assets.
let seed = 147;
const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
};
const scene = new THREE.Scene();
const atelier = new THREE.Group();
atelier.name = "atelier";
scene.add(atelier);
const colors = {
  wood: "#876145",
  lightWood: "#b99670",
  darkWood: "#483c30",
  ink: "#292e2a",
  jade: "#4f8168",
  leaf: "#739451",
  porcelain: "#f1efde",
  coral: "#a96854",
  brass: "#a88d60",
  metal: "#656d68",
  stone: "#aaa897",
  linen: "#d3c9b0",
};
const mats = {
  painted: new THREE.MeshStandardMaterial({
    name: "painted-wood",
    roughness: 0.83,
    vertexColors: true,
  }),
  foliage: new THREE.MeshStandardMaterial({
    name: "foliage",
    roughness: 1,
    vertexColors: true,
    side: THREE.DoubleSide,
  }),
  matte: new THREE.MeshStandardMaterial({
    roughness: 0.84,
    vertexColors: true,
  }),
  wood: new THREE.MeshStandardMaterial({ roughness: 0.59, vertexColors: true }),
  ceramic: new THREE.MeshStandardMaterial({
    roughness: 0.2,
    metalness: 0.08,
    vertexColors: true,
  }),
  metal: new THREE.MeshStandardMaterial({
    roughness: 0.34,
    metalness: 0.68,
    vertexColors: true,
  }),
};
function mesh(
  geo,
  color,
  material = "matte",
  parent = atelier,
  pos = [0, 0, 0],
  rotation = [0, 0, 0],
) {
  const c = new THREE.Color(colors[color] ?? color);
  const colorsArray = new Float32Array(geo.attributes.position.count * 3);
  for (let i = 0; i < colorsArray.length; i += 3) {
    const n = i / 3;
    const py = geo.attributes.position.getY(n);
    const shade =
      material === "foliage"
        ? 0.9 + Math.max(-0.2, Math.min(0.2, py * 0.16))
        : 0.97 +
          Math.sin(geo.attributes.position.getX(n) * 3.1 + py * 4.4) * 0.025;
    colorsArray[i] = c.r * shade;
    colorsArray[i + 1] = c.g * shade;
    colorsArray[i + 2] = c.b * shade;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colorsArray, 3));
  const obj = new THREE.Mesh(geo, mats[material]);
  obj.position.set(...pos);
  obj.rotation.set(...rotation);
  obj.castShadow = true;
  obj.receiveShadow = true;
  parent.add(obj);
  return obj;
}
const box = (
  w,
  h,
  d,
  c,
  p = [0, 0, 0],
  r = [0, 0, 0],
  parent = atelier,
  mat = "wood",
) =>
  mesh(
    Math.min(w, h, d) < 0.05
      ? new THREE.BoxGeometry(w, h, d)
      : new RoundedBoxGeometry(
          w,
          h,
          d,
          Math.min(w, h, d) < 0.3 ? 1 : 2,
          Math.min(0.14, w * 0.22, h * 0.22, d * 0.22),
        ),
    c,
    mat,
    parent,
    p,
    r,
  );
const cyl = (
  top,
  bottom,
  h,
  c,
  p = [0, 0, 0],
  r = [0, 0, 0],
  parent = atelier,
  mat = "matte",
  segments = 40,
) =>
  mesh(
    new THREE.CylinderGeometry(top, bottom, h, segments),
    c,
    mat,
    parent,
    p,
    r,
  );
const sphere = (
  radius,
  c,
  p,
  scale = [1, 1, 1],
  parent = atelier,
  mat = "matte",
) => {
  const m = mesh(
    new THREE.SphereGeometry(
      radius,
      radius < 0.13 ? 12 : 28,
      radius < 0.13 ? 8 : 20,
    ),
    c,
    mat,
    parent,
    p,
  );
  m.scale.set(...scale);
  return m;
};
const torus = (
  radius,
  tube,
  c,
  p,
  r = [0, 0, 0],
  parent = atelier,
  mat = "ceramic",
) => mesh(new THREE.TorusGeometry(radius, tube, 10, 48), c, mat, parent, p, r);
function pot(x, z, size = 1, parent = atelier) {
  cyl(
    0.48 * size,
    0.34 * size,
    0.62 * size,
    "coral",
    [x, 0.31 * size, z],
    [0, 0, 0],
    parent,
    "matte",
  );
  cyl(
    0.43 * size,
    0.43 * size,
    0.06 * size,
    "darkWood",
    [x, 0.64 * size, z],
    [0, 0, 0],
    parent,
  );
  for (let i = 0; i < 14; i++) {
    const a = i * 2.4;
    const h = (0.8 + random() * 0.7) * size;
    const leaf = new THREE.PlaneGeometry(0.6 * size, h, 4, 8);
    const pos = leaf.attributes.position;
    for (let n = 0; n < pos.count; n++) {
      const t = (pos.getY(n) + h / 2) / h;
      const x = pos.getX(n) * Math.sin(t * Math.PI);
      pos.setXYZ(n, x, t * h * 0.65, t * t * h * 0.85 + Math.abs(x) * 0.35);
    }
    leaf.computeVertexNormals();
    mesh(
      leaf,
      ["#6d955b", "#4a7b5a", "#8ca35d"][i % 3],
      "foliage",
      parent,
      [x, 0.6 * size, z],
      [0, a, 0],
    );
  }
}
function cup(x, y, z, s = 1, parent = atelier) {
  const profile = [
    [0, 0.02],
    [0.24, 0.02],
    [0.29, 0.06],
    [0.33, 0.34],
    [0.33, 0.41],
    [0.295, 0.41],
    [0.29, 0.35],
    [0.24, 0.075],
    [0, 0.075],
  ].map(([r, h]) => new THREE.Vector2(r * s, h * s));
  mesh(new THREE.LatheGeometry(profile, 28), "porcelain", "ceramic", parent, [
    x,
    y,
    z,
  ]);
  torus(
    0.14 * s,
    0.035 * s,
    "porcelain",
    [x + 0.38 * s, y + 0.24 * s, z],
    [0, 0, 0],
    parent,
  );
  cyl(
    0.27 * s,
    0.27 * s,
    0.015 * s,
    "jade",
    [x, y + 0.31 * s, z],
    [0, 0, 0],
    parent,
    "ceramic",
  );
  cyl(
    0.52 * s,
    0.44 * s,
    0.035 * s,
    "porcelain",
    [x, y, z],
    [0, 0, 0],
    parent,
    "ceramic",
  );
}
function kettle(x, y, z, s = 1, parent = atelier) {
  sphere(0.5 * s, "jade", [x, y + 0.45 * s, z], [1, 0.9, 1], parent, "ceramic");
  cyl(
    0.28 * s,
    0.34 * s,
    0.055 * s,
    "jade",
    [x, y + 0.86 * s, z],
    [0, 0, 0],
    parent,
    "ceramic",
  );
  sphere(
    0.065 * s,
    "darkWood",
    [x, y + 0.93 * s, z],
    [1, 0.6, 1],
    parent,
    "wood",
  );
  torus(
    0.38 * s,
    0.055 * s,
    "darkWood",
    [x - 0.37 * s, y + 0.52 * s, z],
    [0, 0, 0],
    parent,
    "wood",
  );
  cyl(
    0.065 * s,
    0.17 * s,
    0.52 * s,
    "jade",
    [x + 0.48 * s, y + 0.52 * s, z],
    [0, 0, -0.87],
    parent,
    "ceramic",
  );
}
function lens(parent = atelier, s = 1, p = [0, 0, 0], rolling = false) {
  const group = new THREE.Group();
  group.position.set(...p);
  if (rolling) group.rotation.z = Math.PI / 2;
  parent.add(group);
  cyl(
    0.56 * s,
    0.56 * s,
    1.1 * s,
    "ink",
    [0, 0, 0],
    [0, 0, 0],
    group,
    "matte",
    32,
  );
  for (let i = 0; i < 9; i++)
    torus(
      0.563 * s,
      0.014 * s,
      i === 7 ? "coral" : "metal",
      [0, (i / 8 - 0.5) * 0.94 * s, 0],
      [Math.PI / 2, 0, 0],
      group,
      "metal",
    );
  cyl(
    0.46 * s,
    0.46 * s,
    0.025 * s,
    "#344849",
    [0, 0.562 * s, 0],
    [0, 0, 0],
    group,
    "ceramic",
  );
  torus(
    0.48 * s,
    0.042 * s,
    "metal",
    [0, 0.565 * s, 0],
    [Math.PI / 2, 0, 0],
    group,
    "metal",
  );
  cyl(
    0.3 * s,
    0.3 * s,
    0.03 * s,
    "#4c6666",
    [0, 0.58 * s, 0],
    [0, 0, 0],
    group,
    "ceramic",
  );
  return group;
}
// A garden terrace: softened stone foundation, painted timber and planted verges.
box(19.2, 0.55, 33.2, "#77765c", [0, -0.36, 0], undefined, atelier, "matte");
box(18.35, 0.12, 32.3, "darkWood", [0, -0.08, 0]);
for (let row = 0; row < 32; row++)
  for (let col = 0; col < 5; col++) {
    const c = new THREE.Color("#fff1ce").multiplyScalar(0.82 + random() * 0.16);
    const plank = box(
      3.565,
      0.08,
      0.972,
      c,
      [col * 3.6 - 7.2, 0.001, row - 15.5],
      undefined,
      atelier,
      "painted",
    );
    // Rotate texture coordinates: long, uninterrupted grain along the plank.
    const uv = plank.geometry.attributes.uv;
    const offset = random();
    for (let n = 0; n < uv.count; n++)
      uv.setXY(n, uv.getY(n) * 0.48 + offset, uv.getX(n) * 0.92);
  }
for (const side of [-1, 1]) {
  for (let i = 0; i < 17; i++) {
    const z = -15.8 + i * 1.96;
    box(
      0.44,
      0.25,
      1.89,
      "#a7a188",
      [side * 9.08, 0.02, z],
      [0, (random() - 0.5) * 0.035, 0],
      atelier,
      "matte",
    );
  }
}
for (const z of [-16.1, 16.1])
  for (let i = 0; i < 10; i++)
    box(
      1.78,
      0.22,
      0.42,
      "#a7a188",
      [-8.1 + i * 1.8, 0.02, z],
      undefined,
      atelier,
      "matte",
    );
function shrub(x, z, size = 1) {
  for (let i = 0; i < 6; i++) {
    const a = i * 2.4;
    const geometry = new THREE.IcosahedronGeometry(
      (0.46 + random() * 0.14) * size,
      2,
    );
    // Keep the smooth radial normals; recomputing on unindexed triangles faceted every leaf crown.
    const bush = mesh(
      geometry,
      ["#557b4b", "#6c914e", "#819f59"][i % 3],
      "foliage",
      atelier,
      [
        x + Math.cos(a) * size * 0.34,
        0.2 + size * 0.39,
        z + Math.sin(a) * size * 0.35,
      ],
    );
    bush.scale.y = 0.8;
  }
}
function tree(x, z, size = 1) {
  cyl(
    0.17 * size,
    0.3 * size,
    2.3 * size,
    "#806343",
    [x, 0.65 * size, z],
    [0, 0, -0.07],
    atelier,
    "wood",
    12,
  );
  for (let i = 0; i < 5; i++) {
    const a = i * 2.4;
    cyl(
      0.07 * size,
      0.13 * size,
      1.25 * size,
      "#8d6b47",
      [
        x + Math.cos(a) * 0.33 * size,
        1.35 * size,
        z + Math.sin(a) * 0.33 * size,
      ],
      [Math.sin(a) * 0.6, 0, Math.cos(a) * 0.6],
      atelier,
      "wood",
      8,
    );
  }
  for (let i = 0; i < 9; i++) {
    const a = i * 2.4;
    const canopy = mesh(
      new THREE.IcosahedronGeometry((0.9 + random() * 0.25) * size, 2),
      ["#628647", "#76994e", "#89a457"][i % 3],
      "foliage",
      atelier,
      [
        x + Math.cos(a) * 0.82 * size,
        2.0 * size + (i % 3) * 0.22 * size,
        z + Math.sin(a) * 0.72 * size,
      ],
    );
    canopy.scale.y = 0.75;
  }
}
// Everything beyond the edging is scenery; the playable footprint stays readable.
for (const side of [-1, 1])
  for (let i = 0; i < 18; i++) {
    const z = -16 + i * 1.9;
    const mound = mesh(
      new THREE.IcosahedronGeometry(1.65, 2),
      i % 2 ? "#80985d" : "#73915b",
      "foliage",
      atelier,
      [side * (9.8 + random() * 0.35), -0.57, z],
    );
    mound.scale.set(1.4, 0.38, 1.2);
    if (i % 2 === 0)
      shrub(side * (9.7 + random() * 0.4), z, 0.8 + random() * 0.3);
    for (let f = 0; f < 4; f++) {
      const x = side * (9.45 + random() * 1.5),
        fz = z + (random() - 0.5) * 1.5;
      const h = 0.2 + random() * 0.24;
      cyl(
        0.012,
        0.02,
        h,
        "leaf",
        [x, h / 2 - 0.02, fz],
        undefined,
        atelier,
        "foliage",
        5,
      );
      for (let petal = 0; petal < 5; petal++)
        sphere(
          0.062,
          f % 3 ? "#e8d9a3" : "#c79076",
          [
            x + Math.cos(petal * 1.257) * 0.05,
            h - 0.02,
            fz + Math.sin(petal * 1.257) * 0.05,
          ],
          [1, 0.45, 1],
          atelier,
          "foliage",
        );
    }
  }
for (const [x, z, size] of [
  [-10.6, 8, 1],
  [-10.8, -7, 1.25],
  [-8.4, -17.9, 1.3],
  [10.8, -13, 1.1],
  [11.2, 4, 0.9],
])
  tree(x, z, size);

// Back wall, a low atelier window, a bench and a linen curtain.
box(18.3, 3.4, 0.18, "#b5bdaa", [0, 1.6, -16.12], undefined, atelier, "matte");
box(6.5, 2.7, 0.2, "darkWood", [-3, 2.05, -15.98]);
box(
  6.15,
  2.4,
  0.21,
  "#dedec6",
  [-3, 2.07, -15.84],
  undefined,
  atelier,
  "matte",
);
for (const x of [-5.1, -3, -0.9])
  box(0.065, 2.45, 0.08, "lightWood", [x, 2.07, -15.68]);
box(6.2, 0.065, 0.08, "lightWood", [-3, 2.1, -15.65]);
box(7, 0.12, 0.7, "wood", [-3, 0.77, -15.7]);
for (let i = 0; i < 12; i++)
  cyl(
    0.075,
    0.075,
    2.9,
    i % 2 ? "linen" : "porcelain",
    [0.5 + i * 0.09, 1.9, -15.68],
    undefined,
    atelier,
    "matte",
    10,
  );
pot(-5.3, -15.25, 0.7);
kettle(-1, 0.84, -15.55, 0.55);
// Quiet start mat and arrival island.
box(4, 0.025, 3.1, "#8b9a7e", [0, 0.064, 13.05], undefined, atelier, "matte");
for (let i = 0; i < 12; i++)
  box(
    3.85,
    0.003,
    0.012,
    "#72856b",
    [0, 0.08, 11.67 + i * 0.25],
    undefined,
    atelier,
    "matte",
  );
// Stone approach. The chips and card gate demand gentler steering here.
box(18, 0.025, 6.2, "#93947f", [0, 0.045, -7.55], undefined, atelier, "matte");
for (let i = 0; i < 6; i++)
  for (let j = 0; j < 17; j++)
    box(
      0.995,
      0.075,
      0.93,
      new THREE.Color(colors.stone).multiplyScalar(0.94 + random() * 0.1),
      [j * 1.045 - 8.36, 0.06, -5 - i * 1.015],
      undefined,
      atelier,
      "matte",
    );
// A wider, slower textile bridge on the left of the rotating record.
box(3.1, 0.09, 6.3, "darkWood", [-5.7, 0.095, -0.1]);
for (let j = 0; j < 14; j++)
  box(3, 0.045, 0.4, "lightWood", [-5.7, 0.16, -3 + j * 0.45]);
box(2.5, 0.035, 6, "linen", [-5.7, 0.205, -0.1], undefined, atelier, "matte");
for (let i = 0; i < 20; i++)
  box(
    2.4,
    0.006,
    0.018,
    i % 3 ? "#b9ad92" : "#9a8e75",
    [-5.7, 0.227, -2.93 + i * 0.295],
    undefined,
    atelier,
    "matte",
  );
for (const x of [-7.2, -4.2]) box(0.07, 0.12, 6.1, "wood", [x, 0.23, -0.1]);
for (const o of OBSTACLES) {
  const group = new THREE.Group();
  group.position.set(o.x, 0, o.z);
  group.rotation.y = o.rotation ?? 0;
  atelier.add(group);
  if (o.kind === "camera") {
    box(o.w, o.h, o.d, "ink", [0, o.h / 2, 0], undefined, group, "matte");
    box(
      o.w,
      0.19,
      o.d + 0.02,
      "metal",
      [0, o.h - 0.03, 0],
      undefined,
      group,
      "metal",
    );
    box(
      1.15,
      0.34,
      1.1,
      "metal",
      [0.25, o.h + 0.18, 0],
      undefined,
      group,
      "metal",
    );
    const l = lens(group, 1.13, [0.35, 0.88, 0.94]);
    l.rotation.x = Math.PI / 2;
    for (const x of [-1.5, 1.3])
      cyl(
        0.26,
        0.26,
        0.17,
        "metal",
        [x, o.h + 0.15, 0],
        undefined,
        group,
        "metal",
      );
    box(
      0.4,
      0.37,
      0.03,
      "#819087",
      [-1.1, 0.97, 0.85],
      undefined,
      group,
      "ceramic",
    );
    torus(0.17, 0.04, "coral", [1.77, 0.6, 0.65], [0, 0, 0], group, "matte");
    // Embossed leather panels.
    for (let i = 0; i < 30; i++)
      box(
        0.012,
        0.98,
        0.012,
        "#3b4038",
        [-1.86 + i * 0.125, 0.65, 0.842],
        undefined,
        group,
        "matte",
      );
  } else if (o.kind === "lens") {
    lens(group, o.w / 1.15, [0, o.h / 2, 0]);
  } else if (o.kind === "plant") {
    box(o.w, 0.6, o.d, "darkWood", [0, 0.3, 0], undefined, group);
    for (let i = 0; i < Math.max(1, Math.floor(o.w)); i++)
      pot((i - (Math.floor(o.w) - 1) / 2) * 0.9, 0, 0.86, group);
  } else if (o.kind === "vinyl") {
    box(o.w, 0.7, o.d, "wood", [0, 0.35, 0], undefined, group);
    for (let i = 0; i < Math.floor(o.w / 0.23); i++) {
      const h = 0.82 + random() * 0.34;
      box(
        0.14,
        h,
        o.d * 0.87,
        ["jade", "coral", "linen", "ink"][i % 4],
        [-o.w / 2 + 0.14 + i * 0.23, 0.45 + h / 2, 0],
        [0, 0, (random() - 0.5) * 0.08],
        group,
        "matte",
      );
    }
    box(
      o.w,
      0.12,
      0.07,
      "darkWood",
      [0, 0.59, o.d / 2 + 0.02],
      undefined,
      group,
    );
    for (let i = 0; i < Math.max(1, Math.floor(o.w / 2)); i++) {
      const x = -o.w / 2 + 0.58 + i * 1.85;
      cyl(
        0.44,
        0.44,
        0.035,
        "ink",
        [x, 0.62, o.d / 2 + 0.05],
        [Math.PI / 2, 0, 0],
        group,
        "ceramic",
      );
      cyl(
        0.13,
        0.13,
        0.041,
        "coral",
        [x, 0.62, o.d / 2 + 0.072],
        [Math.PI / 2, 0, 0],
        group,
      );
    }
  } else if (o.kind === "weights") {
    const length = o.w * 0.91;
    cyl(
      0.12,
      0.12,
      length,
      "metal",
      [0, 0.44, 0],
      [0, 0, Math.PI / 2],
      group,
      "metal",
    );
    for (const side of [-1, 1])
      for (let i = 0; i < 3; i++) {
        const x = side * (length / 2 - 0.22 - i * 0.25);
        cyl(
          0.46,
          0.46,
          0.19,
          "ink",
          [x, 0.48, 0],
          [0, 0, Math.PI / 2],
          group,
          "metal",
        );
        torus(
          0.35,
          0.018,
          "metal",
          [x + side * 0.1, 0.48, 0],
          [0, Math.PI / 2, 0],
          group,
          "metal",
        );
      }
    for (let i = 0; i < 30; i++)
      torus(
        0.122,
        0.01,
        "darkWood",
        [-0.6 + i * 0.04, 0.44, 0],
        [0, Math.PI / 2, 0],
        group,
        "metal",
      );
  } else if (o.kind === "tin") {
    cyl(
      o.w * 0.48,
      o.w * 0.48,
      o.h,
      "jade",
      [0, o.h / 2, 0],
      undefined,
      group,
      "metal",
    );
    cyl(
      o.w * 0.49,
      o.w * 0.49,
      0.095,
      "brass",
      [0, o.h + 0.03, 0],
      undefined,
      group,
      "metal",
    );
    box(
      0.92,
      0.7,
      0.04,
      "linen",
      [0, o.h * 0.52, o.d * 0.45],
      undefined,
      group,
      "matte",
    );
    sphere(0.11, "leaf", [0, o.h * 0.55, o.d * 0.48], [0.6, 1.8, 0.12], group);
  } else if (o.kind === "cards") {
    box(o.w, o.h, o.d, "porcelain", [0, o.h / 2, 0], undefined, group, "matte");
    for (const side of [-1, 1]) {
      sphere(
        0.13,
        "coral",
        [side * (o.w / 2 + 0.006), o.h * 0.66, 0],
        [0.03, 1, 1],
        group,
      );
      sphere(
        0.07,
        "coral",
        [side * (o.w / 2 + 0.006), o.h * 0.85, -0.43],
        [0.03, 1, 1],
        group,
      );
    }
  } else if (o.kind === "chips") {
    for (let i = 0; i < 3; i++) {
      cyl(
        o.w / 2,
        o.w / 2,
        0.06,
        i % 2 ? "porcelain" : "coral",
        [0, 0.06 + i * 0.065, 0],
        undefined,
        group,
      );
      for (let a = 0; a < 6; a++)
        box(
          0.04,
          0.044,
          0.11,
          "porcelain",
          [
            Math.cos((a * Math.PI) / 3) * o.w * 0.49,
            0.063 + i * 0.065,
            Math.sin((a * Math.PI) / 3) * o.w * 0.49,
          ],
          [0, (-a * Math.PI) / 3, 0],
          group,
          "matte",
        );
    }
  } else if (o.kind === "spoon") {
    box(
      0.12,
      0.035,
      0.98,
      "metal",
      [0, 0.075, 0.19],
      undefined,
      group,
      "metal",
    );
    sphere(0.2, "metal", [0, 0.08, -0.46], [0.8, 0.2, 1.2], group, "metal");
  }
}
// Player crosses the spinning vinyl; the tonearm is the timed physical barrier.
box(4.15, 0.14, 4.65, "darkWood", [RECORD.x, 0.055, RECORD.z]);
cyl(
  2.03,
  2.03,
  0.08,
  "metal",
  [RECORD.x, 0.16, RECORD.z],
  undefined,
  atelier,
  "metal",
  64,
);
const record = new THREE.Group();
record.name = "record";
record.position.set(RECORD.x, 0.23, RECORD.z);
scene.add(record);
cyl(1.96, 1.96, 0.035, "ink", [0, 0, 0], undefined, record, "ceramic", 64);
for (let i = 0; i < 13; i++)
  torus(
    0.65 + i * 0.1,
    0.004,
    "#51564a",
    [0, 0.02, 0],
    [Math.PI / 2, 0, 0],
    record,
    "metal",
  );
cyl(0.58, 0.58, 0.008, "coral", [0, 0.025, 0], undefined, record);
cyl(0.13, 0.13, 0.02, "brass", [0, 0.04, 0], undefined, record, "metal");
box(
  0.5,
  0.005,
  0.055,
  "porcelain",
  [0, 0.035, 0.27],
  undefined,
  record,
  "matte",
);
const arm = new THREE.Group();
arm.name = "arm";
arm.position.set(RECORD.x, 0.6, RECORD.z);
scene.add(arm);
box(2.04, 0.15, 0.14, "metal", [0.9, 0, 0], undefined, arm, "metal");
box(0.26, 0.23, 0.33, "jade", [1.84, 0, 0], undefined, arm, "metal");
cyl(0.14, 0.17, 0.55, "brass", [0, -0.2, 0], undefined, arm, "metal");
const roller = new THREE.Group();
roller.name = "roller";
scene.add(roller);
lens(roller, 1, [0, 0, 0], true);
// Tea table: clear destination, room to stop immediately in front.
box(4.2, 0.19, 2.2, "darkWood", [0, 0.85, -14.8]);
for (const x of [-1.8, 1.8])
  for (const z of [-15.6, -14]) box(0.16, 0.8, 0.16, "wood", [x, 0.4, z]);
box(
  1.35,
  0.024,
  2.35,
  "linen",
  [0.4, 0.962, -14.8],
  undefined,
  atelier,
  "matte",
);
kettle(-0.92, 0.96, -14.8, 1.0);
cup(0.78, 0.98, -14.5, 0.9);
cup(1.65, 0.98, -15.25, 0.7);
cyl(
  0.45,
  0.45,
  0.54,
  "jade",
  [-1.45, 1.23, -15.42],
  undefined,
  atelier,
  "metal",
);
for (let i = 0; i < 14; i++) {
  const l = sphere(
    0.055,
    "leaf",
    [-1 + random() * 1.4, 0.976, -15.5 + random() * 0.9],
    [0.3, 0.1, 1],
  );
  l.rotation.y = random() * 6;
}
// A low stool and secondary weights are deliberately outside the navigation lane.
for (const x of [-7.7, 7.6]) {
  cyl(0.8, 0.85, 0.14, "wood", [x, 0.51, -13.7]);
  for (const dz of [-0.4, 0.4])
    box(0.12, 0.45, 0.12, "darkWood", [x, 0.25, -13.7 + dz]);
}
pot(7.6, -14.8, 1.15);
// Timber pergola frames the tea table; its foliage remains behind the destination.
for (const x of [-6.5, 6.5]) {
  box(0.22, 3.5, 0.22, "darkWood", [x, 1.65, -15.95]);
  shrub(x, -16.3, 1);
  for (let i = 0; i < 8; i++)
    sphere(
      0.18,
      i % 2 ? "leaf" : "jade",
      [x + Math.sin(i * 2.4) * 0.18, 0.4 + i * 0.37, -15.9],
      [0.8, 0.5, 1.4],
      atelier,
      "foliage",
    );
}
box(13.5, 0.22, 0.28, "wood", [0, 3.43, -16]);
for (const x of [-4.6, 4.6]) {
  cyl(
    0.018,
    0.018,
    0.45,
    "brass",
    [x, 3.1, -15.86],
    undefined,
    atelier,
    "metal",
  );
  sphere(
    0.26,
    "#e9ba71",
    [x, 2.75, -15.86],
    [0.75, 1.18, 0.75],
    atelier,
    "ceramic",
  );
  cyl(
    0.21,
    0.23,
    0.06,
    "brass",
    [x, 2.46, -15.86],
    undefined,
    atelier,
    "metal",
  );
}
// Group static vertices by material: 4 draw calls, with meshopt compression.
function batch(parent) {
  parent.updateMatrixWorld(true);
  const groups = new Map();
  parent.traverse((obj) => {
    if (!obj.isMesh) return;
    const key = obj.material;
    const geo = obj.geometry.clone();
    geo.applyMatrix4(obj.matrixWorld);
    for (const attr of Object.keys(geo.attributes))
      if (!["position", "normal", "uv", "color"].includes(attr))
        geo.deleteAttribute(attr);
    const list = groups.get(key) ?? [];
    list.push(geo.index ? geo.toNonIndexed() : geo);
    groups.set(key, list);
  });
  const inverse = new THREE.Matrix4().copy(parent.matrixWorld).invert();
  parent.clear();
  for (const [material, geometries] of groups) {
    const geometry = mergeGeometries(geometries, false);
    geometry.applyMatrix4(inverse);
    const obj = new THREE.Mesh(geometry, material);
    obj.castShadow = true;
    obj.receiveShadow = true;
    parent.add(obj);
  }
}
for (const group of [atelier, record, arm, roller]) batch(group);
// GLTFExporter uses FileReader for ArrayBuffer assembly in node.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = buffer;
      this.onloadend?.();
    });
  }
  readAsDataURL(blob) {
    blob.arrayBuffer().then((buffer) => {
      this.result = `data:${blob.type};base64,${Buffer.from(buffer).toString("base64")}`;
      this.onloadend?.();
    });
  }
};
const glb = await new GLTFExporter().parseAsync(scene, {
  binary: true,
  onlyVisible: true,
});
await MeshoptEncoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.encoder": MeshoptEncoder });
const doc = await io.readBinary(new Uint8Array(glb));
// The wood texture is loaded at runtime. Keep its UVs even though GLB has no embedded image.
for (const mesh of doc.getRoot().listMeshes())
  for (const primitive of mesh.listPrimitives()) {
    if (primitive.getMaterial()?.getName() !== "painted-wood")
      primitive.setAttribute("TEXCOORD_0", null);
  }
await doc.transform(
  dedup(),
  weld(),
  prune({ keepAttributes: true }),
  meshopt({ encoder: MeshoptEncoder, level: "high" }),
);
const output = await io.writeBinary(doc);
await mkdir("public/tea-trail", { recursive: true });
await writeFile("public/tea-trail/atelier.glb", output);
console.log(
  `Tea Trail atelier: ${(output.byteLength / 1024).toFixed(1)} KiB; ${doc.getRoot().listMeshes().length} batched meshes.`,
);

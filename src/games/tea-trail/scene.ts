import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { CAMERA_ANGLE } from "./input";
import { GOAL, RECORD, SAFE_WAYPOINTS, START } from "./level";
import type { Simulation } from "./simulation";
import { clamp, TEA_BASE_HEIGHT, TEA_FILL_DEPTH } from "./liquid";
import { CharacterRig } from "./character";
type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number;
};
export class Diorama {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 120);
  private sun = new THREE.DirectionalLight("#ffe4b3", 2.9);
  private windTime = { value: 0 };
  private paintedWood: THREE.Texture | null = null;
  private env: THREE.WebGLRenderTarget;
  private model: THREE.Group | null = null;
  private roller: THREE.Object3D | null = null;
  private arm: THREE.Object3D | null = null;
  private record: THREE.Object3D | null = null;
  private character = new CharacterRig();
  private avatar = this.character.root;
  private tray = new THREE.Group();
  private cup = new THREE.Group();
  private tea: THREE.Mesh;
  private teaRest: Float32Array;
  private droplets: THREE.InstancedMesh;
  private puddles: THREE.InstancedMesh;
  private particles: Particle[] = Array.from({ length: 64 }, () => ({
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    life: 0,
  }));
  private dummy = new THREE.Object3D();
  private cupWorld = new THREE.Vector3();
  private nextParticle = 0;
  private nextPuddle = 0;
  private spillClock = 0;
  private target = new THREE.Vector3(START.x, 0, START.z - 1.45);
  private cameraOffset = new THREE.Vector3(
    Math.sin(CAMERA_ANGLE) * 21,
    24,
    Math.cos(CAMERA_ANGLE) * 21,
  );
  private resizeObserver: ResizeObserver;
  private quality: "high" | "medium" | "low";
  private width = 1;
  private height = 1;
  private disposed = false;
  private abort = new AbortController();
  private reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  private renderDurations: number[] = [];
  private slowFrames = 0;
  private frameCount = 0;
  private goalRing: THREE.Mesh;
  private shadow: THREE.Mesh;
  constructor(private canvas: HTMLCanvasElement) {
    const mobile =
      document.querySelector<HTMLElement>("[data-tea-trail]")?.dataset.touch ===
        "true" ||
      navigator.maxTouchPoints > 0 ||
      matchMedia("(any-pointer: coarse)").matches ||
      innerWidth < 760;
    this.quality = mobile ? "medium" : "high";
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: !mobile,
      alpha: false,
      powerPreference: "high-performance",
    });
    this.renderer.setClearColor("#b5c7ad");
    this.renderer.setPixelRatio(
      Math.min(devicePixelRatio, mobile ? 1.35 : 1.75),
    );
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.scene.background = new THREE.Color("#b5c7ad");
    this.scene.fog = new THREE.Fog("#b5c7ad", 44, 76);
    const environment = new RoomEnvironment();
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    this.env = pmrem.fromScene(environment, 0.04);
    this.scene.environment = this.env.texture;
    this.scene.environmentIntensity = 0.23;
    environment.dispose();
    pmrem.dispose();
    this.scene.add(new THREE.HemisphereLight("#f5f2d7", "#647267", 1.2));
    this.sun.position.set(-15, 25, -6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(mobile ? 1024 : 2048, mobile ? 1024 : 2048);
    Object.assign(this.sun.shadow.camera, {
      left: -23,
      right: 23,
      top: 24,
      bottom: -24,
      near: 1,
      far: 70,
    });
    this.sun.shadow.bias = -0.0004;
    this.sun.shadow.normalBias = 0.025;
    this.sun.shadow.radius = 3;
    this.scene.add(this.sun);
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(200, 200),
      new THREE.MeshStandardMaterial({ color: "#95ad80", roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1.2;
    ground.receiveShadow = true;
    this.scene.add(ground);
    this.createAvatar();
    const liquidGeo = new THREE.CircleGeometry(0.29, 40);
    liquidGeo.rotateX(-Math.PI / 2);
    this.teaRest = new Float32Array(liquidGeo.attributes.position.array);
    this.tea = new THREE.Mesh(
      liquidGeo,
      new THREE.MeshPhysicalMaterial({
        color: "#92a34a",
        roughness: 0.16,
        metalness: 0.12,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        side: THREE.DoubleSide,
      }),
    );
    this.cup.add(this.tea);
    this.droplets = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.033, 6, 4),
      new THREE.MeshStandardMaterial({ color: "#839343", roughness: 0.22 }),
      64,
    );
    this.droplets.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.droplets.frustumCulled = false;
    this.scene.add(this.droplets);
    this.puddles = new THREE.InstancedMesh(
      new THREE.CircleGeometry(0.17, 10),
      new THREE.MeshStandardMaterial({
        color: "#697845",
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        roughness: 0.3,
      }),
      96,
    );
    this.puddles.frustumCulled = false;
    this.scene.add(this.puddles);
    this.resetSpills();
    const ringMat = new THREE.MeshBasicMaterial({
      color: "#eef3df",
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    this.goalRing = new THREE.Mesh(
      new THREE.RingGeometry(1.16, 1.3, 48),
      ringMat,
    );
    this.goalRing.rotation.x = -Math.PI / 2;
    this.goalRing.position.set(GOAL.x, 0.105, GOAL.z);
    this.scene.add(this.goalRing);
    // A bounded pool and instancing keep repeated marks to one draw call.
    const leaves = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.12, 6, 4),
      new THREE.MeshStandardMaterial({ color: "#66734d", roughness: 0.9 }),
      40,
    );
    for (let i = 0; i < 40; i++) {
      const t = (i / 39) * (SAFE_WAYPOINTS.length - 1);
      const a = SAFE_WAYPOINTS[Math.floor(t)],
        b =
          SAFE_WAYPOINTS[
            Math.min(SAFE_WAYPOINTS.length - 1, Math.floor(t) + 1)
          ];
      this.dummy.position.set(
        THREE.MathUtils.lerp(a.x, b.x, t % 1),
        0.11,
        THREE.MathUtils.lerp(a.z, b.z, t % 1),
      );
      this.dummy.scale.set(0.55, 0.13, 1.3);
      this.dummy.rotation.set(0, -Math.atan2(b.x - a.x, b.z - a.z), 0);
      this.dummy.updateMatrix();
      leaves.setMatrixAt(i, this.dummy.matrix);
    }
    this.scene.add(leaves);
    this.label("START", 0, 14.9, 2);
    this.label("TEETISCH", 0, -12.25, 2.8);
    this.label("RUHIGER WEG", -5.7, 2.65, 3.3);
    this.label("ABKÜRZUNG", -0.55, 2.8, 3);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(canvas.parentElement!);
    this.resize();
    this.shadow = this.createContactShadow();
  }
  private make(
    geometry: THREE.BufferGeometry,
    color: string,
    parent: THREE.Object3D,
    x = 0,
    y = 0,
    z = 0,
    roughness = 0.7,
  ) {
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({ color, roughness }),
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  private createAvatar() {
    this.scene.add(this.avatar);
    this.tray.position.set(0, 1.16, -0.59);
    this.character.body.add(this.tray);
    this.make(
      new RoundedBoxGeometry(1.05, 0.085, 0.81, 2, 0.08),
      "#775439",
      this.tray,
    );
    for (const x of [-0.49, 0.49])
      this.make(
        new THREE.BoxGeometry(0.04, 0.09, 0.78),
        "#543e2b",
        this.tray,
        x,
        0.05,
        0,
      );
    for (const z of [-0.37, 0.37])
      this.make(
        new THREE.BoxGeometry(1, 0.09, 0.04),
        "#543e2b",
        this.tray,
        0,
        0.05,
        z,
      );
    this.cup.position.set(0, 0.065, 0);
    this.tray.add(this.cup);
    const profile = [
      [0, 0],
      [0.25, 0],
      [0.29, 0.045],
      [0.33, 0.34],
      [0.33, 0.42],
      [0.297, 0.42],
      [0.288, 0.34],
      [0.235, 0.065],
      [0, 0.065],
    ].map(([r, y]) => new THREE.Vector2(r, y));
    const porcelain = this.make(
      new THREE.LatheGeometry(profile, 32),
      "#f6f2df",
      this.cup,
      0,
      0,
      0,
      0.18,
    );
    (porcelain.material as THREE.MeshStandardMaterial).metalness = 0.08;
    this.make(
      new THREE.TorusGeometry(0.125, 0.034, 8, 24),
      "#f6f2df",
      this.cup,
      0.36,
      0.24,
      0,
      0.18,
    );
    this.make(
      new THREE.CylinderGeometry(0.4, 0.37, 0.025, 32),
      "#dedbc8",
      this.tray,
      0,
      0.04,
      0,
      0.25,
    );
  }
  private createContactShadow() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const c = canvas.getContext("2d")!;
    const gradient = c.createRadialGradient(32, 32, 1, 32, 32, 31);
    gradient.addColorStop(0, "rgba(36,43,29,.35)");
    gradient.addColorStop(1, "rgba(36,43,29,0)");
    c.fillStyle = gradient;
    c.fillRect(0, 0, 64, 64);
    const mesh = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 1.5),
      new THREE.MeshBasicMaterial({
        map: new THREE.CanvasTexture(canvas),
        transparent: true,
        depthWrite: false,
      }),
    );
    mesh.rotation.x = -Math.PI / 2;
    this.scene.add(mesh);
    return mesh;
  }
  private label(text: string, x: number, z: number, width: number) {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 80;
    const c = canvas.getContext("2d")!;
    c.font = "600 29px sans-serif";
    c.fillStyle = "#3e4c35";
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.fillText(text, 256, 40);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(width, (width * 80) / 512),
      new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
      }),
    );
    label.rotation.x = -Math.PI / 2;
    label.position.set(x, 0.13, z);
    this.scene.add(label);
  }
  async load() {
    const response = await fetch("/tea-trail/atelier.glb", {
      signal: this.abort.signal,
    });
    if (!response.ok)
      throw new Error("Das Atelier konnte nicht geladen werden.");
    const buffer = await response.arrayBuffer();
    if (this.disposed) return;
    const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
    const asset = await loader.parseAsync(buffer, "/tea-trail/");
    if (this.disposed) {
      this.disposeObjects(asset.scene);
      return;
    }
    this.model = asset.scene;
    const woodResponse = await fetch("/tea-trail/painted-wood.webp", {
      signal: this.abort.signal,
    });
    if (!woodResponse.ok)
      throw new Error("Die gemalten Materialien konnten nicht geladen werden.");
    const woodBitmap = await createImageBitmap(await woodResponse.blob(), {
      imageOrientation: "flipY",
    });
    if (this.disposed) {
      woodBitmap.close();
      this.disposeObjects(asset.scene);
      return;
    }
    this.paintedWood = new THREE.Texture(woodBitmap);
    this.paintedWood.colorSpace = THREE.SRGBColorSpace;
    this.paintedWood.wrapS = this.paintedWood.wrapT = THREE.RepeatWrapping;
    this.paintedWood.anisotropy = Math.min(
      4,
      this.renderer.capabilities.getMaxAnisotropy(),
    );
    this.paintedWood.needsUpdate = true;
    this.model.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.castShadow = true;
        o.receiveShadow = true;
        const material = o.material as THREE.MeshStandardMaterial;
        if (material.name === "painted-wood") {
          material.map = this.paintedWood;
          material.onBeforeCompile = (shader) => {
            shader.fragmentShader = shader.fragmentShader.replace(
              "#include <map_fragment>",
              `
              #include <map_fragment>
              float woodLuma = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
              diffuseColor.rgb = mix(vec3(woodLuma), diffuseColor.rgb, 0.48);
              diffuseColor.rgb = mix(vec3(0.38, 0.27, 0.17), diffuseColor.rgb, 0.52);
            `,
            );
          };
          material.customProgramCacheKey = () => "tea-painted-wood-v2";
        }
        if (material.name === "foliage") {
          material.onBeforeCompile = (shader) => {
            shader.uniforms.teaWindTime = this.windTime;
            shader.vertexShader =
              "uniform float teaWindTime;\n" + shader.vertexShader;
            shader.vertexShader = shader.vertexShader.replace(
              "#include <begin_vertex>",
              `
              #include <begin_vertex>
              float sway = smoothstep(0.4, 3.0, position.y) * 0.045;
              transformed.x += sin(teaWindTime * 0.8 + position.z * 1.4 + position.x * 0.7) * sway;
              transformed.z += cos(teaWindTime * 0.65 + position.x) * sway * 0.5;
            `,
            );
          };
          material.customProgramCacheKey = () => "tea-foliage-v2";
        }
      }
    });
    this.scene.add(this.model);
    this.roller = this.model.getObjectByName("roller") ?? null;
    this.record = this.model.getObjectByName("record") ?? null;
    this.arm = this.model.getObjectByName("arm") ?? null;
    await this.renderer.compileAsync(this.scene, this.camera);
  }
  resize() {
    if (this.disposed) return;
    const rect = this.canvas.parentElement!.getBoundingClientRect();
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    const aspect = this.width / this.height,
      view =
        aspect < 0.8
          ? 16.6
          : aspect < 1.3
            ? 15.3
            : clamp(24 / aspect, 12.5, 14.6);
    this.camera.left = (-view * aspect) / 2;
    this.camera.right = (view * aspect) / 2;
    this.camera.top = view / 2;
    this.camera.bottom = -view / 2;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.width, this.height, false);
  }
  resetSpills() {
    this.nextPuddle = this.nextParticle = 0;
    this.spillClock = 0;
    this.dummy.scale.setScalar(0);
    this.dummy.updateMatrix();
    for (let i = 0; i < 96; i++) this.puddles.setMatrixAt(i, this.dummy.matrix);
    for (let i = 0; i < 64; i++) {
      this.particles[i].life = 0;
      this.droplets.setMatrixAt(i, this.dummy.matrix);
    }
    this.puddles.instanceMatrix.needsUpdate =
      this.droplets.instanceMatrix.needsUpdate = true;
  }
  render(sim: Simulation, dt: number, overview = false) {
    if (this.disposed) return;
    const begin = performance.now();
    const p = sim.position,
      l = sim.liquid;
    this.windTime.value = this.reduced ? 0 : sim.elapsed;
    this.character.update(sim, dt, this.reduced);
    const facingCos = Math.cos(sim.yaw),
      facingSin = Math.sin(sim.yaw);
    const trayX = l.trayX * facingCos - l.trayZ * facingSin;
    const trayZ = l.trayX * facingSin + l.trayZ * facingCos;
    const cupX = l.cupX * facingCos - l.cupZ * facingSin;
    const cupZ = l.cupX * facingSin + l.cupZ * facingCos;
    this.tray.rotation.set(trayZ, 0, -trayX);
    this.cup.rotation.set(cupZ, 0, -cupX);
    // Cancel the vessel's attitude: resting fluid stays level under world gravity.
    this.tea.rotation.set(
      -trayZ - cupZ - this.character.body.rotation.x,
      0,
      trayX + cupX,
    );
    const vertices = this.tea.geometry.attributes.position;
    for (let i = 0; i < vertices.count; i++) {
      const x = this.teaRest[i * 3],
        z = this.teaRest[i * 3 + 2];
      const worldX = x * Math.cos(sim.yaw) + z * Math.sin(sim.yaw),
        worldZ = -x * Math.sin(sim.yaw) + z * Math.cos(sim.yaw);
      vertices.setY(
        i,
        TEA_BASE_HEIGHT +
          l.amount * TEA_FILL_DEPTH +
          l.x * worldX +
          l.z * worldZ +
          l.wave * (worldX * worldX - worldZ * worldZ) * 2,
      );
    }
    vertices.needsUpdate = true;
    this.tea.geometry.computeVertexNormals();
    this.tea.visible = l.amount > 0.005;
    this.shadow.position.set(p.x, this.avatar.position.y + 0.012, p.z);
    if (this.roller) {
      this.roller.position.set(sim.rollerX, 0.68, 4.25);
      this.roller.rotation.z = -sim.rollerX / 0.6;
    }
    if (this.record) this.record.rotation.y = sim.recordAngle;
    if (this.arm) {
      this.arm.position.set(RECORD.x, 0.6, RECORD.z);
      this.arm.rotation.y = -sim.recordAngle;
    }
    this.spillClock += dt;
    this.avatar.updateMatrixWorld(true);
    this.cup.getWorldPosition(this.cupWorld);
    if (sim.spilled > 0.00001 && dt > 0) {
      const particle = this.particles[this.nextParticle++ % 64];
      const direction = Math.atan2(l.z, l.x);
      const amount = 0.31;
      Object.assign(particle, {
        x: this.cupWorld.x + Math.cos(direction) * amount,
        y: this.cupWorld.y + 0.4,
        z: this.cupWorld.z + Math.sin(direction) * amount,
        vx: Math.cos(direction) * 0.8,
        vy: 0.4,
        vz: Math.sin(direction) * 0.8,
        life: 1,
      });
      if (this.spillClock > 0.25) {
        this.spillClock = 0;
        this.dummy.position.set(p.x, 0.25, p.z);
        this.dummy.rotation.set(-Math.PI / 2, 0, this.nextPuddle * 2.4);
        this.dummy.scale.set(1, 1.3, 1);
        this.dummy.updateMatrix();
        this.puddles.setMatrixAt(this.nextPuddle++ % 96, this.dummy.matrix);
        this.puddles.instanceMatrix.needsUpdate = true;
      }
    }
    for (let i = 0; i < 64; i++) {
      const q = this.particles[i];
      q.life -= dt;
      if (q.life > 0) {
        q.vy -= 9.81 * dt;
        q.x += q.vx * dt;
        q.y += q.vy * dt;
        q.z += q.vz * dt;
        if (q.y < 0.15) q.life = 0;
      }
      this.dummy.position.set(q.x, q.y, q.z);
      this.dummy.rotation.set(0, 0, 0);
      this.dummy.scale.setScalar(q.life > 0 ? 1 : 0);
      this.dummy.updateMatrix();
      this.droplets.setMatrixAt(i, this.dummy.matrix);
    }
    this.droplets.instanceMatrix.needsUpdate = true;
    const desired = new THREE.Vector3(
      clamp(p.x + sim.lastV.x * 0.15, -7.2, 7.2),
      0,
      clamp(p.z - 1.45, -13.2, 13),
    );
    if (overview) {
      desired.set(0, 0, -0.4);
      this.camera.zoom = ((this.camera.top * 2) / 19) * 0.61;
    } else this.camera.zoom = 1;
    this.camera.updateProjectionMatrix();
    this.target.lerp(
      desired,
      dt === 0 || overview ? 1 : 1 - Math.exp(-(this.reduced ? 18 : 7) * dt),
    );
    this.camera.position.copy(this.target).add(this.cameraOffset);
    this.camera.lookAt(this.target);
    this.renderer.render(this.scene, this.camera);
    const duration = performance.now() - begin;
    this.renderDurations.push(duration);
    if (this.renderDurations.length > 300) this.renderDurations.shift();
    if (dt > 0) {
      this.frameCount++;
      if (dt > 0.03 || duration > 24) this.slowFrames++;
      if (this.frameCount >= 180) {
        if (this.slowFrames > 70) this.downgrade();
        this.frameCount = this.slowFrames = 0;
      }
    }
  }
  private downgrade() {
    if (this.quality === "high") {
      this.quality = "medium";
      this.renderer.setPixelRatio(Math.min(devicePixelRatio, 1.3));
    } else if (this.quality === "medium") {
      this.quality = "low";
      this.renderer.setPixelRatio(1);
      this.renderer.shadowMap.enabled = false;
    }
    this.resize();
  }
  get footstep() {
    return this.character.landed;
  }
  get metrics() {
    const sorted = [...this.renderDurations].sort((a, b) => a - b);
    return {
      quality: this.quality,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      geometries: this.renderer.info.memory.geometries,
      textures: this.renderer.info.memory.textures,
      renderP95Ms: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
      pixelRatio: this.renderer.getPixelRatio(),
    };
  }
  private disposeObjects(object: THREE.Object3D) {
    const geometries = new Set<THREE.BufferGeometry>(),
      materials = new Set<THREE.Material>(),
      textures = new Set<THREE.Texture>();
    object.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        geometries.add(o.geometry);
        for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
          materials.add(m);
          for (const value of Object.values(m))
            if (value instanceof THREE.Texture) textures.add(value);
        }
        if (o instanceof THREE.InstancedMesh) o.dispose();
      }
    });
    geometries.forEach((g) => g.dispose());
    materials.forEach((m) => m.dispose());
    textures.forEach((t) => t.dispose());
  }
  dispose() {
    if (this.disposed) return;
    this.disposed = true;
    this.abort.abort();
    this.resizeObserver.disconnect();
    this.disposeObjects(this.scene);
    // A failed material fetch may leave a parsed model outside the scene.
    if (this.model && !this.model.parent) this.disposeObjects(this.model);
    (this.paintedWood?.image as ImageBitmap | undefined)?.close();
    this.paintedWood?.dispose();
    this.env.dispose();
    this.sun.shadow.map?.dispose();
    this.scene.clear();
    this.renderer.renderLists.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

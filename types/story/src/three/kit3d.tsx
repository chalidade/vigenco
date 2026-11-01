import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { Bloom, DepthOfField, EffectComposer, ToneMapping, Vignette } from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { createContext, useContext, useEffect, useMemo, useState, type FC, type ReactNode } from "react";
import * as THREE from "three";
import { continueRender, delayRender, useCurrentFrame, useVideoConfig } from "remotion";
import { rand } from "../lib/kit";

// Shared 3D kit for the Nuh series. Rules: Nabi Nuh is only ever <Glow>, and nobody stands behind or inside it.

type V3 = [number, number, number];
const SKIN = ["#c68a5a", "#a86f45", "#d9a074", "#8f5c3a"];
const ROBES = ["#e9dcc0", "#b8573f", "#4f6d8f", "#7e8f4f", "#c9a24a", "#8a5a7a", "#d8c7a0"];
const RICH = ["#4a1f4f", "#6b1f2a", "#1f3a4a", "#3b2a5a"];
const CLOTH = ["#f2ece0", "#d9c9a8", "#6b4f3a", "#a33f3f", "#e0d2b4"];
const GOLD = "#d4a640";

export type Light = { top: string; bottom: string; fog: string; sun: V3; sunColor: string; sunI: number; hemi: [string, string, number]; rim: string; sand: string; fill: number };
export const LIGHT: Record<"dawn" | "day" | "dusk", Light> = {
  dawn: { top: "#3d3a7a", bottom: "#f4b183", fog: "#e9a57a", sun: [-6, 4, -12], sunColor: "#ffb57a", sunI: 2.4, hemi: ["#a29ed8", "#b07050", 0.9], rim: "#ffcf9a", sand: "#d79a62", fill: 0.7 },
  day: { top: "#6fa9d6", bottom: "#f4ddb0", fog: "#f1d9ad", sun: [9, 9, 5], sunColor: "#ffe8c4", sunI: 2.6, hemi: ["#cfe6ff", "#c9955a", 0.8], rim: "#bcd7ff", sand: "#e2b878", fill: 0.3 },
  dusk: { top: "#2b2556", bottom: "#e0805f", fog: "#b06a58", sun: [-8, 3, -6], sunColor: "#ff9a5a", sunI: 2.2, hemi: ["#8a7ac8", "#7d4a3c", 1.1], rim: "#ffb27a", sand: "#a8694a", fill: 1.3 },
};

/* ---------- textures (procedural, drawn once per canvas) ---------- */

const canvasTex = (size: number, repeat: number, draw: (g: CanvasRenderingContext2D, s: number) => void, srgb = true) => {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  draw(c.getContext("2d")!, size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat, repeat);
  t.anisotropy = 4;
  return t;
};

const speckle = (g: CanvasRenderingContext2D, s: number, n: number, seed: number, lo: number, hi: number, r: number) => {
  for (let i = 0; i < n; i++) {
    const v = Math.round(lo + rand(seed + i * 3) * (hi - lo));
    g.fillStyle = `rgb(${v},${v},${v})`;
    g.beginPath();
    g.arc(rand(seed + i) * s, rand(seed + i * 7 + 1) * s, 0.5 + rand(seed + i * 5) * r, 0, Math.PI * 2);
    g.fill();
  }
};

const makeTextures = () => ({
  sand: canvasTex(512, 14, (g, s) => {
    g.fillStyle = "#e9e3d8"; g.fillRect(0, 0, s, s);
    speckle(g, s, 5000, 1, 200, 255, 1.6);
    g.fillStyle = "rgba(120,100,80,0.18)"; // footprints
    for (let i = 0; i < 14; i++) { g.beginPath(); g.ellipse(rand(i + 40) * s, rand(i + 80) * s, 7, 12, rand(i) * 3, 0, Math.PI * 2); g.fill(); }
  }),
  plaster: canvasTex(256, 1, (g, s) => {
    g.fillStyle = "#e6e0d6"; g.fillRect(0, 0, s, s);
    speckle(g, s, 2500, 9, 190, 250, 1.4);
    g.strokeStyle = "rgba(90,70,50,0.25)"; g.lineWidth = 1.5; // faint mud-brick courses
    for (let y = 0; y < s; y += 22) { g.beginPath(); g.moveTo(0, y); g.lineTo(s, y + (rand(y) - 0.5) * 4); g.stroke(); }
  }),
  stone: canvasTex(256, 2, (g, s) => {
    g.fillStyle = "#d8d4cc"; g.fillRect(0, 0, s, s);
    speckle(g, s, 3500, 21, 150, 240, 2);
    g.strokeStyle = "rgba(60,55,50,0.35)"; g.lineWidth = 1.2; // cracks
    for (let i = 0; i < 9; i++) { g.beginPath(); let x = rand(i + 60) * s, y = rand(i + 61) * s; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (rand(i * 9 + k) - 0.5) * 40; y += rand(i * 7 + k) * 25; g.lineTo(x, y); } g.stroke(); }
  }),
  glow: canvasTex(128, 1, (g) => {
    const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, "rgba(255,248,220,1)");
    grad.addColorStop(0.25, "rgba(255,226,150,0.6)");
    grad.addColorStop(1, "rgba(255,210,120,0)");
    g.fillStyle = grad; g.fillRect(0, 0, 128, 128);
  }, false),
});
type Textures = ReturnType<typeof makeTextures>;
const Tex = createContext<Textures | null>(null);
const useTex = () => useContext(Tex)!;

export const Mat: FC<{ c: string; r?: number; flat?: boolean; map?: THREE.Texture }> = ({ c, r = 0.85, flat, map }) => (
  <meshStandardMaterial color={c} roughness={r} flatShading={flat} map={map} bumpMap={map} bumpScale={map ? 2 : 0} />
);

/* ---------- stage: canvas, camera, light, ground, post effects ---------- */

const CamRig: FC<{ pos: V3; look: V3; fov: number }> = ({ pos, look, fov }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(...pos);
  camera.lookAt(...look);
  if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  return null;
};

/** The effect composer mounts after Remotion's first draw, so redraw once it is in place before that frame is captured. */
const Redraw: FC = () => {
  const advance = useThree((s) => s.advance);
  const [handle] = useState(() => delayRender("postprocessing redraw"));
  useEffect(() => {
    const id = requestAnimationFrame(() => { advance(performance.now()); continueRender(handle); });
    return () => cancelAnimationFrame(id);
  }, [advance, handle]);
  return null;
};

const SkyDome: FC<{ top: string; bottom: string }> = ({ top, bottom }) => {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { top: { value: new THREE.Color(top) }, bottom: { value: new THREE.Color(bottom) } },
    vertexShader: "varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top; uniform vec3 bottom; varying vec3 p; void main(){ gl_FragColor = vec4(mix(bottom, top, smoothstep(-0.05, 0.6, p.y)), 1.0); }",
  }), [top, bottom]);
  return <mesh material={mat}><sphereGeometry args={[90, 24, 12]} /></mesh>;
};

const Textured: FC<{ children: ReactNode }> = ({ children }) => {
  const t = useMemo(makeTextures, []);
  return <Tex.Provider value={t}>{children}</Tex.Provider>;
};

const Ground: FC<{ color: string }> = ({ color }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><circleGeometry args={[80, 48]} /><Mat c={color} r={1} map={useTex().sand} /></mesh>
);

export const Stage: FC<{ light: Light; cam: V3; look: V3; fov?: number; focus: V3; range?: number; children: ReactNode }> = ({ light, cam, look, fov = 45, focus, range = 7, children }) => {
  const { width, height } = useVideoConfig();
  return (
    <ThreeCanvas width={width} height={height} shadows="soft" camera={{ fov, near: 0.1, far: 220 }}>
      <Textured>
        <CamRig pos={cam} look={look} fov={fov} />
        <fog attach="fog" args={[light.fog, 24, 80]} />
        <SkyDome top={light.top} bottom={light.bottom} />
        <hemisphereLight args={light.hemi} />
        <directionalLight position={light.sun} intensity={light.sunI} color={light.sunColor} castShadow shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-14} shadow-camera-right={14} shadow-camera-top={14} shadow-camera-bottom={-14} shadow-camera-far={60}
          shadow-bias={-0.0004} shadow-normalBias={0.02} shadow-radius={4} />
        {/* rim light from behind so silhouettes separate from the background */}
        <directionalLight position={[-4, 6, -10]} intensity={1.1} color={light.rim} />
        {/* soft fill from the camera side so faces stay readable when the sun is behind them */}
        <directionalLight position={[2, 4, 12]} intensity={light.fill} color="#ffd9b8" />
        <Ground color={light.sand} />
        {children}
        <EffectComposer multisampling={0}>
          {/* no N8AO: on a CPU-only (SwiftShader) render it costs ~30% render time for a subtle gain */}
          <DepthOfField target={focus} worldFocusRange={range} bokehScale={1.6} />
          <Bloom luminanceThreshold={1} intensity={0.9} mipmapBlur />
          <ToneMapping mode={ToneMappingMode.NEUTRAL} />
          <Vignette offset={0.25} darkness={0.55} />
        </EffectComposer>
        <Redraw />
      </Textured>
    </ThreeCanvas>
  );
};

/* ---------- people ---------- */

/** Robe: a flared lathe with soft vertical folds that fade toward the chest. */
const robeGeo = (() => {
  const g = new THREE.LatheGeometry(
    [[0, 0], [0.43, 0], [0.42, 0.06], [0.37, 0.4], [0.3, 0.85], [0.29, 1.15], [0.33, 1.3], [0.22, 1.42], [0, 1.45]].map(([x, y]) => new THREE.Vector2(x, y)),
    32,
  );
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 1 + Math.sin(Math.atan2(z, x) * 9) * 0.045 * Math.max(0, 1 - y / 1.1);
    p.setXYZ(i, x * k, y, z * k);
  }
  g.computeVertexNormals();
  return g;
})();

export type Gesture = "idle" | "point" | "whisper" | "cross" | "bow" | "laugh" | "ears" | "cover" | "elbow";
export type Mood = "smile" | "flat" | "frown" | "laugh";

/** Shoulder and elbow rotations per gesture; side = -1 left, 1 right. */
const armPose = (g: Gesture, side: number, swing: number, t: number): [V3, V3] => {
  switch (g) {
    case "point": return side === 1 ? [[-1.35 + Math.sin(t * 2) * 0.05, 0, -0.12], [0, 0, 0]] : [[0.05, 0, -0.08], [-0.2, 0, 0]];
    case "cross": return [[-0.35, 0, side * -0.25], [-1.5, 0, side * -0.3]];
    case "whisper": return side === 1 ? [[-0.5, 0, -0.35], [-2.1, 0, 0]] : [[0.05, 0, -0.08], [-0.2, 0, 0]];
    case "bow": return [[-1.3, 0, side * 0.1], [-0.2, 0, 0]];
    case "laugh": return [[-0.25 + Math.sin(t * 12) * 0.05, 0, side * -0.15], [-1.25, 0, side * -0.5]];
    case "ears": case "cover": return [[0, 0, side * 1.9], [0, 0, side * 2.35]];
    case "elbow": return side === 1 ? [[-0.4, 0, 1.0 + Math.sin(t * 5) * 0.15], [-1.7, 0, 0]] : [[0.05, 0, -0.08], [-0.2, 0, 0]];
    default: return [[side * swing, 0, side * 0.08], [-0.15, 0, 0]];
  }
};

const Arm: FC<{ side: number; robe: string; skin: string; shoulder: V3; elbow: V3 }> = ({ side, robe, skin, shoulder, elbow }) => (
  <group position={[side * 0.29, 1.32, 0]} rotation={shoulder}>
    <mesh position={[0, -0.15, 0]} castShadow><capsuleGeometry args={[0.085, 0.2, 6, 12]} /><Mat c={robe} r={0.95} /></mesh>
    <group position={[0, -0.3, 0]} rotation={elbow}>
      <mesh position={[0, -0.12, 0]} castShadow><capsuleGeometry args={[0.078, 0.18, 6, 12]} /><Mat c={robe} r={0.95} /></mesh>
      <mesh position={[0, -0.24, 0]}><cylinderGeometry args={[0.1, 0.085, 0.08, 12]} /><Mat c={robe} r={0.95} /></mesh>
      <group position={[0, -0.33, 0]}>
        <mesh scale={[0.8, 1.15, 0.6]} castShadow><sphereGeometry args={[0.075, 12, 10]} /><Mat c={skin} r={0.6} /></mesh>
        <mesh position={[side * -0.045, 0.02, 0.03]} scale={[0.5, 0.9, 0.5]}><sphereGeometry args={[0.05, 8, 6]} /><Mat c={skin} r={0.6} /></mesh>
      </group>
    </group>
  </group>
);

const Face: FC<{ skin: string; mood: Mood; t: number; beard: boolean }> = ({ skin, mood, t, beard }) => (
  <>
    {[-1, 1].map((side) => (
      <group key={side} position={[side * 0.06, 0.0, 0.148]}>
        <mesh scale={[1, mood === "laugh" ? 0.45 : 1, 0.5]}><sphereGeometry args={[0.026, 10, 8]} /><meshStandardMaterial color="#f4ede2" roughness={0.4} /></mesh>
        <mesh position={[0, 0, 0.012]} scale={[1, mood === "laugh" ? 0.5 : 1, 1]}><sphereGeometry args={[0.016, 8, 6]} /><meshStandardMaterial color="#1c120c" roughness={0.2} /></mesh>
        <mesh position={[0, 0.045, 0.006]} rotation={[0, 0, side * (mood === "frown" ? 0.35 : -0.12)]}><boxGeometry args={[0.055, 0.012, 0.012]} /><Mat c="#2a1d14" /></mesh>
      </group>
    ))}
    <mesh position={[0, -0.035, 0.17]} scale={[0.8, 1, 1]}><sphereGeometry args={[0.03, 8, 6]} /><Mat c={skin} r={0.6} /></mesh>
    {mood === "flat" && <mesh position={[0, -0.09, 0.155]}><boxGeometry args={[0.05, 0.01, 0.01]} /><Mat c="#5a2e22" /></mesh>}
    {(mood === "smile" || mood === "frown") && (
      <mesh position={[0, mood === "smile" ? -0.08 : -0.105, 0.152]} rotation={[0, 0, mood === "smile" ? Math.PI : 0]}><torusGeometry args={[0.03, 0.007, 4, 10, Math.PI]} /><Mat c="#5a2e22" /></mesh>
    )}
    {mood === "laugh" && <mesh position={[0, -0.095, 0.145]} scale={[1, 0.6 + Math.abs(Math.sin(t * 12)) * 0.4, 0.5]}><sphereGeometry args={[0.04, 10, 8]} /><meshStandardMaterial color="#4a1515" roughness={0.6} /></mesh>}
    {beard && <mesh position={[0, -0.12, 0.08]} scale={[1, 1.15, 0.75]}><sphereGeometry args={[0.12, 12, 8, 0, Math.PI * 2, Math.PI / 2.1, Math.PI / 2]} /><Mat c="#2a1d14" r={1} /></mesh>}
  </>
);

/**
 * A villager (never Nabi Nuh). Feet at (x, 0, z), about 1.75 units tall.
 * Faces `facing` (radians, 0 = toward +z / the camera), or turns toward `lookAt` when given.
 */
export const Villager: FC<{ x: number; z: number; seed: number; facing?: number; lookAt?: [number, number]; walk?: number; gesture?: Gesture; mood?: Mood; rich?: boolean; old?: boolean; robe?: string; lean?: number; s?: number }> = ({
  x, z, seed, facing, lookAt, walk = 0, gesture = "idle", mood = "flat", rich, old, robe: robeC, lean = 0, s: scale,
}) => {
  const f = useCurrentFrame();
  const t = f / 30 + seed * 1.7;
  const skin = SKIN[seed % SKIN.length];
  const robe = robeC ?? (rich ? RICH[seed % RICH.length] : ROBES[seed % ROBES.length]);
  const wrap = old ? "#ece8e0" : rich ? GOLD : CLOTH[(seed * 3) % CLOTH.length];
  const px = x + (walk * f) / 30;
  const face = facing ?? (lookAt ? Math.atan2(lookAt[0] - px, lookAt[1] - z) : 0);
  const step = Math.sin(t * 7);
  const swing = walk ? step * 0.5 : Math.sin(t * 1.4) * 0.05;
  const kneel = gesture === "bow";
  const bob = walk ? Math.abs(step) * 0.045 : gesture === "laugh" ? Math.abs(Math.sin(t * 12)) * 0.03 : Math.sin(t * 2.2) * 0.012;
  const look = walk || kneel ? 0 : Math.sin(t * 0.6) * 0.2;
  const s = scale ?? 0.92 + rand(seed) * 0.16;
  // bowing people rise and lower slowly, as in prostration
  const tilt = kneel ? 1.0 + Math.sin(t * 0.9) * 0.25 : lean + (gesture === "elbow" ? 0.12 : 0);
  const headTilt = gesture === "laugh" ? -0.35 : gesture === "whisper" ? 0.15 : kneel ? -0.4 : 0;
  const pivot = kneel ? 0.5 : 0.82;
  return (
    <group position={[px, bob, z]} rotation={[0, face, 0]} scale={s}>
      <mesh geometry={robeGeo} scale={kneel ? [1.15, 0.55, 1.25] : 1} castShadow receiveShadow><Mat c={robe} r={0.95} /></mesh>
      {!kneel && <mesh position={[0, 0.82, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow><torusGeometry args={[0.3, 0.035, 8, 24]} /><Mat c={wrap} r={rich ? 0.35 : 0.85} /></mesh>}
      {!kneel && <mesh position={[0.12, 0.62, 0.27]} rotation={[0.08, 0, 0.05]} castShadow><boxGeometry args={[0.07, 0.38, 0.02]} /><Mat c={wrap} /></mesh>}
      {walk ? [-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.12, 0.04, 0.1 + side * step * 0.12]} castShadow><boxGeometry args={[0.12, 0.08, 0.24]} /><Mat c="#5a3b25" /></mesh>
      )) : null}
      {/* upper body pivots at the waist */}
      <group position={[0, pivot, 0]} rotation={[tilt, 0, 0]}>
        <group position={[0, -0.82, 0]}>
          {kneel && <mesh position={[0, 1.1, 0]} castShadow><capsuleGeometry args={[0.27, 0.4, 6, 16]} /><Mat c={robe} r={0.95} /></mesh>}
          {[-1, 1].map((side) => {
            const [sh, el] = armPose(gesture, side, swing, t);
            return <Arm key={side} side={side} robe={robe} skin={skin} shoulder={sh} elbow={el} />;
          })}
          <mesh position={[0, 1.47, 0]}><cylinderGeometry args={[0.07, 0.08, 0.12, 10]} /><Mat c={skin} r={0.6} /></mesh>
          <group position={[0, 1.6, 0]} rotation={[headTilt, look, gesture === "whisper" ? 0.2 : 0]}>
            <mesh scale={[0.95, 1.08, 1]} castShadow><sphereGeometry args={[0.17, 20, 16]} /><Mat c={skin} r={0.6} /></mesh>
            {rich ? (
              <>
                <mesh position={[0, 0.15, -0.01]} castShadow><cylinderGeometry args={[0.15, 0.17, 0.22, 16]} /><Mat c={robe} r={0.6} /></mesh>
                <mesh position={[0, 0.06, -0.01]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.17, 0.025, 8, 24]} /><Mat c={GOLD} r={0.3} /></mesh>
              </>
            ) : (
              <>
                <mesh position={[0, 0.05, -0.01]} scale={[1.12, 0.85, 1.12]} castShadow><sphereGeometry args={[0.18, 20, 10, 0, Math.PI * 2, 0, Math.PI / 1.9]} /><Mat c={wrap} r={0.95} /></mesh>
                <mesh position={[0, 0.03, 0]} rotation={[Math.PI / 2 - 0.1, 0, 0]}><torusGeometry args={[0.185, 0.03, 8, 24]} /><Mat c={wrap} r={0.95} /></mesh>
                <mesh position={[0, -0.13, -0.11]} rotation={[0.25, 0, 0]} castShadow><boxGeometry args={[0.33, 0.38, 0.04]} /><Mat c={wrap} r={0.95} /></mesh>
              </>
            )}
            {gesture === "cover"
              ? <mesh position={[0, 0.02, 0.06]} castShadow><boxGeometry args={[0.42, 0.46, 0.26]} /><Mat c={CLOTH[(seed + 1) % CLOTH.length]} r={0.95} /></mesh>
              : <Face skin={skin} mood={mood} t={t} beard={old || seed % 3 === 0} />}
          </group>
        </group>
      </group>
    </group>
  );
};

/* ---------- town ---------- */

export const House: FC<{ x: number; z: number; w: number; h: number; d: number; c: string; rot?: number; lit?: boolean }> = ({ x, z, w, h, d, c, rot = 0, lit }) => {
  const tex = useTex().plaster;
  const map = useMemo(() => { const m = tex.clone(); m.repeat.set(w / 2, h / 2); m.needsUpdate = true; return m; }, [tex, w, h]);
  const hole = lit ? <meshBasicMaterial color="#ffb45a" /> : <Mat c="#3b2418" />;
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      <mesh position={[0, h / 2, 0]} castShadow receiveShadow><boxGeometry args={[w, h, d]} /><Mat c={c} r={1} map={map} /></mesh>
      <mesh position={[0, h + 0.08, 0]} castShadow><boxGeometry args={[w + 0.2, 0.16, d + 0.2]} /><Mat c="#8f5a3a" r={1} /></mesh>
      {Array.from({ length: Math.floor(w / 0.5) }, (_, i) => (
        <mesh key={i} position={[-w / 2 + 0.25 + i * 0.5, h - 0.25, d / 2 + 0.12]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.05, 0.05, 0.3, 6]} /><Mat c="#6b4428" /></mesh>
      ))}
      <mesh position={[0, 0.7, d / 2 + 0.01]}><planeGeometry args={[0.75, 1.4]} />{hole}</mesh>
      <mesh position={[0, 1.42, d / 2 + 0.06]}><boxGeometry args={[0.95, 0.1, 0.12]} /><Mat c="#6b4428" /></mesh>
      {h > 3 && <mesh position={[w / 4, h - 1, d / 2 + 0.01]}><planeGeometry args={[0.45, 0.45]} />{hole}</mesh>}
    </group>
  );
};

/** The town square's backdrop: houses on three sides and two palms. */
export const Town: FC<{ lit?: boolean }> = ({ lit }) => (
  <>
    {[[-6, -8, 3, 3.5, 3], [-2.5, -9, 3.2, 2.6, 3], [1.2, -8.5, 2.8, 4.2, 3], [5, -8, 3.4, 3, 3], [-9, -4, 3, 3.2, 3], [9, -5, 3, 3.6, 3], [-10, 1, 3, 2.8, 3], [10.5, 0.5, 3, 3.2, 3],
      [-3, -15, 4, 4.5, 3], [4, -15, 4, 3.6, 3], [-9, -12, 3.4, 3, 3], [10, -12, 3.4, 4, 3]].map(([x, z, w, h, d], i) => (
      <House key={i} x={x} z={z} w={w} h={h} d={d} c={i % 2 ? "#d8a06a" : "#c98f5a"} rot={x < -8 ? 0.6 : x > 8 ? -0.6 : 0} lit={lit} />
    ))}
    <Palm x={-4} z={-5.5} s={1.1} />
    <Palm x={4.2} z={-6} />
    <Palm x={-7.5} z={-1.5} s={0.9} />
  </>
);

const jarGeo = new THREE.LatheGeometry([[0, 0], [0.09, 0], [0.15, 0.1], [0.14, 0.22], [0.06, 0.3], [0.07, 0.34]].map(([x, y]) => new THREE.Vector2(x, y)), 16);

export const Stall: FC<{ x: number; z: number; c: string; seed: number }> = ({ x, z, c, seed }) => (
  <group position={[x, 0, z]}>
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => (
      <mesh key={i} position={[a * 0.9, 1.1, b * 0.5]} castShadow><cylinderGeometry args={[0.04, 0.05, 2.2, 6]} /><Mat c="#6b4428" /></mesh>
    ))}
    <mesh position={[0, 2.22, 0.1]} rotation={[-0.25, 0, 0]} castShadow><boxGeometry args={[2.1, 0.03, 1.5]} /><Mat c={c} r={0.9} /></mesh>
    <mesh position={[0, 0.5, 0]} castShadow receiveShadow><boxGeometry args={[1.9, 0.12, 1]} /><Mat c="#7a4a2a" /></mesh>
    <mesh position={[0, 0.25, 0]}><boxGeometry args={[1.8, 0.5, 0.9]} /><Mat c="#5e3a22" /></mesh>
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={i} position={[-0.75 + (i % 3) * 0.22, 0.62 + Math.floor(i / 3) * 0.12, -0.15 + rand(seed + i) * 0.3]} castShadow>
        <sphereGeometry args={[0.1, 10, 8]} /><Mat c={["#d9822b", "#b83b3b", "#e8c34a", "#6f8f3f"][(seed + i) % 4]} r={0.5} />
      </mesh>
    ))}
    {[0, 1].map((i) => <mesh key={i} geometry={jarGeo} position={[0.1 + i * 0.3, 0.56, 0.1]} scale={1 + i * 0.3} castShadow><Mat c={i ? "#a8653a" : "#c27a48"} r={0.7} /></mesh>)}
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[0.65, 0.63 + i * 0.1, -0.1]} rotation={[0, 0, Math.PI / 2]} castShadow><cylinderGeometry args={[0.06, 0.06, 0.5, 12]} /><Mat c={["#a33f3f", "#4f6d8f", "#e0d2b4"][(seed + i) % 3]} r={0.95} /></mesh>
    ))}
  </group>
);

export const Palm: FC<{ x: number; z: number; s?: number }> = ({ x, z, s = 1 }) => {
  const f = useCurrentFrame();
  return (
    <group position={[x, 0, z]} scale={s}>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[i * i * 0.012, 0.35 + i * 0.7, 0]} rotation={[0, 0, -i * 0.03]} castShadow><cylinderGeometry args={[0.13 - i * 0.008, 0.17 - i * 0.008, 0.72, 8]} /><Mat c="#7a5a3a" flat /></mesh>
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} position={[0.42, 4.4, 0]} rotation={[0, (i / 8) * Math.PI * 2, Math.sin(f / 25 + i) * 0.04]}>
          <mesh position={[0.8, -0.25, 0]} rotation={[0, 0, -0.5]} scale={[1, 0.06, 0.3]} castShadow><sphereGeometry args={[0.9, 10, 6]} /><Mat c={i % 2 ? "#4f7a35" : "#5c8a3c"} flat /></mesh>
        </group>
      ))}
    </group>
  );
};

/* ---------- the five idols (Nuh 71:23) ---------- */

const STONE = "#9a9084";
const Eyes: FC<{ y: number; z: number; w?: number }> = ({ y, z, w = 0.12 }) => (
  <>{[-1, 1].map((s) => <mesh key={s} position={[s * w, y, z]}><sphereGeometry args={[0.05, 8, 6]} /><meshStandardMaterial color="#1a120e" roughness={0.3} /></mesh>)}</>
);

const Idol: FC<{ kind: number; x: number; tex: THREE.Texture }> = ({ kind, x, tex }) => {
  const m = <Mat c={STONE} r={0.95} map={tex} flat />;
  const shape = [
    // Wadd: a man
    <group key={0}>
      <mesh position={[0, 1.3, 0]} castShadow><cylinderGeometry args={[0.38, 0.5, 2.2, 8]} />{m}</mesh>
      <mesh position={[0, 2.7, 0]} castShadow><sphereGeometry args={[0.4, 10, 8]} />{m}</mesh>
      <mesh position={[0, 2.95, 0]} castShadow><cylinderGeometry args={[0.36, 0.42, 0.3, 8]} />{m}</mesh>
      <Eyes y={2.72} z={0.36} />
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.55, 1.6, 0.1]} rotation={[0, 0, s * 0.15]} castShadow><boxGeometry args={[0.22, 1.2, 0.3]} />{m}</mesh>)}
    </group>,
    // Suwa': a woman
    <group key={1}>
      <mesh position={[0, 1.2, 0]} castShadow><coneGeometry args={[0.7, 2.4, 10]} />{m}</mesh>
      <mesh position={[0, 2.55, 0]} castShadow><sphereGeometry args={[0.36, 10, 8]} />{m}</mesh>
      <mesh position={[0, 2.5, -0.15]} scale={[1.1, 1.3, 0.8]} castShadow><sphereGeometry args={[0.4, 10, 8]} />{m}</mesh>
      <Eyes y={2.58} z={0.32} w={0.11} />
    </group>,
    // Yaghuts: a lion, seated
    <group key={2}>
      <mesh position={[0, 0.9, -0.1]} rotation={[-0.4, 0, 0]} castShadow><boxGeometry args={[0.9, 1.6, 0.9]} />{m}</mesh>
      <mesh position={[0, 2.0, 0.2]} castShadow><sphereGeometry args={[0.42, 10, 8]} />{m}</mesh>
      <mesh position={[0, 2.0, 0.12]} castShadow><torusGeometry args={[0.45, 0.2, 8, 14]} />{m}</mesh>
      <mesh position={[0, 1.9, 0.6]} castShadow><boxGeometry args={[0.3, 0.25, 0.25]} />{m}</mesh>
      <Eyes y={2.1} z={0.56} w={0.15} />
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.3, 0.5, 0.45]} castShadow><boxGeometry args={[0.22, 1.0, 0.3]} />{m}</mesh>)}
    </group>,
    // Ya'uq: a horse
    <group key={3}>
      <mesh position={[0, 0.9, 0]} castShadow><boxGeometry args={[0.8, 1.8, 0.8]} />{m}</mesh>
      <mesh position={[0, 2.1, 0.15]} rotation={[0.35, 0, 0]} castShadow><cylinderGeometry args={[0.25, 0.35, 1.2, 8]} />{m}</mesh>
      <mesh position={[0, 2.75, 0.45]} rotation={[1.0, 0, 0]} castShadow><boxGeometry args={[0.36, 0.8, 0.4]} />{m}</mesh>
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.12, 3.0, 0.2]} castShadow><coneGeometry args={[0.07, 0.25, 5]} />{m}</mesh>)}
      <Eyes y={2.85} z={0.55} w={0.19} />
    </group>,
    // Nasr: an eagle
    <group key={4}>
      <mesh position={[0, 0.6, 0]} castShadow><cylinderGeometry args={[0.45, 0.55, 1.2, 8]} />{m}</mesh>
      <mesh position={[0, 1.7, 0]} scale={[1, 1.4, 0.9]} castShadow><sphereGeometry args={[0.5, 10, 8]} />{m}</mesh>
      <mesh position={[0, 2.55, 0.1]} castShadow><sphereGeometry args={[0.3, 10, 8]} />{m}</mesh>
      <mesh position={[0, 2.48, 0.42]} rotation={[Math.PI / 2 + 0.3, 0, 0]} castShadow><coneGeometry args={[0.1, 0.3, 6]} />{m}</mesh>
      <Eyes y={2.62} z={0.25} w={0.13} />
      {[-1, 1].map((s) => <mesh key={s} position={[s * 0.85, 2.0, -0.1]} rotation={[0, 0, s * -0.5]} castShadow><boxGeometry args={[1.2, 0.18, 0.6]} />{m}</mesh>)}
    </group>,
  ][kind];
  return (
    <group position={[x, 0.5, 0]}>
      <mesh position={[0, -0.05, 0]} castShadow receiveShadow><boxGeometry args={[1.3, 0.3, 1.3]} />{m}</mesh>
      <group position={[0, 0.1, 0]}>{shape}</group>
    </group>
  );
};

/** Wadd, Suwa', Yaghuts, Ya'uq and Nasr on one platform. */
export const Idols: FC<{ z?: number; s?: number }> = ({ z = -3, s = 1 }) => {
  const tex = useTex().stone;
  return (
    <group position={[0, 0, z]} scale={s}>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow><boxGeometry args={[9.4, 0.5, 2.4]} /><Mat c="#8a7f72" r={1} map={tex} /></mesh>
      {[0, 1, 2, 3, 4].map((k) => <Idol key={k} kind={k} x={(k - 2) * 1.8} tex={tex} />)}
    </group>
  );
};

/* ---------- light, sun, dust ---------- */

const add = (map: THREE.Texture) => ({ map, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }) as const;

/** The presence of Nabi Nuh: warm light and drifting motes, never a body. */
export const Glow: FC<{ x: number; z: number; o?: number; s?: number }> = ({ x, z, o = 1, s = 1 }) => {
  const f = useCurrentFrame();
  const tex = useTex().glow;
  const pulse = 1 + Math.sin(f / 18) * 0.05;
  return (
    <group position={[x, 1.3, z]} scale={s}>
      <pointLight color="#ffd98a" intensity={18 * o} distance={10} decay={1.5} />
      <sprite scale={[3.6 * pulse, 4.4 * pulse, 1]}><spriteMaterial {...add(tex)} opacity={o} /></sprite>
      <sprite scale={[1.4, 1.8, 1]}><spriteMaterial {...add(tex)} opacity={o} color="#fffbe8" /></sprite>
      {Array.from({ length: 18 }, (_, i) => {
        const a = i * 2.4 + f * 0.02, r = 0.5 + rand(i) * 0.9, y = ((f * 0.008 + rand(i + 5)) % 1) * 2.4 - 0.9;
        return <sprite key={i} position={[Math.cos(a) * r, y, Math.sin(a) * r]} scale={0.12}><spriteMaterial {...add(tex)} opacity={o * (1 - Math.abs(y) / 1.5)} /></sprite>;
      })}
    </group>
  );
};

/** A sun disc far away in the sky (dawn and dusk). */
export const SunDisc: FC<{ pos: V3; color: string; size?: number }> = ({ pos, color, size = 14 }) => {
  const tex = useTex().glow;
  return (
    <group position={pos}>
      <sprite scale={size * 2.4}><spriteMaterial {...add(tex)} color={color} opacity={0.8} /></sprite>
      <sprite scale={size * 0.6}><spriteMaterial {...add(tex)} color="#fff6e0" /></sprite>
    </group>
  );
};

/** Dust hanging in the light. */
export const Dust: FC<{ n?: number }> = ({ n = 50 }) => {
  const f = useCurrentFrame();
  const tex = useTex().glow;
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const x = -5 + rand(i) * 10 + ((f * 0.004 * (0.5 + rand(i + 3))) % 1) * 1.5, y = 0.3 + rand(i + 7) * 3.5 + Math.sin(f / 40 + i) * 0.15, z = -4 + rand(i + 11) * 10;
        return <sprite key={i} position={[x, y, z]} scale={0.05 + rand(i + 2) * 0.05}><spriteMaterial {...add(tex)} opacity={0.35} /></sprite>;
      })}
    </>
  );
};

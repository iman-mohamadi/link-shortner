"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

/* ─────────────────────────────────────────────────────────────────────────────
   Vertex — full-screen quad, pass through UV.
───────────────────────────────────────────────────────────────────────────── */
const VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

/* ─────────────────────────────────────────────────────────────────────────────
   Fragment — high-viscosity fluid with chromatic aberration + film grain.

   Design intent:
   • Multi-octave FBM with a rotation matrix every octave → isotropic, organic
   • Two-layer domain warp → complex, non-repeating flow
   • Per-channel UV offsets (radial) → chromatic aberration at screen edges
   • High-frequency hash noise → film-grain texture overlay
   • Soft vignette → darkness at edges, energy at centre
   • Time scale ~0.006 → barely perceptible movement; purely ambient
───────────────────────────────────────────────────────────────────────────── */
const FRAG = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform float u_time;
  uniform vec2  u_res;
  uniform vec2  u_mouse;
  uniform float u_intensity;

  /* ── Hash / Noise ──────────────────────────────────────────────────────── */
  float hash21(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(in vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i),              hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  /* 5-octave FBM with a per-octave rotation for isotropy */
  float fbm(vec2 p) {
    float v   = 0.0;
    float amp = 0.52;
    /* slight rotation matrix — kills axis-aligned banding */
    mat2 rot  = mat2(0.809, 0.588, -0.588, 0.809);
    for (int i = 0; i < 5; i++) {
      v   += amp * noise(p);
      p    = rot * p * 2.05;
      amp *= 0.46;
    }
    return v;
  }

  /* ── RizO Palette — electric violet / purple ───────────────────────────── */
  const vec3 BASE   = vec3(0.018, 0.014, 0.026); /* near-black, cool-violet tint */
  const vec3 DEEP   = vec3(0.10,  0.06,  0.30);  /* deep indigo-violet           */
  const vec3 VIOLET = vec3(0.30,  0.15,  0.68);  /* electric violet              */
  const vec3 PURPLE = vec3(0.44,  0.20,  0.80);  /* vivid purple                 */
  const vec3 SOFT   = vec3(0.22,  0.18,  0.55);  /* muted blue-violet            */

  vec3 palette(float t) {
    vec3 col = BASE;
    col = mix(col,   DEEP,   smoothstep(0.00, 0.25, t));
    col = mix(col,   SOFT,   smoothstep(0.18, 0.42, t));
    col = mix(col,   VIOLET, smoothstep(0.32, 0.68, t));
    col = mix(col,   PURPLE, smoothstep(0.60, 0.92, t));
    col = mix(col,   VIOLET * 1.12, smoothstep(0.86, 1.00, t));
    return col;
  }

  void main() {
    vec2 uv = vUv;                                        /* [0,1]            */
    vec2 p  = (gl_FragCoord.xy - 0.5 * u_res) / u_res.y; /* aspect-corrected */

    /* Extremely slow drift */
    float t = u_time * 0.006;

    /* Whisper-quiet mouse parallax */
    p += u_mouse * 0.038;

    /* ── Two-layer domain warp ──────────────────────────────────────────── */
    vec2 q = vec2(
      fbm(p               + vec2(0.0, 0.0) + t),
      fbm(p               + vec2(5.2, 1.3) - t * 0.75)
    );
    vec2 r = vec2(
      fbm(p + 2.6 * q + vec2(1.7,  9.2) + t * 0.55),
      fbm(p + 2.6 * q + vec2(8.3,  2.8) - t * 0.45)
    );
    float f = fbm(p + 2.2 * r + t * 0.35);

    /* Flow value — smooth remap to [0,1] */
    float flow = smoothstep(0.26, 0.94, f + 0.32 * r.x + 0.16 * q.y);

    /* ── Chromatic aberration (radial, screen-edge only) ────────────────── */
    vec2  centered  = uv - vec2(0.5);
    float radial    = length(centered);
    vec2  radialDir = radial > 0.001 ? normalize(centered) : vec2(0.0);
    float aberStr   = 0.042 * radial * radial;          /* grows toward edges */

    /* Offset the palette lookup for R and B channels */
    float flowR = clamp(flow + aberStr * 1.8, 0.0, 1.0);
    float flowB = clamp(flow - aberStr * 1.4, 0.0, 1.0);

    vec3 colG = palette(flow);
    vec3 col  = vec3(palette(flowR).r, colG.g, palette(flowB).b);

    /* ── Brightness envelope ────────────────────────────────────────────── */
    float brightness = (0.24 + 0.22 * u_intensity) * flow;
    col *= brightness;

    /* ── Vignette — pulls edges to near-black ───────────────────────────── */
    float vig = smoothstep(1.80, 0.02, length(p));
    col *= 0.48 + 0.52 * vig;

    /* ── Film grain — physical texture overlay ──────────────────────────── */
    float grain = (hash21(uv * 1379.0 + fract(t * 64.0)) - 0.5) * 0.022;
    col += grain;

    gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
  }
`

interface Props {
  intensity?: number
  className?: string
}

export function LiquidBackground({ intensity = 1.0, className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: false,
        alpha: false,
        powerPreference: "low-power",
      })
    } catch {
      return
    }

    const dpr = Math.min(window.devicePixelRatio, 1.5)
    renderer.setPixelRatio(dpr)
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene    = new THREE.Scene()
    const camera   = new THREE.Camera()
    const uniforms = {
      u_time:      { value: 0.0 },
      u_res:       { value: new THREE.Vector2(mount.clientWidth * dpr, mount.clientHeight * dpr) },
      u_mouse:     { value: new THREE.Vector2(0.0, 0.0) },
      u_intensity: { value: intensity },
    }

    const material = new THREE.ShaderMaterial({
      vertexShader:   VERT,
      fragmentShader: FRAG,
      uniforms,
    })

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    scene.add(mesh)

    /* Mouse parallax — very gentle lerp target */
    const target = new THREE.Vector2(0.0, 0.0)
    const onMove  = (e: MouseEvent) => {
      target.set(
         (e.clientX / window.innerWidth)  * 2.0 - 1.0,
        -((e.clientY / window.innerHeight) * 2.0 - 1.0),
      )
    }
    window.addEventListener("mousemove", onMove, { passive: true })

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      uniforms.u_res.value.set(w * dpr, h * dpr)
    }
    window.addEventListener("resize", onResize, { passive: true })

    let raf   = 0
    let start = 0.0
    const render = (now: number) => {
      if (!start) start = now
      if (!reduceMotion) uniforms.u_time.value = (now - start) / 1000.0

      /* Extra-slow mouse lerp — a whisper of parallax */
      uniforms.u_mouse.value.lerp(target, 0.018)
      renderer.render(scene, camera)

      if (!reduceMotion) raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("resize", onResize)
      mesh.geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement)
      }
    }
  }, [intensity])

  return (
    <div
      ref={mountRef}
      aria-hidden
      className={className ?? "pointer-events-none fixed inset-0 -z-10"}
    />
  )
}

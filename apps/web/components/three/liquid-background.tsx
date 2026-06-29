"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

/* Domain-warped fbm noise mapped through a single indigo accent — clean + visible. */
const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float u_time;
  uniform vec2  u_res;
  uniform vec2  u_mouse;
  uniform float u_intensity;

  vec3 hash3(vec2 p){
    vec3 q = vec3(dot(p,vec2(127.1,311.7)),
                  dot(p,vec2(269.5,183.3)),
                  dot(p,vec2(419.2,371.9)));
    return fract(sin(q)*43758.5453);
  }

  float noise(in vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f*f*(3.0-2.0*f);
    float a = hash3(i+vec2(0.0,0.0)).x;
    float b = hash3(i+vec2(1.0,0.0)).x;
    float c = hash3(i+vec2(0.0,1.0)).x;
    float d = hash3(i+vec2(1.0,1.0)).x;
    return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
  }

  float fbm(vec2 p){
    float v = 0.0;
    float amp = 0.5;
    for(int i=0;i<6;i++){
      v += amp*noise(p);
      p *= 2.0;
      amp *= 0.5;
    }
    return v;
  }

  // Single indigo accent ramp: dark base -> indigo -> light indigo.
  const vec3 BASE   = vec3(0.031, 0.035, 0.047); // near-black canvas
  const vec3 ACCENT = vec3(0.388, 0.400, 0.945); // #6366f1
  const vec3 ACCENT_HI = vec3(0.506, 0.549, 0.972); // #818cf8

  void main(){
    vec2 uv = (gl_FragCoord.xy - 0.5*u_res) / u_res.y;
    float t = u_time * 0.05;

    vec2 m = u_mouse * 0.35;
    uv += m;

    // Domain warping for the liquid feel.
    vec2 q = vec2(fbm(uv + t), fbm(uv + vec2(5.2,1.3) - t));
    vec2 r = vec2(fbm(uv + 4.0*q + vec2(1.7,9.2) + 0.15*t),
                  fbm(uv + 4.0*q + vec2(8.3,2.8) - 0.13*t));
    float f = fbm(uv + 4.0*r);

    // Shape the noise into visible flowing bands.
    float flow = smoothstep(0.25, 0.95, f + 0.5*r.x + 0.25*q.y);

    // Blend the two indigo tones, then lift off the dark base — clearly visible.
    vec3 accent = mix(ACCENT, ACCENT_HI, smoothstep(0.4, 1.0, flow));
    vec3 col = BASE + accent * (0.42 + 0.30*u_intensity) * flow;

    // Soft vignette keeps focus toward the centre.
    float vig = smoothstep(1.45, 0.15, length(uv));
    col *= 0.45 + 0.55*vig;

    gl_FragColor = vec4(col, 1.0);
  }
`

interface Props {
  intensity?: number
  className?: string
}

export function LiquidBackground({ intensity = 1, className }: Props) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, powerPreference: "high-performance" })
    } catch {
      return // CSS gradient fallback (body background) stays visible
    }

    const dpr = Math.min(window.devicePixelRatio, 1.75)
    renderer.setPixelRatio(dpr)
    renderer.setSize(mount.clientWidth, mount.clientHeight)
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.Camera()

    const uniforms = {
      u_time: { value: 0 },
      u_res: { value: new THREE.Vector2(mount.clientWidth * dpr, mount.clientHeight * dpr) },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_intensity: { value: intensity },
    }

    const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms })
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material)
    scene.add(mesh)

    const target = new THREE.Vector2(0, 0)
    const onMove = (e: MouseEvent) => {
      target.set((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
    }
    window.addEventListener("mousemove", onMove)

    const onResize = () => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      renderer.setSize(w, h)
      uniforms.u_res.value.set(w * dpr, h * dpr)
    }
    window.addEventListener("resize", onResize)

    let raf = 0
    let start = 0
    const render = (now: number) => {
      if (!start) start = now
      uniforms.u_time.value = reduce ? 4.0 : (now - start) / 1000
      uniforms.u_mouse.value.lerp(target, 0.04)
      renderer.render(scene, camera)
      if (!reduce) raf = requestAnimationFrame(render)
    }
    raf = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("mousemove", onMove)
      window.removeEventListener("resize", onResize)
      mesh.geometry.dispose()
      material.dispose()
      renderer.dispose()
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement)
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

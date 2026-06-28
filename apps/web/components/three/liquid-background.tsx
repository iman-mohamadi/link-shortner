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

/* Domain-warped fbm noise mapped through an oil-slick cosine palette. */
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

  // Inigo Quilez cosine palette — tuned to cyan/azure/violet/magenta/amber.
  vec3 palette(float t){
    vec3 a = vec3(0.46, 0.42, 0.55);
    vec3 b = vec3(0.42, 0.40, 0.45);
    vec3 c = vec3(1.00, 1.00, 1.00);
    vec3 d = vec3(0.10, 0.55, 0.85);
    return a + b*cos(6.28318*(c*t+d));
  }

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

    float tone = f + 0.6*r.x + 0.3*q.y;
    vec3 col = palette(tone + 0.15*t);

    // Deep charcoal base, iridescence rides on top.
    vec3 base = vec3(0.043, 0.051, 0.071);
    col = base + col * (0.10 + 0.16*u_intensity) * smoothstep(0.1, 1.0, f);

    // subtle vignette
    float vig = smoothstep(1.25, 0.2, length(uv));
    col *= 0.55 + 0.45*vig;

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
    const clock = new THREE.Clock()
    const render = () => {
      uniforms.u_time.value = reduce ? 4.0 : clock.getElapsedTime()
      uniforms.u_mouse.value.lerp(target, 0.04)
      renderer.render(scene, camera)
      if (!reduce) raf = requestAnimationFrame(render)
    }
    render()

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

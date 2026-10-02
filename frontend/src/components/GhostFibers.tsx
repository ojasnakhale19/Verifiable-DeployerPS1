import { useEffect, useRef } from 'react';
import { Mesh, Program, Renderer, Triangle } from 'ogl';
import './GhostFibers.css';

interface GhostFibersProps {
  lineColor?: string;
  glowColor?: string;
  speed?: number;
  scale?: number;
  rotation?: number;
  rotationSpeed?: number;
  layers?: number;
  waveAmplitude?: number;
  waveFrequency?: number;
  waveSpeed?: number;
  layerSpeed?: number;
  twist?: number;
  twistFrequency?: number;
  twistSpeed?: number;
  lineFrequency?: number;
  lineSpacing?: number;
  lineSharpness?: number;
  glowFalloff?: number;
  glowIntensity?: number;
  brightness?: number;
  blueBoost?: number;
  vignette?: number;
  grain?: number;
  lightMode?: boolean;
  dpr?: number;
  fps?: number;
  paused?: boolean;
  className?: string;
}

const hexToRgb = (hex: string): [number, number, number] => {
  const value = hex.trim().replace(/^#/, '');
  const normalized = value.length === 3 ? value.replace(/./g, (c) => c + c) : value;
  const match = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  if (!match) return [1, 1, 1];
  return [
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255,
  ];
};

const setColor = (uniform: { value: Float32Array }, hex: string) => {
  const [r, g, b] = hexToRgb(hex);
  uniform.value[0] = r;
  uniform.value[1] = g;
  uniform.value[2] = b;
};

const vertex = /* glsl */`#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}`;

const fragment = /* glsl */`#version 300 es
precision highp float;
uniform vec2 uResolution;
uniform float uTime;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uLayers;
uniform float uWaveAmplitude;
uniform float uWaveFrequency;
uniform float uWaveSpeed;
uniform float uLayerSpeed;
uniform float uTwist;
uniform float uTwistFrequency;
uniform float uTwistSpeed;
uniform float uLineFrequency;
uniform float uLineSpacing;
uniform float uLineSharpness;
uniform float uGlowFalloff;
uniform float uGlowIntensity;
uniform float uBrightness;
uniform float uBlueBoost;
uniform float uVignette;
uniform float uGrain;
uniform float uRotationSpeed;
uniform float uLightMode;
uniform vec3 uLineColor;
uniform vec3 uGlowColor;
out vec4 fragColor;
#define MAX_LAYERS 10

mat2 rotate2d(float angle) {
  float s = sin(angle); float c = cos(angle);
  return mat2(c, -s, s, c);
}
float grainHash(vec2 p) {
  p = floor(p);
  return fract(52.9829189 * fract(dot(p, vec2(0.065, 0.005))));
}
float layeredGrain(vec2 fp) {
  vec2 pt = mod(fp + vec2(uTime*30.0, -uTime*21.0), 1024.0);
  vec2 r = mat2(0.8,-0.5,0.5,0.8)*pt;
  float g = 0.0;
  g += 0.40*grainHash(r);
  g += 0.25*grainHash(r*2.0+17.0);
  g += 0.20*grainHash(r*4.0+47.0);
  g += 0.10*grainHash(r*8.0+113.0);
  g += 0.05*grainHash(r*16.0+191.0);
  return g;
}
void main() {
  vec2 res = max(uResolution, vec2(1.0));
  vec2 uv = (2.0*gl_FragCoord.xy - res) / res.y;
  float time = uTime * uSpeed;
  vec3 backdrop = mix(vec3(0.070588,0.058824,0.090196), vec3(1.0), step(0.5,uLightMode));
  vec3 centerTone = max(uLineColor*0.85567 - uGlowColor*0.06186, vec3(0.0));
  vec3 cloudTone  = uLineColor*0.19588 + uGlowColor*0.2268;
  vec2 p = uv / max(uScale,0.05);
  p = rotate2d(radians(uRotation) + time*uRotationSpeed)*p;
  vec3 color = vec3(0.0);
  float fiberField = 0.0;
  for (int i = 0; i < MAX_LAYERS; i++) {
    float fi = float(i)+1.0;
    if (fi > uLayers) break;
    p += uWaveAmplitude*sin(p.yx*fi*uWaveFrequency + time*(uWaveSpeed+fi*uLayerSpeed));
    float rad = length(p);
    float ang = atan(p.y,p.x) + sin(rad*uTwistFrequency - time*uTwistSpeed+fi)*uTwist;
    p = vec2(cos(ang),sin(ang))*rad;
    float lines = pow(max(0.0, 1.0-abs(sin(p.x*(uLineFrequency+fi*uLineSpacing)+sin(p.y*3.0+time)))), uLineSharpness);
    fiberField += lines/fi;
    color += uLineColor*lines/fi;
    color += uGlowColor*exp(-uGlowFalloff*abs(sin(p.x*3.0+time+fi)))*uGlowIntensity/(fi*2.0);
  }
  color += centerTone*exp(-2.2*dot(uv,uv));
  color += cloudTone*exp(-1.5*length(uv+vec2(sin(time*0.3)*0.25,cos(time*0.25)*0.18)));
  float vig = 1.0-smoothstep(0.35,1.45,length(uv));
  color *= mix(1.0-uVignette,1.0,vig);
  color = 1.0-exp(-color*uBrightness);
  color.b *= uBlueBoost;
  vec3 out_color;
  if (uLightMode > 0.5) {
    float ef = mix(1.0-uVignette,1.0,vig);
    float fibers = pow(smoothstep(0.12,1.05,fiberField)*ef,1.5);
    float atm = (exp(-2.2*dot(uv,uv))*0.025 + exp(-1.5*length(uv+vec2(sin(time*0.3)*0.25,cos(time*0.25)*0.18)))*0.015)*ef;
    out_color = mix(backdrop, mix(backdrop,uGlowColor,0.16), atm);
    out_color = mix(out_color, mix(backdrop,uLineColor,0.52), fibers*0.3);
  } else {
    out_color = backdrop + color;
  }
  out_color = clamp(out_color + (layeredGrain(gl_FragCoord.xy)-0.5)*uGrain, 0.0, 1.0);
  fragColor = vec4(out_color, 1.0);
}`;

type ContextEntry = {
  renderer: Renderer;
  program: Program;
  render: () => void;
  setPaused: (v: boolean) => void;
  setFps: (v: number) => void;
};

const contexts = new WeakMap<HTMLElement, ContextEntry>();

const GhostFibers: React.FC<GhostFibersProps> = ({
  lineColor = '#140E35', glowColor = '#3437A0',
  speed = 0.2, scale = 2, rotation = 0, rotationSpeed = 0.25,
  layers = 4, waveAmplitude = 0.015, waveFrequency = 3,
  waveSpeed = 0.15, layerSpeed = 0.08, twist = 0.1,
  twistFrequency = 5, twistSpeed = 1.2, lineFrequency = 5,
  lineSpacing = 2, lineSharpness = 16, glowFalloff = 10,
  glowIntensity = 1.6, brightness = 2, blueBoost = 1.25,
  vignette = 0.8, grain = 0.05, lightMode = false,
  dpr = 1, fps = 60, paused = false, className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new Renderer({ webgl: 2, alpha: false, antialias: false, dpr: Math.min(Math.max(dpr, 0.5), 2) });
    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = '100%'; canvas.style.height = '100%'; canvas.style.display = 'block';
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex, fragment,
      uniforms: {
        uResolution:     { value: new Float32Array([1,1]) },
        uTime:           { value: 0 },
        uSpeed:          { value: 0.2 },
        uScale:          { value: 2 },
        uRotation:       { value: 0 },
        uRotationSpeed:  { value: 0.25 },
        uLayers:         { value: 4 },
        uWaveAmplitude:  { value: 0.015 },
        uWaveFrequency:  { value: 3 },
        uWaveSpeed:      { value: 0.15 },
        uLayerSpeed:     { value: 0.08 },
        uTwist:          { value: 0.1 },
        uTwistFrequency: { value: 5 },
        uTwistSpeed:     { value: 1.2 },
        uLineFrequency:  { value: 5 },
        uLineSpacing:    { value: 2 },
        uLineSharpness:  { value: 16 },
        uGlowFalloff:    { value: 10 },
        uGlowIntensity:  { value: 1.6 },
        uBrightness:     { value: 2 },
        uBlueBoost:      { value: 1.25 },
        uVignette:       { value: 0.8 },
        uGrain:          { value: 0.05 },
        uLightMode:      { value: 0 },
        uLineColor:      { value: new Float32Array(hexToRgb('#140E35')) },
        uGlowColor:      { value: new Float32Array(hexToRgb('#3437A0')) },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    let frameId = 0, elapsed = 0, previousTime = performance.now();
    let lastRenderTime = 0, frameRate = 60, isPaused = false;
    let isVisible = true, isPageVisible = !document.hidden;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    const render = () => renderer.render({ scene: mesh });
    const stop = () => { if (frameId) cancelAnimationFrame(frameId); frameId = 0; };
    const canAnimate = () => isVisible && isPageVisible && !isPaused && !reducedMotion.matches;

    const loop = (now: number) => {
      frameId = 0;
      if (!canAnimate()) return;
      const delta = Math.min((now - previousTime) / 1000, 0.1);
      previousTime = now; elapsed += delta;
      if (now - lastRenderTime >= 1000 / frameRate - 0.5) {
        program.uniforms.uTime.value = elapsed;
        render(); lastRenderTime = now;
      }
      frameId = requestAnimationFrame(loop);
    };
    const start = () => {
      if (!canAnimate() || frameId) return;
      previousTime = performance.now();
      frameId = requestAnimationFrame(loop);
    };
    const setSize = () => {
      const rect = container.getBoundingClientRect();
      renderer.setSize(Math.max(1, Math.floor(rect.width)), Math.max(1, Math.floor(rect.height)));
      program.uniforms.uResolution.value[0] = gl.drawingBufferWidth;
      program.uniforms.uResolution.value[1] = gl.drawingBufferHeight;
      render();
    };

    const handleVisibility = () => { isPageVisible = !document.hidden; canAnimate() ? start() : stop(); };
    const handleRM = () => { canAnimate() ? start() : (stop(), render()); };

    const ro = new ResizeObserver(setSize);
    ro.observe(container);
    const io = new IntersectionObserver(([e]) => { isVisible = e.isIntersecting; canAnimate() ? start() : stop(); }, { threshold: 0 });
    io.observe(container);
    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotion.addEventListener('change', handleRM);

    contexts.set(container, {
      renderer, program, render,
      setPaused(v) { isPaused = v; canAnimate() ? start() : (stop(), render()); },
      setFps(v) { frameRate = Math.min(Math.max(v, 1), 120); },
    });

    setSize(); start();

    return () => {
      stop(); ro.disconnect(); io.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotion.removeEventListener('change', handleRM);
      contexts.delete(container);
      if (canvas.parentNode === container) container.removeChild(canvas);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [dpr]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ctx = contexts.get(container);
    if (!ctx) return;
    const u = ctx.program.uniforms;
    setColor(u.uLineColor, lineColor); setColor(u.uGlowColor, glowColor);
    u.uSpeed.value = speed; u.uScale.value = scale; u.uRotation.value = rotation;
    u.uRotationSpeed.value = rotationSpeed;
    u.uLayers.value = Math.min(Math.max(Math.round(layers), 1), 10);
    u.uWaveAmplitude.value = waveAmplitude; u.uWaveFrequency.value = waveFrequency;
    u.uWaveSpeed.value = waveSpeed; u.uLayerSpeed.value = layerSpeed;
    u.uTwist.value = twist; u.uTwistFrequency.value = twistFrequency; u.uTwistSpeed.value = twistSpeed;
    u.uLineFrequency.value = lineFrequency; u.uLineSpacing.value = lineSpacing; u.uLineSharpness.value = lineSharpness;
    u.uGlowFalloff.value = glowFalloff; u.uGlowIntensity.value = glowIntensity;
    u.uBrightness.value = brightness; u.uBlueBoost.value = blueBoost;
    u.uVignette.value = vignette; u.uGrain.value = grain;
    u.uLightMode.value = lightMode ? 1 : 0;
    ctx.setFps(fps); ctx.setPaused(paused); ctx.render();
  }, [
    lineColor, glowColor, speed, scale, rotation, rotationSpeed, layers,
    waveAmplitude, waveFrequency, waveSpeed, layerSpeed, twist, twistFrequency,
    twistSpeed, lineFrequency, lineSpacing, lineSharpness, glowFalloff,
    glowIntensity, brightness, blueBoost, vignette, grain, lightMode, fps, paused, dpr,
  ]);

  return <div ref={containerRef} className={`ghost-fibers-container${className ? ` ${className}` : ''}`} />;
};

export default GhostFibers;

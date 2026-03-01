import type { OGLRenderingContext } from "ogl";

import { Color, Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;
uniform float uLightMode;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
    0.211324865405187,
    0.366025403784439,
    -0.577350269189626,
    0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);
  vec3 p = permute(
    permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );
  vec3 m = max(
    0.5 - vec3(
      dot(x0, x0),
      dot(x12.xy, x12.xy),
      dot(x12.zw, x12.zw)
    ),
    0.0
  );
  m = m * m;
  m = m * m;
  vec3 x_ = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x_) - 0.5;
  vec3 ox = floor(x_ + 0.5);
  vec3 a0 = x_ - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) { \\
  int index = 0; \\
  for (int i = 0; i < 2; i++) { \\
    ColorStop currentColor = colors[i]; \\
    bool isInBetween = currentColor.position <= factor; \\
    index = int(mix(float(index), float(i), float(isInBetween))); \\
  } \\
  ColorStop currentColor = colors[index]; \\
  ColorStop nextColor = colors[index + 1]; \\
  float range = nextColor.position - currentColor.position; \\
  float lerpFactor = (factor - currentColor.position) / range; \\
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \\
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  // In dark mode: intensity darkens the color (black → colored transition)
  // In light mode: use ramp color directly (colored → transparent, no dark areas)
  vec3 auroraColor = uLightMode > 0.5 ? rampColor : intensity * rampColor;
  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`;

interface AuroraProps {
  amplitude?: number;
  blend?: number;
  blendMode?: React.CSSProperties["mixBlendMode"];
  colorStops?: [string, string, string];
  lightMode?: boolean;
  speed?: number;
}

const colorStopsToArray = (stops: string[]) =>
  stops.map((hex) => {
    const c = new Color(hex);
    return [c.r, c.g, c.b];
  });

const setupGlContext = () => {
  const renderer = new Renderer({ alpha: true, antialias: true, premultipliedAlpha: true });
  const { gl } = renderer;
  gl.clearColor(0, 0, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.canvas.style.backgroundColor = "transparent";

  const geometry = new Triangle(gl);
  if (geometry.attributes.uv != null) {
    geometry.attributes.uv = undefined as unknown as Partial<import("ogl").Attribute>;
  }

  return { geometry, gl, renderer };
};

const createAuroraProgram = (
  gl: OGLRenderingContext,
  ctn: HTMLDivElement,
  opts: { amplitude: number; blend: number; colorStops: string[]; lightMode: boolean }
) =>
  new Program(gl, {
    fragment: FRAG,
    uniforms: {
      uAmplitude: { value: opts.amplitude },
      uBlend: { value: opts.blend },
      uColorStops: { value: colorStopsToArray(opts.colorStops) },
      uLightMode: { value: opts.lightMode ? 1 : 0 },
      uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
      uTime: { value: 0 },
    },
    vertex: VERT,
  });

const mountAuroraScene = (
  ctn: HTMLDivElement,
  renderer: Renderer,
  gl: OGLRenderingContext,
  geometry: Triangle,
  program: Program,
  propsRef: React.RefObject<{
    amplitude: number;
    blend: number;
    colorStops: string[];
    lightMode: boolean;
    speed: number;
  }>
) => {
  const mesh = new Mesh(gl, { geometry, program });

  const resize = () => {
    renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
    program.uniforms.uResolution.value = [ctn.offsetWidth, ctn.offsetHeight];
  };

  window.addEventListener("resize", resize);
  ctn.append(gl.canvas);

  // Transition duration in ms — matches the CSS `transition-colors duration-300`
  const LERP_DURATION = 300;

  // Current interpolated values (start at the initial uniform values)
  let currentStops: number[][] = program.uniforms.uColorStops.value as number[][];
  let targetStops: number[][] = currentStops;
  let currentLightMode: number = program.uniforms.uLightMode.value as number;
  let targetLightMode: number = currentLightMode;

  let transitionStart = 0;
  let cachedStopsKey = program.uniforms.uColorStops.value.toString();

  const lerpChannel = (a: number, b: number, t: number) => a + (b - a) * t;

  const lerpStops = (from: number[][], to: number[][], t: number): number[][] =>
    from.map((stop, i) => stop.map((ch, j) => lerpChannel(ch, to[i][j], t)));

  let animateId = 0;
  const update = (t: number) => {
    animateId = requestAnimationFrame(update);
    const p = propsRef.current;
    program.uniforms.uTime.value = t * 0.01 * p.speed * 0.1;
    program.uniforms.uAmplitude.value = p.amplitude;
    program.uniforms.uBlend.value = p.blend;

    // Detect color stop or lightMode changes and start a transition
    const stopsKey = p.colorStops.join();
    const newLightMode = p.lightMode ? 1 : 0;

    if (stopsKey !== cachedStopsKey || newLightMode !== targetLightMode) {
      cachedStopsKey = stopsKey;
      // Snapshot current interpolated values as the new "from"
      currentStops = program.uniforms.uColorStops.value as number[][];
      currentLightMode = program.uniforms.uLightMode.value as number;
      targetStops = colorStopsToArray(p.colorStops);
      targetLightMode = newLightMode;
      transitionStart = t;
    }

    const elapsed = t - transitionStart;
    const progress = Math.min(elapsed / LERP_DURATION, 1);
    // Ease-out curve for a smooth deceleration
    const eased = 1 - (1 - progress) ** 2;

    program.uniforms.uColorStops.value = lerpStops(currentStops, targetStops, eased);
    program.uniforms.uLightMode.value = lerpChannel(currentLightMode, targetLightMode, eased);

    renderer.render({ scene: mesh });
  };

  animateId = requestAnimationFrame(update);
  resize();

  return () => {
    cancelAnimationFrame(animateId);
    window.removeEventListener("resize", resize);
    if (gl.canvas.parentNode) {
      gl.canvas.remove();
    }
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };
};

export const Aurora = ({
  colorStops = ["#3D2D6B", "#5F4B8B", "#7B68AE"],
  amplitude = 1,
  blend = 0.5,
  speed = 1,
  blendMode = "normal",
  lightMode = false,
}: AuroraProps) => {
  const propsRef = useRef({ amplitude, blend, colorStops, lightMode, speed });
  propsRef.current = { amplitude, blend, colorStops, lightMode, speed };

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctn = containerRef.current;
    if (!ctn) {
      return;
    }

    const { geometry, gl, renderer } = setupGlContext();
    const program = createAuroraProgram(gl, ctn, { amplitude, blend, colorStops, lightMode });

    return mountAuroraScene(ctn, renderer, gl, geometry, program, propsRef);
    // All prop updates are handled at runtime via propsRef inside the
    // animation loop, so the effect only needs to run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: "100%",
        left: 0,
        mixBlendMode: blendMode,
        pointerEvents: "none",
        position: "absolute",
        top: 0,
        width: "100%",
      }}
    />
  );
};

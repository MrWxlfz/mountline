export const liquidVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

export const liquidFragmentShader = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uBass;
  uniform float uMids;
  uniform float uTreble;
  uniform float uEnergy;
  uniform float uMode;
  uniform float uNextMode;
  uniform float uModeProgress;
  uniform float uTransition;
  uniform vec2 uPointer;
  uniform vec2 uResolution;
  uniform float uIntensity;
  uniform float uReducedMotion;
  uniform float uOpening;
  uniform float uParticleDensity;

  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);

    float a = hash21(cell);
    float b = hash21(cell + vec2(1.0, 0.0));
    float c = hash21(cell + vec2(0.0, 1.0));
    float d = hash21(cell + vec2(1.0, 1.0));

    return mix(mix(a, b, local.x), mix(c, d, local.x), local.y);
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.52;
    mat2 rotation = mat2(0.80, 0.60, -0.60, 0.80);

    for (int octave = 0; octave < 5; octave++) {
      value += amplitude * noise(point);
      point = rotation * point * 2.03 + 13.7;
      amplitude *= 0.48;
    }

    return value;
  }

  float sdSegment(vec2 point, vec2 a, vec2 b) {
    vec2 pa = point - a;
    vec2 ba = b - a;
    float projection = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * projection);
  }

  float mountlineMark(vec2 point) {
    float left = sdSegment(point, vec2(0.0, 0.42), vec2(-0.28, -0.31));
    float right = sdSegment(point, vec2(0.0, 0.42), vec2(0.28, -0.31));
    float base = sdSegment(point, vec2(-0.28, -0.31), vec2(0.28, -0.31));
    float stem = sdSegment(point, vec2(0.0, -0.42), vec2(0.0, 0.48));
    float arrowLeft = sdSegment(point, vec2(-0.105, 0.31), vec2(0.0, 0.48));
    float arrowRight = sdSegment(point, vec2(0.105, 0.31), vec2(0.0, 0.48));
    float distanceToMark = min(min(min(left, right), base), min(stem, min(arrowLeft, arrowRight)));
    return 1.0 - smoothstep(0.018, 0.034, distanceToMark);
  }

  float renderMode(float mode, float field, float secondary, vec2 point, float time) {
    float liquid = smoothstep(0.34 - uBass * 0.08, 0.67 + uTreble * 0.025, field);
    liquid = mix(liquid, smoothstep(0.43, 0.57, field), uEnergy * 0.52);

    float marbleBands = sin((field + secondary * 0.28) * 20.0 + time * 0.3);
    float marble = smoothstep(-0.34, 0.34, marbleBands);

    float ridge = 1.0 - smoothstep(0.012, 0.11, abs(field - 0.52));
    float chrome = pow(ridge, 2.15) * (0.62 + uTreble * 1.25);
    chrome += smoothstep(0.58, 0.77, secondary) * 0.16;
    chrome = clamp(chrome, 0.0, 1.0);

    float inkEdge = 0.48 + 0.1 * sin(secondary * 9.0 + time * 0.18);
    float ink = 1.0 - smoothstep(inkEdge - 0.05, inkEdge + 0.055, field);

    float contourField = field * (9.0 + uMids * 5.0);
    float contourDistance = abs(fract(contourField) - 0.5);
    float contours = 1.0 - smoothstep(0.035, 0.085, contourDistance);
    contours *= 0.54 + 0.46 * smoothstep(0.24, 0.74, secondary);

    vec2 particleCell = floor(gl_FragCoord.xy / mix(4.8, 2.4, uParticleDensity));
    float particleNoise = hash21(particleCell + floor(time * 1.7));
    float dissolution = smoothstep(0.37, 0.68, field + secondary * 0.16);
    float particles = step(0.84 - uTreble * 0.11, particleNoise) * dissolution;
    particles += liquid * 0.16;

    float result = liquid;
    if (mode > 0.5 && mode < 1.5) result = marble;
    else if (mode >= 1.5 && mode < 2.5) result = chrome;
    else if (mode >= 2.5 && mode < 3.5) result = ink;
    else if (mode >= 3.5 && mode < 4.5) result = contours;
    else if (mode >= 4.5 && mode < 5.5) result = particles;
    else if (mode >= 5.5) {
      float mark = mountlineMark(point);
      float aura = 1.0 - smoothstep(0.1, 0.62, length(point));
      result = max(mark, chrome * aura * 0.34);
    }

    return clamp(result, 0.0, 1.0);
  }

  void main() {
    vec2 uv = vUv;
    vec2 point = uv * 2.0 - 1.0;
    point.x *= uResolution.x / max(uResolution.y, 1.0);

    float motionScale = mix(1.0, 0.22, uReducedMotion);
    float time = uTime * motionScale;
    float intensity = uIntensity * mix(1.0, 0.52, uReducedMotion);
    vec2 pointerInfluence = uPointer * 0.11 * (1.0 - uReducedMotion);

    float transitionPull = smoothstep(0.08, 0.64, uTransition);
    point *= mix(1.0, 1.0 + transitionPull * 1.55, transitionPull);
    point += pointerInfluence * (1.0 - transitionPull);

    vec2 flowPoint = point * mix(0.94, 1.48, intensity);
    vec2 warpA = vec2(
      fbm(flowPoint * 0.72 + vec2(time * 0.052, -time * 0.031)),
      fbm(flowPoint * 0.72 + vec2(5.2, 1.3) - time * 0.044)
    );
    vec2 warpB = vec2(
      fbm(flowPoint + warpA * (1.7 + uMids * 1.6) + vec2(1.7, 8.4)),
      fbm(flowPoint - warpA * (1.3 + uBass * 1.8) + vec2(8.3, 2.8))
    );

    float radialPulse = sin(length(point) * 8.5 - time * 1.7) * uBass * 0.12;
    float field = fbm(
      flowPoint * 1.16 +
      warpA * (1.05 + intensity * 0.64) +
      warpB * (0.72 + uEnergy * 1.15) +
      radialPulse
    );
    float secondary = fbm(flowPoint * 2.25 - warpB * 0.78 + time * 0.027);

    float modeBlend = smoothstep(0.0, 0.28, uModeProgress);
    float currentMaterial = renderMode(uMode, field, secondary, point, time);
    float nextMaterial = renderMode(uNextMode, field, secondary, point, time);
    float material = mix(currentMaterial, nextMaterial, modeBlend);

    float logoTransition = smoothstep(0.34, 0.7, uTransition);
    float logoMaterial = renderMode(6.0, field, secondary, point, time);
    material = mix(material, logoMaterial, logoTransition);

    float openingReveal = smoothstep(0.02, 0.2, uOpening);
    float openingShape = 1.0 - smoothstep(0.05, 0.82, length(point - vec2(-0.08, 0.06)));
    material *= mix(openingShape * 0.18, 1.0, smoothstep(0.12, 0.56, uOpening));
    material *= openingReveal;

    float vignette = 1.0 - smoothstep(0.45, 1.62, length(point) * 0.72);
    material *= 0.72 + vignette * 0.28;

    float grain = hash21(gl_FragCoord.xy + fract(time) * 113.0) - 0.5;
    material += grain * (0.018 + uTreble * 0.026) * (1.0 - uReducedMotion * 0.7);

    float transitionFade = 1.0 - smoothstep(0.73, 0.9, uTransition);
    material *= transitionFade;
    gl_FragColor = vec4(vec3(clamp(material, 0.0, 1.0)), 1.0);
  }
`

/**
 * The Bramble shopfront: one illustrated scene of a made-up dog groomer, drawn once and framed
 * several ways, the way a photographer covers one location. It stands in for photography in the
 * design example and the Capture storyboard. It is not a photo, and Bramble is not a client.
 *
 * Scene units: 1600 × 1000. Light comes from the upper left, early in the day.
 */

export const SCENE = { width: 1600, height: 1000 } as const

/** Framings of the scene, as [x, y, width, height]. */
export const framings = {
  wide: [0, 0, 1600, 1000],
  front: [150, 90, 1300, 812],
  window: [318, 380, 540, 338],
  sign: [470, 150, 660, 412],
  welcome: [1070, 650, 440, 275],
  // Portrait crops, for tall photo slots on a phone.
  entrance: [880, 320, 520, 600],
  welcomeTall: [1110, 600, 300, 346],
  windowTall: [452, 404, 360, 415],
  signTall: [560, 140, 480, 554],
} as const

export type Framing = keyof typeof framings

const SCENE_ID = "bramble-storefront"

export function viewBoxFor(framing: Framing) {
  return framings[framing].join(" ")
}

/** One framing of the scene. Decorative: the surrounding figure carries the description. */
export function Storefront({ framing = "wide", className }: { framing?: Framing; className?: string }) {
  return (
    <svg className={className} viewBox={viewBoxFor(framing)} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <use href={`#${SCENE_ID}`} />
    </svg>
  )
}

/**
 * The scene behind a camera that can move. The frame keeps its own shape (`width` × `height`);
 * changing `framing` pans and zooms to cover that crop, animated by CSS where motion is allowed.
 */
export function StorefrontCamera({ framing, width, height, className }: { framing: Framing; width: number; height: number; className?: string }) {
  const [x, y, w, h] = framings[framing]
  const scale = Math.max(width / w, height / h)
  const tx = width / 2 / scale - (x + w / 2)
  const ty = height / 2 / scale - (y + h / 2)
  return (
    <svg className={className} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g className="bb-camera" style={{ transform: `scale(${round(scale)}) translate(${round(tx)}px, ${round(ty)}px)` }}>
        <use href={`#${SCENE_ID}`} />
      </g>
    </svg>
  )
}

const round = (value: number) => Math.round(value * 1000) / 1000

const cream = "#f4ead8"
const green = "#2c4636"
const greenDeep = "#213728"
const greenTrim = "#3d5a48"
const terracotta = "#c4613a"
const brass = "#c9a560"
const ink = "#2a221d"
const dog = "#f7f0e4"
const dogShade = "#e6d9c4"

function Scallops({ x0, x1, y, r }: { x0: number; x1: number; y: number; r: number }) {
  const count = Math.round((x1 - x0) / (r * 2))
  const step = (x1 - x0) / count
  let d = `M${x0} ${y}`
  for (let i = 0; i < count; i++) d += ` a${step / 2} ${r} 0 0 0 ${step} 0`
  return <path d={`${d} V${y - 2} H${x0} Z`} />
}

function Awning() {
  // A striped awning over the window, seen slightly from below.
  const top = { y: 330, x0: 296, x1: 874 }
  const bottom = { y: 424, x0: 266, x1: 904 }
  const stripes = 14
  const bands = Array.from({ length: stripes }, (_, i) => {
    const t0 = i / stripes
    const t1 = (i + 1) / stripes
    const tx = (t: number) => top.x0 + (top.x1 - top.x0) * t
    const bx = (t: number) => bottom.x0 + (bottom.x1 - bottom.x0) * t
    return <path key={i} d={`M${tx(t0)} ${top.y} L${tx(t1)} ${top.y} L${bx(t1)} ${bottom.y} L${bx(t0)} ${bottom.y} Z`} fill={i % 2 ? terracotta : "#efe2c9"} />
  })
  return (
    <g>
      {/* Shadow the awning throws down the glass and frame. */}
      <path d="M300 424 H870 L870 560 Q600 500 300 470 Z" fill="#0d1a12" opacity="0.22" />
      {bands}
      <path d={`M${top.x0} ${top.y} L${top.x1} ${top.y} L${bottom.x1} ${bottom.y} L${bottom.x0} ${bottom.y} Z`} fill="url(#bb-awning-shade)" />
      <g fill={terracotta}>
        <Scallops x0={bottom.x0} x1={bottom.x1} y={bottom.y + 22} r={14} />
      </g>
      <rect x={bottom.x0} y={bottom.y - 3} width={bottom.x1 - bottom.x0} height="8" fill="#a84f2e" />
      <rect x={top.x0 - 6} y={top.y - 6} width={top.x1 - top.x0 + 12} height="8" rx="3" fill={greenDeep} />
    </g>
  )
}

function Interior() {
  return (
    <g clipPath="url(#bb-glass-clip)">
      <rect x="318" y="378" width="534" height="394" fill="url(#bb-interior)" />
      {/* Pendant lamp and the pool of light under it. */}
      <circle cx="470" cy="560" r="230" fill="url(#bb-lamp-glow)" />
      <path d="M470 378 V470" stroke="#3a3129" strokeWidth="3" />
      <path d="M436 498 Q470 452 504 498 Z" fill="#3b5a48" />
      <ellipse cx="470" cy="499" rx="16" ry="5" fill="#fff4dc" />
      {/* Shelf of products on the back wall. */}
      <g>
        <rect x="660" y="520" width="180" height="7" fill="#9c7a55" />
        <rect x="676" y="486" width="18" height="34" rx="3" fill="#7d9474" />
        <rect x="700" y="494" width="14" height="26" rx="3" fill={cream} />
        <rect x="720" y="480" width="20" height="40" rx="3" fill={terracotta} />
        <rect x="748" y="492" width="16" height="28" rx="3" fill="#e9d6b1" />
        <rect x="772" y="486" width="18" height="34" rx="3" fill="#7d9474" />
        <rect x="660" y="600" width="180" height="7" fill="#9c7a55" />
        <rect x="680" y="568" width="40" height="32" rx="4" fill="#d6b989" />
        <rect x="728" y="574" width="26" height="26" rx="4" fill={cream} />
        <circle cx="782" cy="586" r="14" fill={terracotta} opacity="0.9" />
      </g>
      {/* A framed print by the door. */}
      <rect x="352" y="444" width="64" height="80" fill="#f1e4c9" stroke="#8d6c48" strokeWidth="5" />
      <path d="M362 510 Q384 474 406 510 Z" fill="#8fa27f" />
      {/* The groomer at work, behind the table. */}
      <g>
        <path d="M478 772 V612 Q478 566 520 560 H556 Q598 566 600 612 V772 Z" fill="#efe6d4" />
        <path d="M494 772 V620 Q496 600 520 598 H558 Q582 600 584 620 V772 Z" fill="#5f7c64" />
        <path d="M512 598 L520 566 M566 598 L558 566" stroke="#5f7c64" strokeWidth="6" strokeLinecap="round" />
        <rect x="528" y="536" width="22" height="28" rx="8" fill="#9a6444" />
        <circle cx="539" cy="516" r="30" fill="#a56d4b" />
        <path d="M509 512 Q510 482 540 482 Q570 482 570 510 Q560 496 540 496 Q520 498 509 512 Z" fill="#2e211b" />
        <circle cx="560" cy="478" r="15" fill="#2e211b" />
        <path d="M596 606 Q640 616 672 634" stroke="#efe6d4" strokeWidth="24" strokeLinecap="round" fill="none" />
        <circle cx="676" cy="636" r="12" fill="#a56d4b" />
        <rect x="668" y="604" width="12" height="36" rx="3" fill="#3b2c22" transform="rotate(-24 674 622)" />
      </g>
      {/* A small dog on the grooming table, mid-brush. */}
      <g>
        <rect x="604" y="686" width="220" height="14" rx="4" fill="#2f3530" />
        <rect x="706" y="700" width="18" height="72" fill="#2f3530" />
        <ellipse cx="740" cy="652" rx="62" ry="34" fill={dog} />
        <circle cx="690" cy="634" r="28" fill={dog} />
        <circle cx="684" cy="608" r="18" fill={dog} />
        <ellipse cx="706" cy="644" rx="12" ry="22" fill={dogShade} />
        <ellipse cx="664" cy="642" rx="15" ry="10" fill={dog} />
        <circle cx="651" cy="640" r="4.5" fill={ink} />
        <circle cx="678" cy="628" r="3.2" fill={ink} />
        <rect x="700" y="672" width="12" height="16" rx="5" fill={dog} />
        <rect x="770" y="672" width="12" height="16" rx="5" fill={dog} />
        <circle cx="806" cy="630" r="12" fill={dog} />
      </g>
      {/* Glass: a faint tint and the morning sky reflected across it. */}
      <rect x="318" y="378" width="534" height="394" fill="#0e1a13" opacity="0.1" />
      <path d="M318 640 L560 378 H640 L318 728 Z" fill="#fffaf0" opacity="0.16" />
      <path d="M318 772 L676 378 H706 L346 772 Z" fill="#fffaf0" opacity="0.1" />
      <path d="M612 772 L852 520 V580 L668 772 Z" fill="#fffaf0" opacity="0.08" />
    </g>
  )
}

function Door() {
  return (
    <g>
      <rect x="930" y="342" width="230" height="530" fill={greenDeep} />
      <rect x="946" y="360" width="198" height="512" fill={green} />
      {/* Glass pane with a glimpse of the warm room behind. */}
      <rect x="976" y="392" width="138" height="244" rx="4" fill="url(#bb-interior)" />
      <circle cx="1045" cy="470" r="120" fill="url(#bb-lamp-glow)" opacity="0.7" />
      <rect x="976" y="392" width="138" height="244" rx="4" fill="#0e1a13" opacity="0.12" />
      <path d="M976 560 L1070 392 H1100 L976 612 Z" fill="#fffaf0" opacity="0.16" />
      <rect x="976" y="392" width="138" height="244" rx="4" fill="none" stroke={greenTrim} strokeWidth="6" />
      {/* The hanging sign. */}
      <path d="M1022 404 L1045 392 L1068 404" stroke="#8a6a3c" strokeWidth="2" fill="none" />
      <rect x="1004" y="404" width="82" height="40" rx="5" fill={cream} />
      <text x="1045" y="431" textAnchor="middle" fontSize="19" fontWeight="700" letterSpacing="3" fill={terracotta} style={{ fontFamily: "var(--font-site-sans), system-ui, sans-serif" }}>OPEN</text>
      {/* Lower panel, kick plate, and handle. */}
      <rect x="976" y="666" width="138" height="170" rx="4" fill="none" stroke={greenTrim} strokeWidth="6" />
      <rect x="992" y="682" width="106" height="138" rx="2" fill={greenDeep} opacity="0.35" />
      <rect x="946" y="846" width="198" height="26" fill={brass} opacity="0.85" />
      <rect x="1120" y="620" width="9" height="72" rx="4.5" fill={brass} />
      <circle cx="1124" cy="706" r="5" fill="#8f7240" />
      {/* Shade under the door head. */}
      <rect x="946" y="360" width="198" height="26" fill="url(#bb-head-shade)" />
    </g>
  )
}

function Dog() {
  // A freshly groomed poodle waiting by the door, facing left.
  return (
    <g>
      <ellipse cx="1300" cy="912" rx="104" ry="15" fill="#5a3c1f" opacity="0.22" transform="skewX(-28)" style={{ transformBox: "fill-box", transformOrigin: "center" }} />
      <circle cx="1318" cy="846" r="17" fill={dog} />
      <path d="M1300 858 Q1312 850 1316 842" stroke={dog} strokeWidth="9" strokeLinecap="round" fill="none" />
      <ellipse cx="1268" cy="850" rx="50" ry="58" fill={dog} />
      <circle cx="1292" cy="878" r="32" fill={dogShade} />
      <circle cx="1288" cy="874" r="30" fill={dog} />
      <rect x="1222" y="846" width="19" height="58" rx="8" fill={dogShade} />
      <rect x="1246" y="850" width="19" height="56" rx="8" fill={dog} />
      <ellipse cx="1230" cy="904" rx="17" ry="9" fill={dogShade} />
      <ellipse cx="1256" cy="906" rx="17" ry="9" fill={dog} />
      <circle cx="1240" cy="818" r="34" fill={dog} />
      <path d="M1222 800 Q1224 776 1232 764 L1252 770 Q1256 792 1258 808 Z" fill={dog} />
      <circle cx="1232" cy="748" r="30" fill={dog} />
      <circle cx="1238" cy="714" r="27" fill={dog} />
      <ellipse cx="1256" cy="768" rx="17" ry="33" fill={dogShade} />
      <ellipse cx="1202" cy="760" rx="23" ry="14" fill={dog} />
      <circle cx="1181" cy="756" r="6.5" fill={ink} />
      <circle cx="1220" cy="741" r="4.2" fill={ink} />
      <circle cx="1221.4" cy="739.8" r="1.2" fill="#fff" />
      <path d="M1206 784 Q1234 796 1262 790 L1236 830 Z" fill={terracotta} />
      <circle cx="1258" cy="789" r="6" fill="#a84f2e" />
      {/* Morning light on the left edge of the coat. */}
      <path d="M1210 720 Q1214 704 1226 694" stroke="#fffaf0" strokeWidth="4" strokeLinecap="round" opacity="0.8" fill="none" />
    </g>
  )
}

/** The scene definition. Render once per page, before any <Storefront />. */
export function StorefrontDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute", overflow: "hidden" }} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="bb-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6e6c8" />
          <stop offset="0.55" stopColor="#e6cfa8" />
          <stop offset="1" stopColor="#cfb087" />
        </linearGradient>
        <linearGradient id="bb-facade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#35503f" />
          <stop offset="1" stopColor="#273e30" />
        </linearGradient>
        <linearGradient id="bb-interior" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8c996" />
          <stop offset="1" stopColor="#b98a58" />
        </linearGradient>
        <radialGradient id="bb-lamp-glow">
          <stop offset="0" stopColor="#fff1cf" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff1cf" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="bb-sconce-glow">
          <stop offset="0" stopColor="#ffe3a8" stopOpacity="0.75" />
          <stop offset="1" stopColor="#ffe3a8" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bb-walk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9c39e" />
          <stop offset="1" stopColor="#c2a77e" />
        </linearGradient>
        <linearGradient id="bb-awning-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.18" />
          <stop offset="0.5" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.08" />
        </linearGradient>
        <linearGradient id="bb-head-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.3" />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bb-grade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff6e2" stopOpacity="0.22" />
          <stop offset="0.45" stopColor="#fff6e2" stopOpacity="0" />
          <stop offset="1" stopColor="#3a2410" stopOpacity="0.2" />
        </linearGradient>
        <clipPath id="bb-glass-clip">
          <rect x="318" y="378" width="534" height="394" />
        </clipPath>

        <g id={SCENE_ID}>
          {/* Wall and pavement. */}
          <rect width="1600" height="1000" fill="url(#bb-wall)" />
          <g stroke="#b99a72" strokeOpacity="0.28" strokeWidth="2">
            <path d="M0 214 H180 M0 318 H180 M0 422 H180 M0 526 H180 M0 630 H180 M0 734 H180" />
            <path d="M1420 214 H1600 M1420 318 H1600 M1420 422 H1600 M1420 526 H1600 M1420 630 H1600 M1420 734 H1600" />
          </g>
          <rect y="870" width="1600" height="130" fill="url(#bb-walk)" />
          <path d="M0 872 H1600" stroke="#fff4dd" strokeOpacity="0.5" strokeWidth="3" />
          <path d="M180 870 L120 1000 M700 870 L680 1000 M1480 870 L1540 1000" stroke="#a88e68" strokeOpacity="0.45" strokeWidth="2" />

          {/* Facade. */}
          <rect x="220" y="138" width="1160" height="36" rx="3" fill={greenDeep} />
          <rect x="240" y="170" width="1120" height="702" fill="url(#bb-facade)" />
          <text x="800" y="264" textAnchor="middle" fontSize="104" fill={cream} style={{ fontFamily: "var(--font-example-serif), Georgia, serif", fontStyle: "italic" }}>Bramble</text>
          <text x="800" y="302" textAnchor="middle" fontSize="18" letterSpacing="7" fill={brass} style={{ fontFamily: "var(--font-site-sans), system-ui, sans-serif", fontWeight: 600 }}>DOG GROOMING · KELLER</text>
          <rect x="240" y="320" width="1120" height="5" fill={brass} opacity="0.75" />
          <rect x="240" y="170" width="1120" height="702" fill="none" stroke={greenDeep} strokeWidth="6" />
          <rect x="240" y="325" width="44" height="547" fill={greenDeep} opacity="0.55" />
          <rect x="1316" y="325" width="44" height="547" fill={greenDeep} opacity="0.55" />
          <rect x="884" y="325" width="36" height="547" fill={greenDeep} opacity="0.45" />

          {/* Window, sill, and kick panels. */}
          <rect x="300" y="360" width="570" height="430" fill={greenTrim} />
          <Interior />
          <rect x="318" y="378" width="534" height="394" fill="none" stroke={greenDeep} strokeWidth="4" />
          <rect x="290" y="788" width="590" height="22" rx="2" fill={greenDeep} />
          <path d="M290 789 H880" stroke="#fff4dd" strokeOpacity="0.3" strokeWidth="2" />
          <rect x="316" y="824" width="264" height="36" rx="2" fill="none" stroke={greenTrim} strokeWidth="4" />
          <rect x="592" y="824" width="264" height="36" rx="2" fill="none" stroke={greenTrim} strokeWidth="4" />
          <Awning />

          <Door />
          <rect x="916" y="866" width="258" height="16" rx="2" fill="#bca47f" />

          {/* Right panel: sconce, house number, leash hook. */}
          <circle cx="1240" cy="440" r="120" fill="url(#bb-sconce-glow)" />
          <rect x="1234" y="398" width="12" height="30" rx="3" fill={greenDeep} />
          <path d="M1222 426 H1258 L1252 470 H1228 Z" fill="#fff0c8" />
          <path d="M1218 424 H1262" stroke={brass} strokeWidth="6" strokeLinecap="round" />
          <text x="1240" y="532" textAnchor="middle" fontSize="34" fill={brass} letterSpacing="2" style={{ fontFamily: "var(--font-example-serif), Georgia, serif" }}>1120</text>
          <path d="M1282 566 V580 Q1282 590 1292 590" stroke={brass} strokeWidth="6" strokeLinecap="round" fill="none" />
          <path d="M1290 588 C1270 640 1324 646 1306 594" stroke={terracotta} strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M1306 594 C1304 626 1318 646 1310 664" stroke={terracotta} strokeWidth="7" strokeLinecap="round" fill="none" />
          <circle cx="1310" cy="668" r="6" fill={brass} />

          {/* Planter with a small olive tree. */}
          <path d="M150 700 Q146 640 132 600 M150 700 Q160 640 190 598" stroke="#6e5a44" strokeWidth="7" fill="none" strokeLinecap="round" />
          <g>
            <ellipse cx="128" cy="590" rx="64" ry="44" fill="#6f835f" />
            <ellipse cx="196" cy="580" rx="58" ry="42" fill="#81956f" />
            <ellipse cx="160" cy="540" rx="62" ry="44" fill="#8fa37d" />
            <ellipse cx="104" cy="548" rx="40" ry="30" fill="#7d916b" />
            <ellipse cx="214" cy="534" rx="36" ry="26" fill="#9aad86" />
          </g>
          <path d="M104 760 H206 L194 874 H116 Z" fill={terracotta} />
          <rect x="98" y="748" width="114" height="18" rx="3" fill="#a84f2e" />
          <path d="M104 766 H206" stroke="#000" strokeOpacity="0.12" strokeWidth="6" />
          <ellipse cx="210" cy="880" rx="80" ry="10" fill="#5a3c1f" opacity="0.18" />

          {/* Water bowl by the step. */}
          <ellipse cx="1178" cy="914" rx="42" ry="13" fill="#a84f2e" />
          <ellipse cx="1178" cy="908" rx="42" ry="12" fill={terracotta} />
          <ellipse cx="1178" cy="907" rx="31" ry="7" fill="#8fb6c4" />
          <path d="M1162 905 Q1176 902 1190 905" stroke="#fff" strokeOpacity="0.6" strokeWidth="2" fill="none" />

          <Dog />

          {/* Morning light over everything. */}
          <rect width="1600" height="1000" fill="url(#bb-grade)" />
        </g>
      </defs>
    </svg>
  )
}

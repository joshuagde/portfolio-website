import { useRef, useState, useEffect } from 'react'
import { motion, useInView, AnimatePresence } from 'framer-motion'
import { useIsMobile } from '../hooks/useIsMobile'

/* ================================================================
   SHARED ICON HEIGHT — both icons use this so the timeline line
   at `top: ICON_H / 2` hits the centre of every icon perfectly.
   ================================================================ */
const ICON_H = 72   // px

/* ================================================================
   LIQUID COLA ICON
   Realistic cola liquid with spring-damper slosh physics.

   Colour reference: Cola hex #3c3024 (rgb 60,48,36) — reddish-brown
   amber.  A depth gradient goes from amber-brown at the surface to
   deeper reddish-dark toward the bottom, matching a real glass of Coke.

   Physics:
     – Hover fires a slosh impulse; liquid tilts like a glass being
       jostled, oscillates, then damps back to rest.
     – Wave amplitude scales with |sloshAngle| so it calms naturally.
     – Ice cubes are pushed sideways by the slosh velocity each frame.
   ================================================================ */

/* Rounded-rect helper (safe cross-browser, avoids ctx.roundRect) */
function rrect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y,     x + w, y + r,     r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x,     y + h, x,     y + h - r, r)
  ctx.lineTo(x,     y + r)
  ctx.arcTo(x,     y,     x + r, y,         r)
  ctx.closePath()
}

function LiquidColaIcon({ hovered }) {
  const canvasRef = useRef(null)
  const stateRef  = useRef({
    hovered:     false,
    prevHovered: false,
    raf:         null,
    frame:       0,
    /* ── 1-D shallow-water height field ──
       28 sample points across the 52 px width.
       heights[i] = displacement from flat surface (px, up = negative).
       vels[i]    = velocity of that column.                             */
    N:       28,
    heights: new Float32Array(28).fill(0),
    vels:    new Float32Array(28).fill(0),
    /* ── CO₂ bubbles: each { x, y, r, vy, wobble, ws }              */
    bubbles: [],
    /* ── Ice cubes: float on dynamic surface, normalised x position  */
    cubes: [
      { xn: 0.17, w: 10, h: 10, angle: -0.20, va:  0.009 },
      { xn: 0.62, w:  9, h:  9, angle:  0.35, va: -0.007 },
      { xn: 0.40, w:  8, h:  8, angle:  0.05, va:  0.010 },
    ],
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    canvas.width  = 52 * dpr
    canvas.height = 52 * dpr
    ctx.scale(dpr, dpr)

    const s      = stateRef.current
    const BASE_Y = 18          // y of undisturbed flat surface
    /* CO₂ nucleation sites — fixed x positions where bubbles form */
    const NUKE   = [5, 11, 18, 26, 33, 40, 47]

    /* ── Interpolate surface Y at any pixel x ─────────────────── */
    function surfAt(px) {
      const t = Math.min(Math.max(px / 52 * (s.N - 1), 0), s.N - 2)
      const i = Math.floor(t)
      const f = t - i
      return BASE_Y + s.heights[i] + (s.heights[i + 1] - s.heights[i]) * f
    }

    /* ── One step of the 1-D wave equation ────────────────────── */
    function stepWave() {
      const C2   = 0.22    // propagation speed²
      const DAMP = 0.988   // energy loss per frame (~1.2% per frame)
      for (let i = 1; i < s.N - 1; i++) {
        s.vels[i] += C2 * (s.heights[i - 1] + s.heights[i + 1] - 2 * s.heights[i])
        s.vels[i] *= DAMP
      }
      for (let i = 0; i < s.N; i++) s.heights[i] += s.vels[i]
      /* Absorbing wall boundaries (no reflection) */
      s.heights[0]       = s.heights[1]       * 0.2;  s.vels[0]       = 0
      s.heights[s.N - 1] = s.heights[s.N - 2] * 0.2;  s.vels[s.N - 1] = 0
    }

    /* ── Jolt: asymmetric tilt + noise — fires on hover-start ─── */
    function jolt() {
      const dir = Math.random() > 0.5 ? 1 : -1
      for (let i = 0; i < s.N; i++) {
        s.heights[i] += dir  * (i / (s.N - 1) - 0.5) * 7.5
                      + (Math.random() - 0.5) * 1.0
        s.vels[i]    += dir  * (i / (s.N - 1) - 0.5) * 2.0
      }
    }

    /* ── CO₂ bubble lifecycle ──────────────────────────────────── */
    function stepBubbles() {
      /* Spawn rate: quicker while hovered */
      const interval = s.hovered ? 5 : 16
      if (s.frame % interval === 0) {
        const site = NUKE[Math.floor(Math.random() * NUKE.length)]
        s.bubbles.push({
          x:  site + (Math.random() - 0.5) * 3,
          y:  50 + Math.random() * 2,
          r:  0.55 + Math.random() * 0.50,   // tiny at nucleation
          vy: 0.28 + Math.random() * 0.30,   // rise speed (px/frame)
          wobble: Math.random() * Math.PI * 2,
          ws: 0.06 + Math.random() * 0.07,   // wobble speed
        })
      }

      for (let i = s.bubbles.length - 1; i >= 0; i--) {
        const b = s.bubbles[i]
        b.y      -= b.vy
        b.wobble += b.ws
        b.x      += Math.sin(b.wobble) * 0.13
        b.r       = Math.min(b.r + 0.013, 2.3)   // grow as pressure drops

        /* Pop when top of bubble reaches surface */
        if (b.y - b.r <= surfAt(b.x)) {
          /* Micro-disturbance where it pops */
          const ix = Math.round(Math.min(Math.max(b.x / 52 * (s.N - 1), 1), s.N - 2))
          s.vels[ix] -= 0.18
          s.bubbles.splice(i, 1)
        }
      }
      if (s.bubbles.length > 24) s.bubbles.splice(0, s.bubbles.length - 24)
    }

    /* ── Main render loop ──────────────────────────────────────── */
    function render() {
      s.frame++

      /* Detect hover-start → jolt */
      if (s.hovered && !s.prevHovered) jolt()
      s.prevHovered = s.hovered

      stepWave()
      stepBubbles()

      /* Pre-bake surface Y for every pixel column */
      const surfY = new Float32Array(53)
      for (let x = 0; x <= 52; x++) surfY[x] = surfAt(x)

      ctx.clearRect(0, 0, 52, 52)

      /* ── Cola liquid (amber-brown depth gradient) ──────────── */
      const grad = ctx.createLinearGradient(0, BASE_Y - 4, 0, 52)
      grad.addColorStop(0,    'rgba(108, 46, 16, 0.87)')  // amber-brown (#3c2010 lightened)
      grad.addColorStop(0.25, 'rgba( 75, 30,  9, 0.93)')
      grad.addColorStop(0.60, 'rgba( 50, 18,  5, 0.96)')
      grad.addColorStop(1,    'rgba( 30,  9,  2, 0.98)')  // deep reddish-dark

      ctx.beginPath()
      ctx.moveTo(0, 52)
      ctx.lineTo(0, surfY[0])
      for (let x = 1; x <= 52; x++) ctx.lineTo(x, surfY[x])
      ctx.lineTo(52, 52)
      ctx.closePath()
      ctx.fillStyle = grad
      ctx.fill()

      /* ── Surface highlight (amber sheen on wave crest) ──────── */
      ctx.beginPath()
      ctx.moveTo(0, surfY[0])
      for (let x = 1; x <= 52; x++) ctx.lineTo(x, surfY[x])
      ctx.strokeStyle = 'rgba(215, 100, 35, 0.45)'
      ctx.lineWidth = 1.3
      ctx.stroke()

      /* ── CO₂ bubbles ─────────────────────────────────────────── */
      for (const b of s.bubbles) {
        if (b.y > surfY[Math.round(Math.min(b.x, 52))] + 0.5 && b.y < 52) {
          /* Bubble outline */
          ctx.beginPath()
          ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(205, 115, 48, 0.58)'
          ctx.lineWidth = 0.65
          ctx.stroke()
          /* Specular highlight — top-left of bubble */
          ctx.beginPath()
          ctx.arc(b.x - b.r * 0.28, b.y - b.r * 0.32, b.r * 0.40, 0, Math.PI * 2)
          ctx.fillStyle = 'rgba(255, 220, 145, 0.50)'
          ctx.fill()
        }
      }

      /* ── Ice cubes (track dynamic surface, rotate with slosh) ── */
      let maxDisp = 0
      for (let i = 0; i < s.N; i++) maxDisp = Math.max(maxDisp, Math.abs(s.heights[i]))

      for (const cube of s.cubes) {
        const cx = cube.xn * 52
        const sy = surfAt(cx)
        /* Float: 38 % of cube height above liquid surface */
        const cy = sy + cube.h * (1 - 0.38) - cube.h / 2

        /* Rotation rate scales with current wave energy */
        cube.angle += cube.va * (0.25 + maxDisp * 0.15)

        ctx.save()
        ctx.translate(cx, cy)
        ctx.rotate(cube.angle)

        rrect(ctx, -cube.w / 2, -cube.h / 2, cube.w, cube.h, 2.2)
        ctx.fillStyle = 'rgba(212, 240, 255, 0.80)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.68)'
        ctx.lineWidth = 0.85
        ctx.stroke()

        /* Top-edge glassy highlight */
        ctx.beginPath()
        ctx.moveTo(-cube.w / 2 + 1.5, -cube.h / 2 + 2.0)
        ctx.lineTo( cube.w / 2 - 2.0, -cube.h / 2 + 2.0)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.62)'
        ctx.lineWidth = 1.3
        ctx.stroke()

        /* Left-edge catchlight */
        ctx.beginPath()
        ctx.moveTo(-cube.w / 2 + 2.0, -cube.h / 2 + 3.0)
        ctx.lineTo(-cube.w / 2 + 2.0,  cube.h / 2 - 2.5)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)'
        ctx.lineWidth = 1.0
        ctx.stroke()

        ctx.restore()
      }

      s.raf = requestAnimationFrame(render)
    }

    render()
    return () => cancelAnimationFrame(s.raf)
  }, [])

  /* Sync hover into ref so the loop can read it */
  useEffect(() => {
    stateRef.current.hovered = hovered
  }, [hovered])

  return (
    /* Wrapper centres the 52×52 tile in ICON_H, same as SynthesisIcon */
    <div style={{
      height: ICON_H,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <motion.div
        animate={hovered
          ? { scale: 1.08, boxShadow: '0 0 0 3px rgba(230,22,25,0.28)' }
          : { scale: 1,    boxShadow: 'none' }
        }
        transition={{ duration: 0.2 }}
        style={{
          width: 52, height: 52, borderRadius: 12,
          background: 'linear-gradient(160deg, #E61619 0%, #8B0000 100%)',
          position: 'relative', overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        {/* Cola liquid — fades in on hover, invisible at rest */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        >
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />
        </motion.div>

        {/* Coca-Cola Company logo — floats above liquid, ghosts on hover */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none',
        }}>
          <motion.img
            src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg"
            alt="Coca-Cola"
            animate={{ opacity: hovered ? 0.04 : 0.95 }}
            transition={{ duration: 0.28 }}
            style={{
              width: 38, height: 'auto', display: 'block',
              filter: 'brightness(0) invert(1)',
            }}
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>
      </motion.div>
    </div>
  )
}

/* ================================================================
   SYNTHESIS ICON
   Hover: logo fades out, K-means cluster animation reveals.
   ================================================================ */
const INNER_DOTS = [
  // Cluster A — top-left
  { s: { x:  4, y: 46 }, c: { x: 10, y: 10 }, color: 'rgba(255,255,255,0.90)' },
  { s: { x: 24, y: 48 }, c: { x: 16, y: 16 }, color: 'rgba(255,255,255,0.90)' },
  { s: { x: 44, y: 44 }, c: { x: 11, y: 21 }, color: 'rgba(255,255,255,0.90)' },
  { s: { x: 48, y: 48 }, c: { x: 18, y: 11 }, color: 'rgba(255,255,255,0.90)' },
  // Cluster B — top-right
  { s: { x:  4, y: 26 }, c: { x: 34, y: 10 }, color: 'rgba(255,224,190,0.90)' },
  { s: { x: 16, y:  4 }, c: { x: 40, y: 16 }, color: 'rgba(255,224,190,0.90)' },
  { s: { x: 44, y: 20 }, c: { x: 35, y: 21 }, color: 'rgba(255,224,190,0.90)' },
  { s: { x: 48, y: 34 }, c: { x: 42, y: 11 }, color: 'rgba(255,224,190,0.90)' },
  // Cluster C — bottom-centre
  { s: { x: 46, y:  6 }, c: { x: 22, y: 34 }, color: 'rgba(255,205,140,0.90)' },
  { s: { x: 46, y: 22 }, c: { x: 28, y: 40 }, color: 'rgba(255,205,140,0.90)' },
  { s: { x:  4, y:  8 }, c: { x: 23, y: 46 }, color: 'rgba(255,205,140,0.90)' },
  { s: { x:  6, y: 38 }, c: { x: 30, y: 36 }, color: 'rgba(255,205,140,0.90)' },
]
const INNER_CENTROIDS = [
  { x: 14, y: 14 },
  { x: 38, y: 14 },
  { x: 26, y: 39 },
]

function KMeansViz() {
  const [clustered, setClustered] = useState(false)

  useEffect(() => {
    let tid
    const cycle = () => {
      setClustered(prev => {
        tid = setTimeout(cycle, prev ? 800 : 1700)
        return !prev
      })
    }
    tid = setTimeout(cycle, 300)
    return () => clearTimeout(tid)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
      <svg width="52" height="52" viewBox="0 0 52 52">
        <AnimatePresence>
          {clustered && INNER_DOTS.map((d, i) => (
            <motion.line
              key={`il${i}`}
              x1={d.c.x} y1={d.c.y}
              x2={INNER_CENTROIDS[Math.floor(i / 4)].x}
              y2={INNER_CENTROIDS[Math.floor(i / 4)].y}
              stroke="rgba(255,255,255,0.28)" strokeWidth="0.6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ delay: 0.42 + (i % 4) * 0.04 }}
            />
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {clustered && INNER_CENTROIDS.map((c, i) => (
            <motion.circle
              key={`ic${i}`}
              cx={c.x} cy={c.y} r="8"
              fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.1"
              strokeDasharray="3.5 2.5"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ delay: 0.55 + i * 0.07, type: 'spring', stiffness: 280, damping: 20 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          ))}
        </AnimatePresence>

        {INNER_DOTS.map((d, i) => {
          const target = clustered ? d.c : d.s
          return (
            <motion.g key={i}
              initial={{ x: d.s.x, y: d.s.y }}
              animate={{ x: target.x, y: target.y }}
              transition={{ duration: 0.72, delay: i * 0.025, ease: [0.4, 0, 0.2, 1] }}
            >
              <circle r="2.6" fill={d.color} />
            </motion.g>
          )
        })}
      </svg>

      <AnimatePresence>
        {clustered && (
          <motion.span
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ delay: 0.75 }}
            style={{
              position: 'absolute', bottom: 3, right: 4,
              fontSize: 6.5, fontWeight: 700,
              fontFamily: 'Space Grotesk, sans-serif',
              color: 'rgba(255,255,255,0.85)',
              letterSpacing: '0.04em',
            }}
          >K=3</motion.span>
        )}
      </AnimatePresence>
    </div>
  )
}

function SynthesisIcon({ hovered }) {
  return (
    /* Wrapper to vertically centre the 52×52 box in ICON_H */
    <div style={{
      height: ICON_H,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    }}>
      <motion.div
        animate={hovered
          ? { scale: 1.08, boxShadow: '0 0 0 3px rgba(232,107,44,0.28)' }
          : { scale: 1,    boxShadow: 'none' }
        }
        transition={{ duration: 0.2 }}
        style={{
          width: 52, height: 52, borderRadius: 12,
          background: 'linear-gradient(135deg, #E86B2C 0%, #F09040 100%)',
          position: 'relative', overflow: 'hidden',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <motion.img
          src="https://cdn.prod.website-files.com/63735bd38b9cf9437a4b4b97/6746d4be4dfa4f72bc069eb4_synthesis-logo-white.svg"
          alt="Synthesis"
          animate={{ opacity: hovered ? 0.12 : 1 }}
          transition={{ duration: 0.25 }}
          style={{ width: 36, height: 'auto', position: 'relative', zIndex: 1, display: 'block' }}
          onError={e => {
            e.target.style.display = 'none'
            e.target.parentNode.insertAdjacentHTML('beforeend',
              '<span style="position:relative;z-index:1;font-family:Space Grotesk,sans-serif;font-weight:700;font-size:1rem;color:white">S</span>')
          }}
        />

        <AnimatePresence>
          {hovered && <KMeansViz key="kmeans" />}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

/* ================================================================
   EXPERIENCE DATA
   ================================================================ */
const EXPERIENCES = [
  {
    id: 'synthesis',
    company: 'Synthesis',
    role: 'Data Scientist Intern',
    period: 'May – Aug 2025',
    description: 'Owned and developed AI-powered tools and ETL pipelines that uncover insights from open-source data to formulate strategic recommendations for clients such as Brown-Forman and 2K Games.',
    tags: ['Python', 'SQL', 'BigQuery', 'Vertex AI', 'GCP'],
    accentColor: '#E86B2C',
  },
  {
    id: 'coke',
    company: 'The Coca-Cola Company',
    role: 'AI Engineer Intern',
    period: 'Jan – Jun 2026',
    description: 'Built and deployed agentic systems and LLM-driven pipelinesto automate decision-making and streamline internal workflows.',
    tags: ['Python', 'SQL', 'LangGraph', 'Azure', 'OpenAI', 'NLP', 'RAG', 'Databricks'],
    accentColor: '#E61619',
  },
]

/* ================================================================
   TIMELINE NODE
   ================================================================ */
function TimelineNode({ exp, isMobile, isActive, onToggle }) {
  const [hovered, setHovered] = useState(false)
  const active = isMobile ? isActive : hovered

  return (
    /* flex: 1 lets both nodes share the timeline width equally */
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>

      {/* Inline-block wrapper — hover card anchors to this */}
      <div
        style={{ position: 'relative', display: 'inline-block' }}
        onMouseEnter={!isMobile ? () => setHovered(true) : undefined}
        onMouseLeave={!isMobile ? () => setHovered(false) : undefined}
      >
        {/* ── Desktop: floating info card (appears above icon) ── */}
        {!isMobile && (
          <AnimatePresence>
            {hovered && (
              <motion.div
                key="card"
                initial={{ opacity: 0, y: 8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  bottom: `calc(100% + 14px)`,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 248,
                  background: 'var(--bg-card)',
                  border: `1px solid ${exp.accentColor}35`,
                  borderRadius: 12,
                  padding: '1rem 1.1rem',
                  boxShadow: `0 8px 28px rgba(0,0,0,0.12), 0 0 0 1px ${exp.accentColor}15`,
                  zIndex: 30,
                  pointerEvents: 'none',
                }}
              >
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {exp.company}
                </p>
                <p style={{ fontSize: '0.78rem', fontWeight: 600, color: exp.accentColor, marginBottom: '0.6rem' }}>
                  {exp.role} · {exp.period}
                </p>
                <p style={{ fontSize: '0.78rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
                  {exp.description}
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {exp.tags.map(tag => (
                    <span key={tag} style={{
                      padding: '2px 7px', borderRadius: 4, fontSize: '0.67rem', fontWeight: 500,
                      background: `${exp.accentColor}10`, color: exp.accentColor,
                      border: `1px solid ${exp.accentColor}22`,
                    }}>{tag}</span>
                  ))}
                </div>
                {/* Caret */}
                <div style={{
                  position: 'absolute', bottom: -7, left: '50%',
                  transform: 'translateX(-50%) rotate(45deg)',
                  width: 12, height: 12, background: 'var(--bg-card)',
                  borderRight: `1px solid ${exp.accentColor}35`,
                  borderBottom: `1px solid ${exp.accentColor}35`,
                }}/>
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* ── Icon ── */}
        <div
          style={{ cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
          onClick={isMobile ? onToggle : undefined}
        >
          {exp.id === 'coke'
            ? <LiquidColaIcon hovered={active} />
            : <SynthesisIcon hovered={active} />
          }
        </div>

        {/* Period label */}
        <p style={{
          marginTop: '0.5rem', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center',
          color: active ? exp.accentColor : 'var(--text-muted)',
          transition: 'color 0.2s', letterSpacing: '0.02em',
        }}>
          {exp.period}
        </p>
      </div>
    </div>
  )
}

/* ================================================================
   EXPERIENCE SECTION
   ================================================================ */
export default function Experience() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const isMobile = useIsMobile()
  const [activeId, setActiveId] = useState(null)

  const handleToggle = (id) => setActiveId(prev => prev === id ? null : id)
  const activeExp = EXPERIENCES.find(e => e.id === activeId)

  /* The connecting line sits at top = ICON_H / 2 so it exactly
     bisects the vertical centre of both icons.                  */
  const lineTop = ICON_H / 2

  return (
    <section
      id="experience"
      ref={ref}
      style={{ padding: 'var(--sv) var(--sh)', borderTop: '1px solid var(--border)', background: 'var(--bg-surface)' }}
    >
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <motion.p className="section-label"
          initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.45 }} style={{ marginBottom: '0.75rem' }}
        >Experience</motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.1 }}
          style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700,
            letterSpacing: '-0.02em', marginBottom: '5rem', color: 'var(--text-primary)',
          }}
        >Where I&apos;ve been</motion.h2>

        {/* ── Timeline ── */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
            <TimelineNode
              exp={EXPERIENCES[0]}
              isMobile={isMobile}
              isActive={activeId === EXPERIENCES[0].id}
              onToggle={() => handleToggle(EXPERIENCES[0].id)}
            />
            <div style={{ flex: 1 }} />
            <TimelineNode
              exp={EXPERIENCES[1]}
              isMobile={isMobile}
              isActive={activeId === EXPERIENCES[1].id}
              onToggle={() => handleToggle(EXPERIENCES[1].id)}
            />
          </div>

          {/* Connecting line — top exactly at icon centre */}
          <motion.div
            initial={{ scaleX: 0 }} animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.4, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: lineTop,
              left: '26px', right: '22px',
              height: '1.5px',
              background: 'linear-gradient(90deg, #E86B2C 0%, rgba(232,107,44,0.2) 50%, #E61619 100%)',
              transformOrigin: 'left',
              zIndex: 0,
            }}
          />
        </div>

        {/* Year markers */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>2025</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>2026</span>
        </div>

        {/* Mobile: tap hint + full-width detail card */}
        {isMobile && (
          <>
            {!activeId && (
              <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.72rem', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                Tap an icon to view details
              </p>
            )}
            <AnimatePresence>
              {activeExp && (
                <motion.div
                  key={activeExp.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  style={{
                    marginTop: '1.5rem',
                    background: 'var(--bg-card)',
                    border: `1px solid ${activeExp.accentColor}35`,
                    borderRadius: 12,
                    padding: '1.25rem',
                    boxShadow: `0 6px 24px rgba(0,0,0,0.10)`,
                  }}
                >
                  <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {activeExp.company}
                  </p>
                  <p style={{ fontSize: '0.8rem', fontWeight: 600, color: activeExp.accentColor, marginBottom: '0.75rem' }}>
                    {activeExp.role} · {activeExp.period}
                  </p>
                  <p style={{ fontSize: '0.82rem', lineHeight: 1.65, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                    {activeExp.description}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                    {activeExp.tags.map(tag => (
                      <span key={tag} style={{
                        padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 500,
                        background: `${activeExp.accentColor}10`, color: activeExp.accentColor,
                        border: `1px solid ${activeExp.accentColor}22`,
                      }}>{tag}</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  )
}

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import HeroRightCanvas from './HeroRightCanvas'

/* ================================================================
   TYPEWRITER
   ================================================================ */
const PHRASES = [
  { prefix: "I'm a",  word: 'Data Scientist' },
  { prefix: 'I',      word: 'analyse data' },
  { prefix: "I'm an", word: 'AI Engineer' },
  { prefix: 'I',      word: 'solve problems' },
  { prefix: "I'm an", word: 'Analyst' },
  { prefix: 'I',      word: 'build MVPs' },
]

function useTypewriter(phrases, typingSpeed = 85, deletingSpeed = 50, pauseMs = 1700) {
  const [text, setText]         = useState('')
  const [idx, setIdx]           = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [paused, setPaused]     = useState(false)

  useEffect(() => {
    const target = phrases[idx % phrases.length].word
    if (paused) {
      const t = setTimeout(() => { setPaused(false); setDeleting(true) }, pauseMs)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => {
      if (!deleting) {
        const next = target.slice(0, text.length + 1)
        setText(next)
        if (next === target) setPaused(true)
      } else {
        const next = target.slice(0, text.length - 1)
        setText(next)
        if (next === '') { setDeleting(false); setIdx(i => i + 1) }
      }
    }, deleting ? deletingSpeed : typingSpeed)
    return () => clearTimeout(t)
  }, [text, deleting, idx, paused, phrases, typingSpeed, deletingSpeed, pauseMs])

  return { text, phrase: phrases[idx % phrases.length] }
}

/* ================================================================
   SECTION
   ================================================================ */
export default function Intro() {
  const { text, phrase } = useTypewriter(PHRASES)
  const containerRef = useRef(null)

  return (
    /*
     * Full-width section so ThemedHeroBg spans the entire viewport.
     * Inside we have a two-column flex row:
     *   – Left col  : text content
     *   – Right col : HeroRightCanvas (desktop only, hidden on mobile)
     */
    <section
      id="hero"
      style={{
        position: 'relative',
        minHeight: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* Two-column row — centred within a max-width container */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        gap: '0',
        justifyContent: 'space-between',
        maxWidth: '1320px',
        margin: '0 auto',
        padding: '7rem 4vw 5rem',
      }}>

        {/* ── Left: text content ──────────────────────────────── */}
        <div style={{ flex: '0 0 auto', minWidth: 0, maxWidth: '480px' }}>

          {/* Eyebrow */}
          <motion.p
            className="section-label"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            style={{ marginBottom: '1.75rem' }}
          >
            Portfolio
          </motion.p>

          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.65 }}
            style={{
              fontSize: 'clamp(3.2rem, 8vw, 6.5rem)',
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: '2rem',
            }}
          >
            Joshua<br />Goi.
          </motion.h1>

          {/* Typewriter line */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.55 }}
            style={{
              fontSize: 'clamp(1rem, 2.6vw, 1.4rem)',
              fontWeight: 500,
              color: 'var(--text-muted)',
              marginBottom: '2.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              flexWrap: 'wrap',
              minHeight: '2rem',
            }}
          >
            <span>{phrase.prefix}</span>
            <span style={{ color: 'var(--accent)', fontWeight: 600 }}>
              {text}
              <span style={{
                display: 'inline-block',
                width: '2px',
                height: '1.1em',
                background: 'var(--accent)',
                marginLeft: '1px',
                verticalAlign: 'middle',
                animation: 'blink 1s step-end infinite',
              }} />
            </span>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.55 }}
            style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}
          >
            <a
              href="#projects"
              style={{
                padding: '11px 28px', borderRadius: '8px',
                background: 'var(--accent)', color: '#FFFFFF',
                fontWeight: 600, fontSize: '0.875rem',
                transition: 'all 0.2s', display: 'inline-block',
              }}
              onMouseEnter={e => { e.target.style.background = '#0F2540'; e.target.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.target.style.background = 'var(--accent)'; e.target.style.transform = 'translateY(0)' }}
            >
              View My Work
            </a>
            <a
              href="/resume.pdf"
              download="Joshua_Goi_Resume.pdf"
              style={{
                padding: '11px 28px', borderRadius: '8px',
                border: '1px solid var(--border)', color: 'var(--text-primary)',
                fontWeight: 600, fontSize: '0.875rem',
                transition: 'all 0.2s', display: 'inline-block', background: 'transparent',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)'; e.target.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-primary)'; e.target.style.transform = 'translateY(0)' }}
            >
              Resume
            </a>
          </motion.div>
        </div>

        {/* ── Right: animated canvas panel (desktop only) ─────── */}
        <motion.div
          ref={containerRef}
          className="hidden lg:block"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55, duration: 0.75 }}
          style={{
            flex: '0 0 660px',
            height: '480px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <HeroRightCanvas containerRef={containerRef} />
        </motion.div>

      </div>

      <style>{`@keyframes blink { 50% { opacity: 0; } }`}</style>
    </section>
  )
}

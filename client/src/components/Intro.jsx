import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import HeroRightCanvas from './HeroRightCanvas'
import { useIsMobile } from '../hooks/useIsMobile'

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
  { prefix: "I'm an", word: 'ML Engineer' },
  { prefix: 'I',      word: 'build models' },
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
  const isMobile = useIsMobile()

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (!dropdownOpen) return
    function handleOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [dropdownOpen])

  function handleProjects() {
    setDropdownOpen(false)
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
  }

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
        padding: isMobile ? '5rem 1.5rem 3rem' : '7rem 4vw 5rem',
      }}>

        {/* ── Left: text content ──────────────────────────────── */}
        <div style={{ flex: isMobile ? '1 1 auto' : '0 0 auto', minWidth: 0, maxWidth: isMobile ? '100%' : '480px' }}>

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
            <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
              <button
                onClick={() => setDropdownOpen(o => !o)}
                style={{
                  padding: '11px 28px',
                  borderRadius: '8px',
                  background: 'var(--accent)',
                  color: '#FFFFFF',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  transition: 'background 0.2s, transform 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#0F2540'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                View My Work
                <span style={{
                  fontSize: '0.65rem',
                  display: 'inline-block',
                  transition: 'transform 0.2s',
                  transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>▾</span>
              </button>

              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    minWidth: '230px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: '10px',
                    boxShadow: 'var(--shadow-md)',
                    padding: '0.4rem',
                    zIndex: 50,
                  }}
                >
                  {/* Synthesis */}
                  <Link
                    to="/experience/synthesis"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      padding: '0.55rem 0.85rem', borderRadius: '6px',
                      fontSize: '0.82rem', fontWeight: 500,
                      color: 'var(--text-primary)', textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                      background: 'linear-gradient(135deg, #E86B2C 0%, #F09040 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img
                        src="https://cdn.prod.website-files.com/63735bd38b9cf9437a4b4b97/6746d4be4dfa4f72bc069eb4_synthesis-logo-white.svg"
                        alt=""
                        style={{ width: 13, height: 'auto' }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    </div>
                    Synthesis
                  </Link>

                  {/* Coca-Cola */}
                  <Link
                    to="/experience/coke"
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      padding: '0.55rem 0.85rem', borderRadius: '6px',
                      fontSize: '0.82rem', fontWeight: 500,
                      color: 'var(--text-primary)', textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                      background: 'linear-gradient(160deg, #E61619 0%, #8B0000 100%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg"
                        alt=""
                        style={{ width: 15, height: 'auto', filter: 'brightness(0) invert(1)' }}
                        onError={e => { e.target.style.display = 'none' }}
                      />
                    </div>
                    The Coca-Cola Company
                  </Link>

                  {/* Divider */}
                  <div style={{ height: '1px', background: 'var(--border)', margin: '0.3rem 0.5rem' }} />

                  {/* Personal Projects */}
                  <button
                    onClick={handleProjects}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.65rem',
                      padding: '0.55rem 0.85rem', borderRadius: '6px',
                      fontSize: '0.82rem', fontWeight: 500,
                      color: 'var(--text-primary)',
                      background: 'transparent', border: 'none',
                      cursor: 'pointer', width: '100%', textAlign: 'left',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-dim)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: 5, flexShrink: 0,
                      background: 'var(--accent-dim)',
                      border: '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', color: 'var(--accent)',
                    }}>
                      ⊞
                    </div>
                    Personal Projects
                  </button>
                </motion.div>
              )}
            </div>
            <a
              href="/resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
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

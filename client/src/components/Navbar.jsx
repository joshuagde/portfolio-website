import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

const links = [
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(250,248,243,0.9)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : '1px solid transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
      }}
    >
      <div style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '0 2rem',
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <a href="#hero">
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '7px',
            background: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700,
            fontSize: '12px',
            color: '#FFFFFF',
            letterSpacing: '-0.02em',
          }}>JG</div>
        </a>

        {/* Links */}
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              style={{
                fontSize: '0.82rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                transition: 'color 0.2s',
                letterSpacing: '0.01em',
              }}
              onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/resume.pdf"
            download="Joshua_Goi_Resume.pdf"
            style={{
              padding: '7px 16px',
              borderRadius: '7px',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
              fontSize: '0.82rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              background: 'transparent',
            }}
            onMouseEnter={e => { e.target.style.background = 'var(--accent)'; e.target.style.color = '#fff'; e.target.style.borderColor = 'var(--accent)' }}
            onMouseLeave={e => { e.target.style.background = 'transparent'; e.target.style.color = 'var(--text-primary)'; e.target.style.borderColor = 'var(--border)' }}
          >
            Resume
          </a>
        </div>
      </div>
    </motion.nav>
  )
}

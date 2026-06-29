import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useIsMobile } from '../hooks/useIsMobile'

const links = [
  { label: 'About',      href: '/#about' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Projects',   href: '/#projects' },
  { label: 'Contact',    href: '/#contact' },
]

const HamburgerIcon = ({ open }) => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    {open ? (
      <>
        <line x1="5" y1="5" x2="17" y2="17" />
        <line x1="17" y1="5" x2="5" y2="17" />
      </>
    ) : (
      <>
        <line x1="3" y1="7" x2="19" y2="7" />
        <line x1="3" y1="11" x2="19" y2="11" />
        <line x1="3" y1="15" x2="19" y2="15" />
      </>
    )}
  </svg>
)

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  const closeMenu = () => setMenuOpen(false)

  const navBg = scrolled || menuOpen ? 'rgba(250,248,243,0.95)' : 'transparent'
  const navBorder = scrolled || menuOpen ? '1px solid var(--border)' : '1px solid transparent'
  const navBlur = scrolled || menuOpen ? 'blur(16px)' : 'none'

  return (
    <>
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
          background: navBg,
          borderBottom: navBorder,
          backdropFilter: navBlur,
        }}
      >
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 1.5rem',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <a href="/" style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: '15px',
            color: 'var(--accent)',
            letterSpacing: '-0.02em',
          }}>Joshua</a>

          {!isMobile && (
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
          )}

          {isMobile && (
            <button
              onClick={() => setMenuOpen(o => !o)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '44px',
                minHeight: '44px',
              }}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              <HamburgerIcon open={menuOpen} />
            </button>
          )}
        </div>
      </motion.nav>

      <AnimatePresence>
        {menuOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: '60px',
              left: 0,
              right: 0,
              zIndex: 99,
              background: 'rgba(250,248,243,0.97)',
              backdropFilter: 'blur(16px)',
              borderBottom: '1px solid var(--border)',
              padding: '1.5rem 1.5rem 2rem',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {links.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    letterSpacing: '0.01em',
                    padding: '0.25rem 0',
                  }}
                >
                  {link.label}
                </a>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <a
                  href="/resume.pdf"
                  download="Joshua_Goi_Resume.pdf"
                  onClick={closeMenu}
                  style={{
                    display: 'inline-block',
                    padding: '10px 22px',
                    borderRadius: '7px',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    background: 'transparent',
                  }}
                >
                  Download Resume
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

import { useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

const GitHubIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
)

const ExternalIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/>
    <line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
)

const PROJECTS = [
  {
    name: 'Graham',
    tagline: 'AI Investment Research Platform',
    description: 'From stock screening to valuation — the full equity research workflow, in one platform, powered by GPT-mini-5.',
    logo: '/graham-logo.png',
    /* Dark navy card — invert + screen blend makes the B&W portrait glow white */
    cardBg: '#0C1829',
    logoBg: '#0C1829',
    logoFilter: 'invert(1)',
    logoMixBlend: 'screen',
    accentColor: '#C8A96E',
    titleColor: '#F0EAD6',
    descColor: 'rgba(240,234,214,0.6)',
    borderColor: 'rgba(200,169,110,0.2)',
    hoverBorder: 'rgba(200,169,110,0.5)',
    tagBg: 'rgba(200,169,110,0.12)',
    tagBorder: 'rgba(200,169,110,0.25)',
    tags: ['GPT-5', 'LLM Pipeline', 'Portfolio Optimisation'],
    links: [
      { label: 'GitHub', href: 'https://github.com/rohanjaggi/graham', icon: <GitHubIcon /> },
      { label: 'Live',   href: 'https://graham-blue.vercel.app',       icon: <ExternalIcon /> },
    ],
  },
  {
    name: 'Nomster',
    tagline: 'Food Discovery Platform',
    description: 'A community food discovery and rating platform built to combine the best of social media and Google Maps to allow users to share and discover food recommendations in their city.',
    logo: '/nomster.png',
    cardBg: '#FFF8F2',
    logoBg: 'rgba(249,115,22,0.06)',
    logoFilter: 'none',
    accentColor: '#C2622A',
    titleColor: '#1A1A1A',
    descColor: '#7A7060',
    borderColor: 'rgba(194,98,42,0.18)',
    hoverBorder: 'rgba(194,98,42,0.45)',
    tagBg: 'rgba(194,98,42,0.08)',
    tagBorder: 'rgba(194,98,42,0.22)',
    tags: ['React', 'Firebase', 'Google Maps API'],
    links: [
      { label: 'Live', href: 'https://nomster-13cf2.web.app/', icon: <ExternalIcon /> },
    ],
  },
]

function ProjectCard({ project, index }) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        flex: 1,
        minWidth: 0,
        borderRadius: 16,
        background: project.cardBg,
        border: `1px solid ${hovered ? project.hoverBorder : project.borderColor}`,
        boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.16)' : '0 2px 8px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'all 0.25s ease',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Logo area */}
      <div style={{
        height: 180,
        background: project.logoBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderBottom: `1px solid ${project.borderColor}`,
        padding: '2rem',
        transition: 'background 0.25s',
      }}>
        <motion.img
          src={project.logo}
          alt={project.name}
          animate={{ scale: hovered ? 1.06 : 1 }}
          transition={{ duration: 0.25 }}
          style={{
            maxWidth: 140,
            maxHeight: 120,
            objectFit: 'contain',
            filter: project.logoFilter,
            mixBlendMode: project.logoMixBlend || 'normal',
          }}
        />
      </div>

      {/* Content */}
      <div style={{ padding: '1.4rem 1.5rem 1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: project.titleColor, marginBottom: 3 }}>
            {project.name}
          </h3>
          <p style={{ fontSize: '0.75rem', color: project.accentColor, fontWeight: 500 }}>
            {project.tagline}
          </p>
        </div>

        {/* Description fades in on hover */}
        <motion.p
          animate={{ opacity: hovered ? 1 : 0, maxHeight: hovered ? 60 : 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: '0.8rem', lineHeight: 1.65, color: project.descColor, overflow: 'hidden', marginBottom: hovered ? '0.75rem' : 0 }}
        >
          {project.description}
        </motion.p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto', marginBottom: '0.875rem' }}>
          {project.tags.map(tag => (
            <span key={tag} style={{
              padding: '3px 9px', borderRadius: 5, fontSize: '0.7rem', fontWeight: 500,
              background: project.tagBg, color: project.accentColor, border: `1px solid ${project.tagBorder}`,
            }}>{tag}</span>
          ))}
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {project.links.map(link => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 13px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 600,
                color: project.accentColor, border: `1px solid ${project.tagBorder}`,
                background: project.tagBg, transition: 'all 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = project.hoverBorder.replace('0.45','0.15'); e.currentTarget.style.borderColor = project.accentColor }}
              onMouseLeave={e => { e.currentTarget.style.background = project.tagBg; e.currentTarget.style.borderColor = project.tagBorder }}
            >
              {link.icon}{link.label}
            </a>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Projects() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section id="projects" ref={ref} style={{ padding: 'var(--sv) var(--sh)', maxWidth: '1100px', margin: '0 auto', borderTop: '1px solid var(--border)' }}>
      <motion.p className="section-label"
        initial={{ opacity: 0, y: 12 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.45 }}
        style={{ marginBottom: '0.75rem' }}
      >Projects</motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.55, delay: 0.1 }}
        style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '2.5rem', color: 'var(--text-primary)' }}
      >
        Things I&apos;ve built
      </motion.h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '1.25rem', alignItems: 'stretch' }}>
        {PROJECTS.map((p, i) => (
          <ProjectCard key={p.name} project={p} index={i} />
        ))}
      </div>
    </section>
  )
}

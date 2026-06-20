import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const PILLARS = [
  {
    label: 'Analyse',
    icon: '◎',
    description: 'Explore noisy datasets. find patterns, test hypotheses and build models to make predictions and discover insights.',
  },
  {
    label: 'Engineer',
    icon: '⬡',
    description: 'Building the infrastructure behind the insight — LLM pipelines, multi-agent architectures, and data infrastructure',
  },
  {
    label: 'Build',
    icon: '△',
    description: 'Transform an idea from a plan to working product. From dashboards, pipelines to full-stack applications, building solutions that people use to make decisions.',
  },
]

export default function About() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="about"
      ref={ref}
      style={{
        padding: 'var(--sv) var(--sh)',
        maxWidth: '1100px',
        margin: '0 auto',
        borderTop: '1px solid var(--border)',
      }}
    >
      <motion.p
        className="section-label"
        initial={{ opacity: 0, y: 12 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45 }}
        style={{ marginBottom: '0.75rem' }}
      >
        About
      </motion.p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '4rem', alignItems: 'start' }}>
        {/* Bio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              marginBottom: '1.5rem',
              color: 'var(--text-primary)',
            }}
          >
            About me
          </h2>
          <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-muted)', marginBottom: '1.1rem' }}>
            I am an aspiring data scientist currently building agentic systems and LLM pipelines to transform raw data into actionable insights that drive decision-making and solve real-world problems. 
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-muted)', marginBottom: '1.1rem' }}>
            Data science challenges me to learn continuously and ask questions in order to uncover hidden patterns or insights that help make predictions or solve complex prolems, which I really enjoy. I have also been exploring the capabilities of LLMs to build tools and pipelines that automate my workflows, which is something I hope to learn more about.
          </p>
          <p style={{ fontSize: '1rem', lineHeight: 1.85, color: 'var(--text-muted)' }}>
            In my free time, I enjoy watching sports, visiting new countries, hiking and trying new cuisines.
            
          </p>
        </motion.div>

        {/* What I do pillars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.label}
              initial={{ opacity: 0, x: 24 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.2 + i * 0.1 }}
              whileHover={{ x: 4 }}
              style={{
                padding: '1.25rem 1.5rem',
                borderRadius: '10px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                cursor: 'default',
                transition: 'box-shadow 0.2s, border-color 0.2s',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
            >
              <span style={{ fontSize: '1.1rem', color: 'var(--accent-warm)', flexShrink: 0, marginTop: '1px' }}>{p.icon}</span>
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: '5px' }}>
                  {p.label}
                </p>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-muted)' }}>
                  {p.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

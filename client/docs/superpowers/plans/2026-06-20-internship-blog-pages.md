# Internship Blog Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add per-company internship blog pages for Synthesis and Coca-Cola, accessible via company icon clicks and a redesigned "View My Work" dropdown.

**Architecture:** Install react-router-dom and wrap the app in BrowserRouter. Add routes for `/` (existing homepage) and `/experience/:id` (new ExperiencePage component). Wire company icon clicks in Experience.jsx to navigate via Link, and replace the "View My Work" anchor in Intro.jsx with a dropdown that offers Synthesis, Coca-Cola, and Personal Projects.

**Tech Stack:** react-router-dom ^7, React 19, Framer Motion ^12, Vite 6, existing CSS custom properties

## Global Constraints

- All styling via inline styles and `var(--*)` CSS custom properties — no new CSS files
- No testing framework in this project — verify each task visually by running `npm run dev`
- Follow existing patterns: `useInView` for scroll animations, Space Grotesk for headings, `var(--bg-card)` / `var(--border)` / `var(--shadow-sm)` for cards
- `accentColor` per company: Synthesis `#E86B2C`, Coca-Cola `#E61619`
- Working directory for all commands: `client/`

---

### Task 1: Install react-router-dom and set up routing skeleton

**Files:**
- Modify: `src/main.jsx`
- Modify: `src/App.jsx`
- Modify: `src/components/Navbar.jsx`
- Create: `src/components/ExperiencePage.jsx` (stub)

**Interfaces:**
- Produces: `<Route path="/experience/:id">` renders `ExperiencePage`
- Produces: Navbar hash links use `/#` prefix so they resolve correctly from any route

- [ ] **Step 1: Install react-router-dom**

```bash
npm install react-router-dom
```

Expected: `package.json` dependencies now includes `"react-router-dom": "^7.x.x"`

- [ ] **Step 2: Wrap app in BrowserRouter**

Replace `src/main.jsx` entirely:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 3: Add Routes to App.jsx**

Replace `src/App.jsx` entirely:

```jsx
import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Intro from './components/Intro'
import About from './components/About'
import Experience from './components/Experience'
import Projects from './components/Projects'
import Footer from './components/Footer'
import ExperiencePage from './components/ExperiencePage'

function HomePage() {
  return (
    <div>
      <Navbar />
      <main>
        <Intro />
        <About />
        <Experience />
        <Projects />
        <Footer />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/experience/:id" element={<ExperiencePage />} />
    </Routes>
  )
}
```

- [ ] **Step 4: Create stub ExperiencePage**

Create `src/components/ExperiencePage.jsx`:

```jsx
import { useParams } from 'react-router-dom'

export default function ExperiencePage() {
  const { id } = useParams()
  return <div style={{ padding: '8rem 2rem' }}>Experience page: {id}</div>
}
```

- [ ] **Step 5: Update Navbar hrefs to work from any route**

In `src/components/Navbar.jsx`, change the `links` array so all anchors are absolute paths (so they work from `/experience/synthesis` as well as `/`):

```js
const links = [
  { label: 'About',      href: '/#about' },
  { label: 'Experience', href: '/#experience' },
  { label: 'Projects',   href: '/#projects' },
  { label: 'Contact',    href: '/#contact' },
]
```

And change the logo anchor from `href="#hero"` to `href="/"`:

```jsx
<a href="/" style={{
  fontFamily: "'Space Grotesk', sans-serif",
  fontWeight: 600,
  fontSize: '15px',
  color: 'var(--accent)',
  letterSpacing: '-0.02em',
}}>Joshua</a>
```

- [ ] **Step 6: Verify routing works**

Run: `npm run dev`

- Navigate to `http://localhost:5173/experience/synthesis` — should see "Experience page: synthesis"
- Navigate to `http://localhost:5173/` — homepage renders as before
- Navbar "Joshua" logo links to `/`, nav links use `/#` prefix

- [ ] **Step 7: Commit**

```bash
git add src/main.jsx src/App.jsx src/components/ExperiencePage.jsx src/components/Navbar.jsx
git commit -m "feat: add react-router-dom with routing skeleton and update Navbar hrefs"
```

---

### Task 2: ExperiencePage — data layer + Hero section

**Files:**
- Modify: `src/components/ExperiencePage.jsx`

**Interfaces:**
- Produces: `BLOG_DATA` object keyed by `'synthesis' | 'coke'`, consumed by Tasks 3 and 4
- Produces: Hero strip at `/experience/synthesis` and `/experience/coke`
- Produces: `SectionWrapper` helper used by Tasks 3 and 4

- [ ] **Step 1: Replace stub with full data + Hero**

Replace `src/components/ExperiencePage.jsx` entirely:

```jsx
import { useParams } from 'react-router-dom'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import Navbar from './Navbar'

const BLOG_DATA = {
  synthesis: {
    company: 'Synthesis',
    role: 'Data Scientist Intern',
    period: 'May – Aug 2025',
    accentColor: '#E86B2C',
    logoSrc: 'https://cdn.prod.website-files.com/63735bd38b9cf9437a4b4b97/6746d4be4dfa4f72bc069eb4_synthesis-logo-white.svg',
    logoBg: 'linear-gradient(135deg, #E86B2C 0%, #F09040 100%)',
    logoFilter: 'none',
    tagline: 'AI-powered tools & ETL pipelines for strategic client insights',
    overview: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    ],
    stack: [
      { category: 'Languages', tags: ['Python', 'SQL'] },
      { category: 'Cloud & Data', tags: ['GCP', 'BigQuery', 'Vertex AI'] },
    ],
    projects: [
      {
        name: 'Client Intelligence Pipeline',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim veniam.',
        outcomes: ['Reduced data processing time by 40%', 'Generated insights for 3 major client accounts', 'Automated weekly reporting pipeline'],
        tags: ['Python', 'BigQuery', 'GCP'],
      },
      {
        name: 'Open-Source Data Scraper',
        description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat.',
        outcomes: ['Scraped and structured 50k+ data points', 'Cut manual research time by 60%'],
        tags: ['Python', 'SQL'],
      },
      {
        name: 'Recommendation Engine',
        description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum perspiciatis.',
        outcomes: ['Improved recommendation precision by 25%', 'Deployed to Vertex AI endpoint'],
        tags: ['Vertex AI', 'Python'],
      },
    ],
    takeaways: [
      'Working with messy, real-world open-source data at scale requires robust validation and fallback strategies that you rarely encounter in academic datasets.',
      'Building AI-powered tools in a consulting context means balancing technical sophistication with explainability — clients need to understand and trust the output.',
      'Communicating data insights to non-technical stakeholders is a distinct skill that improves with deliberate practice and clear visual storytelling.',
    ],
  },
  coke: {
    company: 'The Coca-Cola Company',
    role: 'AI Engineer Intern',
    period: 'Jan – Jun 2026',
    accentColor: '#E61619',
    logoSrc: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg',
    logoBg: 'linear-gradient(160deg, #E61619 0%, #8B0000 100%)',
    logoFilter: 'brightness(0) invert(1)',
    tagline: 'Agentic systems & LLM pipelines to automate internal workflows',
    overview: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.',
    ],
    stack: [
      { category: 'Languages', tags: ['Python', 'SQL'] },
      { category: 'AI / LLM', tags: ['LangGraph', 'OpenAI', 'NLP', 'RAG'] },
      { category: 'Cloud & Data', tags: ['Azure', 'Databricks'] },
    ],
    projects: [
      {
        name: 'Workflow Automation Agent',
        description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim veniam.',
        outcomes: ['Automated 3 internal approval workflows', 'Reduced processing time from hours to minutes', 'Integrated with existing enterprise tooling'],
        tags: ['LangGraph', 'Python', 'Azure'],
      },
      {
        name: 'RAG Knowledge System',
        description: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat.',
        outcomes: ['Indexed 10k+ internal documents', 'Achieved 87% retrieval accuracy on benchmark queries'],
        tags: ['RAG', 'OpenAI', 'Databricks'],
      },
      {
        name: 'NLP Classification Pipeline',
        description: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum perspiciatis.',
        outcomes: ['Classified 500k+ records with 92% accuracy', 'Replaced a fully manual review process'],
        tags: ['NLP', 'Python', 'SQL'],
      },
    ],
    takeaways: [
      'Building agentic systems that work reliably in a production enterprise environment requires significantly more defensive error handling and human-in-the-loop checkpoints than a prototype.',
      'Working with LLMs in an enterprise context means managing data privacy, latency, and cost constraints that fundamentally shape architectural decisions.',
      'Collaborating across product, engineering, and legal teams to deploy AI solutions taught me that technical excellence alone is rarely the bottleneck in large organisations.',
    ],
  },
}

function SectionWrapper({ children }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })
  return (
    <div
      ref={ref}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.55s ease, transform 0.55s ease',
      }}
    >
      {children}
    </div>
  )
}

export default function ExperiencePage() {
  const { id } = useParams()
  const data = BLOG_DATA[id]

  if (!data) {
    return (
      <div style={{ padding: '8rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Experience not found.</p>
        <a href="/" style={{ color: 'var(--accent)', fontWeight: 600 }}>← Back home</a>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={{
        paddingTop: '100px',
        paddingBottom: '4rem',
        paddingLeft: 'var(--sh)',
        paddingRight: 'var(--sh)',
        background: `linear-gradient(180deg, ${data.accentColor}0a 0%, var(--bg) 100%)`,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <a
              href="/#experience"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                textDecoration: 'none',
                padding: '0.4rem 0.75rem',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                marginBottom: '2.5rem',
                transition: 'all 0.2s',
                background: 'var(--bg-card)',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)' }}
            >
              ← Back
            </a>
          </motion.div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              style={{
                width: 72, height: 72, borderRadius: 16, flexShrink: 0,
                background: data.logoBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 4px 20px ${data.accentColor}30`,
              }}
            >
              <img
                src={data.logoSrc}
                alt={data.company}
                style={{ width: 44, height: 'auto', filter: data.logoFilter }}
                onError={e => { e.target.style.display = 'none' }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <p className="section-label" style={{ marginBottom: '0.3rem' }}>
                {data.period}
              </p>
              <h1 style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
                marginBottom: '0.5rem',
              }}>
                {data.company}
              </h1>
              <p style={{ fontSize: '1rem', fontWeight: 600, color: data.accentColor, marginBottom: '0.5rem' }}>
                {data.role}
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {data.tagline}
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 2: Verify hero renders**

Run: `npm run dev`

- `/experience/synthesis` — Navbar visible, back button, Synthesis logo on orange gradient, role/period/tagline in Synthesis orange
- `/experience/coke` — Coca-Cola logo on red gradient, role/period/tagline in red
- `/experience/unknown` — "Experience not found." with back link
- Back button (`←`) navigates to `/#experience`

- [ ] **Step 3: Commit**

```bash
git add src/components/ExperiencePage.jsx
git commit -m "feat: add ExperiencePage hero section with BLOG_DATA"
```

---

### Task 3: ExperiencePage — Overview + Tech Stack sections

**Files:**
- Modify: `src/components/ExperiencePage.jsx`

**Interfaces:**
- Consumes: `BLOG_DATA[id].overview` (string[]), `BLOG_DATA[id].stack` ({ category: string, tags: string[] }[]), `data.accentColor`
- Consumes: `SectionWrapper` (defined in Task 2)

- [ ] **Step 1: Add Overview section after the hero closing `</section>`**

In `src/components/ExperiencePage.jsx`, find the closing `</section>` of the Hero section (the line before the final `</div>` closing the page). Insert the following **after** that `</section>` and **before** the final `</div>`:

```jsx
      {/* Overview */}
      <section style={{ padding: 'var(--sv) var(--sh)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '740px', margin: '0 auto' }}>
          <SectionWrapper>
            <p className="section-label" style={{ marginBottom: '0.75rem' }}>Overview</p>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '1.5rem',
            }}>
              What I did
            </h2>
            {data.overview.map((para, i) => (
              <p key={i} style={{
                fontSize: '1rem',
                lineHeight: 1.85,
                color: 'var(--text-muted)',
                marginBottom: i < data.overview.length - 1 ? '1.1rem' : 0,
              }}>
                {para}
              </p>
            ))}
          </SectionWrapper>
        </div>
      </section>

      {/* Tech Stack */}
      <section style={{
        padding: 'var(--sv) var(--sh)',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionWrapper>
            <p className="section-label" style={{ marginBottom: '0.75rem' }}>Tech Stack</p>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '2rem',
            }}>
              Tools & technologies
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {data.stack.map(group => (
                <div key={group.category}>
                  <p style={{
                    fontSize: '0.7rem', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                    color: 'var(--text-muted)', marginBottom: '0.6rem',
                  }}>
                    {group.category}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {group.tags.map(tag => (
                      <span key={tag} style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        background: `${data.accentColor}10`,
                        color: data.accentColor,
                        border: `1px solid ${data.accentColor}22`,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </section>
```

- [ ] **Step 2: Verify sections render**

Run: `npm run dev`

- Both `/experience/synthesis` and `/experience/coke` show Overview paragraphs and grouped Tech Stack pills
- Synthesis pills are orange, Coca-Cola pills are red
- Sections fade up on scroll

- [ ] **Step 3: Commit**

```bash
git add src/components/ExperiencePage.jsx
git commit -m "feat: add Overview and Tech Stack sections to ExperiencePage"
```

---

### Task 4: ExperiencePage — Key Projects + Key Takeaways sections

**Files:**
- Modify: `src/components/ExperiencePage.jsx`

**Interfaces:**
- Consumes: `BLOG_DATA[id].projects` ({ name, description, outcomes: string[], tags: string[] }[])
- Consumes: `BLOG_DATA[id].takeaways` (string[])
- Consumes: `data.accentColor`, `SectionWrapper`

- [ ] **Step 1: Add Key Projects and Key Takeaways after the Tech Stack `</section>`**

Insert the following after the Tech Stack `</section>` and before the final `</div>`:

```jsx
      {/* Key Projects */}
      <section style={{ padding: 'var(--sv) var(--sh)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionWrapper>
            <p className="section-label" style={{ marginBottom: '0.75rem' }}>Key Projects</p>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '2rem',
            }}>
              What I built
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}>
              {data.projects.map((project, i) => (
                <div
                  key={i}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '12px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'box-shadow 0.2s, border-color 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${data.accentColor}55`
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border)'
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  }}
                >
                  <div>
                    <h3 style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '1rem',
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      marginBottom: '0.5rem',
                    }}>
                      {project.name}
                    </h3>
                    <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: 'var(--text-muted)' }}>
                      {project.description}
                    </p>
                  </div>
                  <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {project.outcomes.map((outcome, j) => (
                      <li key={j} style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-muted)',
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'flex-start',
                      }}>
                        <span style={{ color: data.accentColor, flexShrink: 0, marginTop: '1px' }}>•</span>
                        {outcome}
                      </li>
                    ))}
                  </ul>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: 'auto' }}>
                    {project.tags.map(tag => (
                      <span key={tag} style={{
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 500,
                        background: `${data.accentColor}10`,
                        color: data.accentColor,
                        border: `1px solid ${data.accentColor}22`,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </section>

      {/* Key Takeaways */}
      <section style={{
        padding: 'var(--sv) var(--sh)',
        borderTop: '1px solid var(--border)',
        background: 'var(--bg-surface)',
      }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionWrapper>
            <p className="section-label" style={{ marginBottom: '0.75rem' }}>Key Takeaways</p>
            <h2 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 'clamp(1.4rem, 3vw, 2rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: '2rem',
            }}>
              What I learned
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '740px' }}>
              {data.takeaways.map((takeaway, i) => (
                <div key={i} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  <div style={{
                    flexShrink: 0,
                    width: 32, height: 32,
                    borderRadius: '50%',
                    background: `${data.accentColor}15`,
                    border: `1px solid ${data.accentColor}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    color: data.accentColor,
                  }}>
                    {i + 1}
                  </div>
                  <p style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.75,
                    color: 'var(--text-muted)',
                    paddingTop: '0.35rem',
                  }}>
                    {takeaway}
                  </p>
                </div>
              ))}
            </div>
          </SectionWrapper>
        </div>
      </section>
```

- [ ] **Step 2: Verify full page**

Run: `npm run dev`

Both experience pages show all sections: Hero → Overview → Tech Stack → Key Projects → Key Takeaways. Project cards have accent-colour hover border. Takeaways show numbered circles in accent colour. Page is visually consistent with the main portfolio.

- [ ] **Step 3: Commit**

```bash
git add src/components/ExperiencePage.jsx
git commit -m "feat: add Key Projects and Key Takeaways sections to ExperiencePage"
```

---

### Task 5: Wire Experience.jsx company icons to navigate

**Files:**
- Modify: `src/components/Experience.jsx`

**Interfaces:**
- Consumes: `Link` from `react-router-dom`, `exp.id` (`'synthesis' | 'coke'`)
- Produces: Clicking either company icon navigates to `/experience/{exp.id}`

- [ ] **Step 1: Add Link import**

At the top of `src/components/Experience.jsx`, add `Link` to the react-router-dom import (new line after the existing imports):

```jsx
import { Link } from 'react-router-dom'
```

- [ ] **Step 2: Simplify TimelineNode — remove mobile props, replace click div with Link**

Replace the entire `TimelineNode` function with:

```jsx
function TimelineNode({ exp }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
      <div
        style={{ position: 'relative', display: 'inline-block' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Desktop hover card */}
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

        {/* Icon — clicking navigates to the blog page */}
        <Link
          to={`/experience/${exp.id}`}
          style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none' }}
        >
          {exp.id === 'coke'
            ? <LiquidColaIcon hovered={hovered} />
            : <SynthesisIcon hovered={hovered} />
          }
        </Link>

        <p style={{
          marginTop: '0.5rem', fontSize: '0.7rem', fontWeight: 600, textAlign: 'center',
          color: hovered ? exp.accentColor : 'var(--text-muted)',
          transition: 'color 0.2s', letterSpacing: '0.02em',
        }}>
          {exp.period}
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Simplify the Experience export — remove mobile state and detail card**

Replace the `Experience` default export with:

```jsx
export default function Experience() {
  const ref    = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

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

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', position: 'relative' }}>
            <TimelineNode exp={EXPERIENCES[0]} />
            <div style={{ flex: 1 }} />
            <TimelineNode exp={EXPERIENCES[1]} />
          </div>

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

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>2025</span>
          <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>2026</span>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Remove unused imports from Experience.jsx**

Remove the `useIsMobile` import line since it is no longer used:

```jsx
// Delete this line:
import { useIsMobile } from '../hooks/useIsMobile'
```

- [ ] **Step 5: Verify icon navigation**

Run: `npm run dev`

- Hover Synthesis icon on homepage — K-means animation and hover card appear as before
- Click Synthesis icon — navigates to `/experience/synthesis`
- Click ← Back — returns to `/#experience` and scrolls to the experience section
- Same for Coca-Cola icon
- No mobile detail card expands; tapping on mobile navigates directly

- [ ] **Step 6: Commit**

```bash
git add src/components/Experience.jsx
git commit -m "feat: wire company icons to navigate to internship blog pages"
```

---

### Task 6: View My Work dropdown in Intro.jsx

**Files:**
- Modify: `src/components/Intro.jsx`

**Interfaces:**
- Consumes: `Link` from `react-router-dom`
- Produces: Clicking "View My Work" opens dropdown with Synthesis → `/experience/synthesis`, Coca-Cola → `/experience/coke`, Personal Projects → scroll to `#projects`

- [ ] **Step 1: Add Link import to Intro.jsx**

In `src/components/Intro.jsx`, add `Link` to the imports:

```jsx
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import HeroRightCanvas from './HeroRightCanvas'
import { useIsMobile } from '../hooks/useIsMobile'
```

- [ ] **Step 2: Add dropdown state inside the Intro component**

Inside the `Intro` function, directly after the `useTypewriter` call, add:

```jsx
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
```

- [ ] **Step 3: Replace the View My Work anchor with the dropdown**

Find and replace the entire `<a href="#projects" ...>View My Work</a>` element (the first child inside the `<motion.div style={{ display: 'flex', gap: '0.875rem', ... }}>` CTA block) with:

```jsx
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
```

- [ ] **Step 4: Verify dropdown behaviour**

Run: `npm run dev`

- Click "View My Work" — dropdown opens, chevron points up
- Click Synthesis — navigates to `/experience/synthesis`
- Click back, open dropdown, click The Coca-Cola Company — navigates to `/experience/coke`
- Click back, open dropdown, click Personal Projects — page smooth-scrolls to `#projects`, dropdown closes
- Click anywhere outside the open dropdown — it closes
- On mobile: all three behaviours work identically

- [ ] **Step 5: Commit**

```bash
git add src/components/Intro.jsx
git commit -m "feat: replace View My Work link with internship/projects dropdown"
```

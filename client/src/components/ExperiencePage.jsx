import { useParams } from 'react-router-dom'
import { useRef, useEffect, useState, Fragment } from 'react'
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
    tagline: 'Synthesis is a data and strategy consultancy that helps global brands future-proof their business through open data, specialising in audience intelligence, cultural positioning, and route-to-consumer strategy across food & beverage, wellness, and entertainment. Clients include Diageo, Netflix, Meta, and PepsiCo.',
    overview: [
      'I was part of the Audiences pod that applied data science to identify growth audiences and passion spaces for brand marketing. The team focuses on two main areas: using network theory to understand brand audiences and formulate marketing strategies for entertainment brands like Netflix and 2K Games, and geosegmentation to inform distribution strategies for FMCG clients like Diageo and Brown Forman',
      'Alongside client work, the team also actively builds and develops internal tools such as data pipelines in Dagster and shared Python packages to streamline workflows',
      'Some of the key projects I worked on include building and maintaining a data pipeline to retrieve and identify F&B partners across Japan for a global spirits conglomerate and architecting an end-to-end AI pipeline to automate the processing of YouTube metadata for network analysis via GCP and Vertex AI',
    ],
    stack: [
      { category: 'Languages', tags: ['Python', 'SQL'] },
      { category: 'Cloud & Data', tags: ['GCP', 'BigQuery', 'Vertex AI'] },
    ],
    projects: [
      {
        name: 'Sports Audience Passion Space Mapping',
        description: 'Built a GCP pipeline to classify ~7,000 YouTube channels by their top associated properties using Gemini on Vertex AI, producing structured outputs for audience network graph construction.',
        outcomes: [
          'Processed ~7,000 channels end-to-end from GCS through Vertex AI batch inference',
          'Structured JSON output fed directly into network graph construction for audience clustering',
          'Streamlit prototype built for strategists to explore property associations and co-occurrences',
        ],
        tags: ['Python', 'GCS', 'BigQuery', 'Vertex AI', 'Gemini', 'Streamlit'],
        detail: [
          {
            type: 'text',
            content: 'Built for a Growth Audiences engagement focused on the sports industry. The goal was to segment viewers into themed passion spaces by identifying what properties audiences engage with across channels, things like specific sports, leagues, tournaments, and game titles, rather than working at the channel level where labels are too opaque to cluster meaningfully.',
          },
          {
            type: 'text',
            content: 'The pipeline took YouTube channel titles, descriptions, video titles, video descriptions, and category as input for around 7,000 channels. Gemini on Vertex AI predicted the top 3 to 5 properties most associated with each channel and returned a structured JSON response. These properties become nodes in a network graph downstream, with users who engage across multiple channels acting as edges, surfacing shared viewing behaviour at the property layer.',
          },
          {
            type: 'section',
            title: 'Context Window Management',
            blocks: [
              {
                type: 'text',
                content: 'YouTube channel data varies widely in length. Some channels had extensive descriptions and large numbers of video titles, and many inputs exceeded the context limit even with batch prediction.',
              },
              {
                type: 'text',
                content: 'Handled this by truncating input fields with a priority ordering based on signal density. Channel title and category were kept in full. Descriptions were capped at a fixed character limit. Video titles were taken from the most recent entries up to a set count. This kept inputs within the token budget while preserving the most informative fields.',
              },
              {
                type: 'text',
                content: 'Additional throughput optimization: pre-filtering channels with near-identical content signatures before inference to avoid redundant calls, and tuning batch sizes to balance job startup overhead against per-item latency.',
              },
            ],
          },
          {
            type: 'section',
            title: 'Output Quality and Consistency',
            blocks: [
              {
                type: 'text',
                content: 'Raw responses across a batch of this size were inconsistent. Semantically equivalent properties came back with different surface forms, for example "Basketball", "NBA", and "Pro Basketball" as separate labels for the same concept, which made downstream graph construction noisy.',
              },
              {
                type: 'bullets',
                items: [
                  'Enforced a JSON response schema through Vertex AI\'s structured output parameter to constrain format and reduce freeform variation',
                  'Set temperature to 0 for deterministic outputs across the batch',
                  'Included few-shot examples in the prompt to anchor the model on well-formed property extractions',
                  'Post-processed properties using embedding similarity to cluster and canonicalize semantically equivalent labels, with a manual review pass for high-ambiguity cases',
                ],
              },
            ],
          },
          {
            type: 'section',
            title: 'Streamlit Exploration Tool',
            blocks: [
              {
                type: 'text',
                content: 'Built an internal Streamlit prototype at the end of the internship for strategists to explore the results: filtering by property, inspecting which channels map to a given property, and identifying co-occurrence patterns across the corpus.',
              },
            ],
          },
        ],
      },
      {
        name: 'F&B Venue Identification and Prioritization',
        description: 'Built an end-to-end pipeline to extract, deduplicate, and score F&B venues across a target APAC market to support a global spirit client\'s distribution strategy.',
        outcomes: [
          'Delivered a scored, ranked venue dataset and statistics summary as the client deliverable',
          'Multi-source extraction across Google Maps Grid Search and SerpAPI for maximum coverage',
          'Full pipeline from raw extraction to client-ready output, owned within a four-person team',
        ],
        tags: ['Python', 'GeoPandas', 'Google Maps API', 'SerpAPI', 'GCS'],
        detail: [
          {
            type: 'text',
            content: 'A global spirit client needed to identify and prioritize F&B venues across a target APAC market as part of a distribution strategy engagement. The pipeline covered everything from raw extraction across multiple APIs through to a scored, ranked output and summary statistics that the strategy team could present to the client.',
          },
          {
            type: 'section',
            title: 'Data Extraction',
            blocks: [
              {
                type: 'text',
                content: 'Used the Google Maps Grid Search API as the primary extraction source and supplemented with SerpAPI to capture venues not surfaced by Maps, particularly for richer menu and drinks data. Used GeoPandas to define grid cells over key cities in the target market, ensuring systematic spatial coverage with no boundary gaps.',
              },
              {
                type: 'bullets',
                items: [
                  'Grid cells defined per city using GeoPandas bounding boxes at the required spatial resolution',
                  'Google Maps Grid Search for primary extraction: name, category, coordinates, price tier, rating, review count',
                  'SerpAPI used to supplement coverage and retrieve menu items, drink types served, and additional venue attributes',
                ],
              },
            ],
          },
          {
            type: 'section',
            title: 'Deduplication',
            blocks: [
              {
                type: 'text',
                content: 'Cross-source extraction produced a high rate of duplicates. Applied a multi-step deduplication approach to resolve them before feature engineering.',
              },
              {
                type: 'bullets',
                items: [
                  'Coordinate-based deduplication: venues within a distance threshold flagged as the same entity',
                  'Fuzzy NLP matching on venue names and addresses to catch near-duplicates with different formatting, transliterations, or minor spelling variation',
                ],
              },
            ],
          },
          {
            type: 'section',
            title: 'Feature Engineering and Filtering',
            blocks: [
              {
                type: 'text',
                content: 'Worked with a strategist and another data scientist to translate the client\'s branding profile and distribution criteria into filterable and scoreable features from the available fields.',
              },
              {
                type: 'bullets',
                items: [
                  'Drink classification: binary flags for alcohol vs non-alcohol service, and specific spirits categories matched against the client\'s portfolio',
                  'Menu item text parsed to extract brand alignment signals where structured drink fields were absent',
                  'Venue category: missing values imputed using keyword-based text classification on venue name and context, with KNN imputation as a fallback for venues where text signals were insufficient',
                  'Price tier from the Google Maps price indicator as a proxy for premium positioning',
                  'Derived features: spirits coverage score, category relevance weight based on on-premise likelihood, and a composite alignment score combining the above with rating and review volume',
                ],
              },
              {
                type: 'text',
                content: 'GeoPandas was used for spatial filtering to restrict venues to distribution-relevant zones within each city, removing venues outside target areas before scoring.',
              },
            ],
          },
        ],
      },
      {
        name: 'Geospatial Coverage Optimisation',
        description: 'Identified a retrieval coverage gap in the team\'s shared geospatial pipeline while working on the spirits client project and refactored it to improve coverage and reduce per-engagement API cost.',
        outcomes: [
          'Higher venue retrieval coverage across target geographic areas',
          'Lower per-engagement API cost from eliminating redundant calls',
          'Adopted as the team standard for all subsequent geo segmentation work',
        ],
        tags: ['Python', 'GeoPandas', 'Google Maps API', 'GCP'],
        detail: [
          {
            type: 'text',
            content: 'The issue surfaced during the spirits client project. We were not finding as many venues as the client expected, and the pipeline was running slowly with relatively high API costs per engagement. This pointed to a problem in the underlying extraction approach rather than the data itself.',
          },
          {
            type: 'section',
            title: 'Root Cause',
            blocks: [
              {
                type: 'text',
                content: 'The existing pipeline made radius-based queries from individual coordinate points. In dense urban areas, any single radius leaves gaps between adjacent query origins, so venues near those boundaries get missed. The problem was structural: no matter how many calls were made, the point-based approach could not guarantee full coverage. It also generated redundant calls in overlapping zones, adding cost without improving retrieval.',
              },
            ],
          },
          {
            type: 'section',
            title: 'What Changed',
            blocks: [
              {
                type: 'text',
                content: 'The Google Maps Grid Search API was already known within the team. The work was in understanding the API and integrating it into the existing workflow in a way that applied consistently across different target geographies.',
              },
              {
                type: 'bullets',
                items: [
                  'Used GeoPandas to define structured grid cells over each target city, replacing ad hoc coordinate selection with systematic spatial tiling',
                  'Grid Search queries one cell at a time, so every area in the target geography is covered exactly once with no boundary gaps',
                  'Eliminated overlapping radius calls, which reduced redundant API requests in dense areas and brought down per-engagement cost',
                ],
              },
              {
                type: 'text',
                content: 'The refactored pipeline produced higher retrieval coverage and lower API cost per run. It was applied directly to the spirits client project and carried forward as the team standard for all subsequent geo segmentation engagements.',
              },
            ],
          },
        ],
      },
    ],
    takeaways: [
      'Learnt to design data pipelines in a modular fashion to handle constantly shifting client requirements and data sources.',
      'Gained hands-on experience writing efficient SQL queries and working with datasets in the tens of millions of rows.',
      'Understood how to approach a raw open-source dataset from scratch — from cleaning and exploration through to extracting client-ready insights.',
      'Learnt how to manage LLM outputs at scale, including structured output enforcement and prompt design for batch inference on Vertex AI.',
      'Understood how network analysis and engagement data can surface audience behaviour patterns that inform brand targeting strategy.',
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
    tagline: "Coca-Cola's Commercial Products Supply (CPS) division manufactures the concentrates and beverage bases distributed to bottling partners across 18+ countries worldwide. As part of its Plant of the Future initiative, CPS is integrating AI and automation into internal workflows, from production monitoring to process optimization, to improve efficiency at scale across global operations.",
    overview: [
      'I was part of the Transformation team, a global innovation team within CPS focused on exploring and developing AI use cases across key business functions. The team partners with external research organisations, including A*STAR, to bring these projects from early exploration through to production-ready AI-powered solutions.',
      'My role as an AI Engineer Intern centred on agentic AI. I built agentic MVPs to explore and demonstrate where this technology could create real value for the business, working closely with global non-technical stakeholders throughout to design each solution around the actual business context and position it for future scaling and adoption.',
      'Outside of the agentic work, I also engineered data pipelines in Databricks to improve data synchronization across internal systems, and built AI-powered pipelines using Azure OpenAI to automate processes that were previously handled manually.',
    ],
    stack: [
      { category: 'Languages', tags: ['Python', 'SQL'] },
      { category: 'AI / LLM', tags: ['LangGraph', 'OpenAI', 'NLP', 'RAG'] },
      { category: 'Cloud & Data', tags: ['Azure', 'Databricks'] },
    ],
    projects: [
      {
        name: 'Global Leadership Meeting Agenda Agentic Pipeline',
        description: 'Multi-agent LangGraph pipeline that prepares CPS leadership meeting briefs automatically each week — analyzing KPI performance, financial metrics, and regional breakdowns from Azure SQL, and processing a monthly strategic project report from a PDF via Azure OpenAI vision, with results persisted and served via Flask.',
        outcomes: [
          'Four weekly flows covering KPIs, financial metrics, regional breakdowns, and strategic project review',
          'Presented to global CPS leadership and approved for further investment',
          'Replaced manual pre-meeting review — structured briefs surface before the meeting starts',
        ],
        tags: ['Python', 'LangGraph', 'Azure OpenAI', 'Azure SQL', 'Flask'],
        detail: [
          {
            type: 'text',
            content: 'Leadership meetings had no detailed agenda. KPI performance, financial metrics, and project updates were reviewed in the meeting itself, taking up time that should have been spent on discussion and making decisions. I built an agentic PoC to demonstrate how AI can automate this preparation process and save a significant amount of time.The scheduled pipeline runs across four flows and delivers detailed briefs and agenda item recommendations before each global leadership meeting.',
          },
          { type: 'diagram', name: 'AgendaWorkflow' },
          {
            type: 'section',
            title: 'Multi-Agent Graph Architecture',
            blocks: [
              {
                type: 'text',
                content: 'The system is built as a LangGraph StateGraph with nine nodes. After a data node fetches live KPI data from Azure SQL, a strategy agent classifies each metric by importance and an analyst agent flags those needing attention. If all metrics are on track the pipeline terminates early. Otherwise, regional and plant attribution nodes run in parallel to identify contributing entities, followed by a driver synthesis node, trend analysis, visualisation generation, and a narrative node that assembles the final output.',
              },
              {
                type: 'bullets',
                items: [
                  'Reasoning models handle strategy classification, trend analysis, and narrative generation — tasks that require synthesis across large context windows',
                  'Tool-use agents handle data retrieval — the LLM decides which metrics and entities to query, calls the appropriate SQL tool, and reasons over the result',
                  'An all-clear gate after the analyst node skips the full pipeline when all metrics are healthy, avoiding unnecessary LLM calls',
                  'Multiple graph variants cover different scopes, reusing the same node and agent infrastructure throughout',
                ],
              },
            ],
          },
          {
            type: 'section',
            title: 'Reusable Agent Framework',
            blocks: [
              {
                type: 'text',
                content: 'Alongside the pipeline work, I designed a reusable Azure OpenAI agent framework consisting of a base agent class and a custom tool registry. The base class handles the full tool-use loop — routing between standard completion calls and agentic tool-calling, managing retries, and enforcing rate-limit backoff — so individual agents are defined purely by their system prompt, model role, and the tools they are given. The tool registry allows any Python function to be registered as a callable tool with a typed schema, making it straightforward to attach new data sources or operations to any agent without modifying the core framework.',
              },
              {
                type: 'bullets',
                items: [
                  'Adopted across 10+ agents and both production use cases within the platform',
                  'Access controls enforced at the tool level — each tool integration carries its own permission boundary',
                  'New agents can be defined in a few lines by subclassing BaseAgent with a system prompt, model role, and tool list',
                ],
              },
            ],
          },
          {
            type: 'section',
            title: 'Strategic Project Report — PDF Ingestion',
            blocks: [
              {
                type: 'text',
                content: 'One of the flows processes strategic project slide decks stored in Azure Blob Storage. Rather than extracting PDFs as text, each page is rendered to an image via PyMuPDF, base64-encoded, and passed to Azure OpenAI as image_url blocks in the vision API format.',
              },
              {
                type: 'text',
                content: 'When a deck exceeds the per-request image limit, a map-reduce pattern handles the overflow: the pages are chunked into batches, each batch sent to the model for a partial structured JSON extraction, and the outputs combined in a synthesis call that deduplicates and merges them into the final result.',
              },
            ],
          },
        ],
      },
      {
        name: 'RCA Investigation Agentic Chatbot',
        description: 'LangGraph chatbot that walks an engineer through a structured equipment failure investigation pausing at each stage to ask targeted questions, querying historical maintenance records, and assembling a root cause report once the investigation is complete.',
        outcomes: [
          'Demoed to external industrial vendors as a proof of concept',
          'Human-in-the-loop interrupt cycle drives a structured, multi-stage investigation',
          'SSE-based streaming interface shows the investigation unfolding in real time',
        ],
        tags: ['Python', 'LangGraph', 'Flask', 'Azure OpenAI', 'SSE'],
        detail: [
          {
            type: 'text',
            content: 'The root cause analysis (RCA) process was initially long. inconsistent and required a lot of manual effort to gather evidence from various sources. Engineers gather information about the failure, cross-reference historical records, and reason across multiple possible causes before settling on one. The agent was designed to replicate that process — driving a structured staged investigation by asking targeted questions at each stage and pulling relevant historical data before producing a final report for human validation.',
          },
          { type: 'diagram', name: 'RcaUI' },
          {
            type: 'section',
            title: 'Graph Architecture and Routing',
            blocks: [
              {
                type: 'text',
                content: 'The graph has four nodes. After every pass through the core RCA node, a router reads the status flag set by the agent and branches: ask the user a question, fetch historical data, continue reasoning, or finalise the report. Two agents run sequentially inside the RCA node on each pass — one for reasoning, one to structure the output into a parseable JSON decision with a status flag.',
              },
              {
                type: 'bullets',
                items: [
                  'human node: calls LangGraph interrupt(), suspending graph execution until the user submits an answer via the web interface',
                  'data node: queries historical records from an external maintenance system using failure-mode keywords extracted from the agent\'s reasoning',
                  'summary node: runs once when status is COMPLETE, producing the final structured RCA report over the full investigation state',
                ],
              },
            ],
          },
          {
            type: 'section',
            title: 'Interrupt / Resume via Server-Sent Events',
            blocks: [
              {
                type: 'text',
                content: 'The web interface keeps an HTTP connection open and receives events via SSE as the graph runs. When the agent needs user input, the graph suspends and serialises state to memory via MemorySaver. The stream closes with a question event. When the user submits an answer, a separate POST endpoint resumes the graph from the exact checkpoint, feeds the answer into state, and opens a new SSE stream for the next stage.',
              },
              {
                type: 'bullets',
                items: [
                  'Each SSE event carries a type — message, finding, question, status, or error — so the UI renders each differently',
                  'Thread-keyed locks prevent duplicate resume requests from running concurrently on the same investigation thread',
                  'The graph is lazily initialised on first request so a config error at startup does not silently break all routes',
                ],
              },
            ],
          },
        ],
      },
      {
        name: 'Maintenance Log Retrieval System',
        description: 'Semantic search system for 3,000+ unstructured maintenance records, enabling natural-language queries over equipment failure history. Three design iterations were needed to reach a working retrieval architecture.',
        outcomes: [
          'Indexed 3,000+ maintenance records from unstructured operator logs',
          '72% retrieval accuracy on benchmark queries',
          'Replaced keyword search, which fails on semantically equivalent but lexically different failure descriptions',
        ],
        tags: ['Python', 'FAISS', 'SBERT', 'spaCy', 'OpenAI', 'RapidFuzz'],
        detail: [
          {
            type: 'text',
            content: 'Maintenance logs are written by experienced employees in the plant which means the stored information is often inconsistent, informal and hence difficult to query and retrieve. For example, "Mechanical seal failure" and "pump leaking from shaft" describe the same event but share no keywords. The goal was to build a system that takes a natural-language query about a failure, retrieves the most relevant historical resolution records, and summarises them into an actionable paragraph.',
          },
          {
            type: 'section',
            title: 'Iteration 1 — Fine-Tuned SBERT (Failed)',
            blocks: [
              {
                type: 'text',
                content: 'The first approach fine-tuned SBERT (all-MiniLM-L6-v2) on issue–action pairs using MultipleNegativesRankingLoss, with the hypothesis that querying an issue would retrieve its correct fix. The model trained correctly but produced a geometric problem in the embedding space.',
              },
              { type: 'diagram', name: 'EmbeddingSpace' },
              {
                type: 'text',
                content: 'Issues sharing structurally similar fixes — "hopper leak → adjust hinge", "sensor misaligned → adjust position" — were pulled into the same region of the space, not because the failures were related but because their corrective actions were. The fine-tuning objective was wrong. Retrieval required issues to cluster with similar issues, not with their paired actions.',
              },
            ],
          },
          {
            type: 'section',
            title: 'Iteration 2 — Custom NER Pipeline (Failed)',
            blocks: [
              {
                type: 'text',
                content: 'The second approach kept SBERT pretrained but added a custom NER pipeline — fine-tuning RoBERTa on 400 auto-labelled records to extract COMPONENT and FAILURE entities before embedding. Auto-labelling from a hand-crafted vocabulary introduced systematic label noise, and 400 sparse samples were insufficient for the model to generalise. The NER was eventually commented out at query time, leaving all the complexity of the training pipeline with none of its benefit.',
              },
            ],
          },
          {
            type: 'section',
            title: 'Final Design — Composable, Reliable Components',
            blocks: [
              {
                type: 'text',
                content: 'The working design replaced both failed layers with simpler components each operating only within their reliable range. spaCy handles text normalisation via lemmatisation and stopword removal. A pretrained all-mpnet-base-v2 (768-dim, no fine-tuning) handles semantic embedding. FAISS IndexFlatIP over L2-normalised vectors provides cosine similarity search with interpretable scores.',
              },
              {
                type: 'bullets',
                items: [
                  'RapidFuzz partial_ratio fuzzy-matches equipment names in the query, prefixing the embedding text with a detected equipment signal to bias retrieval without adding model complexity',
                  'Actions are never indexed — they are metadata returned as output, keeping the retrieval space semantically clean',
                  'A language model receives the top-k results and summarises them into one technical paragraph, enforced to the format: "resolved [failure] on [component] by [action]"',
                ],
              },
            ],
          },
        ],
      },
    ],
    takeaways: [
      'Learnt that fine-tuning a model on sparse or poorly labelled data can worsen performance relative to a strong pretrained baseline. The retrieval system only worked once the design stopped trying to specialise components that already generalised well out of the box.',
      'Understood how to translate technical work into business language and how to work in the other direction. Designing a solution around how it will be adopted, not just whether it technically functions, is what determines whether agentic AI creates real value in an enterprise.',
      'Learnt how to explain technical decisions to non-technical global stakeholders and design solutions collaboratively around real business constraints, including deployment fit, user adoption, and readiness for future scaling.',
      'Learnt how to design agentic architectures from scratch, including how to structure multi-agent state graphs, route between nodes based on agent output, and experiment with different patterns until the system behaviour matched the actual workflow.',
      'Developed with reusability in mind across both agent projects. Building shared agent base classes, composable node factories, and parameterised graph patterns meant new analysis flows could be added without rewriting the underlying infrastructure.',
    ],
  },
}

/* ── Diagram: KPI Intelligence Platform multi-agent workflow ───────── */
function AgendaWorkflow() {
  const W = 100, H = 46, R = 8
  const ACC = '#E61619'
  const nodes = [
    { id: 'data',      label: 'Data Agent',       sub: 'Azure SQL fetch',         x: 10,  y: 60 },
    { id: 'strategy',  label: 'Strategy Agent',   sub: 'Classify importance',     x: 118, y: 60 },
    { id: 'analyst',   label: 'Analyst Agent',    sub: 'Flag underperformers',    x: 226, y: 60 },
    { id: 'regional',  label: 'Regional Agent',   sub: 'Regional attribution',    x: 338, y: 18 },
    { id: 'plant',     label: 'Plant Agent',       sub: 'Plant attribution',       x: 338, y: 100 },
    { id: 'driver',    label: 'Driver Agent',     sub: 'Synthesise narratives',   x: 448, y: 60 },
    { id: 'trend',     label: 'Trend Agent',      sub: 'Historical analysis',     x: 556, y: 60 },
    { id: 'viz',       label: 'Viz Agent',        sub: 'Generate charts',         x: 664, y: 60 },
    { id: 'narrative', label: 'Narrative Agent',  sub: 'Generate insights',       x: 772, y: 60 },
  ]
  const arrows = [
    { x1: 110, y1: 83, x2: 118, y2: 83 },
    { x1: 218, y1: 83, x2: 226, y2: 83 },
    { x1: 326, y1: 83, x2: 338, y2: 41 },
    { x1: 326, y1: 83, x2: 338, y2: 123 },
    { x1: 438, y1: 41, x2: 448, y2: 83 },
    { x1: 438, y1: 123, x2: 448, y2: 83 },
    { x1: 548, y1: 83, x2: 556, y2: 83 },
    { x1: 656, y1: 83, x2: 664, y2: 83 },
    { x1: 764, y1: 83, x2: 772, y2: 83 },
  ]
  return (
    <div style={{ margin: '1.5rem 0', overflowX: 'auto' }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
        Agent Pipeline
      </p>
      <svg viewBox="0 0 900 165" style={{ width: '100%', minWidth: 720, display: 'block' }} aria-label="Meeting agenda agentic pipeline — agent graph diagram">
        <defs>
          <marker id="arr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--text-muted)" opacity="0.5" />
          </marker>
        </defs>

        {/* All-clear early exit */}
        <line x1="276" y1="106" x2="276" y2="122" stroke="var(--text-muted)" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
        <text x="276" y="132" textAnchor="middle" fontSize="8.5" fill="var(--text-muted)" fontFamily="Space Grotesk, sans-serif" opacity="0.7">all clear → END</text>

        {/* Parallel bracket lines */}
        <line x1="334" y1="41" x2="334" y2="123" stroke={ACC} strokeWidth="1" opacity="0.25" />
        <line x1="442" y1="41" x2="442" y2="123" stroke={ACC} strokeWidth="1" opacity="0.25" />

        {/* Arrows */}
        {arrows.map((a, i) => (
          <line key={i} x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke="var(--text-muted)" strokeWidth="1.2" markerEnd="url(#arr)" opacity="0.45" />
        ))}

        {/* Nodes */}
        {nodes.map((n) => (
          <g key={n.id}>
            <rect x={n.x} y={n.y} width={W} height={H} rx={R} fill={`${ACC}0d`} stroke={`${ACC}40`} strokeWidth="1" />
            <text x={n.x + W / 2} y={n.y + 15} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={ACC} fontFamily="Space Grotesk, sans-serif">{n.label}</text>
            <text x={n.x + W / 2} y={n.y + 30} textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontFamily="Space Grotesk, sans-serif">{n.sub}</text>
          </g>
        ))}

        {/* Parallel label */}
        <text x="388" y="156" textAnchor="middle" fontSize="8.5" fill="var(--text-muted)" fontFamily="Space Grotesk, sans-serif" opacity="0.6">parallel</text>
      </svg>
    </div>
  )
}

/* ── Diagram: RCA Investigation Agent UI mockup ────────────────────── */
function RcaUI() {
  return (
    <div style={{ margin: '1.5rem 0', borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.65rem', padding: '0.75rem 0.75rem 0' }}>
        RCA Agent Interface
      </p>
      <svg viewBox="0 0 910 870" style={{ width: '100%', display: 'block' }} aria-label="RCA Assistant UI mockup">
        <rect width="900" height="860" rx="12" fill="#F5F0E8" />
        <rect x="0" y="0" width="900" height="58" fill="#FDFBF7" />
        <rect x="0" y="57.5" width="900" height="1" fill="#D4C4A8" />
        <rect x="20" y="15" width="28" height="28" rx="6" fill="#1A1714" />
        <text x="34" y="29" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" fill="#FDFBF7">R</text>
        <text x="58" y="29" dominantBaseline="central" fontSize="14" fontWeight="600" fill="#1A1714">RCA Assistant</text>
        <rect x="182" y="14" width="400" height="30" rx="7" fill="#F5F0E8" stroke="#D4C4A8" strokeWidth="1.5" />
        <text x="196" y="29" dominantBaseline="central" fontSize="12.5" fill="#7A6E64">Dry part packaging leak after line restart</text>
        <rect x="596" y="16" width="120" height="26" rx="13" fill="#F5F0E8" stroke="#D4C4A8" strokeWidth="1" />
        <circle cx="610" cy="29" r="4" fill="#A0622A" />
        <text x="620" y="29" dominantBaseline="central" fontSize="11.5" fill="#7A6E64">Running · Stage 2</text>
        <rect x="730" y="14" width="90" height="30" rx="7" fill="#1A1714" />
        <text x="775" y="29" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="500" fill="#FDFBF7">Begin</text>
        <rect x="832" y="14" width="56" height="30" rx="7" fill="none" stroke="#D4C4A8" strokeWidth="1.5" />
        <text x="860" y="29" textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#7A6E64">Reset</text>
        <rect x="0" y="58" width="900" height="626" fill="#F5F0E8" />
        <rect x="110" y="84" width="2" height="556" fill="#EDE7D9" />
        <circle cx="111" cy="92" r="11" fill="#FDFBF7" stroke="#8B6F47" strokeWidth="2" />
        <circle cx="111" cy="92" r="4.5" fill="#8B6F47" />
        <text x="132" y="92" dominantBaseline="central" fontSize="10" fontWeight="700" letterSpacing="0.9" fill="#8B6F47">INVESTIGATION START</text>
        <rect x="132" y="108" width="730" height="68" rx="9" fill="#FDFBF7" stroke="#EDE7D9" strokeWidth="1" />
        <rect x="132" y="108" width="3" height="68" fill="#4A7A55" />
        <text x="146" y="125" dominantBaseline="central" fontSize="11" fontWeight="700" fill="#4A7A55">Coordinator</text>
        <text x="230" y="125" dominantBaseline="central" fontSize="10.5" fill="#7A6E64">stage 0</text>
        <text x="146" y="147" dominantBaseline="central" fontSize="13" fill="#4A3F35">Starting RCA investigation for: dry part packaging leak after line restart.</text>
        <text x="146" y="165" dominantBaseline="central" fontSize="13" fill="#4A3F35">Moving to stage 1 — symptom mapping.</text>
        <circle cx="111" cy="200" r="11" fill="#8B6F47" />
        <circle cx="111" cy="200" r="4.5" fill="#FDFBF7" />
        <text x="132" y="200" dominantBaseline="central" fontSize="10" fontWeight="700" letterSpacing="0.9" fill="#8B6F47">STAGE 1</text>
        <rect x="132" y="216" width="730" height="108" rx="9" fill="#FDFBF7" stroke="#EDE7D9" strokeWidth="1" />
        <rect x="132" y="216" width="3" height="108" fill="#8B6F47" />
        <text x="146" y="233" dominantBaseline="central" fontSize="11" fontWeight="700" fill="#8B6F47">Core analysis</text>
        <text x="240" y="233" dominantBaseline="central" fontSize="10.5" fill="#7A6E64">stage 1</text>
        <text x="146" y="256" dominantBaseline="central" fontSize="13" fill="#4A3F35">The reported symptom is time-dependent — the leak occurs on restart, not during steady-state</text>
        <text x="146" y="276" dominantBaseline="central" fontSize="13" fill="#4A3F35">operation. This strongly implicates transient conditions during the restart sequence: pressure</text>
        <text x="146" y="296" dominantBaseline="central" fontSize="13" fill="#4A3F35">spikes, seal temperature delta, or operator variation in the re-seating procedure.</text>
        <rect x="132" y="340" width="730" height="88" rx="9" fill="#FDFBF7" stroke="#EDE7D9" strokeWidth="1" />
        <rect x="132" y="340" width="3" height="88" fill="#9A5E28" />
        <text x="146" y="357" dominantBaseline="central" fontSize="11" fontWeight="700" fill="#9A5E28">Data agent</text>
        <text x="224" y="357" dominantBaseline="central" fontSize="10.5" fill="#7A6E64">stage 1</text>
        <text x="146" y="380" dominantBaseline="central" fontSize="13" fill="#4A3F35">Retrieved 3 historical records matching keywords ["leak"] + ["dry part", "packaging"].</text>
        <text x="146" y="400" dominantBaseline="central" fontSize="13" fill="#4A3F35">Closest match: WO-2024-0471 — seal failure after scheduled shutdown, root cause was</text>
        <text x="146" y="420" dominantBaseline="central" fontSize="13" fill="#4A3F35">under-torqued re-seating. Resolved by torque specification update.</text>
        <circle cx="111" cy="452" r="11" fill="#FDFBF7" stroke="#8B6F47" strokeWidth="2" />
        <text x="132" y="452" dominantBaseline="central" fontSize="10" fontWeight="700" letterSpacing="0.9" fill="#8B6F47">STAGE 2</text>
        <rect x="132" y="468" width="730" height="68" rx="9" fill="#EDE7D9" stroke="#D4C4A8" strokeWidth="1" />
        <rect x="132" y="468" width="3" height="68" fill="#7A6E64" />
        <text x="146" y="485" dominantBaseline="central" fontSize="11" fontWeight="700" fill="#4A3F35">You</text>
        <text x="146" y="508" dominantBaseline="central" fontSize="13" fill="#1A1714">The line was restarted manually after a 4-hour unplanned downtime. The seal was not</text>
        <text x="146" y="527" dominantBaseline="central" fontSize="13" fill="#1A1714">replaced — it was re-seated by the operator on shift at the time.</text>
        <rect x="132" y="552" width="730" height="50" rx="9" fill="#FDFBF7" stroke="#EDE7D9" strokeWidth="1" />
        <rect x="132" y="552" width="3" height="50" fill="#4A7A55" />
        <text x="146" y="569" dominantBaseline="central" fontSize="11" fontWeight="700" fill="#4A7A55">Coordinator</text>
        <text x="230" y="569" dominantBaseline="central" fontSize="10.5" fill="#7A6E64">stage 2</text>
        <text x="146" y="589" dominantBaseline="central" fontSize="13" fill="#4A3F35">Stage 2 completed. Finding recorded. Querying whether operator involvement is a factor.</text>
        <circle cx="148" cy="630" r="4" fill="#8B6F47" opacity="1" />
        <circle cx="162" cy="630" r="4" fill="#8B6F47" opacity="0.55" />
        <circle cx="176" cy="630" r="4" fill="#8B6F47" opacity="0.25" />
        <text x="192" y="630" dominantBaseline="central" fontSize="12.5" fill="#7A6E64">Agent is reasoning…</text>
        <rect x="0" y="684" width="900" height="176" fill="#FDFBF7" />
        <rect x="0" y="684" width="900" height="2.5" fill="#C4A882" />
        <text x="24" y="706" dominantBaseline="central" fontSize="10" fontWeight="700" letterSpacing="0.9" fill="#8B6F47">AGENT NEEDS YOUR INPUT</text>
        <text x="24" y="738" dominantBaseline="central" fontFamily="Georgia, serif" fontSize="16" fill="#1A1714">Was the same operator involved in the previous packaging leak</text>
        <text x="24" y="760" dominantBaseline="central" fontFamily="Georgia, serif" fontSize="16" fill="#1A1714">incident (WO-2024-0471)?</text>
        <rect x="24" y="782" width="752" height="42" rx="8" fill="#F5F0E8" stroke="#D4C4A8" strokeWidth="1.5" />
        <text x="40" y="803" dominantBaseline="central" fontSize="13" fill="#7A6E64">Type your answer and press Enter…</text>
        <rect x="790" y="782" width="92" height="42" rx="8" fill="#1A1714" />
        <text x="836" y="803" textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="500" fill="#FDFBF7">Send answer</text>
      </svg>
    </div>
  )
}

/* ── Diagram: Embedding space — iteration 1 failure vs final design ── */
function EmbeddingSpace() {
  const ACC = '#E61619'
  const panelW = 300, panelH = 200
  return (
    <div style={{ margin: '1rem 0' }}>
      <p style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.65rem' }}>
        Embedding space — what went wrong vs what we want
      </p>
      <svg viewBox="0 0 660 230" style={{ width: '100%', display: 'block' }} aria-label="Embedding space comparison diagram">
        <defs>
          <marker id="earr" markerWidth="5" markerHeight="5" refX="2.5" refY="2.5" orient="auto">
            <path d="M0,0 L5,2.5 L0,5 Z" fill="var(--text-muted)" opacity="0.4" />
          </marker>
        </defs>

        {/* Left panel — Iteration 1 (broken) */}
        <rect x="10" y="10" width={panelW} height={panelH} rx="8" fill={`${ACC}06`} stroke={`${ACC}20`} strokeWidth="1" />
        <text x="160" y="28" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={ACC} fontFamily="Space Grotesk, sans-serif">Iteration 1 — fine-tuned on issue–action pairs</text>

        {/* Cluster A label: "adjust X" actions */}
        <ellipse cx="100" cy="110" rx="52" ry="42" fill="#3B82F620" stroke="#3B82F650" strokeWidth="1" strokeDasharray="4 2" />
        <text x="100" y="75" textAnchor="middle" fontSize="8" fill="#3B82F6" fontFamily="Space Grotesk, sans-serif" fontWeight="600">"adjust" actions</text>

        {/* Points in cluster A — different failure types pulled together */}
        <circle cx="85" cy="100" r="5" fill="#3B82F6" opacity="0.8" />
        <text x="91" y="100" dominantBaseline="central" fontSize="7.5" fill="var(--text-muted)">hopper leak</text>
        <circle cx="95" cy="120" r="5" fill="#10B981" opacity="0.8" />
        <text x="101" y="120" dominantBaseline="central" fontSize="7.5" fill="var(--text-muted)">sensor misaligned</text>
        <circle cx="75" cy="135" r="5" fill="#F59E0B" opacity="0.8" />
        <text x="81" y="135" dominantBaseline="central" fontSize="7.5" fill="var(--text-muted)">valve loose</text>

        {/* Cluster B: "replace" actions */}
        <ellipse cx="230" cy="130" rx="50" ry="38" fill="#10B98120" stroke="#10B98150" strokeWidth="1" strokeDasharray="4 2" />
        <text x="230" y="97" textAnchor="middle" fontSize="8" fill="#10B981" fontFamily="Space Grotesk, sans-serif" fontWeight="600">"replace" actions</text>
        <circle cx="215" cy="120" r="5" fill="#3B82F6" opacity="0.8" />
        <text x="221" y="120" dominantBaseline="central" fontSize="7.5" fill="var(--text-muted)">seal failure</text>
        <circle cx="230" cy="138" r="5" fill="#F59E0B" opacity="0.8" />
        <text x="236" y="138" dominantBaseline="central" fontSize="7.5" fill="var(--text-muted)">bearing worn</text>

        <text x="160" y="198" textAnchor="middle" fontSize="8" fill={ACC} fontFamily="Space Grotesk, sans-serif">Clusters formed by action similarity, not failure type</text>

        {/* Right panel — Final design (correct) */}
        <rect x="350" y="10" width={panelW} height={panelH} rx="8" fill="#10B98106" stroke="#10B98130" strokeWidth="1" />
        <text x="500" y="28" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#10B981" fontFamily="Space Grotesk, sans-serif">Final design — pretrained, issues only indexed</text>

        {/* Cluster: seal failures */}
        <ellipse cx="420" cy="100" rx="45" ry="35" fill="#3B82F618" stroke="#3B82F650" strokeWidth="1" strokeDasharray="4 2" />
        <text x="420" y="68" textAnchor="middle" fontSize="8" fill="#3B82F6" fontFamily="Space Grotesk, sans-serif" fontWeight="600">seal failures</text>
        <circle cx="408" cy="95" r="5" fill="#3B82F6" opacity="0.85" />
        <text x="414" y="95" dominantBaseline="central" fontSize="7.5" fill="var(--text-muted)">seal failure</text>
        <circle cx="420" cy="112" r="5" fill="#3B82F6" opacity="0.85" />
        <text x="426" y="112" dominantBaseline="central" fontSize="7.5" fill="var(--text-muted)">pump leaking</text>

        {/* Cluster: sensor issues */}
        <ellipse cx="540" cy="95" rx="42" ry="33" fill="#F59E0B18" stroke="#F59E0B50" strokeWidth="1" strokeDasharray="4 2" />
        <text x="540" y="65" textAnchor="middle" fontSize="8" fill="#F59E0B" fontFamily="Space Grotesk, sans-serif" fontWeight="600">sensor issues</text>
        <circle cx="528" cy="90" r="5" fill="#F59E0B" opacity="0.85" />
        <text x="534" y="90" dominantBaseline="central" fontSize="7.5" fill="var(--text-muted)">sensor misaligned</text>
        <circle cx="545" cy="108" r="5" fill="#F59E0B" opacity="0.85" />
        <text x="551" y="108" dominantBaseline="central" fontSize="7.5" fill="var(--text-muted)">reading drift</text>

        {/* Actions as metadata callout */}
        <rect x="430" y="155" width="150" height="28" rx="5" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="1" />
        <text x="505" y="165" textAnchor="middle" dominantBaseline="central" fontSize="8" fill="var(--text-muted)" fontFamily="Space Grotesk, sans-serif">actions = metadata only</text>
        <text x="505" y="176" textAnchor="middle" dominantBaseline="central" fontSize="8" fill="var(--text-muted)" fontFamily="Space Grotesk, sans-serif">not part of embedding space</text>

        <text x="500" y="198" textAnchor="middle" fontSize="8" fill="#10B981" fontFamily="Space Grotesk, sans-serif">Issues cluster by failure type — retrieval finds similar failures</text>

        {/* Divider label */}
        <line x1="328" y1="20" x2="328" y2="200" stroke="var(--border)" strokeWidth="1" />
      </svg>
    </div>
  )
}

const DIAGRAMS = { AgendaWorkflow, RcaUI, EmbeddingSpace }

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

function DetailBlock({ block }) {
  if (block.type === 'diagram') {
    const Diagram = DIAGRAMS[block.name]
    return Diagram ? <Diagram /> : null
  }
  if (block.type === 'text') {
    return (
      <p style={{ fontSize: '0.9rem', lineHeight: 1.8, color: 'var(--text-muted)', margin: '0 0 0.75rem' }}>
        {block.content}
      </p>
    )
  }
  if (block.type === 'bullets') {
    return (
      <ul style={{ paddingLeft: 0, listStyle: 'none', margin: '0 0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
        {block.items.map((item, i) => (
          <li key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-start', fontSize: '0.875rem', lineHeight: 1.65, color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--accent-modal)', flexShrink: 0, marginTop: '3px', fontSize: '0.7rem' }}>▸</span>
            {item}
          </li>
        ))}
      </ul>
    )
  }
  if (block.type === 'section') {
    return (
      <div style={{ margin: '1.5rem 0 0' }}>
        <p style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: '0.8rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.65rem',
          letterSpacing: '0.01em',
        }}>
          {block.title}
        </p>
        {block.blocks.map((b, i) => <DetailBlock key={i} block={b} />)}
      </div>
    )
  }
  return null
}

function ProjectModal({ project, accentColor, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '88vh',
          overflowY: 'auto',
          boxShadow: '0 24px 60px rgba(0,0,0,0.35)',
          position: 'relative',
          '--accent-modal': accentColor,
        }}
      >
        {/* Modal header */}
        <div style={{
          padding: '1.75rem 2rem 1.25rem',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          background: 'var(--bg-card)',
          zIndex: 1,
          borderRadius: '16px 16px 0 0',
        }}>
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1,
              padding: '0.25rem 0.5rem', borderRadius: '6px',
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            ✕
          </button>
          <h2 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.75rem',
            paddingRight: '2.5rem',
            lineHeight: 1.3,
          }}>
            {project.name}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {project.tags.map(tag => (
              <span key={tag} style={{
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.68rem',
                fontWeight: 500,
                background: `${accentColor}12`,
                color: accentColor,
                border: `1px solid ${accentColor}25`,
              }}>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Modal body */}
        <div style={{ padding: '1.5rem 2rem' }}>
          {project.detail.map((block, i) => <DetailBlock key={i} block={block} />)}

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
            <p style={{
              fontSize: '0.65rem', fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: '0.75rem',
            }}>
              Key Outcomes
            </p>
            <ul style={{ paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {project.outcomes.map((outcome, j) => (
                <li key={j} style={{
                  fontSize: '0.875rem',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  gap: '0.6rem',
                  alignItems: 'flex-start',
                }}>
                  <span style={{ color: accentColor, flexShrink: 0, marginTop: '2px' }}>→</span>
                  {outcome}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function ExperiencePage() {
  const { id } = useParams()
  const data = BLOG_DATA[id]
  const [selectedProject, setSelectedProject] = useState(null)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [id])

  if (!data) {
    return (
      <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
        <Navbar />
        <div style={{ padding: '8rem 2rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Experience not found.</p>
          <a href="/" style={{ color: 'var(--accent)', fontWeight: 600 }}>← Back home</a>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh' }}>
      <Navbar />

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          accentColor={data.accentColor}
          onClose={() => setSelectedProject(null)}
        />
      )}

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
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '1rem', alignItems: 'center' }}>
                {data.stack.map((group, gi) => (
                  <Fragment key={gi}>
                    {gi > 0 && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', opacity: 0.4, alignSelf: 'center', userSelect: 'none' }}>·</span>
                    )}
                    {group.tags.map(tag => (
                      <span key={tag} style={{
                        padding: '3px 9px',
                        borderRadius: '5px',
                        fontSize: '0.72rem',
                        fontWeight: 500,
                        background: `${data.accentColor}10`,
                        color: data.accentColor,
                        border: `1px solid ${data.accentColor}22`,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </Fragment>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section style={{ padding: 'var(--sv) var(--sh)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '740px', margin: '0 auto' }}>
          <SectionWrapper>
            <p className="section-label" style={{ marginBottom: '1.25rem' }}>Overview</p>
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

      {/* Key Projects */}
      <section style={{ padding: 'var(--sv) var(--sh)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <SectionWrapper>
            <p className="section-label" style={{ marginBottom: '1.25rem' }}>Key Projects</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.25rem',
            }}>
              {data.projects.map((project, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedProject(project)}
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
                    cursor: 'pointer',
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
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h3 style={{
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '0.95rem',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        lineHeight: 1.3,
                      }}>
                        {project.name}
                      </h3>
                      <span style={{ fontSize: '0.7rem', color: data.accentColor, flexShrink: 0, marginLeft: '0.75rem', marginTop: '2px', whiteSpace: 'nowrap' }}>
                        Read more →
                      </span>
                    </div>
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
            <p className="section-label" style={{ marginBottom: '1.25rem' }}>Key Takeaways</p>
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
    </div>
  )
}

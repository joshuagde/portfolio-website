import { useRef, useEffect } from 'react'

const PAGE_BG   = '#FAF8F3'
const SCENE_DUR = 8000
const TILE_DUR  = 700
const TCOLS     = 9
const TROWS     = 7
const SCENES    = ['footballanalytics','formula1','housingeda','heatmap','candlestick','transit','anomaly']
const SCENE_DURS = { transit: 14000 }
const SCENE_DIMS = {
  footballanalytics: { w: 660, h: 480 },
  formula1:          { w: 700, h: 460 },
  housingeda:        { w: 660, h: 480 },
  heatmap:           { w: 520, h: 480 },
  candlestick:       { w: 660, h: 400 },
  transit:           { w: 560, h: 480 },
  anomaly:           { w: 660, h: 380 },
}

function makeTiles() {
  const tiles = []
  for (let r = 0; r < TROWS; r++)
    for (let c = 0; c < TCOLS; c++)
      tiles.push({ row: r, col: c, delay: 0 })
  tiles.sort(() => Math.random() - 0.5)
  tiles.forEach((t, i) => { t.delay = (i / tiles.length) * 0.88 })
  return tiles
}

export default function HeroRightCanvas({ onSceneChange, containerRef }) {
  const canvasRef = useRef(null)
  const onSceneChangeRef = useRef(onSceneChange)

  useEffect(() => { onSceneChangeRef.current = onSceneChange }, [onSceneChange])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx  = canvas.getContext('2d')
    const offA = document.createElement('canvas')
    const offB = document.createElement('canvas')
    const ctxA = offA.getContext('2d')
    const ctxB = offB.getContext('2d')
    let W = 0, H = 0
    let resizingFromTransition = false

    const sr   = s => { let x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x) }
    const ease = t => { const c = Math.min(1, Math.max(0, t)); return c < .5 ? 2*c*c : 1 - Math.pow(-2*c+2, 2)/2 }
    const N    = 'rgba(27,58,92,'
    const G    = 'rgba(184,136,74,'

    const applyDims = (dpr) => {
      for (const c of [canvas, offA, offB]) { c.width = W * dpr; c.height = H * dpr }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctxA.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctxB.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const setSize = () => {
      if (resizingFromTransition) return
      const dpr = window.devicePixelRatio || 1
      W = canvas.offsetWidth; H = canvas.offsetHeight
      applyDims(dpr)
      reinit()
    }
    const ro = new ResizeObserver(setSize)
    ro.observe(canvas)

    // ── HEATMAP ─────────────────────────────────────────────────
    const HM_FEATS = ['Score','GDP','Social','Life Exp','Freedom','Generosity','Corrupt']
    const HM_N = 7
    const HM_C = [
      [ 1.00, 0.79, 0.72, 0.78, 0.54, 0.10,-0.44],
      [ 0.79, 1.00, 0.76, 0.83, 0.37,-0.12,-0.35],
      [ 0.72, 0.76, 1.00, 0.73, 0.41, 0.05,-0.23],
      [ 0.78, 0.83, 0.73, 1.00, 0.34,-0.08,-0.26],
      [ 0.54, 0.37, 0.41, 0.34, 1.00, 0.29,-0.46],
      [ 0.10,-0.12, 0.05,-0.08, 0.29, 1.00, 0.08],
      [-0.44,-0.35,-0.23,-0.26,-0.46, 0.08, 1.00],
    ]
    const HM_DELAY = 90
    let hmState = Array.from({ length: HM_N * HM_N }, () => ({ prog: 0, born: 0 }))

    function initHeatmap(now) {
      const order = []
      for (let d = 0; d < HM_N * 2 - 1; d++)
        for (let i = 0; i < HM_N; i++) { const j = d - i; if (j >= 0 && j < HM_N) order.push(i * HM_N + j) }
      hmState = Array.from({ length: HM_N * HM_N }, () => ({ prog: 0, born: 0 }))
      order.forEach((k, rank) => { hmState[k].born = now + rank * HM_DELAY })
    }

    function hmCellColor(v) {
      if (v >= 0) return `rgb(${Math.round(250 - v * 66)},${Math.round(248 - v * 112)},${Math.round(243 - v * 169)})`
      const t = -v
      return `rgb(${Math.round(250 - t * 223)},${Math.round(248 - t * 190)},${Math.round(243 - t * 151)})`
    }

    function drawHeatmap(c, W, H, now) {
      const PL = 40, PT = 16, PR = 5, PB = 16
      const cw = (W - PL - PR) / HM_N, ch = (H - PT - PB) / HM_N
      let allDone = true
      c.font = '6.5px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = 'rgba(27,58,92,.40)'
      HM_FEATS.forEach((f, j) => c.fillText(f.slice(0, 7), PL + j * cw + cw / 2, PT - 3))
      c.textAlign = 'right'
      HM_FEATS.forEach((f, i) => c.fillText(f.slice(0, 7), PL - 2, PT + i * ch + ch / 2 + 2.5))
      for (let i = 0; i < HM_N; i++) for (let j = 0; j < HM_N; j++) {
        const k = i * HM_N + j, st = hmState[k]
        const age = now - st.born
        if (age < 0) { allDone = false; continue }
        st.prog = Math.min(1, age / 260)
        if (st.prog < 1) allDone = false
        const val = HM_C[i][j], x = PL + j * cw, y = PT + i * ch
        c.globalAlpha = st.prog; c.fillStyle = hmCellColor(val); c.fillRect(x + 1, y + 1, cw - 2, ch - 2); c.globalAlpha = 1
        c.strokeStyle = 'rgba(250,248,243,.7)'; c.lineWidth = 0.5; c.strokeRect(x + 1, y + 1, cw - 2, ch - 2)
        if (st.prog > 0.75 && cw > 13) {
          c.globalAlpha = Math.min(1, (st.prog - 0.75) / 0.25)
          c.font = `${Math.min(7, cw * 0.40)}px Inter,sans-serif`; c.textAlign = 'center'
          c.fillStyle = Math.abs(val) > 0.42 ? 'rgba(255,255,255,.90)' : 'rgba(27,58,92,.60)'
          c.fillText(val.toFixed(2), x + cw / 2, y + ch / 2 + 2.5); c.globalAlpha = 1
        }
        if ((i === HM_N - 1 || j === HM_N - 1) && st.prog > 0.5) {
          c.strokeStyle = `rgba(160,50,50,${st.prog * 0.18})`; c.lineWidth = 1; c.strokeRect(x + 1, y + 1, cw - 2, ch - 2)
        }
      }
      c.font = '7px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = 'rgba(27,58,92,.28)'
      c.fillText('World Happiness Report 2023 · 137 countries', W - 5, H - 4)
    }

    // ── CANDLESTICK ──────────────────────────────────────────────
    let csData = [], csBasePrice = 0, csLastAdd = 0, csScrollX = 0
    function addCandle() {
      const prev = csData.length ? csData[csData.length - 1].close : csBasePrice
      const open = prev, move = (Math.random() - 0.46) * 4.5
      const close = Math.max(20, open + move)
      csData.push({ open, close, high: Math.max(open, close) + Math.random() * 3.2, low: Math.min(open, close) - Math.random() * 3.2, vol: 0.25 + Math.random() * 0.75 })
      if (csData.length > 24) csData.shift()
    }
    function initCandlestick(now) { csBasePrice = 248.50; csData = []; csScrollX = 0; csLastAdd = now; for (let i = 0; i < 22; i++) addCandle() }
    function drawCandlestick(c, W, H, now) {
      const PAD_L = 50, PAD_R = 14, PAD_T = 54, PAD_B = 58
      const cW = W - PAD_L - PAD_R, cH = H - PAD_T - PAD_B, N = csData.length, slotW = cW / N
      const dt = Math.min(50, now - csLastAdd); csScrollX += dt * (slotW / 900)
      if (csScrollX >= slotW) { addCandle(); csScrollX -= slotW; csLastAdd = now }
      const allPx = csData.flatMap(d => [d.high, d.low])
      const minP = Math.min(...allPx) - 1.5, maxP = Math.max(...allPx) + 1.5
      const toY = p => PAD_T + cH * (1 - (p - minP) / (maxP - minP))
      const toX = i => PAD_L + i * slotW - csScrollX + slotW
      const bodyW = Math.max(3, slotW * 0.55)
      c.strokeStyle = 'rgba(27,58,92,0.06)'; c.lineWidth = 1
      for (let g = 0; g <= 4; g++) {
        const y = PAD_T + (cH / 4) * g; c.beginPath(); c.moveTo(PAD_L, y); c.lineTo(W - PAD_R, y); c.stroke()
        c.font = '8.5px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = 'rgba(27,58,92,0.40)'
        c.fillText((maxP - g * (maxP - minP) / 4).toFixed(1), PAD_L - 4, y + 3)
      }
      const maPoints = csData.map((_, i) => {
        if (i < 6) return null
        return { x: toX(i), y: toY(csData.slice(i - 6, i + 1).reduce((s, d) => s + d.close, 0) / 7) }
      }).filter(Boolean)
      if (maPoints.length >= 2) {
        c.beginPath(); c.moveTo(maPoints[0].x, maPoints[0].y); maPoints.forEach(p => c.lineTo(p.x, p.y))
        c.strokeStyle = 'rgba(184,136,74,0.80)'; c.lineWidth = 1.6; c.lineJoin = 'round'; c.stroke()
      }
      csData.forEach((d, i) => {
        const x = toX(i), isUp = d.close >= d.open, col = isUp ? 'rgba(47,133,90,' : 'rgba(180,60,60,'
        c.beginPath(); c.moveTo(x, toY(d.high)); c.lineTo(x, toY(d.low)); c.strokeStyle = col + '0.55)'; c.lineWidth = 1; c.stroke()
        c.fillStyle = col + (isUp ? '0.82)' : '0.72)'); c.fillRect(x - bodyW / 2, Math.min(toY(d.open), toY(d.close)), bodyW, Math.max(1.5, Math.abs(toY(d.close) - toY(d.open))))
      })
      const maxVol = Math.max(...csData.map(d => d.vol)), volMaxH = PAD_B * 0.55
      csData.forEach((d, i) => { const x = toX(i), bH = (d.vol / maxVol) * volMaxH; c.fillStyle = d.close >= d.open ? 'rgba(47,133,90,0.22)' : 'rgba(180,60,60,0.18)'; c.fillRect(x - bodyW / 2, H - PAD_B * 0.6 - bH + 8, bodyW, bH) })
      const last = csData[csData.length - 1], chg = last ? ((last.close - csBasePrice) / csBasePrice * 100) : 0
      const dayChg = last ? ((last.close - last.open) / last.open * 100) : 0, isUp = chg >= 0
      c.font = '600 9.5px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = 'rgba(27,58,92,0.55)'; c.fillText('S&P500', PAD_L, 16)
      c.font = 'bold 16px Inter,sans-serif'; c.fillStyle = 'rgba(27,58,92,0.88)'; c.fillText(last ? last.close.toFixed(2) : '--', PAD_L, 36)
      c.font = '10px Inter,sans-serif'; c.fillStyle = isUp ? 'rgba(47,133,90,0.85)' : 'rgba(180,60,60,0.85)'
      c.fillText(`${isUp ? '▲' : '▼'} ${Math.abs(dayChg).toFixed(2)}%   P&L ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`, PAD_L + 82, 36)
    }

    // ══════════════════════════════════════════════════════════════
    // ── HOUSING EDA SCENE (2×2 panels) ───────────────────────────
    // ══════════════════════════════════════════════════════════════
    const EDA_FI = [
      { label: 'Overall Quality',    imp: 0.56, col: 'rgba(27,58,92,'   },
      { label: 'Living Area (sqft)', imp: 0.38, col: 'rgba(37,78,120,'  },
      { label: 'Neighbourhood',      imp: 0.29, col: 'rgba(184,136,74,' },
      { label: 'Year Built',         imp: 0.22, col: 'rgba(47,100,150,' },
      { label: 'Garage Capacity',    imp: 0.17, col: 'rgba(60,130,80,'  },
      { label: 'Basement Area',      imp: 0.14, col: 'rgba(130,80,180,' },
      { label: 'Bathrooms',          imp: 0.10, col: 'rgba(160,90,40,'  },
    ]
    const EDA_BEDS = [
      { n: '2 bed', med: 128, q1: 105, q3: 160, col: N },
      { n: '3 bed', med: 172, q1: 140, q3: 215, col: 'rgba(47,100,150,' },
      { n: '4 bed', med: 238, q1: 188, q3: 300, col: G },
      { n: '5 bed', med: 318, q1: 245, q3: 415, col: 'rgba(60,130,80,' },
    ]
    const EDA_HIST = [42,185,295,240,165,90,45,34,12]
    const EDA_HIST_LABELS = ['50','100','150','200','250','300','350','400','500']
    const EDA_SCATTER = Array.from({ length: 55 }, (_, i) => {
      const sqft = 700 + sr(i * 7 + 1) * 3300
      const price = Math.max(80000, Math.min(520000, sqft * 90 + 55000 + (sr(i * 7 + 2) - .5) * 90000))
      return { sqft: Math.round(sqft / 50) * 50, price: Math.round(price / 5000) * 5000 }
    })

    let edaT0 = null
    function initHousingEDA() { edaT0 = null }

    function edaPanel(c, px, py, pw, ph, fn, age) {
      const g = 1
      c.fillStyle = PAGE_BG; c.fillRect(px, py, pw, ph)
      c.save(); c.beginPath(); c.rect(px + g, py + g, pw - g * 2, ph - g * 2); c.clip()
      c.translate(px + g, py + g); fn(c, pw - g * 2, ph - g * 2, age); c.restore()
    }

    function drawEDA_FI(c, pw, ph, age) {
      const PL = 74, PR = 30, PT = 17, PB = 10, maxW = pw - PL - PR
      const rowH = (ph - PT - PB) / EDA_FI.length, barH = rowH * 0.54
      c.font = 'bold 7px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.52)'; c.fillText('Feature Importance · House Price GBM', PL, 11)
      c.beginPath(); c.moveTo(PL, PT - 3); c.lineTo(PL, PT + rowH * EDA_FI.length); c.strokeStyle = N + '0.18)'; c.lineWidth = .8; c.stroke()
      ;[.25, .5, .75].forEach(f => {
        const x = PL + maxW * f
        c.beginPath(); c.moveTo(x, PT - 3); c.lineTo(x, PT + rowH * EDA_FI.length); c.strokeStyle = N + '0.05)'; c.lineWidth = .5; c.stroke()
        c.font = '5px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = N + '0.20)'; c.fillText(Math.round(f * 100) + '%', x, PT + rowH * EDA_FI.length + 8)
      })
      EDA_FI.forEach((d, i) => {
        const p = ease((age - i * 180 - 100) / 480), bw = d.imp * maxW * p
        const y = PT + i * rowH + (rowH - barH) / 2
        if (bw > 0) {
          const grd = c.createLinearGradient(PL, 0, PL + bw, 0); grd.addColorStop(0, d.col + '0.88)'); grd.addColorStop(1, d.col + '0.48)')
          c.fillStyle = grd; c.fillRect(PL, y, bw, barH)
        }
        c.font = `${i === 0 ? 'bold ' : ''}6.5px Inter,sans-serif`; c.textAlign = 'right'; c.fillStyle = N + '0.62)'; c.fillText(d.label, PL - 3, y + barH / 2 + 2.5)
        if (p > 0.65) { c.font = 'bold 6px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = d.col + ((p - .65) / .35) + ')'; c.fillText(Math.round(d.imp * 100) + '%', PL + bw + 3, y + barH / 2 + 2.5) }
        if (i === 0 && p > .88) { c.strokeStyle = G + '0.38)'; c.lineWidth = 1; c.strokeRect(PL, y, bw, barH) }
      })
      c.font = '5px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = N + '0.20)'; c.fillText('SHAP · Ames Housing Dataset', pw - 2, ph - 2)
    }

    function drawEDA_Beds(c, pw, ph, age) {
      const PL = 10, PR = 10, PT = 20, PB = 30
      const cW = pw - PL - PR, cH = ph - PT - PB
      const maxP = 420, toY = p => PT + cH * (1 - p / maxP)
      const gap = cW / EDA_BEDS.length, barW = gap * 0.48
      c.font = 'bold 7px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.52)'; c.fillText('Median Sale Price by Bedrooms', PL, 11)
      c.beginPath(); c.moveTo(PL, PT + cH); c.lineTo(pw - PR, PT + cH); c.strokeStyle = N + '0.15)'; c.lineWidth = .7; c.stroke()
      ;[100, 200, 300, 400].forEach(p => {
        const y = toY(p); c.beginPath(); c.moveTo(PL, y); c.lineTo(pw - PR, y); c.strokeStyle = N + '0.05)'; c.lineWidth = .4; c.stroke()
        c.font = '5px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = N + '0.20)'; c.fillText('$' + p + 'k', PL - 2, y + 2)
      })
      EDA_BEDS.forEach((d, i) => {
        const cx = PL + gap * i + gap / 2
        const p = ease((age - i * 280 - 180) / 650)
        const medY = toY(d.med), q1Y = toY(d.q1), q3Y = toY(d.q3)
        const animBot = PT + cH, bh = (animBot - medY) * p
        if (p > 0) {
          // IQR shading
          if (p > 0.4) { const qa = (p - .4) / .6; c.fillStyle = d.col + (qa * .12) + ')'; c.fillRect(cx - barW / 2, q3Y, barW, q1Y - q3Y) }
          // Bar
          c.fillStyle = d.col + '0.80)'; c.fillRect(cx - barW / 2, animBot - bh, barW, bh)
          // Value label
          if (p > .75) { c.font = 'bold 6px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = N + ((p - .75) / .25 * .72) + ')'; c.fillText('$' + d.med + 'k', cx, animBot - bh - 3) }
        }
        c.font = '5.5px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = N + '0.38)'; c.fillText(d.n, cx, ph - PB / 2 + 5)
      })
      c.font = '5px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = N + '0.20)'; c.fillText('Ames Iowa · Kaggle', pw - 2, ph - 2)
    }

    function drawEDA_Dist(c, pw, ph, age) {
      const PL = 22, PR = 8, PT = 17, PB = 22
      const cW = pw - PL - PR, cH = ph - PT - PB
      const maxN = 295, nB = EDA_HIST.length, binW = cW / nB
      const toY = n => PT + cH * (1 - n / maxN)
      c.font = 'bold 7px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.52)'; c.fillText('Sale Price Distribution', PL, 11)
      c.beginPath(); c.moveTo(PL, PT); c.lineTo(PL, PT + cH); c.lineTo(pw - PR, PT + cH); c.strokeStyle = N + '0.15)'; c.lineWidth = .7; c.stroke()
      ;[100, 200].forEach(n => {
        const y = toY(n); c.beginPath(); c.moveTo(PL, y); c.lineTo(pw - PR, y); c.strokeStyle = N + '0.05)'; c.lineWidth = .4; c.stroke()
        c.font = '5px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = N + '0.18)'; c.fillText(n, PL - 2, y + 2)
      })
      EDA_HIST.forEach((n, i) => {
        const p = ease((age - i * 110 - 80) / 420), bh = n / maxN * cH * p
        const x = PL + i * binW
        if (bh > 0) {
          const grd = c.createLinearGradient(0, PT + cH - bh, 0, PT + cH); grd.addColorStop(0, N + '0.76)'); grd.addColorStop(1, N + '0.30)')
          c.fillStyle = grd; c.fillRect(x + 1, PT + cH - bh, binW - 2, bh)
        }
        if (i % 2 === 0) { c.font = '4.5px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = N + '0.20)'; c.fillText(EDA_HIST_LABELS[i] + 'k', x + binW / 2, PT + cH + 9) }
      })
      // KDE curve overlay
      const kAge = age - 1100
      if (kAge > 0) {
        const kp = ease(kAge / 900)
        c.beginPath()
        EDA_HIST.forEach((n, i) => {
          const x = PL + i * binW + binW / 2, y = toY(n)
          const animY = y + (1 - kp) * (PT + cH - y)
          i === 0 ? c.moveTo(x, animY) : c.lineTo(x, animY)
        })
        c.strokeStyle = G + '0.78)'; c.lineWidth = 1.6; c.lineJoin = 'round'; c.stroke()
      }
      c.save(); c.translate(8, PT + cH / 2); c.rotate(-Math.PI / 2); c.font = '5px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = N + '0.20)'; c.fillText('count', 0, 0); c.restore()
    }

    function drawEDA_Scatter(c, pw, ph, age) {
      const PL = 26, PR = 10, PT = 17, PB = 24
      const cW = pw - PL - PR, cH = ph - PT - PB
      const minS = 600, maxS = 4200, minP = 60000, maxP = 540000
      const toX = s => PL + cW * (s - minS) / (maxS - minS)
      const toY = p => PT + cH * (1 - (p - minP) / (maxP - minP))
      const nDraw = Math.floor(ease(age / 3800) * EDA_SCATTER.length)
      c.font = 'bold 7px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.52)'; c.fillText('Sale Price vs Living Area', PL, 11)
      c.beginPath(); c.moveTo(PL, PT); c.lineTo(PL, PT + cH); c.lineTo(pw - PR, PT + cH); c.strokeStyle = N + '0.15)'; c.lineWidth = .7; c.stroke()
      ;[200000, 400000].forEach(p => {
        const y = toY(p); c.beginPath(); c.moveTo(PL, y); c.lineTo(pw - PR, y); c.strokeStyle = N + '0.05)'; c.lineWidth = .4; c.stroke()
        c.font = '5px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = N + '0.18)'; c.fillText('$' + p / 1000 + 'k', PL - 2, y + 2)
      })
      ;[1000, 2000, 3000, 4000].forEach(s => {
        const x = toX(s); c.beginPath(); c.moveTo(x, PT); c.lineTo(x, PT + cH); c.strokeStyle = N + '0.05)'; c.lineWidth = .4; c.stroke()
        c.font = '5px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = N + '0.18)'; c.fillText(s + '²', x, PT + cH + 9)
      })
      for (let i = 0; i < nDraw; i++) {
        const pt = EDA_SCATTER[i], p = ease((age - i * (3800 / EDA_SCATTER.length)) / 180)
        c.globalAlpha = p * 0.60; c.beginPath(); c.arc(toX(pt.sqft), toY(pt.price), 2.2, 0, Math.PI * 2); c.fillStyle = N + '1)'; c.fill()
      }
      c.globalAlpha = 1
      if (nDraw >= Math.floor(EDA_SCATTER.length * .55)) {
        const pts = EDA_SCATTER.slice(0, nDraw)
        const xs = pts.map(p => p.sqft), ys = pts.map(p => p.price), n = pts.length
        const sx = xs.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0)
        const sxy = xs.reduce((a, x, i) => a + x * ys[i], 0), sx2 = xs.reduce((a, x) => a + x * x, 0)
        const m = (n * sxy - sx * sy) / (n * sx2 - sx * sx), b = (sy - m * sx) / n
        const rp = ease((nDraw / EDA_SCATTER.length - .55) / .45)
        const x2 = minS + (maxS - minS) * rp
        c.beginPath(); c.moveTo(toX(minS), toY(b + m * minS)); c.lineTo(toX(x2), toY(b + m * x2))
        c.strokeStyle = G + '0.82)'; c.lineWidth = 1.6; c.stroke()
      }
      c.font = '5px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = N + '0.20)'; c.fillText('Living Area (sqft)', PL + cW / 2, ph - 4)
      c.save(); c.translate(8, PT + cH / 2); c.rotate(-Math.PI / 2); c.fillText('Sale Price', 0, 0); c.restore()
    }

    function drawHousingEDA(c, now) {
      if (!edaT0) edaT0 = now
      const age = now - edaT0
      c.fillStyle = PAGE_BG; c.fillRect(0, 0, W, H)
      const pw1 = Math.round(W * 0.50), pw2 = W - pw1
      const ph1 = Math.round(H * 0.50), ph2 = H - ph1
      edaPanel(c, 0,   0,   pw1, ph1, drawEDA_FI,      age)
      edaPanel(c, pw1, 0,   pw2, ph1, drawEDA_Beds,    age)
      edaPanel(c, 0,   ph1, pw1, ph2, drawEDA_Dist,    age)
      edaPanel(c, pw1, ph1, pw2, ph2, drawEDA_Scatter, age)
    }

    // ── TRANSIT ──────────────────────────────────────────────────
    const TR_CL = [
      { label: 'Commuters',  sub: 'high freq · peak hrs',  cx: 0.32, cy: 0.32, col: 'rgba(27,58,92,',   rgb: [27,58,92]    },
      { label: 'Off-Peak',   sub: 'evening · weekend',     cx: 0.65, cy: 0.30, col: 'rgba(184,136,74,', rgb: [184,136,74]  },
      { label: 'Occasional', sub: 'low freq · irregular',  cx: 0.32, cy: 0.68, col: 'rgba(47,133,90,',  rgb: [47,133,90]   },
      { label: 'Tourists',   sub: 'short stay · all hrs',  cx: 0.65, cy: 0.70, col: 'rgba(130,80,180,', rgb: [130,80,180]  },
    ]
    const TR_RADII = [0.13, 0.12, 0.11, 0.10]
    const TR_N_PTS = 68
    let trPts = [], trPhase = 'scatter', trPhaseT = 0, trLabelAlpha = 0
    function initTransit(now) {
      trPts = Array.from({ length: TR_N_PTS }, (_, idx) => {
        const cl = TR_CL[idx % TR_CL.length]
        return { sx: W * 0.04 + Math.random() * W * 0.92, sy: H * 0.04 + Math.random() * H * 0.92, tx: cl.cx * W + (Math.random() - 0.5) * W * 0.06, ty: cl.cy * H + (Math.random() - 0.5) * H * 0.06, x: 0, y: 0, cl: idx % TR_CL.length, ph: Math.random() * Math.PI * 2, spd: 0.004 + Math.random() * 0.004 }
      })
      trPts.forEach(p => { p.x = p.sx; p.y = p.sy }); trPhase = 'scatter'; trPhaseT = now; trLabelAlpha = 0
    }
    function drawTransit(c, W, H, now) {
      const age = now - trPhaseT
      if (trPhase === 'scatter' && age > 800) { trPhase = 'gather'; trPhaseT = now }
      if (trPhase === 'gather') { const t = Math.min(1, age / 10000), e = t; trPts.forEach(p => { p.x += (p.tx - p.x) * p.spd * (1 + e * 0.4); p.y += (p.ty - p.y) * p.spd * (1 + e * 0.4) }); if (t >= 1) { trPhase = 'hold'; trPhaseT = now } }
      if (trPhase === 'hold') { trLabelAlpha = Math.min(1, age / 900); trPts.forEach(p => { p.x = p.tx + Math.sin(now * 0.0005 + p.ph) * 2.5; p.y = p.ty + Math.cos(now * 0.0006 + p.ph) * 2.5 }) }
      if (trPhase === 'hold' || trPhase === 'gather') { TR_CL.forEach((cl, ci) => { const clR = W * TR_RADII[ci], a = (trPhase === 'hold' ? trLabelAlpha : Math.min(1, (now - trPhaseT) / 2500)) * 0.18; for (let r = clR; r > 0; r -= clR / 5) { c.beginPath(); c.arc(cl.cx * W, cl.cy * H, r, 0, Math.PI * 2); c.fillStyle = cl.col + a * 0.7 + ')'; c.fill() } }) }
      trPts.forEach(p => { const cl = TR_CL[p.cl], pulse = Math.sin(now * 0.0014 + p.ph) * 0.5 + 0.5; c.beginPath(); c.arc(p.x, p.y, 2.0 + pulse * 0.5, 0, Math.PI * 2); c.fillStyle = cl.col + (0.50 + pulse * 0.22) + ')'; c.fill() })
      if (trLabelAlpha > 0) { TR_CL.forEach((cl, ci) => { const clR = W * TR_RADII[ci], lx = cl.cx * W, ly = cl.cy * H - clR - 8; c.font = 'bold 8.5px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = cl.col + trLabelAlpha * 0.82 + ')'; c.fillText(cl.label, lx, ly); c.font = '7px Inter,sans-serif'; c.fillStyle = cl.col + trLabelAlpha * 0.50 + ')'; c.fillText(cl.sub, lx, ly + 10) }) }
      const LW = 82, LH = TR_CL.length * 13 + 8, lx0 = W - 5 - LW, ly0 = H - 7 - LH
      c.fillStyle = 'rgba(250,248,243,0.88)'; c.beginPath(); c.roundRect(lx0, ly0, LW, LH, 4); c.fill()
      c.strokeStyle = 'rgba(27,58,92,.10)'; c.lineWidth = 0.8; c.beginPath(); c.roundRect(lx0, ly0, LW, LH, 4); c.stroke()
      TR_CL.forEach((cl, i) => { const ey = ly0 + 6 + i * 13; c.beginPath(); c.arc(lx0 + 8, ey + 4, 4, 0, Math.PI * 2); c.fillStyle = `rgb(${cl.rgb[0]},${cl.rgb[1]},${cl.rgb[2]})`; c.fill(); c.font = 'bold 7.5px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = 'rgba(27,58,92,.78)'; c.fillText(cl.label, lx0 + 16, ey + 8) })
      c.font = '7.5px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = 'rgba(27,58,92,.28)'; c.fillText('MRT Smart Card · k-means profiles', lx0 - 4, H - 4)
    }

    // ── ANOMALY DETECTION ─────────────────────────────────────────
    const AN_MEAN = 0.5, AN_SIG = 0.13, AN_NPTS = 55, AN_TICK = 115
    let anPts = [], anLastTick = 0
    function anNewPt(now) { const isA = Math.random() < 0.07, v = isA ? AN_MEAN + (Math.random() > 0.5 ? 1 : -1) * (AN_SIG * 2.6 + Math.random() * AN_SIG * 0.7) : AN_MEAN + (Math.random() - 0.5) * AN_SIG * 2.3; anPts.push({ v, anom: isA, at: isA ? now : 0 }); if (anPts.length > AN_NPTS) anPts.shift() }
    function initAnomaly(now) { anPts = []; anLastTick = now; for (let i = 0; i < AN_NPTS; i++) anNewPt(now) }
    function drawAnomaly(c, W, H, now) {
      const PAD = { l: 40, r: 10, t: 20, b: 24 }, cw = W - PAD.l - PAD.r, ch = H - PAD.t - PAD.b
      if (now - anLastTick > AN_TICK) { anNewPt(now); anLastTick = now }
      for (let g = 0; g <= 4; g++) { const y = PAD.t + (g / 4) * ch; c.beginPath(); c.moveTo(PAD.l, y); c.lineTo(W - PAD.r, y); c.strokeStyle = 'rgba(27,58,92,.06)'; c.lineWidth = 0.7; c.stroke(); c.font = '7px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = 'rgba(27,58,92,.28)'; c.fillText((1 - g / 4).toFixed(1), PAD.l - 3, y + 3) }
      c.beginPath(); c.moveTo(PAD.l, PAD.t); c.lineTo(PAD.l, PAD.t + ch); c.lineTo(W - PAD.r, PAD.t + ch); c.strokeStyle = 'rgba(27,58,92,.18)'; c.lineWidth = 1; c.stroke()
      const toY = v => PAD.t + ch * (1 - v), toX = i => PAD.l + cw * (i / (AN_NPTS - 1))
      const bt = toY(AN_MEAN + AN_SIG * 2), bb = toY(AN_MEAN - AN_SIG * 2)
      c.fillStyle = 'rgba(27,58,92,.05)'; c.fillRect(PAD.l, bt, cw, bb - bt)
      c.setLineDash([4, 6]);[bt, bb].forEach(y => { c.beginPath(); c.moveTo(PAD.l, y); c.lineTo(W - PAD.r, y); c.strokeStyle = 'rgba(27,58,92,.18)'; c.lineWidth = 0.8; c.stroke() }); c.setLineDash([])
      c.beginPath(); c.moveTo(PAD.l, toY(AN_MEAN)); c.lineTo(W - PAD.r, toY(AN_MEAN)); c.strokeStyle = 'rgba(27,58,92,.12)'; c.lineWidth = 1; c.stroke()
      c.beginPath(); anPts.forEach((p, i) => { const x = toX(i), y = toY(p.v); i === 0 ? c.moveTo(x, y) : c.lineTo(x, y) }); c.strokeStyle = 'rgba(27,58,92,.55)'; c.lineWidth = 1.2; c.lineJoin = 'round'; c.stroke()
      c.beginPath(); anPts.forEach((p, i) => { const x = toX(i), y = toY(p.v); i === 0 ? c.moveTo(x, y) : c.lineTo(x, y) }); c.lineTo(toX(anPts.length - 1), PAD.t + ch); c.lineTo(PAD.l, PAD.t + ch); c.closePath(); c.fillStyle = 'rgba(27,58,92,.05)'; c.fill()
      anPts.forEach((p, i) => {
        const x = toX(i), y = toY(p.v)
        if (p.anom) { const age = now - p.at, pulse = Math.max(0, 1 - age / 1300); if (pulse > 0) { c.beginPath(); c.arc(x, y, 5 + pulse * 9, 0, Math.PI * 2); c.strokeStyle = `rgba(180,60,60,${pulse * 0.4})`; c.lineWidth = 1.2; c.stroke() }; c.beginPath(); c.arc(x, y, 3.8, 0, Math.PI * 2); c.fillStyle = 'rgba(180,60,60,.85)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1; c.stroke(); if (age < 1600) { c.font = 'bold 8px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = `rgba(180,60,60,${Math.max(0, 1 - age / 1600) * 0.8})`; c.fillText('!', x, y - (p.v > AN_MEAN ? 10 : -14)) } }
        else { c.beginPath(); c.arc(x, y, 1.8, 0, Math.PI * 2); c.fillStyle = 'rgba(27,58,92,.38)'; c.fill() }
      })
      c.font = 'bold 8.5px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = 'rgba(27,58,92,.50)'; c.fillText('Live Transaction Stream', PAD.l, 13)
      c.font = '7px Inter,sans-serif'; c.fillStyle = 'rgba(27,58,92,.28)'; c.fillText('±2σ normal band', PAD.l + 4, bt - 3)
      const ac = anPts.filter(p => p.anom).length; if (ac > 0) { c.textAlign = 'right'; c.fillStyle = 'rgba(180,60,60,.60)'; c.fillText(`${ac} anomal${ac > 1 ? 'ies' : 'y'} flagged`, W - PAD.r, 13) }
    }

    // ══════════════════════════════════════════════════════════════
    // ── FORMULA 1 SCENE ──────────────────────────────────────────
    // ══════════════════════════════════════════════════════════════

    // Pre-computed lap telemetry (speed, 0-1 normalized)
    const F1_TELE = Array.from({ length: 240 }, (_, i) => {
      const t = i / 239
      let s = 260
      if (t < .10)       s = 200 + t / .10 * 120
      else if (t < .14)  s = 320 - (t - .10) / .04 * 210
      else if (t < .20)  s = 110 + (t - .14) / .06 * 100
      else if (t < .28)  s = 210 + (t - .20) / .08 * 70
      else if (t < .32)  s = 280 - (t - .28) / .04 * 150
      else if (t < .38)  s = 130 + (t - .32) / .06 * 110
      else if (t < .42)  s = 240 - (t - .38) / .04 * 160
      else if (t < .50)  s = 80  + (t - .42) / .08 * 190
      else if (t < .56)  s = 270 + (t - .50) / .06 * 45
      else if (t < .60)  s = 315 - (t - .56) / .04 * 140
      else if (t < .68)  s = 175 + (t - .60) / .08 * 65
      else if (t < .72)  s = 240 - (t - .68) / .04 * 155
      else if (t < .80)  s = 85  + (t - .72) / .08 * 165
      else if (t < .84)  s = 250 + (t - .80) / .04 * 55
      else if (t < .88)  s = 305 - (t - .84) / .04 * 120
      else if (t < .96)  s = 185 + (t - .88) / .08 * 55
      else               s = 240 - (t - .96) / .04 * 20
      s += (sr(i * 7 + 5) - .5) * 14
      return Math.max(80, Math.min(340, s))
    })

    // F1 sector bump rankings [driver][sector] = rank (0=fastest)
    const F1_DRS = [
      { n: 'VER', col: 'rgba(30,65,255,',  ranks: [0, 1, 0] },
      { n: 'LEC', col: 'rgba(232,0,45,',   ranks: [1, 0, 2] },
      { n: 'HAM', col: 'rgba(0,168,150,',  ranks: [3, 2, 4] },
      { n: 'NOR', col: 'rgba(255,128,0,',  ranks: [2, 3, 1] },
      { n: 'ALO', col: 'rgba(0,111,98,',   ranks: [4, 4, 3] },
    ]

    // Pace degradation lap data
    const F1_PACE_DRS = [
      { n: 'VER', col: 'rgba(30,65,255,',  base: 82.04, deg: .046, noise: .07 },
      { n: 'LEC', col: 'rgba(232,0,45,',   base: 82.18, deg: .060, noise: .09 },
      { n: 'HAM', col: 'rgba(0,168,150,',  base: 82.37, deg: .082, noise: .10 },
      { n: 'NOR', col: 'rgba(255,128,0,',  base: 82.58, deg: .102, noise: .13 },
      { n: 'ALO', col: 'rgba(0,111,98,',   base: 82.90, deg: .128, noise: .16 },
    ].map((d, di) => ({ ...d, laps: Array.from({ length: 20 }, (_, i) => +(d.base + d.deg * i + (sr(di * 37 + i * 13) - .5) * d.noise * 2).toFixed(3)) }))

    // Tyre stints
    const F1_STINTS = [
      { n: 'VER', col: '#1E41FF', stints: [{ s: 1, e: 24, t: 'M' }, { s: 25, e: 57, t: 'H' }] },
      { n: 'LEC', col: '#E8002D', stints: [{ s: 1, e: 15, t: 'S' }, { s: 16, e: 41, t: 'M' }, { s: 42, e: 57, t: 'H' }] },
      { n: 'NOR', col: '#FF8000', stints: [{ s: 1, e: 19, t: 'S' }, { s: 20, e: 40, t: 'M' }, { s: 41, e: 57, t: 'H' }] },
      { n: 'HAM', col: '#00A896', stints: [{ s: 1, e: 30, t: 'M' }, { s: 31, e: 57, t: 'H' }] },
      { n: 'RUS', col: '#00C4B0', stints: [{ s: 1, e: 18, t: 'S' }, { s: 19, e: 44, t: 'H' }, { s: 45, e: 57, t: 'M' }] },
      { n: 'ALO', col: '#006F62', stints: [{ s: 1, e: 27, t: 'H' }, { s: 28, e: 57, t: 'M' }] },
      { n: 'PIA', col: '#FF9500', stints: [{ s: 1, e: 22, t: 'M' }, { s: 23, e: 57, t: 'H' }] },
    ]
    const TC = { S: 'rgba(195,48,48,', M: 'rgba(184,136,74,', H: 'rgba(148,156,162,' }

    let f1T0 = null
    let f1TeleSpd = [], f1TeleThr = [], f1TeleBrk = [], f1TeleLastTick = 0, f1TelePosCounter = 0
    const F1_TELE_NPTS = 70, F1_TELE_TICK = 85

    function f1TeleNewPt() {
      const d = (f1TelePosCounter % F1_TELE_NPTS) / F1_TELE_NPTS
      f1TelePosCounter++
      const sv = Math.max(0.08, Math.min(0.98, 0.38 + 0.30 * Math.sin(d * Math.PI * 2.4) + 0.14 * Math.sin(d * Math.PI * 6.8) + (Math.random() - 0.5) * 0.04))
      f1TeleSpd.push(sv)
      f1TeleThr.push(sv > 0.55 ? Math.min(1, sv + 0.12) : Math.max(0, sv - 0.35))
      f1TeleBrk.push(sv < 0.38 ? Math.min(0.95, 0.65 - sv) : 0)
      if (f1TeleSpd.length > F1_TELE_NPTS) { f1TeleSpd.shift(); f1TeleThr.shift(); f1TeleBrk.shift() }
    }

    function initF1() {
      f1T0 = null
      f1TeleSpd = []; f1TeleThr = []; f1TeleBrk = []; f1TeleLastTick = 0; f1TelePosCounter = 0
      for (let i = 0; i < F1_TELE_NPTS; i++) f1TeleNewPt()
    }

    // Panel helper: fills with page-bg first so 1px gap shows as linen seam
    function f1Panel(c, px, py, pw, ph, fn, age) {
      const g = 1
      c.fillStyle = PAGE_BG; c.fillRect(px, py, pw, ph)
      c.save(); c.beginPath(); c.rect(px + g, py + g, pw - g * 2, ph - g * 2); c.clip()
      c.translate(px + g, py + g); fn(c, pw - g * 2, ph - g * 2, age); c.restore()
    }

    function drawF1Telemetry(c, pw, ph, age) {
      const PAD = { l: 28, r: 8, t: 18, b: 16 }
      const cw = pw - PAD.l - PAD.r, ch = ph - PAD.t - PAD.b
      const sTop = PAD.t, sBot = PAD.t + ch * 0.50
      const tTop = PAD.t + ch * 0.60, tBot = ph - PAD.b
      const toY = (v, a, b) => a + (b - a) * (1 - v)
      const toX = i => PAD.l + cw * (i / (F1_TELE_NPTS - 1))

      const now = performance.now()
      if (now - f1TeleLastTick > F1_TELE_TICK) { f1TeleNewPt(); f1TeleLastTick = now }

      // Speed axis
      c.beginPath(); c.moveTo(PAD.l, sTop); c.lineTo(PAD.l, sBot); c.lineTo(pw - PAD.r, sBot)
      c.strokeStyle = N + '0.12)'; c.lineWidth = 1; c.stroke()
      ;[0.25, 0.5, 0.75].forEach(v => {
        const s = Math.round(80 + v * 260), y = toY(v, sTop, sBot)
        c.beginPath(); c.moveTo(PAD.l, y); c.lineTo(pw - PAD.r, y); c.strokeStyle = N + '0.05)'; c.lineWidth = .4; c.stroke()
        c.font = '4.5px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = N + '0.20)'; c.fillText(s, PAD.l - 2, y + 2)
      })

      // Speed fill
      c.beginPath(); f1TeleSpd.forEach((v, i) => { const x = toX(i), y = toY(v, sTop, sBot); i === 0 ? c.moveTo(x, y) : c.lineTo(x, y) })
      c.lineTo(toX(f1TeleSpd.length - 1), sBot); c.lineTo(PAD.l, sBot); c.closePath()
      c.fillStyle = N + '0.06)'; c.fill()
      // Speed line
      c.beginPath(); f1TeleSpd.forEach((v, i) => { const x = toX(i), y = toY(v, sTop, sBot); i === 0 ? c.moveTo(x, y) : c.lineTo(x, y) })
      c.strokeStyle = N + '0.70)'; c.lineWidth = 1.5; c.lineJoin = 'round'; c.stroke()
      // Gold peak dot
      if (f1TeleSpd.length > 0) {
        const pk = Math.max(...f1TeleSpd), pki = f1TeleSpd.lastIndexOf(pk)
        c.beginPath(); c.arc(toX(pki), toY(pk, sTop, sBot), 3, 0, Math.PI * 2); c.fillStyle = G + '0.90)'; c.fill()
      }

      // Divider label
      c.font = '5px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.30)'; c.fillText('Speed', PAD.l, sBot - 2)
      c.fillStyle = G + '0.50)'; c.fillText('Throttle', PAD.l, tTop - 2)
      c.fillStyle = 'rgba(180,60,60,0.40)'; c.fillText('Brake', PAD.l + 38, tTop - 2)

      // Throttle channel
      c.beginPath(); c.moveTo(PAD.l, tBot)
      f1TeleThr.forEach((v, i) => { c.lineTo(toX(i), toY(v, tTop, tBot)) })
      c.lineTo(toX(f1TeleThr.length - 1), tBot); c.closePath()
      c.fillStyle = G + '0.30)'; c.fill()
      // Brake channel
      c.beginPath(); c.moveTo(PAD.l, tBot)
      f1TeleBrk.forEach((v, i) => { c.lineTo(toX(i), toY(v, tTop, tBot)) })
      c.lineTo(toX(f1TeleBrk.length - 1), tBot); c.closePath()
      c.fillStyle = 'rgba(180,60,60,0.20)'; c.fill()

      // Title
      c.font = 'bold 7px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.52)'
      c.fillText('Lap Telemetry · Live', PAD.l, 11)
    }

    function drawF1Bump(c, pw, ph, age) {
      const SECTORS = ['S1', 'S2', 'S3']
      const PL = 22, PR = 14, PT = 28, PB = 12
      const cW = pw - PL - PR, cH = ph - PT - PB
      const ND = F1_DRS.length, NS = SECTORS.length
      const colW = cW / (NS - 1)
      const rankY = rank => PT + cH * ((rank + 0.5) / ND)
      const secX  = si => PL + si * colW

      c.font = 'bold 7px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.52)'
      c.fillText('Sector Rankings · Q3', PL, 11)

      // Sector columns
      SECTORS.forEach((s, si) => {
        const x = secX(si); const sAge = age - si * 900
        if (sAge <= 0) return
        const sP = Math.min(1, sAge / 400)
        c.font = 'bold 6px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = N + (sP * .45) + ')'
        c.fillText(s, x, PT - 5)
        if (si > 0) { c.beginPath(); c.moveTo(secX(si - 1), PT - 2); c.lineTo(x, PT - 2); c.strokeStyle = N + '0.07)'; c.lineWidth = .5; c.stroke() }
      })

      // Rank grid lines
      for (let r = 0; r < ND; r++) {
        const y = rankY(r); c.beginPath(); c.moveTo(PL, y); c.lineTo(pw - PR, y)
        c.strokeStyle = N + '0.04)'; c.lineWidth = .4; c.stroke()
        c.font = '5px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = N + '0.18)'
        c.fillText(`P${r + 1}`, PL - 3, y + 2)
      }

      F1_DRS.forEach((d, di) => {
        // Draw connecting lines between sectors
        for (let si = 0; si < NS - 1; si++) {
          const lineAge = age - si * 900 - 600
          if (lineAge <= 0) continue
          const lp = Math.min(1, ease(lineAge / 600))
          const x1 = secX(si), y1 = rankY(d.ranks[si])
          const x2 = secX(si + 1), y2 = rankY(d.ranks[si + 1])
          c.beginPath(); c.moveTo(x1, y1)
          c.lineTo(x1 + (x2 - x1) * lp, y1 + (y2 - y1) * lp)
          c.strokeStyle = d.col + '0.55)'; c.lineWidth = 1.5; c.lineJoin = 'round'; c.stroke()
        }
        // Draw dots per sector
        for (let si = 0; si < NS; si++) {
          const dotAge = age - si * 900
          if (dotAge <= 0) continue
          const dp = Math.min(1, ease(dotAge / 350))
          const x = secX(si), y = rankY(d.ranks[si])
          c.beginPath(); c.arc(x, y, 4.5 * dp, 0, Math.PI * 2)
          c.fillStyle = d.col + '0.88)'; c.fill()
          // Driver label on first sector
          if (si === 0 && dp > 0.5) {
            c.font = 'bold 5.5px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = d.col + (dp * .8) + ')'
            c.fillText(d.n, x - 7, y + 2)
          }
          // Delta label on last sector
          if (si === NS - 1 && dp > 0.7) {
            const combined = d.ranks.reduce((a, r) => a + r, 0)
            c.font = '5px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = d.col + '0.55)'
            c.fillText(`P${d.ranks[si] + 1}`, x + 7, y + 2)
          }
        }
      })
    }

    function drawF1Tyre(c, pw, ph, age) {
      const LAPS = 57, DUR = 5500
      const lapsDraw = Math.min(LAPS, (age / DUR) * LAPS * 1.22)
      const PL = 26, PR = 8, PT = 18, PB = 22
      const cW = pw - PL - PR, cH = ph - PT - PB
      const ND = F1_STINTS.length, rowH = cH / ND
      const toX = l => PL + cW * ((l - 1) / (LAPS - 1))

      c.font = 'bold 7px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.52)'; c.fillText('Tyre Strategy · Bahrain GP', PL, 11)
      ;[10, 20, 30, 40, 50].forEach(l => { const x = toX(l); c.beginPath(); c.moveTo(x, PT); c.lineTo(x, PT + cH); c.strokeStyle = N + '0.05)'; c.lineWidth = .4; c.stroke() })

      F1_STINTS.forEach((d, di) => {
        const y = PT + di * rowH + rowH * .28, bH = rowH * .42
        c.font = 'bold 5.5px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = d.col + 'EE'; c.fillText(d.n, PL - 3, y + bH / 2 + 2)
        d.stints.forEach((st, si) => {
          const visEnd = Math.min(st.e, lapsDraw); if (visEnd <= st.s) return
          const x1 = toX(st.s), x2 = toX(visEnd), barW = x2 - x1
          c.fillStyle = TC[st.t] + '0.86)'; c.fillRect(x1, y, barW, bH)
          if (si > 0 && lapsDraw >= st.s) { c.fillStyle = 'rgba(250,248,243,.80)'; c.fillRect(toX(st.s) - 1, y, 2, bH) }
          if (barW > 12) { c.font = 'bold 5.5px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = 'rgba(255,255,255,.82)'; c.fillText(st.t, x1 + Math.min(barW / 2, 9), y + bH / 2 + 2) }
        })
        c.strokeStyle = N + '0.06)'; c.lineWidth = .4; c.strokeRect(PL, y, toX(LAPS) - PL, bH)
      })

      c.beginPath(); c.moveTo(PL, PT + cH + 2); c.lineTo(pw - PR, PT + cH + 2); c.strokeStyle = N + '0.12)'; c.lineWidth = .7; c.stroke()
      ;[1, 20, 40, 57].forEach(l => {
        const x = toX(l); c.font = '5px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = N + '0.22)'
        c.fillText('L' + l, x, PT + cH + 11)
      })
      const legItems = [['S', 'Soft'], ['M', 'Med'], ['H', 'Hard']], legTotalW = legItems.length * 40, legStartX = (pw - legTotalW) / 2
      legItems.forEach(([t, lbl], i) => {
        const lx = legStartX + i * 40; c.fillStyle = TC[t] + '0.85)'; c.fillRect(lx, ph - 8, 10, 7)
        c.font = '5px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.32)'; c.fillText(lbl, lx + 13, ph - 2)
      })
    }

    function drawF1Pace(c, pw, ph, age) {
      const LAPS = 20, DUR = 5800, MIN_T = 81.8, MAX_T = 86.5
      const lapsDraw = Math.min(LAPS, (age / DUR) * LAPS * 1.30)
      const PL = 26, PR = 32, PT = 18, PB = 12, cW = pw - PL - PR, cH = ph - PT - PB
      const toX = l => PL + cW * (l / LAPS), toY = t => Math.max(PT, Math.min(PT + cH, PT + cH * ((t - MIN_T) / (MAX_T - MIN_T))))

      c.font = 'bold 7px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.52)'; c.fillText('Pace Degradation · Medium', PL, 11)
      ;[82, 83, 84, 85, 86].forEach(t => {
        const y = toY(t); if (y > ph - PB || y < PT) return
        c.beginPath(); c.moveTo(PL, y); c.lineTo(pw - PR, y); c.strokeStyle = N + '0.07)'; c.lineWidth = .4; c.stroke()
        c.font = '5px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = N + '0.22)'; c.fillText(t + 's', PL - 2, y + 2)
      })
      c.beginPath(); c.moveTo(PL, PT); c.lineTo(PL, PT + cH); c.lineTo(pw - PR, PT + cH); c.strokeStyle = N + '0.15)'; c.lineWidth = .7; c.stroke()

      F1_PACE_DRS.forEach((d, di) => {
        const nL = Math.floor(lapsDraw)
        for (let i = 0; i < nL; i++) {
          const p = Math.min(1, Math.max(0, (lapsDraw - (i + 1)) / .8))
          c.globalAlpha = .45 + .45 * ease(p)
          c.beginPath(); c.arc(toX(i + 1), toY(d.laps[i]), 2, 0, Math.PI * 2); c.fillStyle = d.col + '1)'; c.fill()
        }
        c.globalAlpha = 1
        if (nL >= 5) {
          const xs = d.laps.slice(0, nL).map((_, i) => i + 1), ys = d.laps.slice(0, nL), n = xs.length
          const sx = xs.reduce((a, b) => a + b, 0), sy = ys.reduce((a, b) => a + b, 0)
          const sxy = ys.reduce((a, y, i) => a + xs[i] * y, 0), sx2 = xs.reduce((a, x) => a + x * x, 0)
          const m = (n * sxy - sx * sy) / (n * sx2 - sx * sx), b = (sy - m * sx) / n
          c.beginPath(); c.moveTo(toX(1), toY(b + m)); c.lineTo(toX(nL), toY(b + m * nL))
          c.strokeStyle = d.col + '0.35)'; c.lineWidth = 1.1; c.stroke()
          if (nL === LAPS) { c.font = 'bold 5.5px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = d.col + '0.82)'; c.fillText(d.n, toX(LAPS) + 2, toY(d.laps[LAPS - 1]) + 2) }
        }
      })

      F1_PACE_DRS.forEach((d, i) => {
        c.beginPath(); c.arc(pw - PR + 6, PT + i * 10 + 3, 2.5, 0, Math.PI * 2); c.fillStyle = d.col + '0.78)'; c.fill()
        c.font = '5px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.32)'; c.fillText(d.n, pw - PR + 10, PT + i * 10 + 6)
      })
    }

    function drawFormula1(c, now) {
      if (!f1T0) f1T0 = now
      const age = now - f1T0
      c.fillStyle = PAGE_BG; c.fillRect(0, 0, W, H)
      const pw1 = Math.round(W * 0.50), pw2 = W - pw1
      const ph1 = Math.round(H * 0.50), ph2 = H - ph1
      f1Panel(c, 0,   0,   pw1, ph1, drawF1Telemetry, age)
      f1Panel(c, pw1, 0,   pw2, ph1, drawF1Bump,      age)
      f1Panel(c, 0,   ph1, pw1, ph2, drawF1Tyre,      age)
      f1Panel(c, pw1, ph1, pw2, ph2, drawF1Pace,      age)
    }

    // ══════════════════════════════════════════════════════════════
    // ── FOOTBALL ANALYTICS SCENE ─────────────────────────────────
    // ══════════════════════════════════════════════════════════════

    const FA_PLAYERS_LIST = [
      { name: 'Salah',      team: 'LIV', col: 'rgba(200,30,30,',   attrs: [92, 88, 78, 90, 45, 75] },
      { name: 'Mbappé',     team: 'PSG', col: 'rgba(0,50,180,',    attrs: [96, 87, 72, 94, 38, 80] },
      { name: 'De Bruyne',  team: 'MCI', col: 'rgba(100,175,225,', attrs: [72, 78, 92, 85, 62, 78] },
      { name: 'Rodri',      team: 'MCI', col: 'rgba(100,175,225,', attrs: [65, 55, 90, 78, 95, 88] },
      { name: 'van Dijk',   team: 'LIV', col: 'rgba(200,30,30,',   attrs: [55, 45, 80, 62, 96, 92] },
      { name: 'Vinícius',   team: 'RMA', col: 'rgba(200,160,0,',   attrs: [94, 82, 68, 92, 40, 72] },
      { name: 'Bellingham', team: 'RMA', col: 'rgba(200,160,0,',   attrs: [80, 82, 85, 84, 72, 82] },
      { name: 'Saka',       team: 'ARS', col: 'rgba(220,50,50,',   attrs: [88, 80, 82, 86, 55, 70] },
    ]
    const RADAR_LABELS = ['Pace', 'Shot', 'Pass', 'Dribble', 'Defend', 'Physical']

    const FA_HEAT_PLAYERS = [
      { role: 'Left Winger',      zones: [[.78,.15,.40,.98],[.85,.12,.28,.85],[.65,.18,.32,.72],[.72,.10,.22,.60],[.90,.20,.20,.55],[.55,.22,.24,.48],[.82,.08,.16,.40],[.60,.12,.18,.36]] },
      { role: 'Right Winger',     zones: [[.78,.85,.40,.98],[.85,.88,.28,.85],[.65,.82,.32,.72],[.72,.90,.22,.60],[.90,.80,.20,.55],[.55,.78,.24,.48],[.82,.92,.16,.40],[.60,.88,.18,.36]] },
      { role: 'Striker',          zones: [[.85,.50,.36,.98],[.80,.40,.26,.88],[.80,.60,.26,.88],[.90,.50,.18,.72],[.75,.50,.24,.65],[.88,.35,.18,.55],[.88,.65,.18,.55],[.70,.50,.20,.42]] },
      { role: 'Central Mid',      zones: [[.52,.50,.34,.92],[.38,.48,.26,.72],[.65,.52,.26,.68],[.48,.58,.22,.58],[.48,.42,.22,.58],[.30,.50,.20,.48],[.70,.50,.18,.42],[.55,.45,.18,.38],[.55,.55,.18,.38]] },
      { role: 'Attacking Mid',    zones: [[.65,.50,.34,.95],[.75,.42,.24,.78],[.75,.58,.24,.78],[.55,.50,.26,.65],[.80,.50,.20,.60],[.50,.45,.20,.50],[.50,.55,.20,.50],[.68,.40,.16,.40]] },
      { role: 'Defensive Mid',    zones: [[.40,.50,.34,.92],[.30,.48,.26,.75],[.50,.52,.24,.62],[.35,.56,.20,.52],[.35,.44,.20,.52],[.22,.50,.18,.45],[.55,.50,.18,.38],[.42,.42,.16,.35]] },
      { role: 'Centre Back',      zones: [[.18,.50,.34,.95],[.12,.44,.24,.80],[.12,.56,.24,.80],[.22,.50,.22,.65],[.08,.50,.18,.62],[.25,.42,.18,.48],[.25,.58,.18,.48],[.15,.50,.16,.42]] },
      { role: 'Left Back',        zones: [[.32,.18,.32,.92],[.18,.15,.24,.75],[.48,.15,.24,.65],[.62,.12,.20,.55],[.22,.22,.18,.50],[.40,.10,.16,.42],[.55,.18,.16,.36]] },
      { role: 'Right Back',       zones: [[.32,.82,.32,.92],[.18,.85,.24,.75],[.48,.85,.24,.65],[.62,.88,.20,.55],[.22,.78,.18,.50],[.40,.90,.16,.42],[.55,.82,.16,.36]] },
    ]

    const FA_MOMENTUM_EVENTS = [[5,0,.4],[9,1,.3],[14,0,.7],[18,0,.5],[23,1,.6],[27,0,.4],[30,1,.5],[35,0,.8],[38,0,.6],[42,1,.4],[45,1,.3],[50,0,.5],[54,0,.9],[58,1,.7],[62,0,.4],[66,1,.8],[70,0,.6],[74,0,.5],[78,1,.4],[82,0,.7],[86,0,.8],[90,1,.3]]

    let faT0 = null, faShots = [], faHeatPlayer = null, faRadarP1 = null, faRadarP2 = null

    function initFootballAnalytics() {
      faT0 = null
      // Pick radar players
      const p1i = Math.floor(Math.random() * FA_PLAYERS_LIST.length)
      const p2i = (p1i + 1 + Math.floor(Math.random() * (FA_PLAYERS_LIST.length - 1))) % FA_PLAYERS_LIST.length
      faRadarP1 = FA_PLAYERS_LIST[p1i]; faRadarP2 = FA_PLAYERS_LIST[p2i]
      // Pick heatmap player
      faHeatPlayer = FA_HEAT_PLAYERS[Math.floor(Math.random() * FA_HEAT_PLAYERS.length)]
      // Generate shots
      function rng(s) { let x = Math.sin(s * 92.7 + 441.1) * 37291.3; return x - Math.floor(x) }
      const seed = Math.floor(Math.random() * 10000)
      const nShots = 9 + Math.floor(rng(seed) * 7)
      const nGoals = Math.floor(rng(seed + 1) * 3) + 1
      const nSaved = Math.min(Math.floor(nShots * .55), 2 + Math.floor(rng(seed + 2) * 4))
      const nOff = nShots - nGoals - nSaved
      faShots = []
      const goalPos = [[.15,.85],[.82,.80],[.50,.35],[.28,.70],[.70,.25],[.62,.88],[.38,.40]]
      const savePos = [[.50,.78],[.68,.42],[.28,.35],[.74,.18],[.35,.72],[.58,.55],[.42,.62],[.66,.30]]
      const offPos  = [[-.22,.52],[1.28,.48],[.44,-.30],[.60,-.18],[-.18,.38],[1.20,.65],[.38,-.28],[1.15,.30]]
      for (let i = 0; i < nGoals; i++) { const [gx, gy] = goalPos[i % goalPos.length]; faShots.push([gx, gy, 'goal', +(.25 + rng(seed + i + 10) * .50).toFixed(2)]) }
      for (let i = 0; i < nSaved; i++) { const [gx, gy] = savePos[i % savePos.length]; faShots.push([gx, gy, 'saved', +(.08 + rng(seed + i + 20) * .28).toFixed(2)]) }
      for (let i = 0; i < nOff; i++) { const [gx, gy] = offPos[i % offPos.length]; faShots.push([gx, gy, 'off', +(.02 + rng(seed + i + 30) * .06).toFixed(2)]) }
      for (let i = faShots.length - 1; i > 0; i--) { const j = Math.floor(rng(seed + i + 50) * (i + 1)); [faShots[i], faShots[j]] = [faShots[j], faShots[i]] }
    }

    function faPanel(c, px, py, pw, ph, fn, age) {
      const g = 1
      c.fillStyle = PAGE_BG; c.fillRect(px, py, pw, ph)
      c.save(); c.beginPath(); c.rect(px + g, py + g, pw - g * 2, ph - g * 2); c.clip()
      c.translate(px + g, py + g); fn(c, pw - g * 2, ph - g * 2, age); c.restore()
    }

    function drawFA_Radar(c, pw, ph, age) {
      const DUR = 2000, p1 = faRadarP1, p2 = faRadarP2
      if (!p1 || !p2) return
      const cx = pw / 2, cy = ph / 2 + 4
      const R = Math.min(pw, ph) * 0.34
      const NA = 6

      c.font = 'bold 7px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.52)'; c.fillText('Player Comparison', 8, 11)

      // Draw spider grid
      for (let ring = 1; ring <= 4; ring++) {
        const r = R * ring / 4; c.beginPath()
        for (let a = 0; a < NA; a++) {
          const angle = (a / NA) * Math.PI * 2 - Math.PI / 2
          const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle)
          a === 0 ? c.moveTo(x, y) : c.lineTo(x, y)
        }
        c.closePath(); c.strokeStyle = N + '0.09)'; c.lineWidth = .5; c.stroke()
      }
      // Spokes
      for (let a = 0; a < NA; a++) {
        const angle = (a / NA) * Math.PI * 2 - Math.PI / 2
        c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + R * Math.cos(angle), cy + R * Math.sin(angle))
        c.strokeStyle = N + '0.10)'; c.lineWidth = .5; c.stroke()
        // Labels
        const lx = cx + (R + 10) * Math.cos(angle), ly = cy + (R + 10) * Math.sin(angle)
        c.font = '5.5px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = N + '0.38)'
        c.fillText(RADAR_LABELS[a], lx, ly + 2)
      }

      const fillRadar = (player, alpha) => {
        c.beginPath()
        for (let a = 0; a < NA; a++) {
          const angle = (a / NA) * Math.PI * 2 - Math.PI / 2
          const r = R * (player.attrs[a] / 100)
          const x = cx + r * Math.cos(angle), y = cy + r * Math.sin(angle)
          a === 0 ? c.moveTo(x, y) : c.lineTo(x, y)
        }
        c.closePath()
        c.fillStyle = player.col + (alpha * 0.25) + ')'; c.fill()
        c.strokeStyle = player.col + alpha + ')'; c.lineWidth = 1.4; c.stroke()
      }

      const p = ease(Math.min(1, age / DUR))
      c.globalAlpha = p; fillRadar(p1, 0.80); c.globalAlpha = 1
      c.globalAlpha = p; fillRadar(p2, 0.80); c.globalAlpha = 1

      // Legend
      if (p > 0.5) {
        const la = (p - 0.5) / 0.5
        c.globalAlpha = la
        c.beginPath(); c.moveTo(8, ph - 14); c.lineTo(18, ph - 14); c.strokeStyle = p1.col + '0.85)'; c.lineWidth = 2; c.stroke()
        c.font = 'bold 6px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = p1.col + '0.85)'; c.fillText(p1.name + ' · ' + p1.team, 22, ph - 11)
        c.beginPath(); c.moveTo(8, ph - 5); c.lineTo(18, ph - 5); c.strokeStyle = p2.col + '0.85)'; c.stroke()
        c.fillStyle = p2.col + '0.85)'; c.fillText(p2.name + ' · ' + p2.team, 22, ph - 2)
        c.globalAlpha = 1
      }
    }

    function drawFA_Shot(c, pw, ph, age) {
      if (!faShots.length) return
      const GX1 = pw * .07, GX2 = pw * .93, GY_BAR = ph * .13, GY_GND = ph * .69
      const GW = GX2 - GX1, GH = GY_GND - GY_BAR
      const SPD = 170, DUR = Math.max(4500, faShots.length * SPD + 1200)

      // Net
      c.fillStyle = N + '0.04)'; c.fillRect(GX1, GY_BAR, GW, GH)
      c.strokeStyle = N + '0.07)'; c.lineWidth = .5
      for (let i = 1; i < 11; i++) { const x = GX1 + i * GW / 11; c.beginPath(); c.moveTo(x, GY_BAR); c.lineTo(x, GY_GND); c.stroke() }
      for (let j = 1; j < 6; j++) { const y = GY_BAR + j * GH / 6; c.beginPath(); c.moveTo(GX1, y); c.lineTo(GX2, y); c.stroke() }
      c.fillStyle = 'rgba(40,100,40,.04)'; c.fillRect(0, GY_GND, pw, ph - GY_GND + 2)

      let goals = 0, shots = 0, totalXG = 0
      faShots.forEach(([gx, gy, outcome, xg], si) => {
        const shotStart = si * SPD
        const p = Math.min(1, Math.max(0, (age - shotStart) / 140))
        if (p <= 0) return
        shots++; totalXG += xg; if (outcome === 'goal') goals++
        const tx = GX1 + gx * GW, ty = GY_BAR + gy * GH, ep = ease(p)

        if (outcome === 'goal') {
          c.beginPath(); c.arc(tx, ty, 8 + ep * 4, 0, Math.PI * 2); c.fillStyle = G + (ep * .20) + ')'; c.fill()
          c.beginPath(); c.arc(tx, ty, 5.5 * ep, 0, Math.PI * 2); c.fillStyle = G + '0.90)'; c.fill()
          if (p > .5) { c.beginPath(); c.arc(tx, ty, 1.8, 0, Math.PI * 2); c.fillStyle = 'rgba(255,255,255,.88)'; c.fill() }
        } else if (outcome === 'saved') {
          const dotR = 4.8 * ep
          c.beginPath(); c.arc(tx, ty, dotR, 0, Math.PI * 2); c.fillStyle = `rgba(95,125,158,${ep * .85})`; c.fill()
          c.strokeStyle = `rgba(255,255,255,${ep * .78})`; c.lineWidth = 1.4; c.stroke()
          if (p >= 1) {
            const rAge = age - (shotStart + 140)
            for (let ring = 0; ring < 3; ring++) {
              const rA = rAge - ring * 200; if (rA <= 0 || rA > 600) continue
              const rf = rA / 600; c.beginPath(); c.arc(tx, ty, dotR + rf * 14, 0, Math.PI * 2)
              c.strokeStyle = `rgba(95,125,158,${(1 - rf) * .42})`; c.lineWidth = 1.1; c.stroke()
            }
          }
        } else {
          const dotR = 3.8 * ep
          c.beginPath(); c.arc(tx, ty, dotR, 0, Math.PI * 2); c.fillStyle = `rgba(110,110,110,${ep * .65})`; c.fill()
          c.strokeStyle = `rgba(255,255,255,${ep * .50})`; c.lineWidth = 1; c.stroke()
        }
      })

      // Goal posts
      c.strokeStyle = N + '0.80)'; c.lineWidth = 3; c.lineJoin = 'miter'
      c.beginPath(); c.moveTo(GX1, GY_GND + 2); c.lineTo(GX1, GY_BAR); c.lineTo(GX2, GY_BAR); c.lineTo(GX2, GY_GND + 2); c.stroke()
      c.strokeStyle = 'rgba(255,255,255,.20)'; c.lineWidth = 1
      c.beginPath(); c.moveTo(GX1 + 2, GY_GND); c.lineTo(GX1 + 2, GY_BAR + 2); c.lineTo(GX2 - 2, GY_BAR + 2); c.lineTo(GX2 - 2, GY_GND); c.stroke()
      c.strokeStyle = N + '0.14)'; c.lineWidth = 1; c.beginPath(); c.moveTo(GX1, GY_GND); c.lineTo(GX2, GY_GND); c.stroke()

      // Stats
      c.font = 'bold 6.5px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.52)'; c.fillText('Shot Map', 6, 10)
      c.textAlign = 'right'
      c.fillStyle = G + '0.82)'; c.fillText('xG ' + totalXG.toFixed(2) + '  ', pw - 6, 10)
      c.fillStyle = G + '0.68)'; c.fillText('Goals ' + goals + '  ', pw - 56, 10)
      c.fillStyle = N + '0.45)'; c.fillText('Shots ' + shots + '  ', pw - 100, 10)
      // Legend
      const ky = ph - 5, kx = GX1 + 2
      c.beginPath(); c.arc(kx + 3, ky - 2, 3, 0, Math.PI * 2); c.fillStyle = G + '0.82)'; c.fill()
      c.font = '5px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.38)'; c.fillText('Goal', kx + 8, ky)
      c.beginPath(); c.arc(kx + 34, ky - 2, 3, 0, Math.PI * 2); c.fillStyle = 'rgba(95,125,158,.80)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.65)'; c.lineWidth = 1; c.stroke()
      c.fillStyle = N + '0.38)'; c.fillText('Save', kx + 40, ky)
      c.beginPath(); c.arc(kx + 68, ky - 2, 2.5, 0, Math.PI * 2); c.fillStyle = 'rgba(110,110,110,.60)'; c.fill()
      c.fillStyle = N + '0.38)'; c.fillText('Off target', kx + 74, ky)
    }

    function drawFA_Heat(c, pw, ph, age) {
      if (!faHeatPlayer) return
      const M = 4, PW = pw - 2 * M, PH = ph - 2 * M
      const OUTLINE_DUR = 800, HEAT_DUR = 900, TOTAL = OUTLINE_DUR + HEAT_DUR
      const outlineP = Math.min(1, age / OUTLINE_DUR)
      const heatP = Math.min(1, Math.max(0, (age - OUTLINE_DUR) / HEAT_DUR))
      const heatE = ease(heatP)

      c.fillStyle = PAGE_BG; c.fillRect(0, 0, pw, ph)
      c.fillStyle = `rgba(8,42,12,${heatE * .06})`; c.fillRect(M, M, PW, PH)

      // Organic blob drawing: 5 sub-ellipses per zone
      if (heatP > 0) {
        faHeatPlayer.zones.forEach(([zx, zy, zr, intensity], zi) => {
          const cx2 = M + zx * PW, cy2 = M + (1 - zy) * PH, r = PH * zr, al = intensity * heatE
          for (let k = 0; k < 5; k++) {
            const s = zi * 31 + k * 13
            const offX = (sr(s + 1) - .5) * r * .55, offY = (sr(s + 2) - .5) * r * .55
            const scX = 0.45 + sr(s + 3) * 1.10, scY = 0.45 + sr(s + 4) * 1.10
            const rot = sr(s + 5) * Math.PI, subR = r * (0.38 + sr(s + 6) * .52)
            const subAl = al * (0.42 + sr(s + 7) * .58)
            c.save(); c.translate(cx2 + offX, cy2 + offY); c.rotate(rot); c.scale(scX, scY)
            const g = c.createRadialGradient(0, 0, 0, 0, 0, subR)
            g.addColorStop(0,    `rgba(170,0,0,${subAl * .92})`)
            g.addColorStop(.14,  `rgba(220,10,0,${subAl * .86})`)
            g.addColorStop(.28,  `rgba(255,90,0,${subAl * .78})`)
            g.addColorStop(.43,  `rgba(255,185,0,${subAl * .65})`)
            g.addColorStop(.58,  `rgba(200,240,20,${subAl * .48})`)
            g.addColorStop(.73,  `rgba(40,210,50,${subAl * .32})`)
            g.addColorStop(.87,  `rgba(0,165,30,${subAl * .15})`)
            g.addColorStop(1,    `rgba(0,120,20,0)`)
            c.beginPath(); c.arc(0, 0, subR, 0, Math.PI * 2); c.fillStyle = g; c.fill(); c.restore()
          }
        })
      }

      // Pitch outline (progressive draw)
      const lc = `rgba(27,58,92,${Math.min(1, outlineP * 3) * .15})`
      const drawSeg = (x1, y1, x2, y2, p) => { if (p <= 0) return; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 + (x2 - x1) * Math.min(1, p), y1 + (y2 - y1) * Math.min(1, p)); c.stroke() }
      const drawRP  = (x, y, rw, rh, p) => { [[x, y, x + rw, y], [x + rw, y, x + rw, y + rh], [x + rw, y + rh, x, y + rh], [x, y + rh, x, y]].forEach(([x1, y1, x2, y2], i) => drawSeg(x1, y1, x2, y2, (p - i * .25) / .25)) }
      c.strokeStyle = lc; c.lineWidth = .8
      drawRP(M, M, PW, PH, outlineP * 4)
      drawSeg(M + PW / 2, M, M + PW / 2, ph - M, (outlineP - .25) / .10)
      if (outlineP > .30) { c.beginPath(); c.arc(M + PW / 2, ph / 2, ph * .18, 0, Math.PI * 2 * Math.min(1, (outlineP - .30) / .25)); c.stroke() }
      if (outlineP > .45) drawRP(M, M + PH * .24, PW * .165, PH * .52, (outlineP - .45) / .15)
      if (outlineP > .50) drawRP(M + PW * .835, M + PH * .24, PW * .165, PH * .52, (outlineP - .50) / .15)
      if (outlineP > .60) drawRP(M, M + PH * .37, PW * .058, PH * .26, (outlineP - .60) / .10)
      if (outlineP > .62) drawRP(M + PW * .942, M + PH * .37, PW * .058, PH * .26, (outlineP - .62) / .10)

      // Role label
      if (heatP > 0.4) {
        c.font = 'bold 6px Inter,sans-serif'; c.textAlign = 'right'; c.fillStyle = `rgba(27,58,92,${(heatP - .4) / .6 * .28})`
        c.fillText(faHeatPlayer.role, pw - M - 2, ph - M - 2)
      }
    }

    function drawFA_Momentum(c, pw, ph, age) {
      const DUR = 5500
      const mins = Math.min(90, (age / DUR) * 90 * 1.30)
      const PL = 8, PR = Math.round(pw * 0.10), PT = 15, PB = 14, cW = pw - PL - PR, cH = (ph - PT - PB) / 2 - 2, centerY = PT + cH + 2

      c.font = 'bold 6.5px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.48)'; c.fillText('Match Momentum', PL, 10)
      c.beginPath(); c.moveTo(PL, centerY); c.lineTo(pw - PR, centerY); c.strokeStyle = N + '0.15)'; c.lineWidth = .8; c.stroke()
      ;[15, 30, 45, 60, 75, 90].forEach(m => {
        const x = PL + cW * (m / 90)
        c.beginPath(); c.moveTo(x, centerY - 2); c.lineTo(x, centerY + 2); c.strokeStyle = N + '0.10)'; c.lineWidth = .6; c.stroke()
        c.font = '4.5px Inter,sans-serif'; c.textAlign = 'center'; c.fillStyle = N + '0.18)'; c.fillText(m + "'", x, centerY + 10)
      })

      const wave = team => {
        const pts = []; for (let m = 0; m <= Math.floor(mins); m++) { let v = 0; FA_MOMENTUM_EVENTS.forEach(([em, et, mag]) => { if (et === team && em <= m) v += mag * Math.max(0, 1 - (m - em) / 8) }); pts.push(Math.min(1, v * .6)) }; return pts
      }
      ;[0, 1].forEach(team => {
        const wv = wave(team), isHome = team === 0
        c.beginPath(); wv.forEach((v, i) => { const x = PL + cW * Math.min(1, i / 90), y = isHome ? centerY - v * cH : centerY + v * cH; i === 0 ? c.moveTo(x, y) : c.lineTo(x, y) }); c.lineTo(PL + cW * Math.min(1, wv.length / 90), centerY); c.lineTo(PL, centerY); c.closePath(); c.fillStyle = isHome ? N + '0.10)' : G + '0.10)'; c.fill()
        c.beginPath(); wv.forEach((v, i) => { const x = PL + cW * Math.min(1, i / 90), y = isHome ? centerY - v * cH : centerY + v * cH; i === 0 ? c.moveTo(x, y) : c.lineTo(x, y) }); c.strokeStyle = isHome ? N + '0.60)' : G + '0.60)'; c.lineWidth = 1.3; c.lineJoin = 'round'; c.stroke()
      })
      c.font = 'bold 5.5px Inter,sans-serif'; c.textAlign = 'left'; c.fillStyle = N + '0.45)'; c.fillText('Home', PL, PT + 3)
      c.fillStyle = G + '0.55)'; c.fillText('Away', PL, ph - 3)
    }

    function drawFootballAnalytics(c, now) {
      if (!faT0) faT0 = now
      const age = now - faT0
      c.fillStyle = PAGE_BG; c.fillRect(0, 0, W, H)
      const pw1 = Math.round(W * 0.50), pw2 = W - pw1
      const ph1 = Math.round(H * 0.50), ph2 = H - ph1
      faPanel(c, 0,   0,   pw1, ph1, drawFA_Radar,    age)
      faPanel(c, pw1, 0,   pw2, ph1, drawFA_Shot,     age)
      faPanel(c, 0,   ph1, pw1, ph2, drawFA_Heat,     age)
      faPanel(c, pw1, ph1, pw2, ph2, drawFA_Momentum, age)
    }

    // ── SCENE DISPATCH ────────────────────────────────────────────
    function drawScene(name, c, now) {
      c.clearRect(0, 0, W, H)
      if (name !== 'formula1' && name !== 'footballanalytics' && name !== 'housingeda') {
        c.fillStyle = PAGE_BG; c.fillRect(0, 0, W, H)
      }
      if      (name === 'heatmap')           drawHeatmap(c, W, H, now)
      else if (name === 'candlestick')        drawCandlestick(c, W, H, now)
      else if (name === 'formula1')           drawFormula1(c, now)
      else if (name === 'footballanalytics')  drawFootballAnalytics(c, now)
      else if (name === 'housingeda')         drawHousingEDA(c, now)
      else if (name === 'transit')            drawTransit(c, W, H, now)
      else if (name === 'anomaly')            drawAnomaly(c, W, H, now)
    }

    function reinit() {
      const now = performance.now()
      initHeatmap(now); initCandlestick(now); initTransit(now); initAnomaly(now)
      initF1(); initFootballAnalytics(); initHousingEDA()
    }

    setSize()

    // ── RENDER LOOP ───────────────────────────────────────────────
    let scene = 0, sceneStart = performance.now()
    let transitioning = false, transStart = 0
    let tiles = makeTiles()
    let rafId

    function render(now) {
      if (W === 0) { rafId = requestAnimationFrame(render); return }
      const elapsed = now - sceneStart
      const curDur = SCENE_DURS[SCENES[scene]] || SCENE_DUR
      if (elapsed > curDur && !transitioning) {
        transitioning = true; transStart = now; tiles = makeTiles()
        // Resize canvas synchronously before tile animation starts so offB renders at correct size
        const nextName = SCENES[(scene + 1) % SCENES.length]
        const nextDims = SCENE_DIMS[nextName]
        if (nextDims && containerRef?.current) {
          resizingFromTransition = true
          containerRef.current.style.flex = `0 0 ${nextDims.w}px`
          containerRef.current.style.height = `${nextDims.h}px`
          const newW = containerRef.current.offsetWidth  // force layout reflow
          const newH = containerRef.current.offsetHeight
          if (newW > 0 && newH > 0) { W = newW; H = newH; applyDims(window.devicePixelRatio || 1) }
          setTimeout(() => { resizingFromTransition = false }, 400)
        }
      }

      if (transitioning) {
        const tp = (now - transStart) / TILE_DUR
        if (tp >= 1) {
          scene = (scene + 1) % SCENES.length
          sceneStart = now; transitioning = false
          const name = SCENES[scene]
          if (name === 'formula1') initF1()
          if (name === 'footballanalytics') initFootballAnalytics()
          if (name === 'housingeda') initHousingEDA()
          if (name === 'heatmap') initHeatmap(now)
          if (name === 'transit') initTransit(now)
          if (onSceneChangeRef.current) onSceneChangeRef.current(name)
          // Draw directly — skip tile compositing to avoid one-frame wrong-content flash
          drawScene(name, ctx, now)
          rafId = requestAnimationFrame(render)
          return
        }

        // During tile animation: force next scene to show its opening frame on offB
        // so tiles reveal age=0 state rather than a mid-animation preview that then resets
        const nextNm = SCENES[(scene + 1) % SCENES.length]
        if (nextNm === 'footballanalytics') faT0 = now
        else if (nextNm === 'formula1') f1T0 = now
        else if (nextNm === 'housingeda') edaT0 = now
        else if (nextNm === 'heatmap') initHeatmap(now)
        else if (nextNm === 'transit') { trPhase = 'scatter'; trPhaseT = now; if (trPts.length > 0) trPts.forEach(p => { p.x = p.sx; p.y = p.sy }) }

        const tW = W / TCOLS, tH = H / TROWS
        drawScene(SCENES[scene], ctxA, now)
        drawScene(nextNm, ctxB, now)
        ctx.clearRect(0, 0, W, H)

        ctx.save(); ctx.beginPath()
        tiles.forEach(t => { if (tp <= t.delay) ctx.rect(t.col * tW, t.row * tH, tW, tH) })
        ctx.clip(); ctx.drawImage(offA, 0, 0, W, H); ctx.restore()

        ctx.save(); ctx.beginPath()
        tiles.forEach(t => { if (tp > t.delay) ctx.rect(t.col * tW, t.row * tH, tW, tH) })
        ctx.clip(); ctx.drawImage(offB, 0, 0, W, H); ctx.restore()

        tiles.forEach(t => {
          const f = (tp - t.delay) / 0.09
          if (f > 0 && f < 1) { ctx.fillStyle = `rgba(255,255,255,${0.42 * Math.sin(f * Math.PI)})`; ctx.fillRect(t.col * tW, t.row * tH, tW, tH) }
        })
      } else {
        drawScene(SCENES[scene], ctx, now)
      }
      rafId = requestAnimationFrame(render)
    }

    rafId = requestAnimationFrame(render)
    return () => { cancelAnimationFrame(rafId); ro.disconnect() }
  }, [])

  return (
    <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
  )
}

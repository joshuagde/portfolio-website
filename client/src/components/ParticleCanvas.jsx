import { useEffect, useRef } from 'react'

/**
 * Animated neural-network particle canvas.
 * Colors match the site's warm navy/linen palette.
 * Fills its absolutely-positioned parent.
 */
export default function ParticleCanvas() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []
    const mouse = { x: null, y: null }

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
      init()
    }

    const onMouseMove = (e) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }

    function init() {
      particles = []
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 13000), 85)
      for (let i = 0; i < count; i++) {
        particles.push({
          x:      Math.random() * canvas.width,
          y:      Math.random() * canvas.height,
          vx:     (Math.random() - 0.5) * 0.38,
          vy:     (Math.random() - 0.5) * 0.38,
          radius: Math.random() * 1.4 + 0.5,
        })
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        // Gentle mouse repulsion
        if (mouse.x !== null) {
          const dx   = p.x - mouse.x
          const dy   = p.y - mouse.y
          const dist = Math.hypot(dx, dy)
          if (dist < 90) {
            p.x += (dx / dist) * 1.2
            p.y += (dy / dist) * 1.2
          }
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        // warm navy — matches var(--accent) = #1B3A5C
        ctx.fillStyle = 'rgba(27, 58, 92, 0.35)'
        ctx.fill()
      })

      // Connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dist = Math.hypot(
            particles[i].x - particles[j].x,
            particles[i].y - particles[j].y,
          )
          if (dist < 135) {
            const alpha = 0.13 * (1 - dist / 135)
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(27, 58, 92, ${alpha})`
            ctx.lineWidth = 0.7
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    window.addEventListener('resize',    resize)
    window.addEventListener('mousemove', onMouseMove)
    resize()
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize',    resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        opacity: 0.55,
      }}
    />
  )
}

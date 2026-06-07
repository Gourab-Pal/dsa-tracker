import { useState, useEffect, useRef } from 'react'

export default function AnimatedNumber({ value, duration = 600 }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    const from = prevRef.current
    const to = value
    if (from === to) { setDisplay(to); return }
    const start = performance.now()
    let frame
    function animate(now) {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplay(Math.round(from + (to - from) * eased))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    prevRef.current = to
    return () => cancelAnimationFrame(frame)
  }, [value, duration])

  return <>{display}</>
}

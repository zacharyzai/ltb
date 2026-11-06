// Decorative pseudo-QR seeded from the booking ref. Clearly a demo: it encodes nothing.
const N = 25

function cells(seed) {
  let h = [...seed].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7)
  const finder = (r, c) => {
    const inBox = (r0, c0) => r >= r0 && r < r0 + 7 && c >= c0 && c < c0 + 7
    for (const [r0, c0] of [[0, 0], [0, N - 7], [N - 7, 0]]) {
      if (inBox(r0, c0)) {
        const d = Math.max(Math.abs(r - r0 - 3), Math.abs(c - c0 - 3))
        return d !== 2
      }
    }
    return null
  }
  const out = []
  for (let r = 0; r < N; r++)
    for (let c = 0; c < N; c++) {
      h = (h * 1664525 + 1013904223) >>> 0
      const f = finder(r, c)
      if (f ?? h >>> 28 > 6) out.push([r, c])
    }
  return out
}

export default function QRPass({ value }) {
  return (
    <figure className="flex flex-col items-center gap-2">
      <svg viewBox={`-2 -2 ${N + 4} ${N + 4}`} role="img" aria-label={`Demo visit pass ${value}`} className="size-52 rounded-xl border-2 border-ink bg-white">
        {cells(value).map(([r, c]) => <rect key={`${r}-${c}`} x={c} y={r} width="1" height="1" fill="#1a1a1a" />)}
      </svg>
      <figcaption className="text-center">
        <span className="block font-heading text-lg font-bold">{value}</span>
        <span className="text-sm text-muted">Demo pass – not a real, scannable code</span>
      </figcaption>
    </figure>
  )
}

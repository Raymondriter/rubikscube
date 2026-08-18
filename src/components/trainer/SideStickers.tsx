import type { StickerColor } from '../../engine/types'

const SWATCH: Record<StickerColor, string> = {
  white: 'var(--color-cube-white)',
  yellow: 'var(--color-cube-yellow)',
  red: 'var(--color-cube-red)',
  orange: 'var(--color-cube-orange)',
  blue: 'var(--color-cube-blue)',
  green: 'var(--color-cube-green)',
}

export function SideStickers({
  front,
  right,
}: {
  front: StickerColor[]
  right: StickerColor[]
}) {
  return (
    <div className="flex items-start justify-center gap-3">
      <Bar label="F" colors={front} />
      <Bar label="R" colors={right} />
    </div>
  )
}

function Bar({ label, colors }: { label: string; colors: StickerColor[] }) {
  return (
    <div>
      <p className="mb-1 text-center text-[11px] uppercase tracking-wider text-white/40">{label}</p>
      <div className="flex gap-1">
        {colors.map((color, index) => (
          <span
            key={`${color}-${index}`}
            className="h-12 w-12 rounded-md border border-black/40 shadow-inner"
            style={{ background: SWATCH[color] }}
            title={color}
          />
        ))}
      </div>
    </div>
  )
}

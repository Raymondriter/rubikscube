import type { ReactNode } from 'react'

function renderInline(text: string): ReactNode[] {
  const parts: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let last = 0
  let match: RegExpExecArray | null
  let key = 0
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index))
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(
        <strong key={key} className="font-semibold text-white">
          {token.slice(2, -2)}
        </strong>,
      )
    } else {
      parts.push(
        <code key={key} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-brand-400">
          {token.slice(1, -1)}
        </code>,
      )
    }
    key += 1
    last = match.index + token.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

function isBullet(line: string): boolean {
  return /^[-*]\s+/.test(line)
}

function isOrdered(line: string): boolean {
  return /^\d+\.\s+/.test(line)
}

type Block =
  | { type: 'p'; lines: string[] }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = []
  for (const rawLine of source.trim().split('\n')) {
    const line = rawLine.trimEnd()
    const last = blocks.at(-1)
    if (line.trim() === '') {
      blocks.push({ type: 'p', lines: [] })
      continue
    }
    if (isBullet(line)) {
      const text = line.replace(/^[-*]\s+/, '')
      if (last?.type === 'ul') last.items.push(text)
      else blocks.push({ type: 'ul', items: [text] })
      continue
    }
    if (isOrdered(line)) {
      const text = line.replace(/^\d+\.\s+/, '')
      if (last?.type === 'ol') last.items.push(text)
      else blocks.push({ type: 'ol', items: [text] })
      continue
    }
    if ((last?.type === 'ul' || last?.type === 'ol') && /^\s+/.test(rawLine)) {
      const items = last.items
      const index = items.length - 1
      if (index >= 0) items[index] = `${items[index]} ${line.trim()}`
      continue
    }
    if (last?.type === 'p') last.lines.push(line)
    else blocks.push({ type: 'p', lines: [line] })
  }
  return blocks.filter((block) => block.type !== 'p' || block.lines.length > 0)
}

export function LessonMarkdown({ source }: { source: string }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-white/70">
      {parseBlocks(source).map((block, index) => {
        if (block.type === 'ul') {
          return (
            <ul key={index} className="list-disc space-y-1.5 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ul>
          )
        }
        if (block.type === 'ol') {
          return (
            <ol key={index} className="list-decimal space-y-1.5 pl-5">
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </ol>
          )
        }
        return (
          <p key={index}>
            {block.lines.map((line, lineIndex) => (
              <span key={lineIndex}>
                {lineIndex > 0 && <br />}
                {renderInline(line)}
              </span>
            ))}
          </p>
        )
      })}
    </div>
  )
}

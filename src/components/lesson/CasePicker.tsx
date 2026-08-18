import { useMemo, useState } from 'react'
import { caseById } from '../../data/methods'
import { btnTiny } from '../ui/styles'

interface CasePickerProps {
  caseIds: string[]
  activeId: string
  onSelect: (id: string) => void
}

export function CasePicker({ caseIds, activeId, onSelect }: CasePickerProps) {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')

  const cases = useMemo(() => caseIds.map(caseById), [caseIds])
  const groups = useMemo(() => {
    const seen = new Set<string>()
    for (const entry of cases) seen.add(entry.group)
    return ['all', ...seen]
  }, [cases])

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return cases.filter((entry) => {
      if (group !== 'all' && entry.group !== group) return false
      if (!needle) return true
      return (
        entry.name.toLowerCase().includes(needle) ||
        entry.id.toLowerCase().includes(needle) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(needle))
      )
    })
  }, [cases, group, query])

  if (caseIds.length <= 6) {
    return (
      <div className="flex flex-wrap justify-center gap-2">
        {cases.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => onSelect(entry.id)}
            className={`${btnTiny} ${entry.id === activeId ? 'border-brand-400 bg-brand-500/20 text-white' : ''}`}
          >
            {entry.name}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search cases…"
        className="w-full rounded-full border border-white/15 bg-ink-900 px-4 py-2 text-sm text-white placeholder:text-white/30"
      />
      <div className="flex flex-wrap justify-center gap-1.5">
        {groups.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => setGroup(name)}
            className={`${btnTiny} ${group === name ? 'border-brand-400 bg-brand-500/20 text-white' : ''}`}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="max-h-40 overflow-y-auto rounded-2xl border border-white/10 bg-ink-900/50 p-2">
        <div className="flex flex-wrap justify-center gap-1.5">
          {visible.map((entry) => (
            <button
              key={entry.id}
              type="button"
              onClick={() => onSelect(entry.id)}
              className={`${btnTiny} ${entry.id === activeId ? 'border-brand-400 bg-brand-500/20 text-white' : ''}`}
            >
              {entry.name}
            </button>
          ))}
          {visible.length === 0 && <p className="px-2 py-3 text-xs text-white/40">No cases match.</p>}
        </div>
      </div>
      <p className="text-center text-[11px] text-white/35">
        {visible.length} of {cases.length}
      </p>
    </div>
  )
}

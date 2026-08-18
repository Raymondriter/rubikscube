import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { CubeRenderer } from '../../engine/render/CubeRenderer'
import { CubeInteraction } from '../../engine/render/CubeInteraction'
import { setColorblindStickers } from '../../engine/render/materials'
import { useProgressStore } from '../../state/progressStore'

export interface CubeCanvasHandle {
  scramble: (length?: number) => string[]
  reset: () => void
  enqueueAlgorithm: (algorithm: string, durationMs?: number) => void
  enqueueMove: (token: string, durationMs?: number) => void
  applyAlgorithmInstant: (algorithm: string) => void
  setHighlightSlots: (slots: string[]) => void
  setTwistEnabled: (enabled: boolean) => void
  getIsSolved: () => boolean
  getIsColorSolved: () => boolean
}

export interface CubeCanvasProps {
  onSolvedChange?: (solved: boolean) => void
  onBusyChange?: (busy: boolean) => void
  onMove?: () => void
  onReady?: () => void
  twistEnabled?: boolean
  className?: string
}

/**
 * Thin React wrapper: owns the imperative CubeRenderer/CubeInteraction pair
 * for its lifetime and exposes just enough of an imperative handle for
 * surrounding UI to drive it. Live cube state stays inside Three.js objects,
 * never mirrored into React state, so an in-progress twist doesn't trigger
 * React re-renders - only the derived summary callbacks (onSolvedChange,
 * onMove) cross back into React, and only after a move settles.
 */
export const CubeCanvas = forwardRef<CubeCanvasHandle, CubeCanvasProps>(function CubeCanvas(
  { onSolvedChange, onBusyChange, onMove, onReady, twistEnabled = true, className },
  ref,
) {
  const colorblind = useProgressStore((state) => state.settings.colorblind ?? false)
  const containerRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<CubeRenderer | null>(null)
  const onSolvedRef = useRef(onSolvedChange)
  const onBusyRef = useRef(onBusyChange)
  const onMoveRef = useRef(onMove)
  const onReadyRef = useRef(onReady)
  onSolvedRef.current = onSolvedChange
  onBusyRef.current = onBusyChange
  onMoveRef.current = onMove
  onReadyRef.current = onReady

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    setColorblindStickers(useProgressStore.getState().settings.colorblind ?? false)
    const renderer = new CubeRenderer(container)
    const interaction = new CubeInteraction(renderer)
    rendererRef.current = renderer

    const offSolved = renderer.onSolvedChange((solved) => onSolvedRef.current?.(solved))
    const offBusy = renderer.onBusyChange((busy) => onBusyRef.current?.(busy))
    const offMove = renderer.onMoveDone(() => onMoveRef.current?.())

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return
      const { width, height } = entry.contentRect
      renderer.resize(width, height)
    })
    resizeObserver.observe(container)
    onReadyRef.current?.()

    return () => {
      resizeObserver.disconnect()
      offSolved()
      offBusy()
      offMove()
      interaction.dispose()
      renderer.dispose()
      rendererRef.current = null
    }
  }, [])

  useEffect(() => {
    rendererRef.current?.setTwistEnabled(twistEnabled)
  }, [twistEnabled])

  useEffect(() => {
    setColorblindStickers(colorblind)
    rendererRef.current?.setLetterOverlaysVisible(colorblind)
  }, [colorblind])

  useImperativeHandle(ref, () => ({
    scramble: (length) => rendererRef.current?.scramble(length) ?? [],
    reset: () => rendererRef.current?.reset(),
    enqueueAlgorithm: (algorithm, durationMs) => rendererRef.current?.enqueueAlgorithm(algorithm, durationMs),
    enqueueMove: (token, durationMs) => rendererRef.current?.enqueueMove(token, durationMs),
    applyAlgorithmInstant: (algorithm) => rendererRef.current?.applyAlgorithmInstant(algorithm),
    setHighlightSlots: (slots) => rendererRef.current?.setHighlightSlots(slots),
    setTwistEnabled: (enabled) => rendererRef.current?.setTwistEnabled(enabled),
    getIsSolved: () => rendererRef.current?.getIsSolved() ?? false,
    getIsColorSolved: () => rendererRef.current?.getIsColorSolved() ?? false,
  }))

  return <div ref={containerRef} className={className} />
})

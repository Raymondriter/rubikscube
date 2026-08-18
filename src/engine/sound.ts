/**
 * Synthesized Web Audio sound effects - no external assets. Mirrors materials.ts's
 * setColorblindStickers pattern: a module-level flag callers push state into, rather than this
 * module reaching up into the progress store itself.
 */

let audioContext: AudioContext | null = null
let enabled = true

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  audioContext ??= new Ctor()
  if (audioContext.state === 'suspended') void audioContext.resume()
  return audioContext
}

export function setSoundEnabled(value: boolean): void {
  enabled = value
}

export function isSoundEnabled(): boolean {
  return enabled
}

function playTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  durationSec: number,
  { type = 'sine' as OscillatorType, gain = 0.15 } = {},
): void {
  const start = ctx.currentTime + startOffset
  const oscillator = ctx.createOscillator()
  const gainNode = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.value = freq
  gainNode.gain.setValueAtTime(0, start)
  gainNode.gain.linearRampToValueAtTime(gain, start + 0.005)
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + durationSec)
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + durationSec + 0.02)
}

/** A short, soft tick - fired on each committed twist. Cheap enough to call on every move. */
export function playTwistClick(): void {
  if (!enabled) return
  const ctx = getContext()
  if (!ctx) return
  playTone(ctx, 720, 0, 0.045, { type: 'square', gain: 0.05 })
}

/** A short major-triad arpeggio - fired once when the cube becomes solved. */
export function playSolveChime(): void {
  if (!enabled) return
  const ctx = getContext()
  if (!ctx) return
  const notes = [523.25, 659.25, 783.99] // C5, E5, G5
  notes.forEach((freq, i) => playTone(ctx, freq, i * 0.07, 0.5, { type: 'sine', gain: 0.18 }))
}

import { describe, expect, it } from 'vitest'
import { isSoundEnabled, playSolveChime, playTwistClick, setSoundEnabled } from './sound'

describe('sound', () => {
  it('tracks the enabled flag', () => {
    setSoundEnabled(false)
    expect(isSoundEnabled()).toBe(false)
    setSoundEnabled(true)
    expect(isSoundEnabled()).toBe(true)
  })

  it('never throws, with or without a Web Audio API available (no DOM in this test env)', () => {
    expect(() => playTwistClick()).not.toThrow()
    expect(() => playSolveChime()).not.toThrow()
    setSoundEnabled(false)
    expect(() => playTwistClick()).not.toThrow()
    expect(() => playSolveChime()).not.toThrow()
    setSoundEnabled(true)
  })
})

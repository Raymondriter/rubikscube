import { describe, expect, it } from 'vitest'
import { asCoord, expandLayers, layersForDrag, layersFromSpan } from './dragLayers'

describe('layersFromSpan', () => {
  it('stays on one layer when the drag never leaves the cubie', () => {
    expect(layersFromSpan(1, 1)).toEqual([1])
    expect(layersFromSpan(0, 0)).toEqual([0])
    expect(layersFromSpan(-1, -1)).toEqual([-1])
  })

  it('covers the outer layer plus the middle for a wide smear', () => {
    expect(layersFromSpan(1, 0)).toEqual([0, 1])
    expect(layersFromSpan(-1, 0)).toEqual([-1, 0])
  })

  it('covers every layer when the drag crosses the cube', () => {
    expect(layersFromSpan(1, -1)).toEqual([-1, 0, 1])
    expect(layersFromSpan(-1, 1)).toEqual([-1, 0, 1])
  })
})

describe('layersForDrag', () => {
  it('treats Ctrl/Cmd as a whole-cube rotation', () => {
    expect(layersForDrag({ start: 1, end: 1, rotateKey: true })).toEqual([-1, 0, 1])
  })

  it('treats Shift on an outer layer as a wide turn', () => {
    expect(layersForDrag({ start: 1, end: 1, shiftKey: true })).toEqual([0, 1])
    expect(layersForDrag({ start: -1, end: -1, shiftKey: true })).toEqual([-1, 0])
  })

  it('does not turn a slice into a wide move just because Shift is held', () => {
    expect(layersForDrag({ start: 0, end: 0, shiftKey: true })).toEqual([0])
  })
})

describe('expandLayers', () => {
  it('only grows the set', () => {
    expect(expandLayers([1], 0)).toEqual([0, 1])
    expect(expandLayers([0, 1], -1)).toEqual([-1, 0, 1])
    expect(expandLayers([0, 1], 1)).toEqual([0, 1])
  })
})

describe('asCoord', () => {
  it('accepts the three legal layers and rejects anything else', () => {
    expect(asCoord(0.4)).toBe(0)
    expect(asCoord(0.6)).toBe(1)
    expect(asCoord(-1.2)).toBe(-1)
    expect(asCoord(2)).toBeNull()
  })
})

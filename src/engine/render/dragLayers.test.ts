import { describe, expect, it } from 'vitest'
import { asCoord, chooseTwist, faceNormalAt, layersForDrag, normalizeQuarterTurns, releaseTurns } from './dragLayers'

describe('layersForDrag', () => {
  it('turns exactly the grabbed layer with no modifiers', () => {
    expect(layersForDrag({ layer: 1 })).toEqual([1])
    expect(layersForDrag({ layer: 0 })).toEqual([0])
    expect(layersForDrag({ layer: -1 })).toEqual([-1])
  })

  it('treats Ctrl/Cmd as a whole-cube rotation', () => {
    expect(layersForDrag({ layer: 1, rotateKey: true })).toEqual([-1, 0, 1])
  })

  it('treats Shift on an outer layer as a wide turn, but not on a slice', () => {
    expect(layersForDrag({ layer: 1, shiftKey: true })).toEqual([0, 1])
    expect(layersForDrag({ layer: -1, shiftKey: true })).toEqual([-1, 0])
    expect(layersForDrag({ layer: 0, shiftKey: true })).toEqual([0])
  })
})

describe('faceNormalAt', () => {
  it('picks the face a surface point sticks out of, including on bevels', () => {
    expect(faceNormalAt({ x: 0.3, y: 0.2, z: 1.52 })).toEqual({ x: 0, y: 0, z: 1 })
    expect(faceNormalAt({ x: 1.49, y: 1.3, z: -0.4 })).toEqual({ x: 1, y: 0, z: 0 })
    expect(faceNormalAt({ x: 0, y: -1.5, z: 0.9 })).toEqual({ x: 0, y: -1, z: 0 })
  })
})

describe('chooseTwist', () => {
  const front = { x: 0, y: 0, z: 1 }
  const top = { x: 0, y: 1, z: 0 }

  it('swiping a front-face row right turns it about y the way U\' does', () => {
    // Front sticker moving toward +x is a counter-clockwise turn seen from above: positive angle about +y.
    expect(chooseTwist(front, { x: 0.6, y: 0.1, z: 0 })).toEqual({ axis: 'y', tangent: 'x', sign: 1 })
  })

  it('swiping a front-face column up turns it about x', () => {
    // Front sticker moving toward +y rotates about -x.
    expect(chooseTwist(front, { x: -0.05, y: 0.4, z: 0 })).toEqual({ axis: 'x', tangent: 'y', sign: -1 })
  })

  it('reads a top-face swipe on the face plane, not by its foreshortened screen look', () => {
    expect(chooseTwist(top, { x: 0.1, y: 0, z: 0.9 })).toEqual({ axis: 'x', tangent: 'z', sign: 1 })
    expect(chooseTwist(top, { x: 0.9, y: 0, z: 0.2 })).toEqual({ axis: 'z', tangent: 'x', sign: -1 })
  })

  it('refuses a drag with no movement across the face', () => {
    expect(chooseTwist(front, { x: 0, y: 0, z: 0 })).toBeNull()
  })
})

describe('releaseTurns', () => {
  it('rounds a slow drag to the nearest quarter turn', () => {
    expect(releaseTurns(0.3, 0)).toBe(0)
    expect(releaseTurns(0.6, 0)).toBe(1)
    expect(releaseTurns(-0.7, 0)).toBe(-1)
    expect(releaseTurns(1.8, 0)).toBe(2)
  })

  it('completes a short, fast flick', () => {
    expect(releaseTurns(0.2, 0.005)).toBe(1)
    expect(releaseTurns(-0.25, -0.005)).toBe(-1)
  })

  it('does not let a slow drag creep into a turn', () => {
    expect(releaseTurns(0.2, 0.0005)).toBe(0)
  })

  it('never adds a second quarter turn however hard the flick', () => {
    expect(releaseTurns(0.1, 1)).toBe(1)
    expect(releaseTurns(1.2, 1)).toBe(1)
    expect(releaseTurns(-1.3, -1)).toBe(-1)
  })
})

describe('normalizeQuarterTurns', () => {
  it('maps whole turns onto the engine range', () => {
    expect(normalizeQuarterTurns(0)).toBe(0)
    expect(normalizeQuarterTurns(1)).toBe(1)
    expect(normalizeQuarterTurns(-1)).toBe(-1)
    expect(normalizeQuarterTurns(2)).toBe(2)
    expect(normalizeQuarterTurns(-2)).toBe(2)
    expect(normalizeQuarterTurns(3)).toBe(-1)
    expect(normalizeQuarterTurns(4)).toBe(0)
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

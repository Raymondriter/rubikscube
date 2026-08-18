import { describe, expect, it } from 'vitest'
import { applyAlgorithm, createSolvedCubies, type Cubie } from '../../engine/cubeState'
import { parseAlgorithm } from '../../engine/notation'
import { caseById } from './index'

function uStickers(cubies: Cubie[]) {
  return cubies.flatMap((cubie) => {
    if (Math.round(cubie.object.position.y) !== 1) return []
    return cubie.stickers
      .map((sticker) => {
        const normal = sticker.normal.clone().applyQuaternion(cubie.object.quaternion)
        if (normal.y < 0.5) return null
        return {
          color: sticker.color,
          kind: cubie.kind,
          x: Math.round(cubie.object.position.x),
          z: Math.round(cubie.object.position.z),
        }
      })
      .filter((row) => row !== null)
  })
}

function yellowEdgeShape(cubies: Cubie[]): 'dot' | 'L' | 'line' | 'cross' | 'other' {
  const edges = uStickers(cubies).filter((s) => s.kind === 'edge' && s.color === 'yellow')
  if (edges.length === 0) return 'dot'
  if (edges.length === 4) return 'cross'
  if (edges.length !== 2) return 'other'
  return edges[0]!.x === edges[1]!.x || edges[0]!.z === edges[1]!.z ? 'line' : 'L'
}

function setup(id: string): Cubie[] {
  const cubies = createSolvedCubies()
  applyAlgorithm(cubies, parseAlgorithm(caseById(id).setupMoves))
  return cubies
}

function yellowUpSlots(cubies: Cubie[], kind: Cubie['kind']): string[] {
  return uStickers(cubies)
    .filter((s) => s.kind === kind && s.color === 'yellow')
    .map((s) => {
      const faces: string[] = ['U']
      if (s.x === 1) faces.push('R')
      if (s.x === -1) faces.push('L')
      if (s.z === 1) faces.push('F')
      if (s.z === -1) faces.push('B')
      return faces.join('')
    })
    .sort()
}

describe('beginner last-layer setups match their names', () => {
  it('yellow cross cases', () => {
    expect(yellowEdgeShape(setup('beginner-yellow-dot'))).toBe('dot')
    expect(yellowEdgeShape(setup('beginner-yellow-l'))).toBe('L')
    expect(yellowEdgeShape(setup('beginner-yellow-line'))).toBe('line')
  })

  it('line and L sit in the holds the lesson text describes', () => {
    expect(yellowUpSlots(setup('beginner-yellow-line'), 'edge')).toEqual(['UL', 'UR'])
    expect(yellowUpSlots(setup('beginner-yellow-l'), 'edge')).toEqual(['UB', 'UL'])
  })

  it('sune / anti-sune still have a yellow cross (edges already oriented)', () => {
    expect(yellowEdgeShape(setup('beginner-sune'))).toBe('cross')
    expect(yellowEdgeShape(setup('beginner-antisune'))).toBe('cross')
    expect(yellowUpSlots(setup('beginner-sune'), 'corner')).toHaveLength(1)
    expect(yellowUpSlots(setup('beginner-antisune'), 'corner')).toHaveLength(1)
  })
})

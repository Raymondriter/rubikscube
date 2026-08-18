import { describe, expect, it } from 'vitest'
import { applyMove, createSolvedCubies } from './cubeState'
import { lastLayerSideColors } from './facelets'
import { parseMove } from './notation'

describe('lastLayerSideColors', () => {
  it('reads solid sides on a solved cube', () => {
    const cubies = createSolvedCubies()
    expect(lastLayerSideColors(cubies, 'F')).toEqual(['green', 'green', 'green'])
    expect(lastLayerSideColors(cubies, 'R')).toEqual(['red', 'red', 'red'])
    expect(lastLayerSideColors(cubies, 'B')).toEqual(['blue', 'blue', 'blue'])
    expect(lastLayerSideColors(cubies, 'L')).toEqual(['orange', 'orange', 'orange'])
  })

  it('changes after a U turn', () => {
    const cubies = createSolvedCubies()
    applyMove(cubies, parseMove('U'))
    expect(lastLayerSideColors(cubies, 'F')).toEqual(['red', 'red', 'red'])
    expect(lastLayerSideColors(cubies, 'R')).toEqual(['blue', 'blue', 'blue'])
  })
})

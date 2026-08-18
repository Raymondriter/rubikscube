import { applyAlgorithm, createSolvedCubies } from '../engine/cubeState'
import { lastLayerSideColors } from '../engine/facelets'
import { parseAlgorithm } from '../engine/notation'
import type { StickerColor } from '../engine/types'

export function twoSidedPllView(
  setupMoves: string,
  extras: string[] = [],
): { front: StickerColor[]; right: StickerColor[] } {
  const cubies = createSolvedCubies()
  const algorithm = [setupMoves, ...extras].filter((token) => token.trim().length > 0).join(' ')
  if (algorithm.trim()) applyAlgorithm(cubies, parseAlgorithm(algorithm))
  return {
    front: lastLayerSideColors(cubies, 'F'),
    right: lastLayerSideColors(cubies, 'R'),
  }
}

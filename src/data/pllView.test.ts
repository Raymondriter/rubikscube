import { describe, expect, it } from 'vitest'
import { caseById } from './methods'
import { twoSidedPllView } from './pllView'

describe('twoSidedPllView', () => {
  it('is not a solid F/R bar after a PLL setup', () => {
    const cubeCase = caseById('cfop-pll-t')
    const view = twoSidedPllView(cubeCase.setupMoves)
    const frontUniform = view.front.every((color) => color === view.front[0])
    const rightUniform = view.right.every((color) => color === view.right[0])
    expect(frontUniform && rightUniform && view.front[0] === 'green' && view.right[0] === 'red').toBe(false)
    expect(view.front).toHaveLength(3)
    expect(view.right).toHaveLength(3)
  })
})

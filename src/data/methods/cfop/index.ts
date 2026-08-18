import { caseFromSolution } from '../../algorithm'
import type { AlgorithmCase } from '../../types'
import { cfopF2lCases } from './f2l'
import { cfopOllCases } from './oll'
import { cfopPllCases } from './pll'

export { cfopMethod } from './method'
export { cfopOllTwoLookIds, cfopPllTwoLookIds } from './ids'

const crossCases: AlgorithmCase[] = [
  caseFromSolution({
    id: 'cfop-cross-daisy-down',
    method: 'cfop',
    step: 'cfop-cross',
    name: 'White edge on D, aligned',
    group: 'cross',
    yellowOnU: true,
    solution: 'F2',
    recognitionHighlight: ['DF'],
    tags: ['cfop', 'cross'],
  }),
  caseFromSolution({
    id: 'cfop-cross-from-e',
    method: 'cfop',
    step: 'cfop-cross',
    name: 'White edge in the E slice',
    group: 'cross',
    yellowOnU: true,
    solution: "F'",
    recognitionHighlight: ['FR'],
    tags: ['cfop', 'cross'],
  }),
]

export const cfopCases: AlgorithmCase[] = [...crossCases, ...cfopF2lCases, ...cfopOllCases, ...cfopPllCases]

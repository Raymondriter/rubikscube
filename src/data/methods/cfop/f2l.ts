import { caseFromSolution } from '../../algorithm'
import type { AlgorithmCase } from '../../types'

function f2l(n: number, name: string, group: string, solution: string): AlgorithmCase {
  return caseFromSolution({
    id: `cfop-f2l-${String(n).padStart(2, '0')}`,
    method: 'cfop',
    step: 'cfop-f2l',
    name: `F2L ${n} · ${name}`,
    group,
    solution,
    yellowOnU: true,
    recognitionHighlight: ['UFR', 'FR'],
    tags: ['cfop', 'f2l', group],
  })
}

/** 41 F2L cases for the FR slot. Algorithms from solvethecube.com. */
export const cfopF2lCases: AlgorithmCase[] = [
  f2l(1, 'Basic insert', 'basic', "R U R'"),
  f2l(2, 'Basic insert', 'basic', "F' U' F"),
  f2l(3, 'Basic insert', 'basic', "U R U' R'"),
  f2l(4, 'Basic insert', 'basic', "U' F' U F"),

  f2l(5, 'Pair in U', 'pair-in-u', "U' R U' R' U R U R'"),
  f2l(6, 'Pair in U', 'pair-in-u', "U F' U F U' F' U' F"),
  f2l(7, 'Pair in U', 'pair-in-u', "U' R U R' U R U R'"),
  f2l(8, 'Pair in U', 'pair-in-u', "U F' U' F U' F' U' F"),
  f2l(9, 'Pair in U', 'pair-in-u', "d R' U2 R d' R U R'"),
  f2l(10, 'Pair in U', 'pair-in-u', "U' R U2 R' d R' U' R"),
  f2l(11, 'Pair in U', 'pair-in-u', "R U' R' U d R' U' R"),
  f2l(12, 'Pair in U', 'pair-in-u', "F' U F U' d' F U F'"),
  f2l(13, 'Pair in U', 'pair-in-u', "U F' U2 F U F' U2 F"),
  f2l(14, 'Pair in U', 'pair-in-u', "U' R U2 R' U' R U2 R'"),
  f2l(15, 'Pair in U', 'pair-in-u', "U F' U' F U F' U2 F"),
  f2l(16, 'Pair in U', 'pair-in-u', "U' R U R' U' R U2 R'"),

  f2l(17, 'Corner pointing up', 'corner-up', "R U2 R' U' R U R'"),
  f2l(18, 'Corner pointing up', 'corner-up', "F' U2 F U F' U' F"),
  f2l(19, 'Corner pointing up', 'corner-up', "U R U2 R' U R U' R'"),
  f2l(20, 'Corner pointing up', 'corner-up', "U' F' U2 F U' F' U F"),
  f2l(21, 'Corner pointing up', 'corner-up', "U2 R U R' U R U' R'"),
  f2l(22, 'Corner pointing up', 'corner-up', "U2 F' U' F U' F' U F"),
  f2l(23, 'Corner pointing up', 'corner-up', "R U R' U' U' R U R' U' R U R'"),
  f2l(24, 'Corner pointing up', 'corner-up', "y' R' U' R U U R' U' R U R' U' R"),

  f2l(25, 'Edge in middle', 'edge-in-slot', "U F' U F U F' U2 F"),
  f2l(26, 'Edge in middle', 'edge-in-slot', "U' R U' R' U' R U2 R'"),
  f2l(27, 'Edge in middle', 'edge-in-slot', "U F' U' F d' F U F'"),
  f2l(28, 'Edge in middle', 'edge-in-slot', "U' R U R' d R' U' R"),
  f2l(29, 'Edge in middle', 'edge-in-slot', "R U' R' d R' U R"),
  f2l(30, 'Edge in middle', 'edge-in-slot', "R U R' U' R U R' U' R U R'"),

  f2l(31, 'Corner in slot', 'corner-in-slot', "U R U' R' U' F' U F"),
  f2l(32, 'Corner in slot', 'corner-in-slot', "U' F' U F U R U' R'"),
  f2l(33, 'Corner in slot', 'corner-in-slot', "F' U F U' F' U F"),
  f2l(34, 'Corner in slot', 'corner-in-slot', "R U' R' U R U' R'"),
  f2l(35, 'Corner in slot', 'corner-in-slot', "R U R' U' R U R'"),
  f2l(36, 'Corner in slot', 'corner-in-slot', "F' U' F U F' U' F"),

  f2l(37, 'Both in slot', 'both-in-slot', "R U' R' U R U2 R' U R U' R'"),
  f2l(38, 'Both in slot', 'both-in-slot', "R U' R' U' R U R' U' R U2 R'"),
  f2l(39, 'Both in slot', 'both-in-slot', "R U R' U' R U' R' U d R' U' R"),
  f2l(40, 'Both in slot', 'both-in-slot', "R U' R' d R' U' R U' R' U' R"),
  f2l(41, 'Both in slot', 'both-in-slot', "R U' R' d R' U2 R U R' U2 R"),
]

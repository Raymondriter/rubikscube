import { caseFromSolution } from '../../algorithm'
import type { AlgorithmCase } from '../../types'

// Slot ids follow the engine's canonical U/D, then R/L, then F/B order (src/engine/cubeState.ts).
const CMLL_HIGHLIGHT = ['URF', 'URB', 'ULB', 'ULF']

function cmll(n: number, name: string, group: string, solution: string): AlgorithmCase {
  return caseFromSolution({
    id: `roux-cmll-${String(n).padStart(2, '0')}`,
    method: 'roux',
    step: 'roux-cmll',
    name: `CMLL ${n} · ${name}`,
    group,
    solution,
    yellowOnU: true,
    recognitionHighlight: CMLL_HIGHLIGHT,
    tags: ['roux', 'cmll', group],
  })
}

/** 42 CMLL cases, grouped by corner-permutation family (O, H, Pi, U, T, L, S, As). Algorithms from Kian Mansour's CMLL sheet (ekrohn.com/cubing/cmll.html). */
export const rouxCmllCases: AlgorithmCase[] = [
  cmll(1, 'Oriented adjacent swap', 'o', "R U R' F' R U R' U' R' F R2 U' R'"),
  cmll(2, 'Oriented diagonal swap', 'o', "F R U' R' U' R U R' F' R U R' U' R' F R F'"),

  cmll(3, 'H · 2 columns', 'h', "R U2 R' U' R U R' U' R U' R' U"),
  cmll(4, 'H · 2 rows', 'h', "F R U R' U' R U R' U' R U R' U' F'"),
  cmll(5, 'H · R column', 'h', "U R U2' R2' F R F' U2 R' F R F'"),
  cmll(6, 'H · F row', 'h', "U2 r U' r2' D' r U' r' D r2 U r'"),

  cmll(7, 'Pi · right column', 'pi', "F R U R' U' R U R' U' F'"),
  cmll(8, 'Pi · columns', 'pi', "U' r U' r2' D' r U r' D r2 U r'"),
  cmll(9, 'Pi · checkerboard', 'pi', "U' R' F R U F U' R U R' U' F'"),
  cmll(10, 'Pi · forward slash', 'pi', "R U2 R' U' R U R' U2' R' F R F'"),
  cmll(11, 'Pi · back slash', 'pi', "U F R' F' R U2 R U' R' U R U2' R'"),
  cmll(12, 'Pi · left column', 'pi', "U' R' U' R' F R F' R U' R' U2 R"),

  cmll(13, 'U · forward slash', 'u', "U2 R2 D R' U2 R D' R' U2 R' U2"),
  cmll(14, 'U · back slash', 'u', "R2' D' R U2 R' D R U2 R"),
  cmll(15, 'U · front row', 'u', "R2' F U' F U F2 R2 U' R' F R"),
  cmll(16, 'U · back row', 'u', "U' F R U R' U' F' U'"),
  cmll(17, 'U · checkerboard', 'u', "U2 r U' r' U r' D' r U' r' D r"),
  cmll(18, 'U · both rows', 'u', "U' F R2 D R' U R D' R2' U' F'"),

  cmll(19, 'T · both columns', 't', "U2 r2' D' r U r' D r2 U' r' U' r"),
  cmll(20, 'T · left column', 't', "U' R U R' U' R' F R F'"),
  cmll(21, 'T · right column', 't', "U L' U' L U L F' L' F"),
  cmll(22, 'T · rows', 't', "F R' F R2 U' R' U' R U R' F2 U"),
  cmll(23, 'T · front row', 't', "r' U r U2' R2' F R F' R"),
  cmll(24, 'T · back row', 't', "U2 F R U R' U' R U' R' U' R U R' F'"),

  cmll(25, 'L · mirror', 'l', "U2 F R U' R' U' R U R' F'"),
  cmll(26, 'L · front edge', 'l', "U2 F R' F' R U R U' R'"),
  cmll(27, 'L · 2 back slants', 'l', "R U2 R' U' R U R' U' R U R' U' R U' R'"),
  cmll(28, 'L · forward slash', 'l', "U2 R U2 R D R' U2 R D' R2'"),
  cmll(29, 'L · forward slash V', 'l', "U R' U2 R' D' R U2 R' D R2"),
  cmll(30, 'L · diagonal', 'l', "R' U' R U R' F' R U R' U' R' F R2 U'"),

  cmll(31, 'Sune · forward slash', 's', "R U' L' U R' U' L"),
  cmll(32, 'Sune · back slash', 's', "F R' F' R U2 R U2' R'"),
  cmll(33, 'Sune · left X', 's', "L' U2 L U2' L F' L' F"),
  cmll(34, 'Sune · both rows', 's', "R U R' U' R' F R F' R U R' U R U2' R'"),
  cmll(35, 'Sune · back row', 's', "R U R' U R U2 R'"),
  cmll(36, 'Sune · front row', 's', "U2 R U R' U R' F R F' R U2' R'"),

  cmll(37, 'Anti-Sune · forward slash', 'as', "F' L F L' U2' L' U2 L"),
  cmll(38, 'Anti-Sune · back slash', 'as', "L' U R U' L U R'"),
  cmll(39, 'Anti-Sune · right X', 'as', "R U2 R' U2 R' F R F'"),
  cmll(40, 'Anti-Sune · both rows', 'as', "R2 D R' U R D' R' U R' U' R U' R'"),
  cmll(41, 'Anti-Sune · front row', 'as', "U R' U' R U' R' U R' F R F' U R"),
  cmll(42, 'Anti-Sune · back row', 'as', "U2 R' U' R U' R' U2' R U"),
]

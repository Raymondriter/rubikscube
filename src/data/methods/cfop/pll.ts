import { caseFromSolution } from '../../algorithm'
import type { AlgorithmCase } from '../../types'

function pll(
  id: string,
  name: string,
  group: string,
  solution: string,
  tags: string[] = [],
): AlgorithmCase {
  return caseFromSolution({
    id: `cfop-pll-${id}`,
    method: 'cfop',
    step: 'cfop-pll',
    name,
    group,
    solution,
    yellowOnU: true,
    recognitionHighlight: ['UF', 'UR', 'UB', 'UL', 'URF', 'URB', 'ULB', 'ULF'],
    tags: ['cfop', 'pll', ...tags],
  })
}

/** 21 PLL cases. Algorithms from solvethecube.com. */
export const cfopPllCases: AlgorithmCase[] = [
  pll('h', 'H perm', 'edges', 'M2 U M2 U2 M2 U M2', ['edges']),
  pll('z', 'Z perm', 'edges', "R' U' R2 U R U R' U' R U R U' R U' R' U2", ['edges']),
  pll('ua', 'Ua perm', 'edges', "R2 U' R' U' R U R U R U' R", ['edges']),
  pll('ub', 'Ub perm', 'edges', "R' U R' U' R' U' R' U R U R2", ['edges']),
  pll('aa', 'Aa perm', 'corners', "x z' R2 U2 R' D' R U2 R' D R' z x'", ['corners']),
  pll('ab', 'Ab perm', 'corners', "x R2 D2 R U R' D2 R U' R x'", ['corners']),
  pll('e', 'E perm', 'corners', "R2 U R' U' y R U R' U' R U R' U' R U R' y' R U' R2", ['corners']),
  pll('t', 'T perm', 'both', "R U R' U' R' F R2 U' R' U' R U R' F'", ['both']),
  pll('y', 'Y perm', 'both', "F R U' R' U' R U R' F' R U R' U' R' F R F'", ['both']),
  pll('f', 'F perm', 'both', "U' R' U R U' R2 F' U' F U x R U R' U' R2 x'", ['both']),
  pll('v', 'V perm', 'both', "R' U R' U' y R' D R' D' R2 y' R' B' R B R", ['both']),
  pll('ja', 'Ja perm', 'both', "L' U' L F L' U' L U L F' L2 U L U", ['both']),
  pll('jb', 'Jb perm', 'both', "R U R' F' R U R' U' R' F R2 U' R' U'", ['both']),
  pll('ra', 'Ra perm', 'both', "L U2 L' U2 L F' L' U' L U L F L2 U", ['both']),
  pll('rb', 'Rb perm', 'both', "R' U2 R U2 R' F R U R' U' R' F' R2 U'", ['both']),
  pll('na', 'Na perm', 'both', "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'", ['both']),
  pll('nb', 'Nb perm', 'both', "R' U R U' R' F' U' F R U R' F R' F' R U' R", ['both']),
  pll('ga', 'Ga perm', 'both', "y R2 u R' U R' U' R u' R2 y' R' U R", ['both']),
  pll('gb', 'Gb perm', 'both', "R' U' R y R2 u R' U R U' R u' R2", ['both']),
  pll('gc', 'Gc perm', 'both', "y R2 u' R U' R U R' u R2 y R U' R'", ['both']),
  pll('gd', 'Gd perm', 'both', "y2 R U R' y' R2 u' R U' R' U R' u R2", ['both']),
]

export { cfopPllTwoLookIds } from './ids'

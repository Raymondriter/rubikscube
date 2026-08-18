import {
  cfopF2lIds,
  cfopOllIds,
  cfopOllTwoLookIds,
  cfopPllIds,
  cfopPllTwoLookIds,
} from './methods/cfop/ids'
import { rouxCmllIds } from './methods/roux/ids'

export const beginnerLastLayerIds = [
  'beginner-yellow-dot',
  'beginner-yellow-l',
  'beginner-yellow-line',
  'beginner-sune',
  'beginner-antisune',
  'beginner-corner-cycle',
  'beginner-u-perm-a',
  'beginner-u-perm-b',
]

export interface TrainerSet {
  id: string
  name: string
  summary: string
  caseIds: string[]
}

export const trainerSets: TrainerSet[] = [
  {
    id: 'pll-2look',
    name: '2-look PLL',
    summary: 'Six last-layer perms. The first set worth drilling every day.',
    caseIds: [...cfopPllTwoLookIds],
  },
  {
    id: 'pll',
    name: 'Full PLL',
    summary: 'All 21 permutations. Recognition plus execution.',
    caseIds: [...cfopPllIds],
  },
  {
    id: 'oll-2look',
    name: '2-look OLL',
    summary: 'Yellow cross plus the seven corner cases.',
    caseIds: [...cfopOllTwoLookIds],
  },
  {
    id: 'oll',
    name: 'Full OLL',
    summary: 'All 57 orientations, grouped by shape in the picker.',
    caseIds: [...cfopOllIds],
  },
  {
    id: 'f2l',
    name: 'F2L',
    summary: '41 FR-slot pair cases.',
    caseIds: [...cfopF2lIds],
  },
  {
    id: 'beginner-ll',
    name: 'Beginner last layer',
    summary: 'The yellow-cross, Sune, and U-perm cases from the beginner course.',
    caseIds: beginnerLastLayerIds,
  },
  {
    id: 'cmll',
    name: 'CMLL',
    summary: 'All 42 Roux corner cases, grouped by permutation family.',
    caseIds: [...rouxCmllIds],
  },
]

export function trainerSetById(id: string): TrainerSet {
  const set = trainerSets.find((entry) => entry.id === id)
  if (!set) throw new Error(`Unknown trainer set: "${id}"`)
  return set
}

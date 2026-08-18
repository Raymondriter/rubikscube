import type { AlgorithmCase } from '../../types'
import { rouxFirstBlockCases, rouxSecondBlockCases } from './blocks'
import { rouxCmllCases } from './cmll'
import { rouxEolrCases } from './eolr'
import { rouxLseEdgesCases, rouxLseEoCases, rouxLseL6eCases } from './lse'

export { rouxMethod } from './method'

export const rouxCases: AlgorithmCase[] = [
  ...rouxFirstBlockCases,
  ...rouxSecondBlockCases,
  ...rouxCmllCases,
  ...rouxLseEoCases,
  ...rouxLseEdgesCases,
  ...rouxLseL6eCases,
  ...rouxEolrCases,
]

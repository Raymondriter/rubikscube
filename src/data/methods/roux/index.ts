import type { AlgorithmCase } from '../../types'
import { rouxFirstBlockCases, rouxSecondBlockCases } from './blocks'
import { rouxCmllCases } from './cmll'

export { rouxMethod } from './method'

export const rouxCases: AlgorithmCase[] = [...rouxFirstBlockCases, ...rouxSecondBlockCases, ...rouxCmllCases]

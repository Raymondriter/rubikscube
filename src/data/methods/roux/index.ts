import type { AlgorithmCase } from '../../types'
import { rouxFirstBlockCases, rouxSecondBlockCases } from './blocks'

export { rouxMethod } from './method'

export const rouxCases: AlgorithmCase[] = [...rouxFirstBlockCases, ...rouxSecondBlockCases]

import type { AlgorithmCase } from '../../types'
import { zzEolineCases } from './eoline'
import { zzF2lCases } from './f2l'

export { zzMethod } from './method'

export const zzCases: AlgorithmCase[] = [...zzEolineCases, ...zzF2lCases]

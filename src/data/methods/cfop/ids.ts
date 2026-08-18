export const cfopCrossIds = ['cfop-cross-daisy-down', 'cfop-cross-from-e'] as const

export const cfopF2lIds = Array.from(
  { length: 41 },
  (_, index) => `cfop-f2l-${String(index + 1).padStart(2, '0')}`,
)

export const cfopOllIds = Array.from(
  { length: 57 },
  (_, index) => `cfop-oll-${String(index + 1).padStart(2, '0')}`,
)

export const cfopPllIds = [
  'cfop-pll-h',
  'cfop-pll-z',
  'cfop-pll-ua',
  'cfop-pll-ub',
  'cfop-pll-aa',
  'cfop-pll-ab',
  'cfop-pll-e',
  'cfop-pll-t',
  'cfop-pll-y',
  'cfop-pll-f',
  'cfop-pll-v',
  'cfop-pll-ja',
  'cfop-pll-jb',
  'cfop-pll-ra',
  'cfop-pll-rb',
  'cfop-pll-na',
  'cfop-pll-nb',
  'cfop-pll-ga',
  'cfop-pll-gb',
  'cfop-pll-gc',
  'cfop-pll-gd',
] as const

export const cfopOllTwoLookIds = [
  'cfop-oll-45',
  'cfop-oll-44',
  'cfop-oll-21',
  'cfop-oll-22',
  'cfop-oll-23',
  'cfop-oll-24',
  'cfop-oll-25',
  'cfop-oll-26',
  'cfop-oll-27',
] as const

export const cfopPllTwoLookIds = [
  'cfop-pll-t',
  'cfop-pll-y',
  'cfop-pll-ua',
  'cfop-pll-ub',
  'cfop-pll-h',
  'cfop-pll-z',
] as const

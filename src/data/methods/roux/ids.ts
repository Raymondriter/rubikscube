export const rouxFirstBlockIds = ['roux-fb-example-1', 'roux-fb-example-2', 'roux-fb-example-3'] as const

export const rouxSecondBlockIds = ['roux-sb-example-1', 'roux-sb-example-2', 'roux-sb-example-3'] as const

export const rouxCmllIds = Array.from(
  { length: 42 },
  (_, index) => `roux-cmll-${String(index + 1).padStart(2, '0')}`,
)

/**
 * The cube-skin catalog, deliberately free of any `three` import.
 *
 * `materials.ts` needs THREE, and THREE code-splits into its own ~560KB chunk.
 * The settings UI and the persisted progress schema both need to know the skin
 * ids and names, and neither should drag that chunk in to get them - so the
 * plain data lives here and `materials.ts` reads it.
 *
 * Cosmetic-only by construction: a skin varies body color and material finish
 * (roughness/metalness), never sticker hue. Sticker color always comes from
 * materials.ts's STICKER_HEX/COLORBLIND_HEX, so which physical color a face is
 * stays identical - and colorblind-safe - no matter the skin.
 */
export interface CubeSkinDefinition {
  id: string
  name: string
  /** What the skin looks like in a settings swatch, as a CSS color. */
  swatch: string
  body: { color: number; roughness: number; metalness: number }
  sticker: { roughness: number; metalness: number }
}

export const CUBE_SKINS: CubeSkinDefinition[] = [
  {
    id: 'classic',
    name: 'Classic',
    swatch: '#0d0d12',
    body: { color: 0x0d0d12, roughness: 0.45, metalness: 0.15 },
    sticker: { roughness: 0.2, metalness: 0 },
  },
  {
    id: 'stealth',
    name: 'Stealth',
    swatch: '#050505',
    body: { color: 0x050505, roughness: 0.75, metalness: 0.05 },
    sticker: { roughness: 0.55, metalness: 0 },
  },
  {
    id: 'chrome',
    name: 'Chrome',
    swatch: '#e4e6eb',
    body: { color: 0xe4e6eb, roughness: 0.15, metalness: 0.85 },
    sticker: { roughness: 0.08, metalness: 0.35 },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    swatch: '#2a120a',
    body: { color: 0x2a120a, roughness: 0.3, metalness: 0.35 },
    sticker: { roughness: 0.12, metalness: 0.1 },
  },
]

export const DEFAULT_SKIN_ID = CUBE_SKINS[0].id

export function isKnownSkinId(id: string): boolean {
  return CUBE_SKINS.some((skin) => skin.id === id)
}

export const ZODIAC_MASCOT_IDS = [
  'rat',
  'ox',
  'tiger',
  'rabbit',
  'dragon',
  'snake',
  'horse',
  'goat',
  'monkey',
  'rooster',
  'dog',
  'pig',
] as const

export const MASCOT_IDS = ['default', ...ZODIAC_MASCOT_IDS] as const

export type ZodiacMascotId = (typeof ZODIAC_MASCOT_IDS)[number]
export type MascotId = (typeof MASCOT_IDS)[number]

export type MascotOption = {
  id: MascotId
  icon: string
  label: string
  displayName: string
}

export const MASCOT_OPTIONS: readonly MascotOption[] = [
  {
    id: 'default',
    icon: '✻',
    label: 'Default',
    displayName: 'Default (Clawd)',
  },
  { id: 'rat', icon: '🐀', label: 'Rat', displayName: '🐀 Rat' },
  { id: 'ox', icon: '🐂', label: 'Ox', displayName: '🐂 Ox' },
  { id: 'tiger', icon: '🐅', label: 'Tiger', displayName: '🐅 Tiger' },
  { id: 'rabbit', icon: '🐇', label: 'Rabbit', displayName: '🐇 Rabbit' },
  { id: 'dragon', icon: '🐉', label: 'Dragon', displayName: '🐉 Dragon' },
  { id: 'snake', icon: '🐍', label: 'Snake', displayName: '🐍 Snake' },
  { id: 'horse', icon: '🐎', label: 'Horse', displayName: '🐎 Horse' },
  { id: 'goat', icon: '🐐', label: 'Goat', displayName: '🐐 Goat' },
  { id: 'monkey', icon: '🐒', label: 'Monkey', displayName: '🐒 Monkey' },
  { id: 'rooster', icon: '🐓', label: 'Rooster', displayName: '🐓 Rooster' },
  { id: 'dog', icon: '🐕', label: 'Dog', displayName: '🐕 Dog' },
  { id: 'pig', icon: '🐖', label: 'Pig', displayName: '🐖 Pig' },
]

export const MASCOT_DISPLAY_OPTIONS = MASCOT_OPTIONS.map(
  option => option.displayName,
)

const MASCOT_OPTION_BY_ID = Object.fromEntries(
  MASCOT_OPTIONS.map(option => [option.id, option]),
) as Record<MascotId, MascotOption>

const MASCOT_ID_BY_DISPLAY_NAME = Object.fromEntries(
  MASCOT_OPTIONS.map(option => [option.displayName, option.id]),
) as Record<string, MascotId>

export function isMascotId(value: unknown): value is MascotId {
  return (
    typeof value === 'string' &&
    (MASCOT_IDS as readonly string[]).includes(value)
  )
}

export function getMascotOption(value: unknown): MascotOption {
  return MASCOT_OPTION_BY_ID[isMascotId(value) ? value : 'default']
}

export function getMascotDisplayName(value: unknown): string {
  return getMascotOption(value).displayName
}

export function getMascotIdFromDisplayName(displayName: string): MascotId {
  return MASCOT_ID_BY_DISPLAY_NAME[displayName] ?? 'default'
}

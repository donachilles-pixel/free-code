import * as React from 'react'
import { Box, Text } from '../../ink.js'
import { useAppStateMaybeOutsideOfProvider } from '../../state/AppState.js'
import {
  getMascotOption,
  type MascotOption,
} from '../../utils/mascot.js'
import { getInitialSettings } from '../../utils/settings/settings.js'
import { AnimatedClawd } from './AnimatedClawd.js'
import { Clawd } from './Clawd.js'

type MascotProps = {
  animated?: boolean
}

export function useConfiguredMascotOption(): MascotOption {
  const appStateSettings = useAppStateMaybeOutsideOfProvider(
    state => state.settings,
  )
  return getMascotOption(
    appStateSettings ? appStateSettings.mascot : getInitialSettings().mascot,
  )
}

export function Mascot({
  animated = false,
}: MascotProps = {}): React.ReactNode {
  const mascot = useConfiguredMascotOption()
  if (mascot.id === 'default') {
    return animated ? <AnimatedClawd /> : <Clawd />
  }
  return <ZodiacMascot mascot={mascot} />
}

function ZodiacMascot({
  mascot,
}: {
  mascot: MascotOption
}): React.ReactNode {
  return (
    <Box flexDirection="column" alignItems="center" width={9}>
      <Text color="clawd_body">╭───╮</Text>
      <Text color="startupAccent">│ {mascot.icon} │</Text>
      <Text color="clawd_body">╰───╯</Text>
    </Box>
  )
}

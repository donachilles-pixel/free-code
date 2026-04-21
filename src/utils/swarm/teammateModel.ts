import { CLAUDE_OPUS_4_6_CONFIG } from '../model/configs.js'
import { getKimiForCodingModel } from '../model/kimiForCoding.js'
import { getAPIProvider } from '../model/providers.js'

// @[MODEL LAUNCH]: Update the fallback model below.
// When the user has never set teammateDefaultModel in /config, new teammates
// use Opus 4.6. Must be provider-aware so third-party customers get the correct
// model ID.
export function getHardcodedTeammateModelFallback(): string {
  const provider = getAPIProvider()
  if (provider === 'kimi') {
    return getKimiForCodingModel()
  }
  return CLAUDE_OPUS_4_6_CONFIG[provider]
}

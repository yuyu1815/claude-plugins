import type { PluginOptions } from 'claude-code'

import { PRESETS } from './presets'

export type Theme = Partial<Record<keyof (typeof PRESETS)['catppuccin-mocha'], string>>

export type Style = { theme: Theme; mermaidAscii: boolean; diagramHints: boolean }

export const resolveStyle = (options: PluginOptions): Style => ({
  theme: (PRESETS as Record<string, Theme>)[String(options.theme)] ?? PRESETS['catppuccin-mocha'],
  mermaidAscii: options.mermaidAscii === true,
  diagramHints: options.diagramHints !== false,
})

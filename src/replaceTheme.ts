import type { ThemeDefinition } from '@hanzogui/web'

import { _mutateTheme } from './_mutateTheme'

export function replaceTheme({
  name,
  theme,
}: {
  name: string
  theme: Partial<Record<keyof ThemeDefinition, any>>
}) {
  const next = _mutateTheme({ name, theme, insertCSS: true, mutationType: 'replace' })
  return next
}

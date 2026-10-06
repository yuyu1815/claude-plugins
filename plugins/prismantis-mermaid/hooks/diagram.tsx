import type { ElementTable, RenderElement } from 'claude-code'

import { mermaidText, paint } from './mermaid'
import type { Style, Theme } from './theme'
import { remember, width } from './util'
import type { Cls } from './vendor/grok-mermaid.js'
import { diagramKind, render } from './vendor/grok-mermaid.js'

type Run = { text: string; color?: string; bold?: boolean }
export type Drawing = { kind: 'art'; rows: Run[][] } | { kind: 'warn'; message: string }

const grokColor = (t: Theme): Record<Cls, Omit<Run, 'text'>> => ({
  border: { color: t.tableRule },
  text: { color: t.diagramText },
  edge: { color: t.diagram },
  edgeLabel: { color: t.quote },
  title: { color: t.heading, bold: true },
  none: {},
})

// grok-mermaid は flowchart/state/class/er/sequence だけを描く。それ以外 (xychart など) は beautiful-mermaid に任せる
const grok = (source: string, style: Style, columns: number): Drawing | null | undefined => {
  if (style.mermaidAscii || diagramKind(source) === null) return undefined
  const art = render(source)
  if (art === null || art.width > columns) return null
  if (art.warnings.length > 0) {
    const more = art.warnings.length > 1 ? ` (+${art.warnings.length - 1} more)` : ''
    return { kind: 'warn', message: `Mermaid diagram not rendered: ${art.warnings[0]}${more}` }
  }
  const cls = grokColor(style.theme)
  return { kind: 'art', rows: art.styled.map(row => row.map(span => ({ text: span.text, ...cls[span.cls] }))) }
}

const beautiful = (source: string, style: Style, columns: number): Drawing | null => {
  const art = mermaidText(source, style.mermaidAscii, columns)
  if (art === null || !art.split('\n').every(l => width(l) <= columns)) return null
  const colors = paint(art, style)
  return {
    kind: 'art',
    rows: art.split('\n').map((line, i) => {
      const chars = [...line]
      const runs: Run[] = []
      for (let at = 0, end = 0; at < chars.length; at = end) {
        const color = colors[i]?.[at]
        end = at + 1
        while (end < chars.length && colors[i]?.[end] === color) end++
        runs.push({ text: chars.slice(at, end).join(''), color })
      }
      return runs
    }),
  }
}

const cache = new Map<string, Drawing | null>()

/** 図にできなければ null。null なら元の fence をそのまま描く */
export const drawing = (source: string, style: Style, columns: number): Drawing | null =>
  remember(cache, `${style.mermaidAscii}:${columns}:${source}`, () => {
    const g = grok(source, style, columns)
    return g === undefined ? beautiful(source, style, columns) : g
  })

export const drawRows = ({ Box, Text }: ElementTable, rows: Run[][], key: string): RenderElement => (
  <Box key={key} flexDirection="column">
    {rows.map((runs, i) => (
      <Text key={`${key}.${i}`}>
        {runs.length && runs.some(r => r.text !== '')
          ? runs.map((r, j) => <Text key={`${key}.${i}.${j}`} color={r.color} bold={r.bold}>{r.text}</Text>)
          : ' '}
      </Text>
    ))}
  </Box>
)

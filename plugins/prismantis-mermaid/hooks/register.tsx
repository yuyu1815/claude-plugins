import type { Register, RenderElement } from 'claude-code'

import type { Drawing } from './diagram'
import { drawRows, drawing } from './diagram'
import { resolveStyle } from './theme'

const HINT = [
  'Replies in this session draw ```mermaid blocks as colored terminal diagrams: flowchart, sequenceDiagram, classDiagram, stateDiagram-v2, erDiagram and xychart-beta bar or line charts.',
  'When a reply carries a numeric series or a flow that is easier to see than read, add one small diagram with short labels.',
  'Skip diagrams for simple answers.',
].join(' ')

// 閉じていない fence (streaming 中) は一致させず、標準の描画に任せる
const FENCE = /^```mermaid[ \t]*\n([\s\S]*?)\n```[ \t]*$/gm
// Markdown 要素の text 上限
const MARKDOWN_LIMIT = 10000

type Part = { kind: 'text'; text: string } | { kind: 'drawing'; drawing: Drawing; raw: string }

const split = (text: string, style: ReturnType<typeof resolveStyle>, columns: number): Part[] | null => {
  const parts: Part[] = []
  let at = 0
  for (const m of text.matchAll(FENCE)) {
    const d = drawing(m[1]!, style, columns)
    if (d === null) continue
    parts.push({ kind: 'text', text: text.slice(at, m.index) }, { kind: 'drawing', drawing: d, raw: m[0] })
    at = m.index + m[0].length
  }
  if (parts.length === 0) return null
  parts.push({ kind: 'text', text: text.slice(at) })
  const kept = parts.filter(p => p.kind === 'drawing' || p.text.trim() !== '')
  return kept.every(p => (p.kind === 'text' ? p.text : p.raw).length <= MARKDOWN_LIMIT) ? kept : null
}

export const register: Register = (on, options) => {
  const style = resolveStyle(options)

  on('prompt.submit', async ($, e, next) => {
    if (!style.diagramHints || (e.origin.kind !== 'composer' && e.origin.kind !== 'bridge')) return next(e)
    return next({ ...e, context: [...(e.context ?? []), HINT] })
  })

  on('ui.render', { component: 'AssistantMessage' }, ($, e, next) => {
    const columns = Math.max(20, (e.viewport?.columns ?? 100) - 4)
    const parts = split(e.props.text, style, columns)
    if (parts === null) return next(e)
    const el = $.ui.resolve(e)
    const { Box, Text, Markdown } = el
    const body: RenderElement[] = parts.map((p, i) => {
      if (p.kind === 'text') return <Markdown key={`m${i}`} text={p.text.trim()} />
      if (p.drawing.kind === 'art') return drawRows(el, p.drawing.rows, `d${i}`)
      return (
        <Box key={`w${i}`} flexDirection="column">
          <Markdown text={p.raw} />
          <Text color={style.theme.emphasis}>{p.drawing.message}</Text>
        </Box>
      )
    })
    return (
      <Box flexDirection="row">
        <Box width={2} flexShrink={0}>
          <Text>{e.props.isFirstOfReply ? '⏺' : ' '}</Text>
        </Box>
        <Box flexDirection="column" rowGap={1} flexGrow={1}>
          {body}
        </Box>
      </Box>
    )
  })
}

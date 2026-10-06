import type { On } from 'claude-code'
import { expect, test } from 'claude-code/testing'

const engine = (on: On) =>
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>engine</Text>
  })

const mount = ($: Parameters<Parameters<typeof test>[1]>[0], text: string, columns = 100) =>
  $.ui.mount({ plugin: 'prismantis-mermaid', surface: 'terminal', component: 'AssistantMessage', props: { text, isFirstOfReply: true }, viewport: { columns, rows: 40 } })

const fence = (src: string) => '```mermaid\n' + src + '\n```'

test('mermaid の無い返答は標準の描画に任せる', async ($, on) => {
  engine(on)
  const ui = await mount($, '| a | b |\n|---|---|\n| 1 | 2 |')
  expect(await ui.find({ type: 'Text', text: 'engine' })).toBeDefined()
  await ui.unmount()
})

test('flowchart は grok-mermaid で描き、前後の文章は Markdown で描く', async ($, on) => {
  engine(on)
  const ui = await mount($, `前の文\n\n${fence('graph LR\n  A[Start] --> B[Done]')}\n\n後の文`)
  expect(await ui.find({ type: 'Text', text: 'engine' })).toBeUndefined()
  expect(await ui.find({ type: 'Markdown', text: '前の文' })).toBeDefined()
  expect(await ui.find({ type: 'Markdown', text: '後の文' })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Start/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /▶/ })).toBeDefined()
  await ui.unmount()
})

test('sequenceDiagram も描く', async ($, on) => {
  engine(on)
  const ui = await mount($, fence('sequenceDiagram\n  Alice->>Bob: Hi'))
  expect(await ui.find({ type: 'Text', text: /Alice/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: 'engine' })).toBeUndefined()
  await ui.unmount()
})

test('xychart は beautiful-mermaid で描く', async ($, on) => {
  engine(on)
  const ui = await mount($, fence('xychart-beta\n  x-axis [a, b, c]\n  bar [1, 3, 2]'))
  expect(await ui.find({ type: 'Text', text: /█/ })).toBeDefined()
  await ui.unmount()
})

test('構文の警告があれば図にせず、元の fence と警告を出す', async ($, on) => {
  engine(on)
  const ui = await mount($, fence('graph TD\n A[Start --> B'))
  expect(await ui.find({ type: 'Markdown', text: /^```mermaid/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /^Mermaid diagram not rendered/ })).toBeDefined()
  await ui.unmount()
})

test('画面に収まらない図は標準の描画に任せる', async ($, on) => {
  engine(on)
  const ui = await mount($, fence('graph LR\n  A[aaaaaaaaaaaa] --> B[bbbbbbbbbbbb] --> C[cccccccccccc] --> D[dddddddddddd]'), 30)
  expect(await ui.find({ type: 'Text', text: 'engine' })).toBeDefined()
  await ui.unmount()
})

test('閉じていない mermaid fence は標準の描画に任せる', async ($, on) => {
  engine(on)
  const ui = await mount($, '```mermaid\ngraph LR\n  A --> B')
  expect(await ui.find({ type: 'Text', text: 'engine' })).toBeDefined()
  await ui.unmount()
})

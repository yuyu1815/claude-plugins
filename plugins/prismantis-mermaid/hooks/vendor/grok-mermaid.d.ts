export type Cls = 'border' | 'text' | 'edge' | 'edgeLabel' | 'title' | 'none'
export type Span = { text: string; cls: Cls }
export type MermaidArt = { plain: string[]; styled: Span[][]; width: number; warnings: string[] }
export function render(src: string): MermaidArt | null
export function diagramKind(src: string): 'flowchart' | 'state' | 'class' | 'er' | 'sequence' | null

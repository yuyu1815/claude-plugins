# claude-plugins

yuyu1815 の Claude Code プラグイン集（marketplace）。

| plugin | 内容 |
|---|---|
| [prismantis-mermaid](plugins/prismantis-mermaid) | `` ```mermaid `` をターミナル内で図として描画する（[prismantis](https://github.com/NahumLitvin/prismantis) 0.6.0 の fork） |

## セットアップ

```
/plugin marketplace add yuyu1815/claude-plugins
/plugin install prismantis-mermaid@claude-plugins
```

インストール後、Claude Code を再起動（または `/reload-plugins`）。

### 動作確認

Claude に次を出力させて、コードブロックではなく図で描画されれば成功。

````
```mermaid
flowchart LR
  A --> B --> C
```
````

### 設定（`/plugin` → prismantis-mermaid → Configure）

| key | default | 内容 |
|---|---|---|
| `theme` | `catppuccin-mocha` | 図の配色（prismantis のプリセット名） |
| `mermaidAscii` | `false` | 罫線文字の代わりに `+ - \| >` で描く |
| `diagramHints` | `true` | mermaid が描画されることをモデルに伝える短い context を付ける |

### 更新・削除

```
/plugin marketplace update claude-plugins
/plugin uninstall prismantis-mermaid@claude-plugins
/plugin marketplace remove claude-plugins
```

## 描画対象

- flowchart / sequence / class / state / er → grok-mermaid 0.2.3
- xychart → beautiful-mermaid 1.1.3
- それ以外 → Claude Code 標準の描画に任せる

## ライセンス

MIT。fork 元・同梱ライブラリの帰属は [LICENSE](plugins/prismantis-mermaid/LICENSE) と
[THIRD_PARTY_NOTICES.md](plugins/prismantis-mermaid/THIRD_PARTY_NOTICES.md) を参照。

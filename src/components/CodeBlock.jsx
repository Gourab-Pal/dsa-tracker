import './CodeBlock.css'

const RULES = [
  { pattern: /(\/\/.*$)/gm, cls: 'code-comment' },
  { pattern: /(\/\*[\s\S]*?\*\/)/g, cls: 'code-comment' },
  { pattern: /(#.*$)/gm, cls: 'code-comment' },
  { pattern: /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, cls: 'code-string' },
  { pattern: /\b(function|const|let|var|return|if|else|for|while|do|switch|case|break|continue|new|class|extends|import|export|from|default|try|catch|finally|throw|async|await|yield|of|in|typeof|instanceof|void|delete|this|super|def|self|lambda|print|elif|pass|raise|with|as|True|False|None|public|private|protected|static|final|abstract|interface|implements|package|int|long|double|float|boolean|char|String|void|null|true|false)\b/g, cls: 'code-keyword' },
  { pattern: /\b(\d+\.?\d*)\b/g, cls: 'code-number' },
  { pattern: /\b([A-Z][a-zA-Z0-9_]*)\b/g, cls: 'code-type' },
  { pattern: /\b([a-zA-Z_]\w*)\s*(?=\()/g, cls: 'code-function' },
]

function highlightLine(line) {
  const tokens = []
  let remaining = line

  while (remaining.length > 0) {
    let earliest = null
    let earliestIdx = remaining.length
    let earliestRule = null

    for (const rule of RULES) {
      rule.pattern.lastIndex = 0
      const match = rule.pattern.exec(remaining)
      if (match && match.index < earliestIdx) {
        earliest = match
        earliestIdx = match.index
        earliestRule = rule
      }
    }

    if (!earliest) {
      tokens.push({ text: remaining, cls: null })
      break
    }

    if (earliestIdx > 0) {
      tokens.push({ text: remaining.slice(0, earliestIdx), cls: null })
    }

    tokens.push({ text: earliest[0], cls: earliestRule.cls })
    remaining = remaining.slice(earliestIdx + earliest[0].length)
  }

  return tokens
}

export default function CodeBlock({ code }) {
  if (!code) return null
  const lines = code.split('\n')

  return (
    <div className="code-block">
      <div className="code-block__gutter">
        {lines.map((_, i) => (
          <div key={i} className="code-block__line-num">{i + 1}</div>
        ))}
      </div>
      <pre className="code-block__code">
        <code>
          {lines.map((line, i) => {
            const tokens = highlightLine(line)
            return (
              <div key={i} className="code-block__line">
                {tokens.map((t, j) =>
                  t.cls ? <span key={j} className={t.cls}>{t.text}</span> : t.text
                )}
                {line === '' && '\n'}
              </div>
            )
          })}
        </code>
      </pre>
    </div>
  )
}

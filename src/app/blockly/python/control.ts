import * as monaco from 'monaco-editor'

export default [
  {
    label: 'google',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'google($1)',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Print to console'
  }
]

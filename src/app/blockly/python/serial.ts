import * as monaco from 'monaco-editor'
export default [
    {
              label: 'print',
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: 'print($1)',
              insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: 'Print to console'
            }]
import * as monaco from 'monaco-editor'

export default [
  {
    label: 'for',
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: 'for i in range($1):\n\t$2',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'For loop'
  },
  {
    label: 'if',
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: 'if $1:\n\t$2',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'If statement'
  },
  {
    label: 'while',
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: 'while $1:\n\t$2',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'While loop'
  },
  {
    label: 'ifelse',
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: 'if $1:\n\t$2\nelse:\n\t$3',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'If-Else statement'
  },
  {
    label: 'def',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'def ${1:function_name}(${2:args}):\n\t$0',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Function definition'
  },
  {
    label: 'function call',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: '${1:function_name}($2)',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Function call'
  },
  {
    label: 'variable assignment',
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: '${1:variable} = ${2:value}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Variable assignment'
  },
  {
    label: 'print',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'print($1)',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Print to console'
  },
  {
    label: 'len',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'len($1)',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Get length of a collection'
  },
  {
    label: 'range',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: 'range($1)',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Create a range of numbers'
  }
]

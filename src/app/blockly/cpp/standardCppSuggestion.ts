import * as monaco from 'monaco-editor'

export default [
  {
    label: 'setup',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: ['void setup() {', '\t$0', '}', '', 'void loop() {', '\t$1', '', '}'].join('\n'),
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Main function'
  },
  {
    label: 'led',
    kind: monaco.languages.CompletionItemKind.Function,
    insertText: [
      '#include <Arduino.h>',
      '',
      'void setup() {',
      '\tpinMode(LED_BUILTIN, OUTPUT);',
      '}',
      '',
      'void loop() {',
      '\tdigitalWrite(LED_BUILTIN, HIGH);',
      '\tdelay(1000);',
      '\tdigitalWrite(LED_BUILTIN, LOW);',
      '\tdelay(1000);',
      '}'
    ].join('\n'),
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'Main function'
  },
  {
    label: 'for',
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: 'for (int i = 0; i < $1; ++i) {\n\t$0\n}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'For loop'
  },
  {
    label: 'if',
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: 'if ($1) {\n\t$0\n}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'If statement'
  },
  {
    label: 'while',
    kind: monaco.languages.CompletionItemKind.Keyword,
    insertText: 'while ($1) {\n\t$0\n}',
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'While loop'
  },
  {
    label: 'class',
    kind: monaco.languages.CompletionItemKind.Class,
    insertText: ['class $1 {', 'public:', '\t$1();', '\t~$1();', 'private:', '\t$0', '};'].join(
      '\n'
    ),
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    documentation: 'C++ class structure'
  }
]

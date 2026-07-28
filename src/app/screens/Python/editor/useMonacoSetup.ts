import { useEffect } from 'react';
import { loader } from '@monaco-editor/react';
import standardSuggestions from '../../../blockly/python/standardSuggestions';
import controlSuggestions from '../../../blockly/python/control';
// Import other suggestions...

export const useMonacoSetup = () => {
  useEffect(() => {
    loader.init().then((monaco) => {

      // DARK THEME
      monaco.editor.defineTheme('atum-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#000000',
        },
      });

      // LIGHT THEME
      monaco.editor.defineTheme('atum-light', {
        base: 'vs',
        inherit: true,
        rules: [],
        colors: {
          'editor.background': '#FFFFFF',
        },
      });

      monaco.languages.registerCompletionItemProvider('python', {
        provideCompletionItems: (model) => {
          const code = model.getValue();
          const dynamicSuggestions = [];

          const functionMatches = [
            ...code.matchAll(/def\s+(\w+)\s*\(/g)
          ];

          for (const match of functionMatches) {
            dynamicSuggestions.push({
              label: match[1],
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: `${match[1]}($1)`,
              insertTextRules:
                monaco.languages
                  .CompletionItemInsertTextRule
                  .InsertAsSnippet,
            });
          }

          return {
            suggestions: [
              ...standardSuggestions,
              ...controlSuggestions,
              ...dynamicSuggestions
            ]
          };
        },
      });
    });
  }, []);
};
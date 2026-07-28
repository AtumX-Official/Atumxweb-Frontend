import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useMonacoSetup } from './useMonacoSetup';

export const PythonEditor = ({
  tabs,
  activeTabId,
  setTabs,
  theme,
  options,
  setContextMenuRef
}) => {
  useMonacoSetup();

  const editorRefs = useRef<Record<string, any>>({});
  return (
    <div className="flex-grow relative bg-white dark:bg-[#1e1e1e]">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className="absolute inset-0"
          style={{ display: activeTabId === tab.id ? 'block' : 'none' }}
        >
          <Editor
            height="100%"
            width="100%"
            defaultLanguage="python"
            value={tab.code}
            theme={theme === 'dark' ? 'atum-dark' : 'atum-light'}            
            options={{
              ...options,
              readOnly: !!tab.isReadOnly,
              domReadOnly: !!tab.isReadOnly
            }}
            onChange={(val) => {
              if (tab.isReadOnly) return;

              setTabs((prev) =>
                prev.map((t) =>
                  t.id === tab.id
                    ? {
                        ...t,
                        code: val || '',
                        isUnsaved: (val || '') !== t.originalCode
                      }
                    : t
                )
              );
            }}
            onMount={(editor) => {
              editorRefs.current[tab.id] = editor;

              // global access (if needed)
              window.monacoEditor = editor;

              if (activeTabId === tab.id) {
                editor.focus();
              }

              editor.updateOptions({ contextmenu: false });

              // attach custom context menu
              setTimeout(() => {
                const editorDom = editor.getDomNode();
                if (!editorDom) return;

                editorDom.addEventListener('contextmenu', (e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  setContextMenuRef.current({
                    x: e.clientX,
                    y: e.clientY,
                    editor
                  });
                });
              }, 100);

              editor.onMouseDown(() => {
                setContextMenuRef.current(null);
              });
            }}
          />
        </div>
      ))}
    </div>
  );
};
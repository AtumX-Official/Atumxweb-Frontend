import { useState, useRef, useEffect, useCallback } from "react";

export const useEditorContextMenu = () => {
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    editor: any;
  } | null>(null);

  const contextMenuRef = useRef<HTMLDivElement>(null);
  const setContextMenuRef = useRef(setContextMenu);

  useEffect(() => {
    setContextMenuRef.current = setContextMenu;
  }, []);

  const editorMenuItems = useCallback((editor: any) => [
    {
      label: 'Cut',
      action: async () => {
        const sel = editor?.getSelection();
        const model = editor?.getModel();
        if (!sel || !model) return;

        const text = model.getValueInRange(sel);

        if (text) {
          await window.api.copyText(text);

          editor.executeEdits('cut', [
            {
              range: sel,
              text: '',
              forceMoveMarkers: true
            }
          ]);

          editor.focus();
        }
      }
    },
    {
      label: 'Copy',
      action: async () => {
        const sel = editor?.getSelection();
        const model = editor?.getModel();
        if (!sel || !model) return;

        const text = model.getValueInRange(sel);
        if (text) await window.api.copyText(text);
      }
    },
    {
      label: 'Paste',
      action: async () => {
        const sel = editor?.getSelection();
        if (!sel) return;

        const text = await window.api.pasteText();

        if (text) {
          editor.executeEdits('paste', [
            {
              range: sel,
              text,
              forceMoveMarkers: true
            }
          ]);

          editor.focus();
        }
      }
    }
  ], []);

  const handleEditorMount = (editor: any) => {
    editor.updateOptions({ contextmenu: false });

    setTimeout(() => {
      const dom = editor.getDomNode();
      if (!dom) return;

      const handler = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setContextMenuRef.current({
          x: e.clientX,
          y: e.clientY,
          editor
        });
      };

      dom.addEventListener('contextmenu', handler);
    }, 100);

    editor.onMouseDown(() => {
      setContextMenuRef.current(null);
    });
  };

  return {
    contextMenu,
    setContextMenu,
    contextMenuRef,
    editorMenuItems,
    handleEditorMount
  };
};
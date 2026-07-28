import { useState } from 'react';
import { Tab } from '../Types/python';

export const usePythonTabs = ({
  handleUnsavedBeforeAction,
  handlePythonSave,
  appendOutput,
  updateActiveTabData,
  handleNewFileCreation
}:any) => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: '1',
      name: 'untitled',
      code: '',
      path: '',
      isUnsaved: false,
      originalCode: '',
      source: 'user',
      isReadOnly: false
    }
  ]);

  const [activeTabId, setActiveTabId] = useState('1');

  const activeTab = tabs.find(t => t.id === activeTabId)!;

  // ✅ Update active tab
  const updateActiveTab = (updates: Partial<Tab>) => {
    setTabs(prev =>
      prev.map(t => (t.id === activeTabId ? { ...t, ...updates } : t))
    );
  };

  // ✅ Create new tab
  const createTab = (tab: Partial<Tab>) => {
    const newTab: Tab = {
      id: Date.now().toString(),
      name: tab.name || 'untitled',
      code: tab.code || '',
      path: tab.path || '',
      isUnsaved: false,
      originalCode: tab.code || '',
      source: tab.source || 'user',
      isReadOnly: !!tab.isReadOnly
    };

    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  };

  // ✅ Close tab
  const closeTab = async (id: string) => {
    const tabToClose = tabs.find(t => t.id === id);
    if (!tabToClose) return;
  
    if (tabs.length === 1) {
      handleNewFileCreation();
      return;
    }
  
    const result = await handleUnsavedBeforeAction({
      tab: tabToClose,
      onSave: async () => {
        return await handlePythonSave({
          activeTab: tabToClose,
          updateActiveTabData,
          appendOutput
        });
      }
    });
  
    if (result === "cancel") return;
  
    const newTabs = tabs.filter(t => t.id !== id);
    setTabs(newTabs);
  
    if (activeTabId === id) {
      setActiveTabId(newTabs[newTabs.length - 1].id);
    }
  };

  return {
    tabs,
    activeTab,
    activeTabId,
    setActiveTabId,
    updateActiveTab,
    createTab,
    closeTab,
    setTabs // keep for advanced cases (like IPC)
  };
};
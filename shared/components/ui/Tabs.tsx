import React, { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (tabId: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}

export function Tabs({ tabs, activeTab: controlledTab, onChange, variant = 'underline', className = '' }: TabsProps) {
  const [internalTab, setInternalTab] = useState(tabs[0]?.id || '');
  const activeId = controlledTab ?? internalTab;

  const handleChange = (id: string) => {
    if (!controlledTab) setInternalTab(id);
    onChange?.(id);
  };

  return (
    <div className={className}>
      <div
        className={`flex gap-1 ${variant === 'underline' ? 'border-b border-border' : ''}`}
        role="tablist"
      >
        {tabs.map(tab => {
          const isActive = tab.id === activeId;
          const base = 'relative px-4 py-2 text-body-sm font-medium cursor-pointer transition-colors duration-base ease-out focus-visible:ring-2 focus-visible:ring-interactive-focus rounded-sm';
          const activeStyle = variant === 'underline'
            ? isActive ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'
            : isActive ? 'bg-interactive-primary text-white' : 'text-text-tertiary hover:bg-surface-tertiary hover:text-text-secondary';
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              className={`${base} ${activeStyle}`}
              onClick={() => handleChange(tab.id)}
            >
              {tab.label}
              {isActive && variant === 'underline' && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-interactive-primary" />
              )}
            </button>
          );
        })}
      </div>
      {tabs.find(t => t.id === activeId)?.content && (
        <div role="tabpanel" className="pt-4">
          {tabs.find(t => t.id === activeId)?.content}
        </div>
      )}
    </div>
  );
}

Tabs.displayName = 'Tabs';
export type { TabsProps, Tab };
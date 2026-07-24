import React, { useState } from 'react';

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  className?: string;
}

export function Accordion({ items, allowMultiple = false, className = '' }: AccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    setOpenIds(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : allowMultiple ? [...prev, id] : [id]
    );
  };

  return (
    <div className={`divide-y divide-border ${className}`}>
      {items.map(item => {
        const isOpen = openIds.includes(item.id);
        return (
          <div key={item.id}>
            <button
              className="flex w-full items-center justify-between px-4 py-3 text-body-sm font-medium text-text-primary hover:bg-surface-tertiary transition-colors duration-base focus-visible:ring-2 focus-visible:ring-interactive-focus rounded-sm"
              onClick={() => toggle(item.id)}
              aria-expanded={isOpen}
            >
              {item.title}
              <svg
                className={`h-4 w-4 text-text-tertiary transition-transform duration-base ease-out ${isOpen ? 'rotate-180' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            <div
              className={`overflow-hidden transition-all duration-base ease-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              role="region"
            >
              <div className="px-4 py-3 text-body-sm text-text-secondary">{item.content}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

Accordion.displayName = 'Accordion';
export type { AccordionProps, AccordionItem };
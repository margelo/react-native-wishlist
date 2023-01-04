import {createContext, useContext} from 'react';

export const TemplateContext = createContext<{
  templateType: string;
  renderChildren?: boolean;
} | null>(null);

export function useTemplateContext() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw Error('Must be rendered inside a Template component.');
  }
  return context;
}

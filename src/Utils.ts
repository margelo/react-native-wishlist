import { useRef } from 'react';

let idGenerator = 0;

export function generateId(): string {
  return `id_${idGenerator++}`;
}

export function useGeneratedId(): string {
  const ref = useRef<string | null>(null);
  if (ref.current === null) {
    ref.current = generateId();
  }
  return ref.current;
}

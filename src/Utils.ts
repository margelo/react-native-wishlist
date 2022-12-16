let idGenerator = 0;

export function generateId() {
  return `id_${idGenerator++}`;
}

// Class names must be unique within a classifier: saved-model bundles key each
// class's training samples by NAME, so two classes sharing a name collide and lose
// data on save/load. This returns `desired` if free, otherwise the first available
// " 2", " 3", … suffix. Comparison is case-insensitive and trim-insensitive.
export function uniqueClassName(desired: string, takenNames: string[]): string {
  const norm = (s: string): string => s.trim().toLowerCase()
  const taken = new Set(takenNames.map(norm))
  const base = desired.trim() || 'Class'
  if (!taken.has(norm(base))) return base
  let n = 2
  while (taken.has(norm(`${base} ${n}`))) n++
  return `${base} ${n}`
}

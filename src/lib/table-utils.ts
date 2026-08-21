export type SortDirection = 'asc' | 'desc';

export function sortRows<T>(
  rows: T[],
  selector: (row: T) => string | number | null | undefined,
  direction: SortDirection = 'asc',
) {
  const multiplier = direction === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => {
    const leftValue = selector(left);
    const rightValue = selector(right);

    if (leftValue === rightValue) return 0;
    if (leftValue === null || leftValue === undefined || leftValue === '') return 1 * multiplier;
    if (rightValue === null || rightValue === undefined || rightValue === '') return -1 * multiplier;

    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * multiplier;
    }

    return String(leftValue).localeCompare(String(rightValue), undefined, { sensitivity: 'base' }) * multiplier;
  });
}

export function toggleSort(currentKey: string, nextKey: string, direction: SortDirection): SortDirection {
  return currentKey === nextKey && direction === 'asc' ? 'desc' : 'asc';
}

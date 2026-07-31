import { useState } from "react";

/**
 * Sort state for a timing sheet. Numeric keys sort descending first, except
 * the keys listed in `ascFirst` (0–100 time and mass) which ascend first.
 */
export function useSheetSort<K extends string>(
  defaultKey: K,
  ascFirst: readonly K[] = [],
) {
  const [sortKey, setSortKey] = useState<K>(defaultKey);
  const [sortDir, setSortDir] = useState<1 | -1>(
    ascFirst.includes(defaultKey) ? 1 : -1,
  );

  const toggle = (key: K) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 1 ? -1 : 1));
    } else {
      setSortKey(key);
      setSortDir(ascFirst.includes(key) ? 1 : -1);
    }
  };

  /** Arrow glyph appended to the active column's header. */
  const arrow = (key: K) => (key === sortKey ? (sortDir === -1 ? " ↓" : " ↑") : "");

  const sortRows = <T,>(rows: T[], accessor: (row: T, key: K) => number | string): T[] =>
    rows.slice().sort((a, b) => {
      const va = accessor(a, sortKey);
      const vb = accessor(b, sortKey);
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return cmp * sortDir;
    });

  return { sortKey, sortDir, toggle, arrow, sortRows };
}

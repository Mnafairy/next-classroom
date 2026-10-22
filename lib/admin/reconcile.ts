import { object } from "./progress";

export function oneEditAway(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  if (a.length === b.length) {
    const dif = [...a].flatMap((c, i) => (c === b[i] ? [] : [i]));
    return (
      dif.length === 1 ||
      (dif.length === 2 &&
        dif[1] === dif[0] + 1 &&
        a[dif[0]] === b[dif[1]] &&
        a[dif[1]] === b[dif[0]])
    );
  }
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  let i = 0,
    j = 0;
  while (i < short.length && j < long.length) {
    if (short[i] === long[j]) {
      i++;
      j++;
    } else {
      if (j !== i) return false;
      j++;
    }
  }
  return true;
}
export function correctionCandidate(
  id: string,
  available: string[],
): string | null {
  const candidates = available.filter((other) => oneEditAway(id, other));
  if (candidates.length !== 1) return null;
  const match = candidates[0];
  // Numeric substitutions can identify a different student even with one candidate.
  const differences = [...id].flatMap((c, i) => (c === match[i] ? [] : [i]));
  if (
    id.length === match.length &&
    differences.every((i) => /\d/.test(id[i]) && /\d/.test(match[i]))
  )
    return null;
  return match;
}
export function mergeJavascriptWork(
  older: Record<string, unknown>,
  newer: Record<string, unknown>,
) {
  const union = (key: string) => [
    ...new Set(
      [
        ...(Array.isArray(older[key]) ? older[key] : []),
        ...(Array.isArray(newer[key]) ? newer[key] : []),
      ].filter((v): v is string => typeof v === "string"),
    ),
  ];
  const history = [
    ...new Map(
      [
        ...(Array.isArray(older.history) ? older.history : []),
        ...(Array.isArray(newer.history) ? newer.history : []),
      ].map((value) => [JSON.stringify(value), value]),
    ).values(),
  ];
  return {
    ...older,
    ...newer,
    ...(history.length ? { history } : {}),
    completed: union("completed"),
    assisted: union("assisted"),
    drafts: { ...object(older.drafts), ...object(newer.drafts) },
  };
}

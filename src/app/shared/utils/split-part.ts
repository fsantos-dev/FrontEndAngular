export function getSplitPart(
  value: string | undefined,
  separator: string,
  position: number
): string | null {
  if (!value) {
    return null;
  }

  return value.split(separator)[position] ?? null;
}
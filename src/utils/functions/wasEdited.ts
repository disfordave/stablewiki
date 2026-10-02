// Dates arrive as Date objects or ISO strings, so compare their time values
export function wasEdited(
  createdAt: Date | string,
  updatedAt: Date | string | null | undefined,
): boolean {
  return (
    !!updatedAt &&
    new Date(updatedAt).getTime() !== new Date(createdAt).getTime()
  );
}

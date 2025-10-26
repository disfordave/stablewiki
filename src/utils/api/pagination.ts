export function handleHPage(hPage: string | string[] | undefined) {
  if (!hPage) return 1;
  const num = Number(hPage);
  if (isNaN(num) || num < 1) return 1;
  return Math.floor(num);
}

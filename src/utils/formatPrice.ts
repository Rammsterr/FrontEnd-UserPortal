export function formatPriceSEK(amount: number): string {
  if (!isFinite(amount)) return '0 kr';
  const rounded = Math.round(amount);
  return `${rounded} kr`;
}
export default formatPriceSEK;

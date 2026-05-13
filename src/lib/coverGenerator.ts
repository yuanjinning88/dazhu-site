/**
 * 根据名称生成确定性封面色对。
 * 同一输入永远返回相同颜色，不需要外部 API。
 */
export function generateCoverColors(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const h1 = Math.abs(hash % 360);
  const h2 = (h1 + 30 + Math.abs((hash >> 8) % 40)) % 360;
  return [
    `hsl(${h1}, 35%, 25%)`,
    `hsl(${h2}, 40%, 40%)`,
  ];
}

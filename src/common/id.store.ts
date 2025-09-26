export let ids: number[] = [];

export const setIds = (newIds: number[]) => {
  ids = newIds;
};

export function getRandomNIdsUnique(n: number, ids: number[]): number[] {
  const shuffled = [...ids];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // swap
  }
  return shuffled.slice(0, n);
}

import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';

export function generateNickname(): string {
  const baseName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: '',
    style: 'capital',
  });

  const randomNumber = Math.floor(Math.random() * 10000); // 0~9999
  return `${baseName}${randomNumber}`;
}

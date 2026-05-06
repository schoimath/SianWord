import { allWords } from "../src/data/words";
import type { PartOfSpeech } from "../src/types/word";

const targets = new Map([
  [100, { noun: 45, verb: 30, adjective: 25 }],
  [500, { noun: 225, verb: 150, adjective: 125 }],
  [1000, { noun: 450, verb: 300, adjective: 250 }],
  [1500, { noun: 675, verb: 450, adjective: 375 }],
  [2000, { noun: 900, verb: 600, adjective: 500 }],
  [2500, { noun: 1125, verb: 750, adjective: 625 }],
  [3000, { noun: 1350, verb: 900, adjective: 750 }],
]);

const targetArg = process.argv.find((arg) => arg.startsWith("--target="));
const target = Number(targetArg?.split("=")[1] ?? 100);
const expectedCounts = targets.get(target);
const errors: string[] = [];

if (!expectedCounts) errors.push(`Unsupported target: ${target}`);

const words = allWords.filter((word) => word.rank <= target);
if (words.length !== target) errors.push(`Expected ${target} words, found ${words.length}.`);

for (let rank = 1; rank <= target; rank += 1) {
  if (!words.some((word) => word.rank === rank)) errors.push(`Missing rank ${rank}.`);
}

const ids = new Set<string>();
const wordTexts = new Set<string>();
const counts: Record<PartOfSpeech, number> = { noun: 0, verb: 0, adjective: 0 };

for (const word of words) {
  if (ids.has(word.id)) errors.push(`Duplicate id: ${word.id}`);
  ids.add(word.id);
  if (wordTexts.has(word.word)) errors.push(`Duplicate word: ${word.word}`);
  wordTexts.add(word.word);
  if (!["noun", "verb", "adjective"].includes(word.partOfSpeech)) errors.push(`Invalid partOfSpeech: ${word.id}`);
  else counts[word.partOfSpeech] += 1;
  for (const field of ["koDefinition", "enDefinition", "example", "exampleKo"] as const) {
    if (!word[field]) errors.push(`Empty ${field}: ${word.id}`);
  }
}

if (expectedCounts) {
  for (const part of ["noun", "verb", "adjective"] as const) {
    if (counts[part] !== expectedCounts[part]) {
      errors.push(`Expected ${expectedCounts[part]} ${part}, found ${counts[part]}.`);
    }
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Word validation passed for target ${target}.`);

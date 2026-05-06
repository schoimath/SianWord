import type { AnswerMode, Question, QuestionOption } from "../types/game";
import type { PartOfSpeech, Word } from "../types/word";
import { allWords } from "../data/words";
import { shuffleArray } from "./shuffle";

const levelTargets = [100, 500, 1000, 3000] as const;

export function getWordsByLevel(level: number): Word[] {
  const target = levelTargets.includes(level as (typeof levelTargets)[number]) ? level : 100;
  return allWords.filter((word) => word.rank <= target);
}

function getLabel(word: Word, answerMode: AnswerMode): string {
  return answerMode === "ko" ? word.koDefinition : word.enDefinition;
}

export function shuffleOptions(
  options: QuestionOption[],
  random: () => number = Math.random,
): QuestionOption[] {
  return shuffleArray(options, random);
}

export function pickGameWords(
  words: Word[],
  count: number,
  random: () => number = Math.random,
): Word[] {
  const buckets: Record<PartOfSpeech, Word[]> = {
    noun: shuffleArray(words.filter((word) => word.partOfSpeech === "noun"), random),
    verb: shuffleArray(words.filter((word) => word.partOfSpeech === "verb"), random),
    adjective: shuffleArray(words.filter((word) => word.partOfSpeech === "adjective"), random),
  };
  const pattern: PartOfSpeech[] = ["noun", "noun", "noun", "noun", "verb", "verb", "verb", "adjective", "adjective", "adjective"];
  const picked: Word[] = [];
  const used = new Set<string>();

  for (let i = 0; i < count; i += 1) {
    const preferred = pattern[i % pattern.length];
    const candidate =
      buckets[preferred].find((word) => !used.has(word.id)) ??
      (Object.keys(buckets) as PartOfSpeech[])
        .flatMap((part) => buckets[part])
        .find((word) => !used.has(word.id));
    if (candidate) {
      picked.push(candidate);
      used.add(candidate.id);
    }
  }

  return picked;
}

export function generateQuestion(
  correctWord: Word,
  allCandidateWords: Word[],
  answerMode: AnswerMode,
  random: () => number = Math.random,
): Question {
  const usedLabels = new Set([getLabel(correctWord, answerMode)]);
  const wrongOptions: Word[] = [];
  const samePart = shuffleArray(
    allCandidateWords.filter((word) => word.id !== correctWord.id && word.partOfSpeech === correctWord.partOfSpeech),
    random,
  );
  const otherPart = shuffleArray(
    allCandidateWords.filter((word) => word.id !== correctWord.id && word.partOfSpeech !== correctWord.partOfSpeech),
    random,
  );
  const pools = [samePart.slice(0, 2), otherPart, samePart.slice(2), allCandidateWords];

  for (const pool of pools) {
    for (const word of pool) {
      const label = getLabel(word, answerMode);
      if (word.id !== correctWord.id && !usedLabels.has(label) && wrongOptions.length < 3) {
        wrongOptions.push(word);
        usedLabels.add(label);
      }
    }
    if (wrongOptions.length === 3) break;
  }

  if (wrongOptions.length < 3) {
    throw new Error("Not enough unique options to generate a question.");
  }

  const options = [correctWord, ...wrongOptions].map((word) => ({
    id: `option-${word.id}`,
    wordId: word.id,
    label: getLabel(word, answerMode),
    partOfSpeech: word.partOfSpeech,
    isCorrect: word.id === correctWord.id,
  }));

  return {
    correctWord,
    options: shuffleOptions(options, random),
  };
}

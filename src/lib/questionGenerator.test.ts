import { describe, expect, it } from "vitest";
import { allWords } from "../data/words";
import { generateQuestion } from "./questionGenerator";

describe("questionGenerator", () => {
  it("보기 4개와 정답 1개를 만든다", () => {
    const question = generateQuestion(allWords[0], allWords, "ko", () => 0.42);
    expect(question.options).toHaveLength(4);
    expect(question.options.filter((option) => option.isCorrect)).toHaveLength(1);
  });

  it("보기 순서를 섞을 수 있다", () => {
    const a = generateQuestion(allWords[0], allWords, "ko", () => 0).options.map((option) => option.wordId);
    const b = generateQuestion(allWords[0], allWords, "ko", () => 0.99).options.map((option) => option.wordId);
    expect(a).not.toEqual(b);
  });

  it("한글 모드에서는 koDefinition이 label이다", () => {
    const question = generateQuestion(allWords[0], allWords, "ko", () => 0.5);
    const correct = question.options.find((option) => option.isCorrect);
    expect(correct?.label).toBe(allWords[0].koDefinition);
  });

  it("영어 모드에서는 enDefinition이 label이다", () => {
    const question = generateQuestion(allWords[0], allWords, "en", () => 0.5);
    const correct = question.options.find((option) => option.isCorrect);
    expect(correct?.label).toBe(allWords[0].enDefinition);
  });

  it("보기 객체에 wordId와 partOfSpeech가 포함된다", () => {
    const question = generateQuestion(allWords[0], allWords, "ko", () => 0.5);
    for (const option of question.options) {
      expect(option.wordId).toMatch(/^w\d{4}$/);
      expect(["noun", "verb", "adjective"]).toContain(option.partOfSpeech);
    }
  });

  it("한 문제 안에서 label 중복이 없다", () => {
    const question = generateQuestion(allWords[0], allWords, "ko", () => 0.5);
    const labels = question.options.map((option) => option.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

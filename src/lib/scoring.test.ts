import { describe, expect, it } from "vitest";
import type { Frame, QuestionOption } from "../types/game";
import type { Word } from "../types/word";
import { calculateBowlingScore, getFirstRollPinsFromFirstWrongChoice, resolveFrameAfterCorrect, resolveOpenFrameAfterAllWrongOptions } from "./scoring";

const correctWord: Word = {
  id: "w0001",
  rank: 1,
  word: "apple",
  partOfSpeech: "noun",
  koDefinition: "사과",
  enDefinition: "a fruit",
  example: "I eat an apple.",
  exampleKo: "나는 사과를 먹어요.",
};

const sameWrong: QuestionOption = { id: "option-w0002", wordId: "w0002", label: "책", partOfSpeech: "noun", isCorrect: false };
const diffWrong: QuestionOption = { id: "option-w0046", wordId: "w0046", label: "달리다", partOfSpeech: "verb", isCorrect: false };

function frame(index: number, rolls: number[], display: string, type: Frame["type"]): Frame {
  return {
    frameIndex: index,
    correctWordId: `w${String(index + 1).padStart(4, "0")}`,
    firstWrongOptionId: null,
    firstRollPins: null,
    wrongOptionIds: [],
    type,
    rolls,
    display,
    status: type === "strike" ? "completeStrike" : type === "spare" ? "completeSpare" : "completeOpen",
  };
}

describe("scoring", () => {
  it("첫 선택 정답은 스트라이크다", () => {
    const result = resolveFrameAfterCorrect({ isFirstChoice: true });
    expect(result.display).toBe("X");
    expect(result.rolls).toEqual([10]);
  });

  it("첫 오답이 같은 품사면 9핀이다", () => {
    const result = getFirstRollPinsFromFirstWrongChoice({ correctWord, firstWrongOption: sameWrong });
    expect(result.firstRollPins).toBe(9);
  });

  it("첫 오답이 다른 품사이고 randomOpenPinScore가 6이면 6핀이다", () => {
    const result = getFirstRollPinsFromFirstWrongChoice({ correctWord, firstWrongOption: diffWrong, randomOpenPinScore: () => 6 });
    expect(result.firstRollPins).toBe(6);
  });

  it("첫 오답 이후 다른 오답을 눌러도 점수는 유지된다", () => {
    const locked = getFirstRollPinsFromFirstWrongChoice({ correctWord, firstWrongOption: diffWrong, randomOpenPinScore: () => 6 });
    const later = getFirstRollPinsFromFirstWrongChoice({ correctWord, firstWrongOption: sameWrong });
    expect(locked.firstRollPins).toBe(6);
    expect(later.firstRollPins).toBe(9);
  });

  it("첫 오답이 같은 품사이고 이후 정답이면 9/다", () => {
    const result = resolveFrameAfterCorrect({ isFirstChoice: false, firstRollPins: 9 });
    expect(result.display).toBe("9/");
    expect(result.rolls).toEqual([9, 1]);
  });

  it("첫 오답이 다른 품사이고 이후 정답이면 6/다", () => {
    const result = resolveFrameAfterCorrect({ isFirstChoice: false, firstRollPins: 6 });
    expect(result.display).toBe("6/");
    expect(result.rolls).toEqual([6, 4]);
  });

  it("첫 오답이 같은 품사이고 오답을 모두 선택하면 9-다", () => {
    const result = resolveOpenFrameAfterAllWrongOptions({ firstRollPins: 9 });
    expect(result.display).toBe("9-");
    expect(result.rolls).toEqual([9, 0]);
  });

  it("첫 오답이 다른 품사이고 오답을 모두 선택하면 7-다", () => {
    const result = resolveOpenFrameAfterAllWrongOptions({ firstRollPins: 7 });
    expect(result.display).toBe("7-");
    expect(result.rolls).toEqual([7, 0]);
  });

  it("open 확정 후 정답을 눌러도 점수가 바뀌지 않는다", () => {
    const result = resolveOpenFrameAfterAllWrongOptions({ firstRollPins: 6 });
    expect(result.rolls).toEqual([6, 0]);
  });

  it("퍼펙트 게임은 300점이다", () => {
    const frames = Array.from({ length: 10 }, (_, index) => frame(index, [10], "X", "strike"));
    frames.push(frame(10, [10], "X", "open"), frame(11, [10], "X", "open"));
    frames[10].isBonus = true;
    frames[11].isBonus = true;
    expect(calculateBowlingScore(frames).total).toBe(300);
  });

  it("모든 프레임 9/ + 10프레임 보너스 9는 190점이다", () => {
    const frames = Array.from({ length: 10 }, (_, index) => frame(index, [9, 1], "9/", "spare"));
    frames.push({ ...frame(10, [9], "9", "open"), isBonus: true });
    expect(calculateBowlingScore(frames).total).toBe(190);
  });

  it("모든 프레임 5/ + 10프레임 보너스 5는 150점이다", () => {
    const frames = Array.from({ length: 10 }, (_, index) => frame(index, [5, 5], "5/", "spare"));
    frames.push({ ...frame(10, [5], "5", "open"), isBonus: true });
    expect(calculateBowlingScore(frames).total).toBe(150);
  });

  it("모든 프레임 7-는 70점이다", () => {
    const frames = Array.from({ length: 10 }, (_, index) => frame(index, [7, 0], "7-", "open"));
    expect(calculateBowlingScore(frames).total).toBe(70);
  });
});

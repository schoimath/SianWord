import type { BonusRollResult, BowlingScore, Frame, FrameResult, QuestionOption } from "../types/game";
import type { Word } from "../types/word";

export function randomOpenPinScore(): 5 | 6 | 7 {
  return [5, 6, 7][Math.floor(Math.random() * 3)] as 5 | 6 | 7;
}

export function getFirstRollPinsFromFirstWrongChoice(params: {
  correctWord: Word;
  firstWrongOption: QuestionOption;
  randomOpenPinScore?: () => 5 | 6 | 7;
}): {
  firstRollPins: 9 | 7 | 6 | 5;
  reason: "same-part-of-speech" | "different-part-of-speech";
} {
  if (params.firstWrongOption.partOfSpeech === params.correctWord.partOfSpeech) {
    return { firstRollPins: 9, reason: "same-part-of-speech" };
  }
  return {
    firstRollPins: (params.randomOpenPinScore ?? randomOpenPinScore)(),
    reason: "different-part-of-speech",
  };
}

export function resolveFrameAfterCorrect(params: {
  isFirstChoice: boolean;
  firstRollPins?: 9 | 7 | 6 | 5 | null;
}): FrameResult {
  if (params.isFirstChoice) {
    return { type: "strike", rolls: [10], display: "X", status: "completeStrike" };
  }
  const firstRollPins = params.firstRollPins;
  if (!firstRollPins) throw new Error("firstRollPins is required for a spare.");
  return {
    type: "spare",
    rolls: [firstRollPins, 10 - firstRollPins],
    display: `${firstRollPins}/`,
    status: "completeSpare",
  };
}

export function resolveOpenFrameAfterAllWrongOptions(params: {
  firstRollPins: 9 | 7 | 6 | 5;
}): FrameResult {
  return {
    type: "open",
    rolls: [params.firstRollPins, 0],
    display: `${params.firstRollPins}-`,
    status: "awaitingCorrectAfterOpen",
  };
}

export function getBonusRollFromChoice(params: {
  correctWord: Word;
  selectedOption: QuestionOption;
  isFirstChoice: boolean;
  randomBonusScore?: () => 5 | 6 | 7;
}): BonusRollResult {
  if (!params.isFirstChoice) {
    return { roll: 10, display: "X", reason: "not-first-choice" };
  }
  if (params.selectedOption.isCorrect) {
    return { roll: 10, display: "X", reason: "correct" };
  }
  if (params.selectedOption.partOfSpeech === params.correctWord.partOfSpeech) {
    return { roll: 9, display: "9", reason: "same-part-of-speech" };
  }
  const roll = (params.randomBonusScore ?? randomOpenPinScore)();
  return { roll, display: String(roll) as "7" | "6" | "5", reason: "different-part-of-speech" };
}

function flattenRolls(frames: Frame[]): number[] {
  return frames.flatMap((frame) => frame.rolls);
}

export function calculateBowlingScore(frames: Frame[]): BowlingScore {
  const normalFrames = frames.filter((frame) => !frame.isBonus).slice(0, 10);
  const allRolls = flattenRolls(frames);
  const frameScores: Array<number | null> = [];
  let total = 0;
  let rollIndex = 0;

  for (let i = 0; i < normalFrames.length; i += 1) {
    const frame = normalFrames[i];
    if (i === 9) {
      const bonusRolls = frames.filter((item) => item.isBonus).flatMap((item) => item.rolls);
      const tenthBase = frame.rolls;
      const requiredRolls = tenthBase[0] === 10 || tenthBase[0] + (tenthBase[1] ?? 0) === 10 ? 3 : 2;
      const available = [...tenthBase, ...bonusRolls];
      if (available.length >= requiredRolls && (frame.status === "completeStrike" || frame.status === "completeSpare" || frame.status === "awaitingCorrectAfterOpen" || frame.status === "completeOpen")) {
        const score = available.reduce((sum, roll) => sum + roll, 0);
        total += score;
        frameScores.push(total);
      } else {
        frameScores.push(null);
      }
      break;
    }

    if (frame.rolls[0] === 10) {
      const nextTwo = allRolls.slice(rollIndex + 1, rollIndex + 3);
      if (nextTwo.length < 2) {
        frameScores.push(null);
      } else {
        total += 10 + nextTwo[0] + nextTwo[1];
        frameScores.push(total);
      }
      rollIndex += 1;
    } else if (frame.rolls.length >= 2 && frame.rolls[0] + frame.rolls[1] === 10) {
      const nextRoll = allRolls[rollIndex + 2];
      if (nextRoll === undefined) {
        frameScores.push(null);
      } else {
        total += 10 + nextRoll;
        frameScores.push(total);
      }
      rollIndex += 2;
    } else if (frame.rolls.length >= 2) {
      total += frame.rolls[0] + frame.rolls[1];
      frameScores.push(total);
      rollIndex += 2;
    } else {
      frameScores.push(null);
      rollIndex += frame.rolls.length;
    }
  }

  return { frameScores, total };
}

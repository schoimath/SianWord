import type { PartOfSpeech, Word } from "./word";

export type AnswerMode = "ko" | "en";
export type LevelTarget = 100 | 500 | 1000 | 3000;
export type FrameStatus =
  | "waitingFirstChoice"
  | "firstRollLocked"
  | "completeStrike"
  | "completeSpare"
  | "completeOpen"
  | "awaitingCorrectAfterOpen";

export type FrameType = "strike" | "spare" | "open";

export type QuestionOption = {
  id: string;
  wordId: string;
  label: string;
  partOfSpeech: PartOfSpeech;
  isCorrect: boolean;
};

export type Question = {
  correctWord: Word;
  options: QuestionOption[];
};

export type FrameResult = {
  type: FrameType;
  rolls: number[];
  display: string;
  status: FrameStatus;
};

export type Frame = {
  frameIndex: number;
  correctWordId: string;
  firstWrongOptionId: string | null;
  firstRollPins: 9 | 7 | 6 | 5 | null;
  wrongOptionIds: string[];
  type: FrameType | null;
  rolls: number[];
  display: string;
  status: FrameStatus;
  isBonus?: boolean;
};

export type BonusRollResult = {
  roll: 10 | 9 | 7 | 6 | 5;
  display: "X" | "9" | "7" | "6" | "5";
  reason: "correct" | "same-part-of-speech" | "different-part-of-speech" | "not-first-choice";
};

export type BowlingScore = {
  frameScores: Array<number | null>;
  total: number;
};

export type GameHistoryResult = {
  date: string;
  level: LevelTarget;
  answerMode: AnswerMode;
  score: number;
  missedWordIds: string[];
};

export type AudioSettings = {
  musicEnabled: boolean;
  sfxEnabled: boolean;
  volume: number;
};

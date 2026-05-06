import { useEffect, useMemo, useState } from "react";
import type { AnswerMode, BonusRollResult, Frame, LevelTarget, Question, QuestionOption } from "../types/game";
import type { Word } from "../types/word";
import { generateQuestion, getWordsByLevel, pickGameWords } from "../lib/questionGenerator";
import { calculateBowlingScore, getBonusRollFromChoice, getFirstRollPinsFromFirstWrongChoice, resolveFrameAfterCorrect, resolveOpenFrameAfterAllWrongOptions } from "../lib/scoring";
import { playCorrect, playMiss, playOptionSelect, playSpare, playStrike, playWrong } from "../lib/audio";
import { BowlingScoreboard } from "./BowlingScoreboard";
import { WordQuestion } from "./WordQuestion";
import { BowlingAnimation } from "./BowlingAnimation";
import { WordInfoModal } from "./WordInfoModal";
import type { CharacterMood } from "./CharacterFace";

type Props = {
  level: LevelTarget;
  answerMode: AnswerMode;
  onFinished: (frames: Frame[], learnedWords: Word[], missedIds: string[]) => void;
  onQuit: () => void;
};

function makeFrame(index: number, correctWordId: string, isBonus = false): Frame {
  return {
    frameIndex: index,
    correctWordId,
    firstWrongOptionId: null,
    firstRollPins: null,
    wrongOptionIds: [],
    type: null,
    rolls: [],
    display: "",
    status: "waitingFirstChoice",
    isBonus,
  };
}

export function GameScreen(props: Props) {
  const words = useMemo(() => getWordsByLevel(props.level), [props.level]);
  const gameWords = useMemo(() => pickGameWords(words, 12), [words]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [bonusNeeded, setBonusNeeded] = useState(0);
  const [frames, setFrames] = useState<Frame[]>(() => gameWords.slice(0, 10).map((word, index) => makeFrame(index, word.id)));
  const [question, setQuestion] = useState<Question>(() => generateQuestion(gameWords[0], words, props.answerMode));
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [correctAnswered, setCorrectAnswered] = useState(false);
  const [wordInfoOpen, setWordInfoOpen] = useState(false);
  const [characterMood, setCharacterMood] = useState<CharacterMood>("normal");
  const [feedback, setFeedback] = useState("뜻을 골라 볼링공을 굴려봐!");
  const [laneState, setLaneState] = useState<"idle" | "rolling" | "strike" | "spare" | "open" | "bonus">("idle");
  const [pinsDown, setPinsDown] = useState(0);
  const [learnedIds, setLearnedIds] = useState<string[]>([]);
  const [missedIds, setMissedIds] = useState<string[]>([]);
  const score = calculateBowlingScore(frames);
  const isBonus = questionIndex >= 10;
  const activeFrameIndex = questionIndex;
  const displayFrameIndex = Math.min(questionIndex, 9);

  function currentFrame(): Frame {
    return frames.find((frame) => frame.frameIndex === activeFrameIndex && Boolean(frame.isBonus) === isBonus) ?? frames[displayFrameIndex];
  }

  function updateFrame(updater: (frame: Frame) => Frame): void {
    setFrames((prev) => prev.map((frame) => (frame.frameIndex === activeFrameIndex && Boolean(frame.isBonus) === isBonus ? updater(frame) : frame)));
  }

  function finishQuestion(): void {
    setLearnedIds((prev) => Array.from(new Set([...prev, question.correctWord.id])));
    const nextIndex = questionIndex + 1;
    const finishedNormal = questionIndex === 9 && bonusNeeded === 0;
    const finishedBonus = isBonus && nextIndex >= 10 + bonusNeeded;
    if (finishedNormal || finishedBonus) {
      setTimeout(() => props.onFinished(frames, words.filter((word) => [...learnedIds, question.correctWord.id].includes(word.id)), missedIds), 0);
      return;
    }
    const nextWord = gameWords[nextIndex] ?? gameWords[(nextIndex + 1) % gameWords.length];
    if (nextIndex >= 10 && !frames.some((frame) => frame.frameIndex === nextIndex && frame.isBonus)) {
      setFrames((prev) => [...prev, makeFrame(nextIndex, nextWord.id, true)]);
    }
    setQuestionIndex(nextIndex);
    setQuestion(generateQuestion(nextWord, words, props.answerMode));
    setSelectedIds([]);
    setCorrectAnswered(false);
    setFeedback(nextIndex >= 10 ? "보너스 문제야! 한 번 더 굴려봐!" : "뜻을 골라 볼링공을 굴려봐!");
    setLaneState(nextIndex >= 10 ? "bonus" : "idle");
    setPinsDown(0);
    setCharacterMood("normal");
  }

  function handleNormalChoice(option: QuestionOption, frame: Frame): void {
    if (selectedIds.includes(option.wordId) || correctAnswered) return;
    playOptionSelect();
    setSelectedIds((prev) => [...prev, option.wordId]);

    if (option.isCorrect && frame.status === "waitingFirstChoice") {
      const result = resolveFrameAfterCorrect({ isFirstChoice: true });
      updateFrame((item) => ({ ...item, ...result, rolls: result.rolls }));
      if (questionIndex === 9) setBonusNeeded(2);
      setFeedback("완벽해! 스트라이크!");
      setCharacterMood("good");
      setLaneState("strike");
      setPinsDown(10);
      playStrike();
      setCorrectAnswered(true);
      return;
    }

    if (!option.isCorrect && frame.status === "waitingFirstChoice") {
      const result = getFirstRollPinsFromFirstWrongChoice({ correctWord: question.correctWord, firstWrongOption: option });
      setMissedIds((prev) => Array.from(new Set([...prev, question.correctWord.id])));
      updateFrame((item) => ({
        ...item,
        firstWrongOptionId: option.wordId,
        firstRollPins: result.firstRollPins,
        wrongOptionIds: [option.wordId],
        rolls: [result.firstRollPins],
        display: String(result.firstRollPins),
        status: "firstRollLocked",
      }));
      setFeedback(result.reason === "same-part-of-speech" ? "아깝다! 품사는 맞게 봤어. 9핀!" : `품사부터 다시 생각해보자. 이번 투구는 ${result.firstRollPins}핀!`);
      setCharacterMood("curious");
      setPinsDown(result.firstRollPins);
      playWrong();
      return;
    }

    if (option.isCorrect && frame.status === "firstRollLocked") {
      const result = resolveFrameAfterCorrect({ isFirstChoice: false, firstRollPins: frame.firstRollPins });
      updateFrame((item) => ({ ...item, ...result, rolls: result.rolls }));
      if (questionIndex === 9) setBonusNeeded(1);
      setFeedback("좋아! 스페어 처리!");
      setCharacterMood("good");
      setLaneState("spare");
      setPinsDown(10);
      playSpare();
      setCorrectAnswered(true);
      return;
    }

    if (!option.isCorrect && frame.status === "firstRollLocked" && frame.firstRollPins) {
      const wrongIds = Array.from(new Set([...frame.wrongOptionIds, option.wordId]));
      if (wrongIds.length >= 3) {
        const result = resolveOpenFrameAfterAllWrongOptions({ firstRollPins: frame.firstRollPins });
        updateFrame((item) => ({ ...item, ...result, wrongOptionIds: wrongIds, rolls: result.rolls }));
        setFeedback("끝까지 찾아보자! 정답을 눌러 마무리해봐.");
        setCharacterMood("curious");
        setLaneState("open");
        setPinsDown(frame.firstRollPins);
        playMiss();
      } else {
        updateFrame((item) => ({ ...item, wrongOptionIds: wrongIds }));
        setFeedback("괜찮아. 첫 투구 점수는 그대로야. 정답을 찾아보자!");
        setCharacterMood("curious");
        playWrong();
      }
      return;
    }

    if (option.isCorrect && frame.status === "awaitingCorrectAfterOpen") {
      setFeedback("정답을 찾았어! 다음 프레임으로 가자.");
      setCharacterMood("good");
      playCorrect();
      setCorrectAnswered(true);
    }
  }

  function handleBonusChoice(option: QuestionOption, frame: Frame): void {
    if (selectedIds.includes(option.wordId) || correctAnswered) return;
    playOptionSelect();
    setSelectedIds((prev) => [...prev, option.wordId]);
    if (frame.rolls.length === 0) {
      const result: BonusRollResult = getBonusRollFromChoice({ correctWord: question.correctWord, selectedOption: option, isFirstChoice: true });
      updateFrame((item) => ({ ...item, rolls: [result.roll], display: result.display, status: "completeOpen", type: "open" }));
      setPinsDown(result.roll);
      if (!option.isCorrect) setMissedIds((prev) => Array.from(new Set([...prev, question.correctWord.id])));
      setFeedback(option.isCorrect ? "보너스 스트라이크!" : `보너스 투구는 ${result.roll}핀! 정답을 눌러 마무리해봐.`);
      setCharacterMood(option.isCorrect ? "good" : "curious");
      if (option.isCorrect) {
        playStrike();
        setLaneState("strike");
        setCorrectAnswered(true);
      } else {
        playWrong();
        setLaneState("bonus");
      }
      return;
    }
    if (option.isCorrect) {
      setFeedback("정답을 찾았어! 다음으로 가자.");
      setCharacterMood("good");
      playCorrect();
      setCorrectAnswered(true);
    } else {
      playWrong();
      setCharacterMood("curious");
      setFeedback("정답을 직접 눌러 마무리해봐.");
    }
  }

  function handleSelect(option: QuestionOption): void {
    const frame = currentFrame();
    if (isBonus) handleBonusChoice(option, frame);
    else handleNormalChoice(option, frame);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const number = Number(event.key);
      if (number >= 1 && number <= 4) handleSelect(question.options[number - 1]);
      if (event.key === "Enter" && correctAnswered) finishQuestion();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    if (!correctAnswered) return;
    const timer = window.setTimeout(finishQuestion, 1300);
    return () => window.clearTimeout(timer);
  }, [correctAnswered, questionIndex]);

  function quitGame() {
    if (window.confirm("지금 게임을 포기하고 첫 화면으로 돌아갈까요?")) {
      props.onQuit();
    }
  }

  const correctWord = question.correctWord;
  return (
    <main className="game-screen">
      <BowlingScoreboard frames={frames} score={score} currentIndex={displayFrameIndex} />
      <div className="game-topline">
        <span>{isBonus ? `보너스 ${questionIndex - 9}` : `${questionIndex + 1}프레임`}</span>
        <strong>현재 총점 {score.total}</strong>
        <div className="game-actions">
          <button onClick={() => setWordInfoOpen(true)} aria-label="현재 단어 도움말">단어 도움말</button>
          <button className="quit-button" onClick={quitGame} aria-label="게임 포기">게임 포기</button>
        </div>
      </div>
      <WordQuestion question={question} selectedIds={selectedIds} correctAnswered={correctAnswered} characterMood={characterMood} onSelect={handleSelect} />
      <p className="feedback">{feedback}</p>
      <BowlingAnimation state={laneState} pinsDown={pinsDown} />
      {wordInfoOpen && <WordInfoModal word={correctWord} onClose={() => setWordInfoOpen(false)} />}
    </main>
  );
}

import { useMemo, useState } from "react";
import type { AnswerMode, AudioSettings, Frame, LevelTarget } from "./types/game";
import type { Word } from "./types/word";
import { allWords } from "./data/words";
import { calculateBowlingScore } from "./lib/scoring";
import { clearGameHistory, loadBestScore, loadGameHistory, saveGameHistory } from "./lib/storage";
import { getAudioSettings, initAudio, playButtonClick, playResult, setMusicEnabled, setSfxEnabled, startBgm } from "./lib/audio";
import { StartScreen } from "./components/StartScreen";
import { GameScreen } from "./components/GameScreen";
import { ResultScreen } from "./components/ResultScreen";

type Screen = "start" | "game" | "result";

export default function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [level, setLevel] = useState<LevelTarget>(100);
  const [answerMode, setAnswerMode] = useState<AnswerMode>("ko");
  const [settings, setSettings] = useState<AudioSettings>(() => getAudioSettings());
  const [historyVersion, setHistoryVersion] = useState(0);
  const [result, setResult] = useState<{ frames: Frame[]; learnedWords: Word[]; missedIds: string[] } | null>(null);
  const best = useMemo(() => loadBestScore(), [historyVersion]);
  const recent = useMemo(() => loadGameHistory().slice(0, 5), [historyVersion]);
  const availableMaxRank = Math.max(...allWords.map((word) => word.rank));

  function updateMusic(enabled: boolean) {
    setMusicEnabled(enabled);
    setSettings(getAudioSettings());
  }

  function updateSfx(enabled: boolean) {
    setSfxEnabled(enabled);
    setSettings(getAudioSettings());
  }

  function startGame() {
    initAudio();
    startBgm();
    playButtonClick();
    setResult(null);
    setScreen("game");
  }

  function finishGame(frames: Frame[], learnedWords: Word[], missedIds: string[]) {
    const score = calculateBowlingScore(frames).total;
    saveGameHistory({
      date: new Date().toISOString(),
      level,
      answerMode,
      score,
      missedWordIds: missedIds,
    });
    setHistoryVersion((value) => value + 1);
    setResult({ frames, learnedWords, missedIds });
    playResult();
    setScreen("result");
  }

  function quitGame() {
    setResult(null);
    setScreen("start");
  }

  function resetHistory() {
    const password = window.prompt("기록을 초기화하려면 비밀번호를 입력해 주세요.");
    if (password === "1234") {
      clearGameHistory();
      setHistoryVersion((value) => value + 1);
    }
  }

  const resultScore = result ? calculateBowlingScore(result.frames).total : 0;
  const missedWords = result ? allWords.filter((word) => result.missedIds.includes(word.id)) : [];

  return (
    <>
      {screen === "start" && (
        <StartScreen
          level={level}
          answerMode={answerMode}
          settings={settings}
          availableMaxRank={availableMaxRank}
          onLevel={setLevel}
          onAnswerMode={setAnswerMode}
          onStart={startGame}
          onMusic={updateMusic}
          onSfx={updateSfx}
        />
      )}
      {screen === "game" && (
        <GameScreen
          level={level}
          answerMode={answerMode}
          onFinished={finishGame}
          onQuit={quitGame}
        />
      )}
      {screen === "result" && result && (
        <ResultScreen
          score={resultScore}
          learnedWords={result.learnedWords}
          missedWords={missedWords}
          best={best}
          recent={recent}
          onRestart={startGame}
          onHome={() => setScreen("start")}
          onReset={resetHistory}
        />
      )}
    </>
  );
}

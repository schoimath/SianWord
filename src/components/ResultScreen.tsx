import { useState } from "react";
import type { GameHistoryResult } from "../types/game";
import type { Word } from "../types/word";
import { CharacterFace } from "./CharacterFace";
import { WordInfoModal } from "./WordInfoModal";

type Props = {
  score: number;
  learnedWords: Word[];
  missedWords: Word[];
  best: GameHistoryResult | null;
  recent: GameHistoryResult[];
  onRestart: () => void;
  onHome: () => void;
  onReset: () => void;
};

function formatScoreDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "날짜 없음";
  const yy = String(date.getFullYear()).slice(2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}년 ${mm}월 ${dd}일`;
}

function praise(score: number): string {
  if (score >= 280) return "완벽에 가까워! 영단어 챔피언!";
  if (score >= 220) return "대단해! 영어 감각이 좋아!";
  if (score >= 160) return "좋아! 단어를 많이 기억하고 있어!";
  return "괜찮아! 다시 하면 더 잘할 수 있어!";
}

function WordButtons({ title, words, onWord }: { title: string; words: Word[]; onWord: (word: Word) => void }) {
  return (
    <section className="panel result-words-panel">
      <h2>{title}</h2>
      <div className="word-list">
        {words.length ? (
          words.map((word) => (
            <button key={word.id} onClick={() => onWord(word)} aria-label={`${word.word} 단어 설명 보기`}>
              {word.word}
            </button>
          ))
        ) : (
          <span className="empty-word">없어요</span>
        )}
      </div>
    </section>
  );
}

export function ResultScreen({ score, learnedWords, missedWords, best, recent, onRestart, onHome, onReset }: Props) {
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);

  return (
    <main className="result-screen compact-result">
      <section className="result-hero">
        <CharacterFace mood="good" alternateMood="curious" animate className="result-character" />
        <h1>게임 결과</h1>
        <div className="final-score">{score} <span>/ 300</span></div>
        <p>{praise(score)}</p>
      </section>

      <section className="result-grid compact-result-grid">
        <WordButtons title="맞힌 단어" words={learnedWords} onWord={setSelectedWord} />
        <WordButtons title="틀렸던 단어" words={missedWords} onWord={setSelectedWord} />

        <section className="panel result-history-panel">
          <div className="result-history-title">
            <h2>기록</h2>
            <button onClick={onReset} aria-label="기록 초기화">Reset</button>
          </div>
          <p className="best-line">
            이전 최고점수: {best ? `${formatScoreDate(best.date)} ${best.score} 점` : "없음"}
          </p>
          <h3>최근 다섯 번</h3>
          <ol className="recent-score-list">
            {recent.length ? (
              recent.slice(0, 5).map((item, index) => (
                <li key={`${item.date}-${index}`}>
                  <span>{formatScoreDate(item.date)}</span>
                  <strong>{item.score} 점</strong>
                </li>
              ))
            ) : (
              <li>기록 없음</li>
            )}
          </ol>
        </section>
      </section>

      <div className="start-actions result-actions">
        <button className="primary" onClick={onRestart}>다시하기</button>
        <button onClick={onHome}>처음으로</button>
      </div>

      {selectedWord && <WordInfoModal word={selectedWord} onClose={() => setSelectedWord(null)} />}
    </main>
  );
}

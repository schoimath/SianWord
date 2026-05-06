import type { AnswerMode, AudioSettings, LevelTarget } from "../types/game";
import { AudioControls } from "./AudioControls";

type Props = {
  level: LevelTarget;
  answerMode: AnswerMode;
  settings: AudioSettings;
  availableMaxRank: number;
  onLevel: (level: LevelTarget) => void;
  onAnswerMode: (mode: AnswerMode) => void;
  onStart: () => void;
  onMusic: (enabled: boolean) => void;
  onSfx: (enabled: boolean) => void;
};

const levels: Array<[LevelTarget, string]> = [
  [100, "처음 100개"],
  [500, "처음 500개"],
  [1000, "처음 1000개"],
  [3000, "처음 3000개"],
];

export function StartScreen(props: Props) {
  const version = "0.1.20260506.0000";

  async function updateApp() {
    const storedVersion = localStorage.getItem("word-bowling-version");
    if (storedVersion !== version && "caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
    localStorage.setItem("word-bowling-version", version);
    window.location.reload();
  }

  return (
    <main className="start-screen compact-start">
      <div className="start-audio">
        <AudioControls settings={props.settings} onMusic={props.onMusic} onSfx={props.onSfx} />
      </div>

      <section className="title-zone">
        <div className="pin-logo" aria-hidden="true">🎳</div>
        <h1>영단어 볼링왕</h1>
        <p className="subtitle">Word Bowling 3000</p>
        <p>영단어 뜻을 맞히고 스트라이크를 노려봐!</p>
      </section>

      <section className="panel start-options">
        <h2>난이도</h2>
        <div className="choice-grid compact-choice-grid">
          {levels.map(([value, label]) => {
            const disabled = props.availableMaxRank < value;
            return (
              <button
                key={value}
                className={props.level === value ? "selected" : ""}
                disabled={disabled}
                onClick={() => props.onLevel(value)}
                aria-label={`${label} 난이도`}
              >
                {label}
                {disabled && <span>준비 중</span>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel start-options">
        <h2>답지 언어</h2>
        <div className="segmented">
          <button className={props.answerMode === "ko" ? "selected" : ""} onClick={() => props.onAnswerMode("ko")}>한글 모드</button>
          <button className={props.answerMode === "en" ? "selected" : ""} onClick={() => props.onAnswerMode("en")}>영어 모드</button>
        </div>
      </section>

      <div className="start-actions">
        <button className="primary" onClick={props.onStart} aria-label="게임 시작">게임 시작</button>
      </div>

      <footer className="version">
        <span>{version}</span>
        <button onClick={updateApp} aria-label="업데이트 확인">업데이트</button>
      </footer>
    </main>
  );
}

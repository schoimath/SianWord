import type { BowlingScore, Frame } from "../types/game";

type Props = {
  frames: Frame[];
  score: BowlingScore;
  currentIndex: number;
};

export function BowlingScoreboard({ frames, score, currentIndex }: Props) {
  return (
    <div className="scoreboard-wrap" aria-label="볼링 점수판">
      <div className="scoreboard">
        {Array.from({ length: 10 }, (_, index) => {
          const frame = frames.find((item) => item.frameIndex === index && !item.isBonus);
          const bonus = index === 9 ? frames.filter((item) => item.isBonus).map((item) => item.display).join(" ") : "";
          return (
            <div key={index} className={`frame-box ${currentIndex === index ? "current" : ""}`}>
              <div className="frame-title">{index + 1}</div>
              <div className="rolls">{frame?.display || ""}{bonus ? ` ${bonus}` : ""}</div>
              <div className="cum">{score.frameScores[index] ?? (frame?.rolls.length ? "..." : "")}</div>
            </div>
          );
        })}
        <div className="total-box">
          <span>총점</span>
          <strong>{score.total}</strong>
        </div>
      </div>
    </div>
  );
}

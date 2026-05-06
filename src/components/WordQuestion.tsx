import type { CSSProperties } from "react";
import type { Question, QuestionOption } from "../types/game";
import { CharacterFace, type CharacterMood } from "./CharacterFace";

type Props = {
  question: Question;
  selectedIds: string[];
  correctAnswered: boolean;
  characterMood: CharacterMood;
  onSelect: (option: QuestionOption) => void;
};

function getWordFit(word: string): { scale: number; fontSize: string } {
  const length = word.length;
  if (length >= 16) return { scale: 0.62, fontSize: "clamp(2rem, 7vw, 4.1rem)" };
  if (length >= 13) return { scale: 0.72, fontSize: "clamp(2.25rem, 8vw, 4.7rem)" };
  if (length >= 10) return { scale: 0.84, fontSize: "clamp(2.55rem, 9vw, 5.1rem)" };
  return { scale: 1, fontSize: "clamp(2.9rem, 10vw, 5.6rem)" };
}

export function WordQuestion({ question, selectedIds, correctAnswered, characterMood, onSelect }: Props) {
  const wordFit = getWordFit(question.correctWord.word);

  return (
    <section className="question-zone">
      <div className="question-character-wrap">
        <CharacterFace
          mood={characterMood}
          alternateMood={characterMood === "normal" ? "curious" : undefined}
          animate={characterMood === "normal"}
          className="question-character"
        />
        <p className="part-label character-part-label">{question.correctWord.partOfSpeech}</p>
      </div>
      <h2
        className="question-word"
        style={
          {
            "--word-scale": wordFit.scale,
            "--word-font-size": wordFit.fontSize,
          } as CSSProperties & Record<"--word-scale" | "--word-font-size", string | number>
        }
      >
        <span>{question.correctWord.word}</span>
      </h2>
      <div className="options">
        {question.options.map((option, index) => {
          const selected = selectedIds.includes(option.wordId);
          const className = [
            "option-button",
            selected ? "picked" : "",
            correctAnswered && option.isCorrect ? "correct" : "",
            selected && !option.isCorrect ? "wrong" : "",
          ].join(" ");
          return (
            <button
              key={option.id}
              className={className}
              onClick={() => onSelect(option)}
              aria-label={`${index + 1}번 보기 ${option.label}`}
              disabled={correctAnswered}
            >
              <span>{index + 1}</span>
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}

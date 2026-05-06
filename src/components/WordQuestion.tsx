import type { Question, QuestionOption } from "../types/game";
import { CharacterFace, type CharacterMood } from "./CharacterFace";

type Props = {
  question: Question;
  selectedIds: string[];
  correctAnswered: boolean;
  characterMood: CharacterMood;
  onSelect: (option: QuestionOption) => void;
};

export function WordQuestion({ question, selectedIds, correctAnswered, characterMood, onSelect }: Props) {
  return (
    <section className="question-zone">
      <CharacterFace
        mood={characterMood}
        alternateMood={characterMood === "normal" ? "curious" : undefined}
        animate={characterMood === "normal"}
        className="question-character"
      />
      <p className="part-label">{question.correctWord.partOfSpeech}</p>
      <h2>{question.correctWord.word}</h2>
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

import type { Word } from "../types/word";

type Props = {
  word: Word;
  onClose: () => void;
};

export function WordInfoModal({ word, onClose }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="현재 단어 도움말">
      <div className="modal word-info-modal">
        <h2>{word.word}</h2>
        <p className="part-label">{word.partOfSpeech}</p>
        <dl>
          <dt>한국어 뜻</dt>
          <dd>{word.koDefinition}</dd>
          <dt>영어 설명</dt>
          <dd>{word.enDefinition}</dd>
          <dt>예문</dt>
          <dd>{word.example}</dd>
          <dt>예문 뜻</dt>
          <dd>{word.exampleKo}</dd>
        </dl>
        <button onClick={onClose} aria-label="현재 단어 도움말 닫기">닫기</button>
      </div>
    </div>
  );
}

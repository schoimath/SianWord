type Props = { onClose: () => void };

export function GameHelpModal({ onClose }: Props) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label="도움말">
      <div className="modal">
        <h2>도움말</h2>
        <h3>아이용 설명</h3>
        <ul>
          <li>한 번에 맞히면 스트라이크 X!</li>
          <li>처음 고른 오답이 같은 품사라면 9핀!</li>
          <li>처음 고른 오답이 다른 품사라면 5~7핀!</li>
          <li>그 다음 정답을 맞히면 스페어!</li>
          <li>오답을 모두 고른 뒤 정답을 찾으면 open이야.</li>
          <li>10프레임에서 스트라이크나 스페어를 하면 보너스 문제가 나와!</li>
        </ul>
        <h3>부모용 설명</h3>
        <p>이 게임은 영어 단어 뜻뿐 아니라 noun, verb, adjective의 구분도 자연스럽게 연습하도록 설계되었습니다.</p>
        <p>첫 오답의 품사가 정답 단어와 같으면 의미적으로 가까운 선택으로 보고 9점을 줍니다. 첫 오답의 품사가 다르면 5~7점으로 처리해 품사 인식을 유도합니다.</p>
        <button onClick={onClose} aria-label="도움말 닫기">닫기</button>
      </div>
    </div>
  );
}

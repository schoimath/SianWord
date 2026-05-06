# 영단어 볼링왕

**Word Bowling 3000**은 7세 전후 아이가 영어 단어 뜻과 품사를 함께 익히는 볼링형 학습 게임입니다.

## 실행 방법

```bash
npm install
npm run dev
```

검증과 빌드:

```bash
npm run test
npm run validate:words -- --target=100
npm run build
```

## 단어 데이터 구조

단어 chunk는 `src/data/wordChunks/words-0001-0100.ts`처럼 범위별 파일에 넣고, `src/data/words.ts`에서 합쳐 export합니다.

```ts
{
  id: "w0001",
  rank: 1,
  word: "apple",
  partOfSpeech: "noun",
  koDefinition: "사과",
  enDefinition: "a round fruit that can be red, green, or yellow",
  example: "I eat an apple.",
  exampleKo: "나는 사과를 먹어요."
}
```

## 난이도

- Level 1: rank 1~100
- Level 2: rank 1~500
- Level 3: rank 1~1000
- Level 4: rank 1~3000

현재 1차 구현은 rank 1~100만 포함하며, 이후 chunk를 추가하면 누적 난이도로 확장됩니다.

## 점수 규칙

첫 선택이 정답이면 스트라이크 `X`입니다. 첫 선택이 오답이면 그 오답의 품사만으로 첫 투구 점수가 고정됩니다. 같은 품사 오답은 9핀, 다른 품사 오답은 5~7핀입니다. 이후 정답을 맞히면 스페어, 정답 전 오답을 모두 누르면 open입니다.

실제 볼링처럼 스트라이크는 다음 두 롤, 스페어는 다음 한 롤을 보너스로 더합니다. 10프레임에서 스트라이크 또는 스페어가 나오면 보너스 문제가 나옵니다. 모든 기본 프레임과 10프레임 보너스 2개를 첫 선택 정답으로 맞히면 300점입니다.

## 단어 검증

```bash
npm run validate:words -- --target=100
```

검증 스크립트는 target 100, 500, 1000, 1500, 2000, 2500, 3000의 단어 수, rank, id/word 중복, 필수 필드, 품사 비율을 검사합니다.

export type PartOfSpeech = "noun" | "verb" | "adjective";

export type Word = {
  id: string;
  rank: number;
  word: string;
  partOfSpeech: PartOfSpeech;
  koDefinition: string;
  enDefinition: string;
  example: string;
  exampleKo: string;
};

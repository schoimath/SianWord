import type { PartOfSpeech, Word } from "../../types/word";

type Group = {
  hint: string;
  items: Array<[word: string, koDefinition: string]>;
};

function idFromRank(rank: number): string {
  return `w${String(rank).padStart(4, "0")}`;
}

function normalizeVerbKoDefinition(koDefinition: string): string {
  if (koDefinition.endsWith("하기")) {
    return `${koDefinition.slice(0, -2)}하다`;
  }

  if (koDefinition.endsWith("기")) {
    return `${koDefinition.slice(0, -1)}다`;
  }

  return koDefinition;
}

function verbNounPhrase(koDefinition: string): string {
  if (koDefinition.endsWith("하다")) {
    return `${koDefinition.slice(0, -2)}하기`;
  }

  if (koDefinition.endsWith("다")) {
    return `${koDefinition.slice(0, -1)}기`;
  }

  return koDefinition;
}

function nounDescription(hint: string): string {
  const descriptions: Record<string, string> = {
    "a family or social person": "a person in a family, class, team, or neighborhood",
    "a job or role": "a person who has a helpful job or special role",
    "a place people visit": "a place people can go to in everyday life",
    "a city or building part": "a part of a street, city, house, or building",
    "a thing used at home": "a home item used for cleaning, fixing, or daily life",
    "a food for meals": "food people can eat at a meal",
    "a fruit or sweet food": "fruit or sweet food people can eat",
    "a body part": "a part of a person's body",
    "a natural place": "a place you can find in nature",
    "a nature or weather thing": "something seen in nature or weather",
    "a small object or container": "a small thing people use, hold, or keep things in",
    "something to wear or carry": "something people wear, carry, or keep with them",
    "a tool or craft item": "a tool or material used to make, fix, or create things",
    "a game or sports thing": "something used in games, play, or sports",
    "a simple social life word": "an everyday idea people use when talking or living together",
  };

  return descriptions[hint] ?? "an everyday thing, person, place, or idea";
}

function verbDescription(hint: string): string {
  const descriptions: Record<string, string> = {
    "to do a learning action": "to learn, think, choose, or understand something",
    "to move or act": "to move, act, or do something with your body",
    "to help or choose": "to help, choose, share, or take care of something",
    "to use the body or voice": "to use your body, voice, or senses",
    "to make or change something": "to make, change, cook, or record something",
    "to clean, mark, or trade": "to clean, mark, move, or exchange something",
    "to join daily life": "to take part in daily life or make something happen",
    "to think or speak": "to think, speak, prepare, or understand",
    "to do a careful action": "to do something carefully with attention",
    "to finish or move forward": "to finish, move, wonder, or go forward",
  };

  return descriptions[hint] ?? "to do an everyday action";
}

function adjectiveDescription(hint: string): string {
  const descriptions: Record<string, string> = {
    "a feeling word": "how someone feels or how something seems",
    "a size, color, or look word": "a size, color, shape, or look",
    "a condition word": "the condition, amount, or state of something",
    "a personality or mood word": "a person's mood, character, or quality",
    "a simple describing word": "a simple quality of a person, place, or thing",
  };

  return descriptions[hint] ?? "a quality of a person, place, or thing";
}

function createDefinition(word: string, hint: string, partOfSpeech: PartOfSpeech): string {
  const article = /^[aeiou]/.test(word) ? "an" : "a";

  if (partOfSpeech === "noun") {
    return `${article} ${word} is ${nounDescription(hint)}`;
  }

  if (partOfSpeech === "verb") {
    return `to ${word} means ${verbDescription(hint)}`;
  }

  return `${word} describes ${adjectiveDescription(hint)}`;
}

function flattenGroups(
  groups: Group[],
  partOfSpeech: PartOfSpeech,
): Array<[string, string, string]> {
  return groups.flatMap((group) =>
    group.items.map(([word, koDefinition]): [string, string, string] => {
      const displayKoDefinition =
        partOfSpeech === "verb" ? normalizeVerbKoDefinition(koDefinition) : koDefinition;

      return [word, displayKoDefinition, createDefinition(word, group.hint, partOfSpeech)];
    }),
  );
}

function makeWords(groups: Group[], startRank: number, partOfSpeech: PartOfSpeech): Word[] {
  return flattenGroups(groups, partOfSpeech).map(([word, koDefinition, enDefinition], index) => {
    const rank = startRank + index;
    const article = /^[aeiou]/.test(word) ? "an" : "a";
    const example =
      partOfSpeech === "noun"
        ? `I know ${article} ${word}.`
        : partOfSpeech === "verb"
          ? `I can ${word} today.`
          : `It feels ${word}.`;
    const exampleKo =
      partOfSpeech === "noun"
        ? `나는 ${koDefinition}을 알아요.`
        : partOfSpeech === "verb"
          ? `나는 오늘 ${verbNounPhrase(koDefinition)}를 할 수 있어요.`
          : `그것은 ${koDefinition} 느낌이에요.`;
    return {
      id: idFromRank(rank),
      rank,
      word,
      partOfSpeech,
      koDefinition,
      enDefinition,
      example,
      exampleKo,
    };
  });
}

const nounGroups: Group[] = [
  {
    hint: "a family or social person",
    items: [["mother", "어머니"], ["father", "아버지"], ["sister", "여자 형제"], ["brother", "남자 형제"], ["grandmother", "할머니"], ["grandfather", "할아버지"], ["cousin", "사촌"], ["neighbor", "이웃"], ["visitor", "방문객"], ["teammate", "팀 친구"], ["classmate", "반 친구"], ["partner", "짝"], ["helper", "도우미"], ["owner", "주인"], ["leader", "리더"]],
  },
  {
    hint: "a job or role",
    items: [["doctor", "의사"], ["nurse", "간호사"], ["dentist", "치과 의사"], ["farmer", "농부"], ["baker", "제빵사"], ["driver", "운전사"], ["pilot", "조종사"], ["firefighter", "소방관"], ["officer", "경찰관"], ["artist", "화가"], ["dancer", "무용가"], ["singer", "가수"], ["writer", "작가"], ["reader", "읽는 사람"], ["coach", "코치"]],
  },
  {
    hint: "a place people visit",
    items: [["market", "시장"], ["store", "가게"], ["bakery", "빵집"], ["clinic", "진료소"], ["hospital", "병원"], ["station", "역"], ["airport", "공항"], ["harbor", "항구"], ["museum", "박물관"], ["theater", "극장"], ["cafe", "카페"], ["restaurant", "식당"], ["bank", "은행"], ["postbox", "우체통"], ["crosswalk", "횡단보도"]],
  },
  {
    hint: "a city or building part",
    items: [["sidewalk", "인도"], ["street", "거리"], ["road", "도로"], ["corner", "모퉁이"], ["bridge", "다리"], ["tunnel", "터널"], ["tower", "탑"], ["fountain", "분수"], ["gate", "문간"], ["fence", "울타리"], ["roof", "지붕"], ["wall", "벽"], ["floor", "바닥"], ["ceiling", "천장"], ["stairs", "계단"]],
  },
  {
    hint: "a thing used at home",
    items: [["broom", "빗자루"], ["bucket", "양동이"], ["sponge", "스펀지"], ["mop", "대걸레"], ["hanger", "옷걸이"], ["drawer", "서랍"], ["key", "열쇠"], ["lock", "자물쇠"], ["remote", "리모컨"], ["charger", "충전기"], ["plug", "플러그"], ["battery", "건전지"], ["flashlight", "손전등"], ["radio", "라디오"], ["fan", "선풍기"]],
  },
  {
    hint: "a food for meals",
    items: [["pancake", "팬케이크"], ["waffle", "와플"], ["dumpling", "만두"], ["rice", "밥"], ["meat", "고기"], ["tofu", "두부"], ["bean", "콩"], ["pea", "완두콩"], ["cabbage", "양배추"], ["lettuce", "상추"], ["spinach", "시금치"], ["mushroom", "버섯"], ["chili", "고추"], ["garlic", "마늘"], ["ginger", "생강"]],
  },
  {
    hint: "a fruit or sweet food",
    items: [["strawberry", "딸기"], ["blueberry", "블루베리"], ["watermelon", "수박"], ["pineapple", "파인애플"], ["mango", "망고"], ["kiwi", "키위"], ["plum", "자두"], ["cherry", "체리"], ["raisin", "건포도"], ["coconut", "코코넛"], ["lemon", "레몬"], ["lime", "라임"], ["avocado", "아보카도"], ["fig", "무화과"], ["apricot", "살구"]],
  },
  {
    hint: "a body part",
    items: [["arm", "팔"], ["leg", "다리"], ["head", "머리"], ["hair", "머리카락"], ["face", "얼굴"], ["mouth", "입"], ["tooth", "이"], ["tongue", "혀"], ["knee", "무릎"], ["elbow", "팔꿈치"], ["shoulder", "어깨"], ["back", "등"], ["neck", "목"], ["finger", "손가락"], ["toe", "발가락"]],
  },
  {
    hint: "a natural place",
    items: [["forest", "숲"], ["field", "들판"], ["meadow", "초원"], ["desert", "사막"], ["island", "섬"], ["mountain", "산"], ["valley", "골짜기"], ["cave", "동굴"], ["pond", "연못"], ["waterfall", "폭포"], ["volcano", "화산"], ["cliff", "절벽"], ["path", "길"], ["trail", "산책길"], ["campsite", "야영지"]],
  },
  {
    hint: "a nature or weather thing",
    items: [["lightning", "번개"], ["thunder", "천둥"], ["fog", "안개"], ["frost", "서리"], ["ice", "얼음"], ["mud", "진흙"], ["sand", "모래"], ["soil", "흙"], ["dust", "먼지"], ["breeze", "산들바람"], ["drizzle", "이슬비"], ["shadow", "그림자"], ["sunlight", "햇빛"], ["moonlight", "달빛"], ["starlight", "별빛"]],
  },
  {
    hint: "a small object or container",
    items: [["coin", "동전"], ["money", "돈"], ["wallet", "지갑"], ["ticket", "표"], ["stamp", "우표"], ["envelope", "봉투"], ["postcard", "엽서"], ["comb", "빗"], ["bottle", "병"], ["jar", "단지"], ["tray", "쟁반"], ["pan", "팬"], ["pot", "냄비"], ["kettle", "주전자"], ["straw", "빨대"]],
  },
  {
    hint: "something to wear or carry",
    items: [["umbrella", "우산"], ["watch", "손목시계"], ["ring", "반지"], ["necklace", "목걸이"], ["bracelet", "팔찌"], ["button", "단추"], ["zipper", "지퍼"], ["helmet", "헬멧"], ["medal", "메달"], ["badge", "배지"], ["suitcase", "여행 가방"], ["passport", "여권"], ["diary", "일기장"], ["album", "앨범"], ["magazine", "잡지"]],
  },
  {
    hint: "a tool or craft item",
    items: [["glue", "풀"], ["scissors", "가위"], ["tape", "테이프"], ["hammer", "망치"], ["nail", "못"], ["screw", "나사"], ["toolbox", "공구함"], ["paintbrush", "붓"], ["canvas", "캔버스"], ["clay", "찰흙"], ["yarn", "실뭉치"], ["needle", "바늘"], ["thread", "실"], ["fabric", "천"], ["magnet", "자석"]],
  },
  {
    hint: "a game or sports thing",
    items: [["kite", "연"], ["puzzle", "퍼즐"], ["block", "블록"], ["dice", "주사위"], ["marble", "구슬"], ["rope", "줄"], ["trampoline", "트램펄린"], ["scoreboard", "점수판"], ["trophy", "트로피"], ["whistle", "호루라기"], ["paddle", "패들"], ["racket", "라켓"], ["net", "그물"], ["goal", "골대"], ["court", "경기장"]],
  },
  {
    hint: "a simple social life word",
    items: [["address", "주소"], ["phone", "전화"], ["email", "이메일"], ["website", "웹사이트"], ["password", "비밀번호"], ["username", "사용자 이름"], ["message", "메시지"], ["favor", "호의"], ["choice", "선택"], ["chance", "기회"], ["habit", "습관"], ["memory", "기억"], ["secret", "비밀"], ["joke", "농담"], ["news", "소식"]],
  },
];

const verbGroups: Group[] = [
  { hint: "to do a learning action", items: [["begin", "시작하기"], ["believe", "믿기"], ["compare", "비교하기"], ["decide", "결정하기"], ["discover", "발견하기"], ["divide", "나누기"], ["enjoy", "즐기기"], ["explain", "설명하기"], ["explore", "탐험하기"], ["finish", "끝내기"], ["forgive", "용서하기"], ["imagine", "상상하기"], ["improve", "나아지기"], ["notice", "알아차리기"], ["prefer", "더 좋아하기"]] },
  { hint: "to move or act", items: [["blow", "불기"], ["care", "돌보기"], ["cover", "덮기"], ["cross", "건너기"], ["giggle", "킥킥 웃기"], ["greet", "인사하기"], ["hurry", "서두르기"], ["keep", "간직하기"], ["land", "착지하기"], ["leave", "떠나기"], ["lend", "빌려주기"], ["lose", "잃어버리기"], ["march", "행진하기"], ["nod", "끄덕이기"], ["offer", "권하기"]] },
  { hint: "to help or choose", items: [["pass", "건네기"], ["promise", "약속하기"], ["protect", "보호하기"], ["race", "경주하기"], ["recycle", "재활용하기"], ["remind", "상기시키기"], ["return", "돌려주기"], ["search", "찾아보기"], ["select", "선택하기"], ["serve", "대접하기"], ["sew", "바느질하기"], ["unlock", "잠금 풀기"], ["untie", "풀기"], ["connect", "연결하기"], ["name", "이름 붙이기"]] },
  { hint: "to use the body or voice", items: [["allow", "허락하기"], ["bend", "구부리기"], ["breathe", "숨쉬기"], ["call", "부르기"], ["chase", "쫓아가기"], ["circle", "동그라미 치기"], ["cough", "기침하기"], ["dive", "뛰어들기"], ["drip", "뚝뚝 떨어지기"], ["earn", "얻기"], ["enter", "들어가기"], ["escape", "빠져나오기"], ["exercise", "운동하기"], ["sparkle", "반짝이기"], ["whirl", "빙글 돌기"]] },
  { hint: "to make or change something", items: [["blink", "눈 깜박이기"], ["bloom", "꽃피기"], ["change", "바꾸기"], ["charge", "충전하기"], ["chew", "씹기"], ["fry", "튀기기"], ["heat", "데우기"], ["introduce", "소개하기"], ["knit", "뜨개질하기"], ["mail", "우편 보내기"], ["match", "어울리기"], ["order", "주문하기"], ["photograph", "사진 찍기"], ["record", "기록하기"], ["reply", "답장하기"]] },
  { hint: "to clean, mark, or trade", items: [["report", "알리기"], ["rescue", "구해주기"], ["rub", "문지르기"], ["scan", "살펴보기"], ["scrub", "박박 닦기"], ["seal", "봉하기"], ["sprinkle", "뿌리기"], ["steer", "조종하기"], ["step", "걸음 내딛기"], ["switch", "바꾸기"], ["text", "문자 보내기"], ["trade", "교환하기"], ["trust", "믿고 맡기기"], ["advise", "조언하기"], ["agree", "동의하기"]] },
  { hint: "to join daily life", items: [["appear", "나타나기"], ["belong", "속하기"], ["bounce", "튀기기"], ["celebrate", "축하하기"], ["chat", "수다 떨기"], ["complete", "완성하기"], ["create", "만들어내기"], ["design", "디자인하기"], ["drift", "떠다니기"], ["assemble", "모아 만들기"], ["glow", "은은히 빛나기"], ["grin", "활짝 웃기"], ["guide", "안내하기"], ["handle", "다루기"], ["include", "포함하기"]] },
  { hint: "to think or speak", items: [["jog", "조깅하기"], ["judge", "판단하기"], ["label", "이름표 붙이기"], ["list", "목록 쓰기"], ["manage", "해내기"], ["mention", "언급하기"], ["mind", "신경 쓰기"], ["obey", "따르기"], ["pause", "잠깐 멈추기"], ["perform", "공연하기"], ["prepare", "준비하기"], ["raise", "올리기"], ["realize", "깨닫기"], ["receive", "받기"], ["recognize", "알아보기"]] },
  { hint: "to do a careful action", items: [["reflect", "비치기"], ["relax", "긴장 풀기"], ["replace", "바꾸어 넣기"], ["request", "요청하기"], ["respect", "존중하기"], ["review", "복습하기"], ["polish", "윤내기"], ["separate", "분리하기"], ["settle", "자리잡기"], ["sketch", "스케치하기"], ["soak", "담그기"], ["stare", "빤히 보기"], ["support", "도와주기"], ["suppose", "생각하기"], ["surprise", "놀라게 하기"]] },
  { hint: "to finish or move forward", items: [["arrange", "정돈하기"], ["translate", "옮겨 말하기"], ["trim", "다듬기"], ["tumble", "굴러 넘어지기"], ["understand", "이해하기"], ["volunteer", "자원하기"], ["wander", "거닐기"], ["weigh", "무게 재기"], ["welcome", "환영하기"], ["wonder", "궁금해하기"], ["yawn", "하품하기"], ["zoom", "쌩 움직이기"], ["estimate", "어림하기"], ["indicate", "가리켜 보이기"], ["publish", "내보내기"]] },
];

const adjectiveGroups: Group[] = [
  { hint: "a feeling word", items: [["afraid", "두려운"], ["alive", "살아 있는"], ["alone", "혼자인"], ["amazing", "놀라운"], ["basic", "기본적인"], ["bent", "구부러진"], ["better", "더 나은"], ["bitter", "쓴맛 나는"], ["blank", "빈칸의"], ["broad", "폭넓은"], ["charming", "매력적인"], ["chilly", "쌀쌀한"], ["clear", "맑은"], ["clever", "영리한"], ["creamy", "부드럽고 진한"], ["crunchy", "바삭한"], ["daily", "매일의"], ["dizzy", "어지러운"], ["double", "두 배의"], ["fair", "공평한"], ["fancy", "화려한"], ["far", "먼"], ["flat", "평평한"], ["fluffy", "폭신한"], ["free", "자유로운"]] },
  { hint: "a size, color, or look word", items: [["giant", "거대한"], ["gray", "회색의"], ["green", "초록색의"], ["icy", "얼음 같은"], ["local", "지역의"], ["magic", "마법 같은"], ["major", "큰"], ["minor", "작은"], ["minty", "민트 맛의"], ["modern", "현대적인"], ["monthly", "매달의"], ["narrow", "좁은"], ["natural", "자연스러운"], ["near", "가까운"], ["official", "공식적인"], ["amber", "호박빛의"], ["perfect", "완벽한"], ["pink", "분홍색의"], ["plain", "수수한"], ["plastic", "플라스틱의"], ["purple", "보라색의"], ["quick", "빠른"], ["rapid", "재빠른"], ["regular", "규칙적인"], ["rich", "풍부한"]] },
  { hint: "a condition word", items: [["rough", "거친"], ["royal", "왕실의"], ["same", "같은"], ["secretive", "비밀스러운"], ["serious", "진지한"], ["several", "몇몇의"], ["silent", "조용한"], ["silver", "은빛의"], ["single", "하나의"], ["slim", "날씬한"], ["solid", "단단한"], ["square", "네모난"], ["steady", "안정된"], ["stormy", "폭풍우 치는"], ["striped", "줄무늬의"], ["sunlit", "햇빛 비친"], ["tan", "황갈색의"], ["thankful", "고마워하는"], ["usable", "사용할 수 있는"], ["usual", "보통의"], ["violet", "보라빛의"], ["weekly", "매주의"], ["whole", "전체의"], ["yellow", "노란색의"], ["yummy", "맛있는"]] },
  { hint: "a personality or mood word", items: [["able", "할 수 있는"], ["active", "활동적인"], ["actual", "실제의"], ["adorable", "아주 귀여운"], ["alert", "깨어 있는"], ["balanced", "균형 잡힌"], ["blushing", "얼굴이 빨개진"], ["boring", "지루한"], ["central", "가운데의"], ["certain", "확실한"], ["classic", "전통적인"], ["correct", "맞는"], ["creative", "창의적인"], ["curved", "휘어진"], ["dear", "소중한"], ["equal", "같은 양의"], ["excellent", "아주 훌륭한"], ["final", "마지막의"], ["formal", "격식을 차린"], ["honest", "정직한"], ["hopeful", "희망찬"], ["ideal", "이상적인"], ["joyful", "기쁜"], ["merry", "즐거운"], ["patient", "참을성 있는"]] },
  { hint: "a simple describing word", items: [["private", "개인적인"], ["proper", "알맞은"], ["public", "공공의"], ["real", "진짜의"], ["recent", "최근의"], ["responsible", "책임감 있는"], ["similar", "비슷한"], ["social", "사교적인"], ["stable", "안정적인"], ["grateful", "고마워하는"], ["upbeat", "활기찬"], ["valuable", "소중한"], ["visible", "보이는"], ["pleasant", "기분 좋은"], ["yearly", "매년의"], ["zesty", "상큼한"], ["polished", "반짝이는"], ["rosy", "장밋빛의"], ["leafy", "잎이 많은"], ["snowy", "눈 덮인"], ["portable", "들고 다닐 수 있는"], ["foldable", "접을 수 있는"], ["washable", "씻을 수 있는"], ["readable", "읽기 쉬운"], ["playful", "장난기 있는"]] },
];

export const words0501To1000: Word[] = [
  ...makeWords(nounGroups, 501, "noun"),
  ...makeWords(verbGroups, 726, "verb"),
  ...makeWords(adjectiveGroups, 876, "adjective"),
];

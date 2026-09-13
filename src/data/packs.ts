import { packSchema, type Bilingual, type Pack } from "../domain/content";

const bi = (en: string, ar: string): Bilingual => ({ en, ar });
type Pair = [string, string];
const house = bi(
  "An Alf Baa house list, chosen for this game. The order is subjective, not a survey or an objective ranking.",
  "قائمة مختارة للعبة ألف باء. ترتيبها من اختيارنا، وليس نتيجة استطلاع أو تصنيفاً موضوعياً.",
);
const date = "2026-09-13";
function make(
  id: string,
  gameType: "bank" | "top-ten",
  category: Pair,
  title: Pair,
  entries: Pair[],
  source?: { url: string; context: Pair },
): Pack {
  return packSchema.parse({
    schemaVersion: 1,
    id,
    gameType,
    category: bi(...category),
    title: bi(...title),
    difficulty: "medium",
    source: source
      ? {
          kind: "factual",
          url: source.url,
          context: bi(...source.context),
          checked: date,
        }
      : { kind: "house", context: house, checked: date },
    answers: entries.map(([en, ar], i) => ({
      id: `${id}-${i + 1}`,
      label: bi(en, ar),
      ...(gameType === "top-ten" ? { rank: i + 1 } : {}),
    })),
  });
}
const elements: Pair[] = [
  ["Hydrogen", "الهيدروجين"],
  ["Helium", "الهيليوم"],
  ["Lithium", "الليثيوم"],
  ["Beryllium", "البيريليوم"],
  ["Boron", "البورون"],
  ["Carbon", "الكربون"],
  ["Nitrogen", "النيتروجين"],
  ["Oxygen", "الأكسجين"],
  ["Fluorine", "الفلور"],
  ["Neon", "النيون"],
];
const pixar: Pair[] = [
  ["Toy Story", "حكاية لعبة"],
  ["A Bug’s Life", "حياة حشرة"],
  ["Toy Story 2", "حكاية لعبة 2"],
  ["Monsters, Inc.", "شركة المرعبين المحدودة"],
  ["Finding Nemo", "البحث عن نيمو"],
  ["The Incredibles", "الخارقون"],
  ["Cars", "سيارات"],
  ["Ratatouille", "راتاتوي"],
  ["WALL-E", "وول-إي"],
  ["Up", "فوق"],
];
const nintendo: Pair[] = [
  ["Mario", "ماريو"],
  ["Luigi", "لويجي"],
  ["Princess Peach", "الأميرة بيتش"],
  ["Bowser", "باوزر"],
  ["Yoshi", "يوشي"],
  ["Donkey Kong", "دونكي كونغ"],
  ["Link", "لينك"],
  ["Kirby", "كيربي"],
  ["Samus Aran", "ساموس آران"],
  ["Pikachu", "بيكاتشو"],
];
const fruits: Pair[] = [
  ["Apple", "تفاح"],
  ["Banana", "موز"],
  ["Orange", "برتقال"],
  ["Mango", "مانجو"],
  ["Strawberry", "فراولة"],
  ["Watermelon", "بطيخ"],
  ["Pineapple", "أناناس"],
  ["Grape", "عنب"],
  ["Peach", "خوخ"],
  ["Kiwi", "كيوي"],
];
const sports: Pair[] = [
  ["Football", "كرة القدم"],
  ["Basketball", "كرة السلة"],
  ["Tennis", "التنس"],
  ["Swimming", "السباحة"],
  ["Volleyball", "الكرة الطائرة"],
  ["Cycling", "ركوب الدراجات"],
  ["Boxing", "الملاكمة"],
  ["Golf", "الغولف"],
  ["Badminton", "الريشة الطائرة"],
  ["Table tennis", "تنس الطاولة"],
];
const animals: Pair[] = [
  ["Lion", "أسد"],
  ["Elephant", "فيل"],
  ["Giraffe", "زرافة"],
  ["Zebra", "حمار وحشي"],
  ["Tiger", "نمر"],
  ["Panda", "باندا"],
  ["Gorilla", "غوريلا"],
  ["Kangaroo", "كنغر"],
  ["Koala", "كوالا"],
  ["Penguin", "بطريق"],
];
const kuwait: Pair[] = [
  ["Kuwait Towers", "أبراج الكويت"],
  ["Souq Al-Mubarakiya", "سوق المباركية"],
  ["Al Shaheed Park", "حديقة الشهيد"],
  ["The Scientific Center", "المركز العلمي"],
  ["Sheikh Jaber Al-Ahmad Cultural Centre", "مركز الشيخ جابر الأحمد الثقافي"],
  ["Grand Mosque", "المسجد الكبير"],
  ["Failaka Island", "جزيرة فيلكا"],
  ["Al Kout", "الكوت"],
  ["The Avenues", "الأفنيوز"],
  ["Sadu House", "بيت السدو"],
];
const marvel: Pair[] = [
  ["Thanos", "ثانوس"],
  ["Loki", "لوكي"],
  ["Doctor Doom", "دكتور دوم"],
  ["Magneto", "ماغنيتو"],
  ["Green Goblin", "غرين غوبلن"],
  ["Ultron", "ألترون"],
  ["Kingpin", "كينغ بين"],
  ["Red Skull", "ريد سكال"],
  ["Hela", "هيلا"],
  ["Mysterio", "ميستيريو"],
];
const travel: Pair[] = [
  ["Paris", "باريس"],
  ["Tokyo", "طوكيو"],
  ["Rome", "روما"],
  ["London", "لندن"],
  ["Istanbul", "إسطنبول"],
  ["New York City", "نيويورك"],
  ["Barcelona", "برشلونة"],
  ["Dubai", "دبي"],
  ["Singapore", "سنغافورة"],
  ["Marrakesh", "مراكش"],
];
const football: Pair[] = [
  ["Lionel Messi", "ليونيل ميسي"],
  ["Cristiano Ronaldo", "كريستيانو رونالدو"],
  ["Pelé", "بيليه"],
  ["Diego Maradona", "دييغو مارادونا"],
  ["Zinedine Zidane", "زين الدين زيدان"],
  ["Ronaldo Nazário", "رونالدو نازاريو"],
  ["Ronaldinho", "رونالدينيو"],
  ["Johan Cruyff", "يوهان كرويف"],
  ["Paolo Maldini", "باولو مالديني"],
  ["Andrés Iniesta", "أندريس إنييستا"],
];
const iupac = {
  url: "https://iupac.org/what-we-do/periodic-table-of-elements/",
  context: [
    "The first ten elements in increasing atomic number: hydrogen (1) through neon (10).",
    "أول عشرة عناصر بترتيب العدد الذري تصاعدياً، من الهيدروجين (1) إلى النيون (10).",
  ] as Pair,
};
const pixarSource = {
  url: "https://www.pixar.com/feature-films",
  context: [
    "The first ten Pixar feature films by original US theatrical release, 1995–2009. Rank 1 is the earliest film.",
    "أول عشرة أفلام طويلة من بيكسار حسب تاريخ عرضها السينمائي الأول في الولايات المتحدة، 1995–2009. المرتبة الأولى للأقدم.",
  ] as Pair,
};

export const bundledPacks: Pack[] = [
  make(
    "bank-space",
    "bank",
    ["Space", "الفضاء"],
    [
      "Name the eight planets in our solar system.",
      "اذكر الكواكب الثمانية في مجموعتنا الشمسية.",
    ],
    [
      ["Mercury", "عطارد"],
      ["Venus", "الزهرة"],
      ["Earth", "الأرض"],
      ["Mars", "المريخ"],
      ["Jupiter", "المشتري"],
      ["Saturn", "زحل"],
      ["Uranus", "أورانوس"],
      ["Neptune", "نبتون"],
    ],
    {
      url: "https://science.nasa.gov/solar-system/planets/",
      context: [
        "The eight planets recognized by the IAU; dwarf planets are excluded.",
        "الكواكب الثمانية المعترف بها لدى الاتحاد الفلكي الدولي، دون الكواكب القزمة.",
      ],
    },
  ),
  make(
    "bank-gulf",
    "bank",
    ["Gulf", "الخليج"],
    [
      "Name the six member states of the GCC.",
      "اذكر الدول الست الأعضاء في مجلس التعاون الخليجي.",
    ],
    [
      ["Kuwait", "الكويت"],
      ["Saudi Arabia", "السعودية"],
      ["Bahrain", "البحرين"],
      ["Qatar", "قطر"],
      ["Oman", "عمان"],
      ["United Arab Emirates", "الإمارات العربية المتحدة"],
    ],
    {
      url: "https://www.gcc-sg.org/en/AboutUs/Pages/default.aspx",
      context: [
        "The six member states of the Gulf Cooperation Council.",
        "الدول الست الأعضاء في مجلس التعاون لدول الخليج العربية.",
      ],
    },
  ),
  make(
    "bank-science",
    "bank",
    ["Science", "العلوم"],
    [
      "Name any of the first ten chemical elements.",
      "اذكر العناصر الكيميائية العشرة الأولى.",
    ],
    elements,
    iupac,
  ),
  make(
    "bank-movies",
    "bank",
    ["Movies", "الأفلام"],
    [
      "Name any of Pixar’s first ten feature films.",
      "اذكر أي فيلم من أفلام بيكسار الطويلة العشرة الأولى.",
    ],
    pixar,
    pixarSource,
  ),
  make(
    "bank-gaming",
    "bank",
    ["Gaming", "الألعاب الإلكترونية"],
    [
      "Find the ten Nintendo characters on our house list.",
      "اكتشف شخصيات نينتندو العشر في قائمتنا المختارة.",
    ],
    nintendo,
  ),
  make(
    "bank-food",
    "bank",
    ["Food", "الطعام"],
    [
      "Find the ten fruits on our house list.",
      "اكتشف أنواع الفاكهة العشرة في قائمتنا المختارة.",
    ],
    fruits,
  ),
  make(
    "bank-sports",
    "bank",
    ["Sports", "الرياضة"],
    [
      "Find the ten sports on our house list.",
      "اكتشف الرياضات العشر في قائمتنا المختارة.",
    ],
    sports,
  ),
  make(
    "bank-animals",
    "bank",
    ["Animals", "الحيوانات"],
    [
      "Find the ten animals on our house list.",
      "اكتشف الحيوانات العشرة في قائمتنا المختارة.",
    ],
    animals,
  ),
  make(
    "bank-kuwait",
    "bank",
    ["Kuwait", "الكويت"],
    [
      "Find ten places to visit in Kuwait on our house list.",
      "اكتشف عشرة أماكن للزيارة في الكويت من قائمتنا المختارة.",
    ],
    kuwait,
  ),
  make(
    "bank-marvel",
    "bank",
    ["Marvel", "مارفل"],
    [
      "Find the ten Marvel villains on our house list.",
      "اكتشف أشرار مارفل العشرة في قائمتنا المختارة.",
    ],
    marvel,
  ),
  make(
    "top-science",
    "top-ten",
    ["Science", "العلوم"],
    ["The first ten elements", "العناصر الكيميائية العشرة الأولى"],
    elements,
    iupac,
  ),
  make(
    "top-pixar",
    "top-ten",
    ["Movies", "الأفلام"],
    ["Pixar’s first ten films", "أفلام بيكسار العشرة الأولى"],
    pixar,
    pixarSource,
  ),
  make(
    "top-marvel",
    "top-ten",
    ["Marvel", "مارفل"],
    ["Marvel’s memorable villains", "أشرار مارفل الذين لا يُنسون"],
    marvel,
  ),
  make(
    "top-travel",
    "top-ten",
    ["Travel", "السفر"],
    ["The city-break wishlist", "قائمة مدن تستحق الزيارة"],
    travel,
  ),
  make(
    "top-gaming",
    "top-ten",
    ["Gaming", "الألعاب الإلكترونية"],
    ["Nintendo character roll call", "شخصيات من عالم نينتندو"],
    nintendo,
  ),
  make(
    "top-food",
    "top-ten",
    ["Food", "الطعام"],
    ["The fruit-bowl favourites", "فاكهة على المائدة"],
    fruits,
  ),
  make(
    "top-football",
    "top-ten",
    ["Football", "كرة القدم"],
    ["Football’s unforgettable names", "أسماء لا تُنسى في كرة القدم"],
    football,
  ),
  make(
    "top-kuwait",
    "top-ten",
    ["Kuwait", "الكويت"],
    ["A day out in Kuwait", "يوم في الكويت"],
    kuwait,
  ),
  make(
    "top-animals",
    "top-ten",
    ["Animals", "الحيوانات"],
    ["Wildlife favourites", "حيوانات نحبها"],
    animals,
  ),
  make(
    "top-sports",
    "top-ten",
    ["Sports", "الرياضة"],
    ["A little friendly competition", "منافسة رياضية ودية"],
    sports,
  ),
];

// Conservative, explicit aliases. The host still confirms every award.
const aliases: Record<string, string[]> = {
  "United Arab Emirates": ["UAE", "U.A.E."],
  "Saudi Arabia": ["KSA"],
  Football: ["Soccer"],
  "WALL-E": ["Wall E"],
  "Monsters, Inc.": ["Monsters Inc"],
  "Princess Peach": ["Peach"],
  "New York City": ["New York", "NYC"],
  "Ronaldo Nazário": ["Ronaldo Nazario"],
  "Andrés Iniesta": ["Andres Iniesta"],
  Pelé: ["Pele"],
  "Souq Al-Mubarakiya": ["Mubarakiya", "Souq Mubarakiya"],
};
for (const pack of bundledPacks)
  for (const answer of pack.answers) {
    if (aliases[answer.label.en])
      answer.aliases = { en: aliases[answer.label.en], ar: [] };
  }

const topicPairs: Pair[] = [
  ["Marvel", "مارفل"],
  ["Movies", "الأفلام"],
  ["TV Shows", "المسلسلات"],
  ["Actors", "الممثلون"],
  ["Directors", "المخرجون"],
  ["Disney", "ديزني"],
  ["Pixar", "بيكسار"],
  ["Anime", "الأنمي"],
  ["Cartoons", "الرسوم المتحركة"],
  ["Gaming", "الألعاب الإلكترونية"],
  ["PlayStation", "بلايستيشن"],
  ["Xbox", "إكس بوكس"],
  ["Nintendo", "نينتندو"],
  ["Sports", "الرياضة"],
  ["Football", "كرة القدم"],
  ["Basketball", "كرة السلة"],
  ["Tennis", "التنس"],
  ["Formula 1", "فورمولا 1"],
  ["History", "التاريخ"],
  ["Geography", "الجغرافيا"],
  ["Countries", "الدول"],
  ["Capitals", "العواصم"],
  ["Cities", "المدن"],
  ["Maps", "الخرائط"],
  ["Landmarks", "المعالم"],
  ["Science", "العلوم"],
  ["Technology", "التكنولوجيا"],
  ["Space", "الفضاء"],
  ["Nature", "الطبيعة"],
  ["Animals", "الحيوانات"],
  ["Music", "الموسيقى"],
  ["Songs", "الأغاني"],
  ["Artists", "الفنانون"],
  ["Celebrities", "المشاهير"],
  ["General Knowledge", "المعلومات العامة"],
  ["Food", "الطعام"],
  ["Brands", "العلامات التجارية"],
  ["Cars", "السيارات"],
  ["Travel", "السفر"],
  ["Kuwait", "الكويت"],
  ["Gulf", "الخليج"],
  ["Arab World", "العالم العربي"],
  ["Middle East", "الشرق الأوسط"],
  ["Islamic History", "التاريخ الإسلامي"],
  ["World History", "تاريخ العالم"],
  ["Literature", "الأدب"],
  ["Internet", "الإنترنت"],
  ["Social Media", "التواصل الاجتماعي"],
  ["Memes", "الميمز"],
  ["Politics", "السياسة"],
  ["Business", "الأعمال"],
  ["Inventions", "الاختراعات"],
  ["Architecture", "العمارة"],
  ["Languages", "اللغات"],
];
export const topics = topicPairs.map(([en, ar]) => bi(en, ar));

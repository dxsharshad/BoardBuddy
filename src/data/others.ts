import { card, chapter, l, mcq } from './helpers';

export const sstChapters = [
  chapter({
    id: 'sst-res',
    subjectId: 'sst',
    title: l('Resources and Development', 'संसाधन एवं विकास'),
    notes: [
      l('Everything in our environment that can be used to satisfy needs, is technologically accessible, economically feasible and culturally acceptable is a resource. Resources can be classified by origin, exhaustibility, ownership and status of development.'),
      l('Sustainable development means development that meets present needs without compromising the ability of future generations to meet theirs.', 'सतत विकास का अर्थ है वर्तमान की आवश्यकताएँ पूरी करना, पर भावी पीढ़ियों की क्षमता को नुकसान पहुँचाए बिना।'),
    ],
    definitions: [
      { term: l('Renewable resource', 'नवीकरणीय संसाधन'), meaning: l('A resource that can be replenished naturally, such as solar and wind energy.', 'जिसकी पूर्ति प्राकृतिक रूप से हो जाए, जैसे सौर व पवन ऊर्जा।') },
    ],
    formulas: [],
    keyPoints: [
      l('Alluvial soil is the most widespread soil in India and is very fertile.'),
      l('The 1992 Rio de Janeiro Earth Summit adopted Agenda 21 for sustainable development.'),
    ],
    important: [l('What is sustainable development? Why is it important?'), l('Name any three types of soil found in India.')],
    mcqs: [
      mcq('ss1-1', 'Solar energy is a', ['Non-renewable resource', 'Renewable resource', 'Man-made resource only', 'Biotic resource'], 1, 'It is naturally replenished.'),
      mcq('ss1-2', 'The most widespread soil in India is', ['Black soil', 'Red soil', 'Alluvial soil', 'Laterite soil'], 2, 'Alluvial soil covers a large part of the northern plains.'),
      mcq('ss1-3', 'Agenda 21 was adopted at the Earth Summit held in', ['1972', '1992', '2002', '1982'], 1, 'Rio de Janeiro, Brazil, 1992.'),
    ],
    cards: [card('ss1-1c', 'Define sustainable development.', 'Meeting present needs without harming future generations’ ability to meet theirs.'), card('ss1-2c', 'Most widespread soil in India?', 'Alluvial soil')],
  }),
  chapter({
    id: 'sst-money',
    subjectId: 'sst',
    title: l('Money and Credit', 'मुद्रा और साख'),
    notes: [
      l('Money removes the problem of double coincidence of wants found in barter. In India the Reserve Bank of India issues currency notes (except the one-rupee note and coins, issued by the Government of India).'),
      l('Credit (loan) is an agreement in which the lender supplies money, goods or services in return for a promise of future payment. Formal credit comes from banks and cooperatives; informal credit from moneylenders and relatives.'),
    ],
    definitions: [
      { term: l('Collateral', 'जमानत'), meaning: l('An asset the borrower pledges to the lender as a guarantee until the loan is repaid.', 'वह संपत्ति जो कर्ज़ चुकाने तक ऋणदाता के पास गारंटी के रूप में रखी जाती है।') },
    ],
    formulas: [],
    keyPoints: [l('Formal sources of credit are regulated by the RBI; informal sources are not.')],
    important: [l('Explain double coincidence of wants.'), l('Differentiate between formal and informal credit.')],
    mcqs: [
      mcq('ss2-1', 'Currency notes in India are issued by', ['The State Bank of India', 'The Reserve Bank of India', 'Commercial banks', 'The Finance Ministry only'], 1, 'The RBI issues notes (the Government issues the one-rupee note and coins).'),
      mcq('ss2-2', 'Which is a formal source of credit?', ['Moneylender', 'Relative', 'Bank', 'Trader'], 2, 'Banks and cooperatives are formal sources.'),
    ],
    cards: [card('ss2-1c', 'What is collateral?', 'An asset pledged as security for a loan.')],
  }),
  chapter({
    id: 'sst-power',
    subjectId: 'sst',
    title: l('Power Sharing', 'सत्ता की साझेदारी'),
    notes: [
      l('Power sharing reduces conflict between social groups and is the very spirit of democracy. Belgium shows accommodation through sharing power among linguistic communities, while in Sri Lanka majoritarianism (the 1956 Sinhala-only law) deepened the conflict.'),
      l('Forms of power sharing: among organs of government (horizontal), among governments at different levels (vertical), among social groups, and among political parties and movements.'),
    ],
    definitions: [{ term: l('Majoritarianism', 'बहुसंख्यकवाद'), meaning: l('Belief that the majority community should rule the country in its own way, ignoring minorities.', 'यह मान्यता कि बहुसंख्यक समुदाय अपनी इच्छा से देश चलाए और अल्पसंख्यकों की उपेक्षा करे।') }],
    formulas: [],
    keyPoints: [l('Power sharing is good because it reduces conflict and ensures stability.')],
    important: [l('Describe the forms of power sharing.'), l('Compare the Belgium and Sri Lanka experiences.')],
    mcqs: [
      mcq('ss3-1', 'Sharing power between the legislature, executive and judiciary is', ['Vertical power sharing', 'Horizontal power sharing', 'Community government', 'Coalition'], 1, 'Different organs at the same level share power: horizontal.'),
      mcq('ss3-2', 'Majoritarianism in Sri Lanka led to', ['Peace', 'Civil conflict', 'Federation', 'Equal rights'], 1, 'Discrimination against Sri Lankan Tamils deepened conflict.'),
    ],
    cards: [card('ss3-1c', 'Two types of power sharing among governments?', 'Horizontal (organs) and vertical (levels).')],
  }),
];

export const hindiChapters = [
  chapter({
    id: 'hin-sandhi',
    subjectId: 'hindi',
    title: l('Sandhi (Grammar)', 'संधि (व्याकरण)'),
    notes: [
      l(
        'Sandhi means joining of two sounds. When two words come together, the last sound of the first word and the first sound of the second word merge. Sandhi has three types: Swar sandhi, Vyanjan sandhi and Visarg sandhi.',
        'संधि का अर्थ है दो वर्णों का मेल। दो शब्द पास आने पर पहले शब्द का अंतिम वर्ण और दूसरे का पहला वर्ण मिल जाते हैं। संधि के तीन भेद हैं: स्वर संधि, व्यंजन संधि और विसर्ग संधि।',
      ),
    ],
    definitions: [{ term: l('Sandhi vichchhed', 'संधि-विच्छेद'), meaning: l('Splitting a joined word back into its original parts.', 'मिले हुए शब्द को उसके मूल रूप में अलग करना।') }],
    formulas: [],
    keyPoints: [
      l('Vidya + alay = Vidyalay (Dirgh swar sandhi).', 'विद्या + आलय = विद्यालय (दीर्घ स्वर संधि)।'),
      l('Surya + uday = Suryoday (Gun swar sandhi).', 'सूर्य + उदय = सूर्योदय (गुण स्वर संधि)।'),
      l('Sat + jan = Sajjan (Vyanjan sandhi).', 'सत् + जन = सज्जन (व्यंजन संधि)।'),
    ],
    important: [l('What is sandhi? Name its types with one example each.', 'संधि किसे कहते हैं? इसके भेद उदाहरण सहित लिखिए।')],
    mcqs: [
      mcq('h1-1', { en: 'विद्या + आलय = ?', hi: 'विद्या + आलय = ?' }, ['विद्यालय', 'विद्यालेय', 'विद्यालय्', 'विद्यआलय'], 0, { en: 'आ + आ = आ (दीर्घ स्वर संधि)।', hi: 'आ + आ = आ (दीर्घ स्वर संधि)।' }),
      mcq('h1-2', 'सूर्य + उदय = ?', ['सूर्यउदय', 'सूर्योदय', 'सूर्योदया', 'सूर्यदय'], 1, 'अ + उ = ओ (गुण संधि)।'),
      mcq('h1-3', 'संधि के कितने मुख्य भेद हैं?', ['दो', 'तीन', 'चार', 'पाँच'], 1, 'स्वर, व्यंजन और विसर्ग संधि।'),
    ],
    cards: [card('h1-1c', 'संधि के तीन भेद?', 'स्वर संधि, व्यंजन संधि, विसर्ग संधि'), card('h1-2c', 'सत् + जन = ?', 'सज्जन')],
  }),
];

export const englishChapters = [
  chapter({
    id: 'eng-tense',
    subjectId: 'english',
    title: l('Tenses (Grammar)', 'काल (Tenses)'),
    notes: [
      l('A tense shows the time of an action. There are three main tenses: present, past and future, and each has four forms: simple, continuous, perfect and perfect continuous.'),
      l('Simple present is used for habits and general truths (She walks to school). Present continuous is used for actions happening now (She is walking). Present perfect connects the past with the present (She has walked).'),
    ],
    definitions: [{ term: l('Auxiliary verb'), meaning: l('A helping verb such as is, are, has, have, was, will that helps form tenses.') }],
    formulas: [
      { name: l('Simple present'), expr: 'Subject + V1 (+s/es for he/she/it)' },
      { name: l('Present continuous'), expr: 'Subject + is/am/are + V-ing' },
      { name: l('Present perfect'), expr: 'Subject + has/have + V3' },
      { name: l('Simple past'), expr: 'Subject + V2' },
    ],
    keyPoints: [l('Use "has" with he/she/it and "have" with I/you/we/they.'), l('Never use "will" in the time clause of a future sentence: "I will call you when he arrives."')],
    important: [l('Change into the present perfect tense: He writes a letter.'), l('Fill in the blanks with the correct form of the verb.')],
    mcqs: [
      mcq('e1-1', 'She ____ to school every day.', ['go', 'goes', 'going', 'gone'], 1, 'Simple present with a third-person singular subject takes -es.'),
      mcq('e1-2', 'They ____ playing football now.', ['is', 'am', 'are', 'was'], 2, 'Present continuous with "they" uses "are".'),
      mcq('e1-3', 'He ____ finished his homework.', ['have', 'has', 'is', 'had been'], 1, 'Present perfect with "he" uses "has".'),
    ],
    cards: [card('e1-1c', 'Formula of present perfect?', 'Subject + has/have + V3'), card('e1-2c', 'Which tense for general truths?', 'Simple present')],
  }),
];

export const sanskritChapters = [
  chapter({
    id: 'san-bhu',
    subjectId: 'sanskrit',
    title: l('Dhatu Roop: Bhu (भू) – Lat lakar', 'धातु रूप: भू (होना) – लट् लकार'),
    notes: [
      l('The root भू means "to be / to become". In the present tense (Lat lakar) it takes forms by person (purush) and number (vachan): singular, dual and plural.', 'भू धातु का अर्थ है "होना"। लट् लकार (वर्तमान काल) में यह पुरुष और वचन (एकवचन, द्विवचन, बहुवचन) के अनुसार बदलता है।'),
    ],
    definitions: [],
    formulas: [
      { name: l('Prathama purush (he/she/they)', 'प्रथम पुरुष'), expr: 'भवति – भवतः – भवन्ति' },
      { name: l('Madhyama purush (you)', 'मध्यम पुरुष'), expr: 'भवसि – भवथः – भवथ' },
      { name: l('Uttama purush (I/we)', 'उत्तम पुरुष'), expr: 'भवामि – भवावः – भवामः' },
    ],
    keyPoints: [l('सः भवति = he is. अहं भवामि = I am.')],
    important: [l('Write the Lat lakar forms of भू in all three persons and numbers.', 'भू धातु के लट् लकार के रूप तीनों पुरुषों व वचनों में लिखिए।')],
    mcqs: [
      mcq('sa1-1', 'अहं ____ (भू धातु, लट्)।', ['भवति', 'भवामि', 'भवसि', 'भवन्ति'], 1, 'उत्तम पुरुष एकवचन: भवामि।'),
      mcq('sa1-2', 'ते ____।', ['भवति', 'भवतः', 'भवन्ति', 'भवथ'], 2, 'प्रथम पुरुष बहुवचन: भवन्ति।'),
    ],
    cards: [card('sa1-1c', 'भू धातु, प्रथम पुरुष एकवचन?', 'भवति'), card('sa1-2c', 'भू धातु, मध्यम पुरुष बहुवचन?', 'भवथ')],
  }),
];

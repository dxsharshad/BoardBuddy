import { card, chapter, l, mcq } from './helpers';

export const mathChapters = [
  chapter({
    id: 'math-real',
    subjectId: 'math',
    title: l('Real Numbers', 'वास्तविक संख्याएँ'),
    notes: [
      l(
        "Euclid's division lemma says that for any two positive integers a and b there are unique whole numbers q and r such that a = bq + r, where 0 ≤ r < b. Repeating this step is called Euclid's division algorithm and it gives the HCF of two numbers.",
        'यूक्लिड विभाजन प्रमेयिका: दो धनात्मक पूर्णांकों a और b के लिए अद्वितीय पूर्ण संख्याएँ q और r होती हैं जिनसे a = bq + r, जहाँ 0 ≤ r < b। इसे बार-बार दोहराने से दो संख्याओं का HCF मिलता है।',
      ),
      l(
        'The Fundamental Theorem of Arithmetic: every composite number can be written as a product of primes, and this factorisation is unique apart from the order of the primes. Example: 12 = 2 × 2 × 3.',
        'अंकगणित की आधारभूत प्रमेय: प्रत्येक भाज्य संख्या को अभाज्य संख्याओं के गुणनफल के रूप में लिखा जा सकता है और यह गुणनखंडन अद्वितीय होता है। उदाहरण: 12 = 2 × 2 × 3।',
      ),
      l('Numbers that cannot be written as p/q (q ≠ 0, p and q integers) are irrational, for example √2 and √3. Decimal expansions of rational numbers terminate or repeat; irrational numbers neither terminate nor repeat.'),
    ],
    definitions: [
      { term: l('HCF', 'महत्तम समापवर्तक (HCF)'), meaning: l('Highest Common Factor: the largest number that divides both numbers exactly.', 'वह सबसे बड़ी संख्या जो दोनों संख्याओं को पूरा-पूरा भाग दे।') },
      { term: l('LCM', 'लघुत्तम समापवर्त्य (LCM)'), meaning: l('Least Common Multiple: the smallest number that is a multiple of both numbers.', 'वह सबसे छोटी संख्या जो दोनों संख्याओं का गुणज हो।') },
    ],
    formulas: [
      { name: l("Euclid's lemma", 'यूक्लिड प्रमेयिका'), expr: 'a = bq + r, 0 ≤ r < b' },
      { name: l('HCF × LCM', 'HCF × LCM'), expr: 'HCF(a, b) × LCM(a, b) = a × b' },
    ],
    keyPoints: [
      l('Prime factorisation is unique.', 'अभाज्य गुणनखंडन अद्वितीय होता है।'),
      l('HCF takes the smallest power of each common prime; LCM takes the greatest power of every prime.'),
      l('√p is irrational for every prime p.'),
      l('Product of two numbers = HCF × LCM.', 'दो संख्याओं का गुणनफल = HCF × LCM।'),
    ],
    important: [
      l('Find the HCF of 96 and 404 using Euclid\'s division algorithm.'),
      l('Prove that √3 is irrational.'),
      l('Find the LCM and HCF of 26 and 91 by prime factorisation and verify HCF × LCM = product.'),
    ],
    mcqs: [
      mcq('m1-1', 'What is the HCF of 12 and 18?', ['3', '6', '9', '12'], 1, 'Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. Greatest common factor is 6.'),
      mcq('m1-2', 'What is the LCM of 12 and 18?', ['24', '36', '72', '54'], 1, '12 = 2²×3 and 18 = 2×3². LCM = 2²×3² = 36.'),
      mcq('m1-3', 'Which of these is an irrational number?', ['0.25', '22/7', '√2', '4'], 2, '√2 cannot be written as p/q. 22/7 is only an approximation of π and is itself rational.'),
      mcq('m1-4', "In Euclid's lemma a = bq + r, the remainder r satisfies:", ['0 < r ≤ b', '0 ≤ r < b', 'r > b', 'r = b'], 1, 'The remainder is always smaller than the divisor b and can be zero.'),
      mcq('m1-5', 'If HCF(a, b) = 4 and LCM(a, b) = 24, then a × b =', ['28', '20', '96', '6'], 2, 'a × b = HCF × LCM = 4 × 24 = 96.'),
    ],
    cards: [
      card('mc1-1', "State Euclid's division lemma.", 'a = bq + r with 0 ≤ r < b, for positive integers a and b.'),
      card('mc1-2', 'Relation between HCF, LCM and the numbers?', 'HCF × LCM = product of the two numbers.'),
      card('mc1-3', 'Prime factorisation of 12?', '2 × 2 × 3 = 2² × 3'),
      card('mc1-4', 'Is √2 rational or irrational?', 'Irrational.'),
    ],
  }),
  chapter({
    id: 'math-quad',
    subjectId: 'math',
    title: l('Quadratic Equations', 'द्विघात समीकरण'),
    notes: [
      l(
        'A quadratic equation has the form ax² + bx + c = 0 where a ≠ 0. Its solutions are called roots. You can find them by factorisation, completing the square, or the quadratic formula.',
        'द्विघात समीकरण का रूप ax² + bx + c = 0 है, जहाँ a ≠ 0। इसके हल को मूल कहते हैं। इन्हें गुणनखंड, पूर्ण वर्ग बनाकर या द्विघात सूत्र से निकाला जा सकता है।',
      ),
      l(
        'The discriminant D = b² − 4ac tells the nature of the roots without solving: D > 0 gives two distinct real roots, D = 0 gives two equal real roots, D < 0 gives no real roots.',
        'विविक्तकर D = b² − 4ac से मूलों की प्रकृति पता चलती है: D > 0 पर दो भिन्न वास्तविक मूल, D = 0 पर दो समान मूल, D < 0 पर कोई वास्तविक मूल नहीं।',
      ),
    ],
    definitions: [
      { term: l('Root of an equation', 'समीकरण का मूल'), meaning: l('A value of x that makes the equation true.', 'x का वह मान जो समीकरण को संतुष्ट करे।') },
      { term: l('Discriminant', 'विविक्तकर'), meaning: l('The quantity b² − 4ac of ax² + bx + c = 0.', 'ax² + bx + c = 0 में b² − 4ac।') },
    ],
    formulas: [
      { name: l('Quadratic formula', 'द्विघात सूत्र'), expr: 'x = (−b ± √(b² − 4ac)) / 2a' },
      { name: l('Discriminant', 'विविक्तकर'), expr: 'D = b² − 4ac' },
      { name: l('Sum of roots', 'मूलों का योग'), expr: 'α + β = −b / a' },
      { name: l('Product of roots', 'मूलों का गुणनफल'), expr: 'αβ = c / a' },
    ],
    keyPoints: [
      l('A quadratic has at most two roots.', 'द्विघात समीकरण के अधिकतम दो मूल होते हैं।'),
      l('Always write the equation in standard form before using the formula.'),
      l('D < 0 means the graph does not touch the x-axis.'),
    ],
    important: [
      l('Solve 2x² − 7x + 3 = 0 by factorisation.'),
      l('Find the nature of roots of 3x² − 4√3x + 4 = 0.'),
      l('The product of two consecutive positive integers is 306. Find them.'),
    ],
    mcqs: [
      mcq('m2-1', 'The roots of x² − 5x + 6 = 0 are', ['1 and 6', '2 and 3', '−2 and −3', '−1 and 6'], 1, 'x² − 5x + 6 = (x − 2)(x − 3), so x = 2 or x = 3.'),
      mcq('m2-2', 'Nature of roots of 2x² − 4x + 3 = 0?', ['Two distinct real roots', 'Two equal real roots', 'No real roots', 'Cannot say'], 2, 'D = (−4)² − 4(2)(3) = 16 − 24 = −8 < 0, so no real roots.'),
      mcq('m2-3', 'If D = 0, the roots are', ['Imaginary', 'Real and equal', 'Real and distinct', 'Zero'], 1, 'When b² − 4ac = 0 the formula gives x = −b/2a twice.'),
      mcq('m2-4', 'Sum of the roots of x² − 7x + 12 = 0 is', ['7', '−7', '12', '−12'], 0, 'Sum = −b/a = 7.'),
    ],
    cards: [
      card('mc2-1', 'Write the quadratic formula.', 'x = (−b ± √(b² − 4ac)) / 2a'),
      card('mc2-2', 'What does D < 0 mean?', 'No real roots.'),
      card('mc2-3', 'Product of roots?', 'c / a'),
    ],
  }),
  chapter({
    id: 'math-trig',
    subjectId: 'math',
    title: l('Introduction to Trigonometry', 'त्रिकोणमिति का परिचय'),
    notes: [
      l(
        'In a right-angled triangle, for an acute angle θ: sin θ = perpendicular/hypotenuse, cos θ = base/hypotenuse, tan θ = perpendicular/base. Their reciprocals are cosec, sec and cot.',
        'समकोण त्रिभुज में न्यून कोण θ के लिए: sin θ = लंब/कर्ण, cos θ = आधार/कर्ण, tan θ = लंब/आधार। इनके व्युत्क्रम cosec, sec और cot हैं।',
      ),
      l('Values for standard angles 0°, 30°, 45°, 60° and 90° are used in almost every board question, so learn the table by heart.'),
    ],
    definitions: [
      { term: l('Trigonometric identity', 'त्रिकोणमितीय सर्वसमिका'), meaning: l('An equation true for every value of the angle.', 'ऐसा समीकरण जो कोण के सभी मानों के लिए सत्य हो।') },
    ],
    formulas: [
      { name: l('Basic identity', 'मूल सर्वसमिका'), expr: 'sin²θ + cos²θ = 1' },
      { name: l('Identity 2', 'सर्वसमिका 2'), expr: '1 + tan²θ = sec²θ' },
      { name: l('Identity 3', 'सर्वसमिका 3'), expr: '1 + cot²θ = cosec²θ' },
      { name: l('tan in terms of sin, cos', 'tan का मान'), expr: 'tan θ = sin θ / cos θ' },
    ],
    keyPoints: [
      l('sin 30° = cos 60° = 1/2.'),
      l('tan 45° = 1; sin 90° = 1; cos 90° = 0.'),
      l('sin and cos never exceed 1.', 'sin और cos का मान 1 से अधिक नहीं हो सकता।'),
    ],
    important: [
      l('Prove that (1 + tan²θ) cos²θ = 1.'),
      l('If sin θ = 3/5, find cos θ and tan θ.'),
      l('Evaluate sin 60° cos 30° + sin 30° cos 60°.'),
    ],
    mcqs: [
      mcq('m3-1', 'The value of sin 30° is', ['1', '1/2', '√3/2', '0'], 1, 'Standard value: sin 30° = 1/2.'),
      mcq('m3-2', 'The value of tan 45° is', ['0', '1/2', '1', '√3'], 2, 'In a 45° right triangle perpendicular = base, so tan 45° = 1.'),
      mcq('m3-3', 'sin²θ + cos²θ equals', ['0', '1', '2', 'tan θ'], 1, 'This is the basic Pythagorean identity.'),
      mcq('m3-4', 'The value of cos 60° is', ['√3/2', '1', '1/2', '0'], 2, 'cos 60° = 1/2.'),
      mcq('m3-5', 'The value of cos 0° is', ['0', '1', '1/2', 'Not defined'], 1, 'cos 0° = 1.'),
    ],
    cards: [
      card('mc3-1', 'sin θ = ?', 'Perpendicular / Hypotenuse'),
      card('mc3-2', 'Identity involving tan and sec?', '1 + tan²θ = sec²θ'),
      card('mc3-3', 'Value of sin 45°?', '1/√2'),
    ],
  }),
];

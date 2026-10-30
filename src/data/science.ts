import { card, chapter, l, mcq } from './helpers';

export const scienceChapters = [
  chapter({
    id: 'sci-light',
    subjectId: 'science',
    title: l('Light – Reflection and Refraction', 'प्रकाश – परावर्तन तथा अपवर्तन'),
    notes: [
      l(
        'Reflection is the bouncing back of light from a surface. For mirrors the angle of incidence equals the angle of reflection. A concave mirror converges light, and a convex mirror diverges it.',
        'परावर्तन में प्रकाश सतह से टकराकर लौट जाता है। दर्पण में आपतन कोण = परावर्तन कोण। अवतल दर्पण प्रकाश को अभिसरित और उत्तल दर्पण अपसरित करता है।',
      ),
      l(
        'Refraction is the bending of light when it passes from one transparent medium into another because its speed changes. The refractive index n = speed of light in vacuum / speed of light in the medium.',
        'अपवर्तन में प्रकाश एक पारदर्शी माध्यम से दूसरे में जाते समय मुड़ जाता है क्योंकि उसकी चाल बदलती है। अपवर्तनांक n = निर्वात में प्रकाश की चाल / माध्यम में प्रकाश की चाल।',
      ),
    ],
    definitions: [
      { term: l('Focal length', 'फोकस दूरी'), meaning: l('Distance between the pole of a mirror (or optical centre of a lens) and its principal focus.', 'दर्पण के ध्रुव (या लेंस के प्रकाशिक केंद्र) से मुख्य फोकस की दूरी।') },
      { term: l('Power of a lens', 'लेंस की क्षमता'), meaning: l('Reciprocal of focal length in metres. Unit: dioptre (D).', 'फोकस दूरी (मीटर में) का व्युत्क्रम। मात्रक: डायोप्टर।') },
    ],
    formulas: [
      { name: l('Mirror formula', 'दर्पण सूत्र'), expr: '1/v + 1/u = 1/f' },
      { name: l('Lens formula', 'लेंस सूत्र'), expr: '1/v − 1/u = 1/f' },
      { name: l('Magnification (mirror)', 'आवर्धन (दर्पण)'), expr: 'm = h′/h = −v/u' },
      { name: l("Snell's law", 'स्नेल का नियम'), expr: 'sin i / sin r = constant = n' },
      { name: l('Power', 'क्षमता'), expr: 'P = 1/f (f in metres)' },
      { name: l('Focal length and radius of curvature', 'फोकस दूरी व वक्रता त्रिज्या'), expr: 'f = R/2' },
    ],
    keyPoints: [
      l('Use the sign convention carefully: distances are measured from the pole; object is on the left.'),
      l('A convex mirror always forms a virtual, erect, diminished image.'),
      l('Light bends towards the normal when entering a denser medium.'),
      l('Convex lens has positive focal length; concave lens has negative.'),
    ],
    important: [
      l('State the laws of reflection and of refraction.'),
      l('An object 4 cm tall is placed 15 cm from a concave mirror of focal length 10 cm. Find the image position.'),
      l('Why are convex mirrors used as rear-view mirrors?'),
    ],
    mcqs: [
      mcq('s1-1', 'A mirror has radius of curvature 20 cm. Its focal length is', ['5 cm', '10 cm', '20 cm', '40 cm'], 1, 'f = R/2 = 10 cm.'),
      mcq('s1-2', 'The SI unit of power of a lens is', ['metre', 'watt', 'dioptre', 'newton'], 2, 'Power = 1/f (in metres) and its unit is the dioptre.'),
      mcq('s1-3', 'Which mirror is used as a rear-view mirror in vehicles?', ['Concave', 'Convex', 'Plane only', 'Cylindrical'], 1, 'A convex mirror gives an erect image and a wide field of view.'),
      mcq('s1-4', 'A concave lens always forms an image that is', ['Real and inverted', 'Virtual and erect', 'Real and erect', 'Virtual and inverted'], 1, 'A concave lens diverges rays, so the image is virtual, erect and diminished.'),
      mcq('s1-5', 'Speed of light in vacuum is approximately', ['3 × 10⁶ m/s', '3 × 10⁸ m/s', '3 × 10¹⁰ m/s', '3 × 10⁵ m/s'], 1, 'c ≈ 3 × 10⁸ m/s.'),
    ],
    cards: [
      card('sc1-1', 'Write the mirror formula.', '1/v + 1/u = 1/f'),
      card('sc1-2', 'Unit of power of a lens?', 'Dioptre (D)'),
      card('sc1-3', 'Relation between f and R?', 'f = R/2'),
      card('sc1-4', 'Define refractive index.', 'Ratio of speed of light in vacuum to its speed in the medium.'),
    ],
  }),
  chapter({
    id: 'sci-elec',
    subjectId: 'science',
    title: l('Electricity', 'विद्युत'),
    notes: [
      l(
        "Electric current is the rate of flow of charge: I = Q/t. Ohm's law states that at constant temperature the current through a conductor is proportional to the potential difference across it, so V = IR.",
        'विद्युत धारा आवेश के प्रवाह की दर है: I = Q/t। ओम का नियम: स्थिर ताप पर चालक में बहने वाली धारा उसके सिरों के विभवांतर के समानुपाती होती है, अतः V = IR।',
      ),
      l(
        'Resistance of a wire depends on its length, area of cross-section and material: R = ρL/A. In series the resistances add; in parallel the reciprocals add.',
        'तार का प्रतिरोध उसकी लंबाई, अनुप्रस्थ काट के क्षेत्रफल और पदार्थ पर निर्भर करता है: R = ρL/A। श्रेणी क्रम में प्रतिरोध जुड़ते हैं; समांतर क्रम में उनके व्युत्क्रम जुड़ते हैं।',
      ),
    ],
    definitions: [
      { term: l('1 ampere', '1 ऐम्पियर'), meaning: l('Current when 1 coulomb of charge flows through a point in 1 second.', 'जब किसी बिंदु से 1 सेकंड में 1 कूलॉम आवेश प्रवाहित हो।') },
      { term: l('Resistivity', 'प्रतिरोधकता'), meaning: l('Resistance of a conductor of unit length and unit cross-section. It depends only on the material and temperature.', 'इकाई लंबाई व इकाई अनुप्रस्थ काट वाले चालक का प्रतिरोध। यह केवल पदार्थ और ताप पर निर्भर है।') },
    ],
    formulas: [
      { name: l("Ohm's law", 'ओम का नियम'), expr: 'V = I R' },
      { name: l('Resistance of a wire', 'तार का प्रतिरोध'), expr: 'R = ρ L / A' },
      { name: l('Series', 'श्रेणी क्रम'), expr: 'R = R₁ + R₂ + R₃' },
      { name: l('Parallel', 'समांतर क्रम'), expr: '1/R = 1/R₁ + 1/R₂ + 1/R₃' },
      { name: l('Electric power', 'विद्युत शक्ति'), expr: 'P = VI = I²R = V²/R' },
      { name: l('Heating effect (Joule)', 'ऊष्मीय प्रभाव (जूल)'), expr: 'H = I² R t' },
    ],
    keyPoints: [
      l('Ammeter is connected in series; voltmeter in parallel.'),
      l('Resistance of a conductor increases with length and decreases with area.'),
      l('1 kWh = 3.6 × 10⁶ J.'),
      l('Household appliances are connected in parallel.'),
    ],
    important: [
      l("State Ohm's law and draw the circuit used to verify it."),
      l('Three resistors of 2 Ω, 3 Ω and 6 Ω are connected in parallel. Find the equivalent resistance.'),
      l('Why is tungsten used for the filament of a bulb?'),
    ],
    mcqs: [
      mcq('s2-1', 'A 12 V battery is connected across a 4 Ω resistor. The current is', ['0.33 A', '3 A', '48 A', '8 A'], 1, 'I = V/R = 12/4 = 3 A.'),
      mcq('s2-2', 'The SI unit of resistance is', ['volt', 'ampere', 'ohm', 'watt'], 2, 'Resistance is measured in ohms (Ω).'),
      mcq('s2-3', 'Two resistors of 2 Ω and 3 Ω in series give', ['1.2 Ω', '5 Ω', '6 Ω', '0.83 Ω'], 1, 'Series: R = 2 + 3 = 5 Ω.'),
      mcq('s2-4', 'Power of an appliance on 220 V drawing 5 A is', ['44 W', '225 W', '1100 W', '4400 W'], 2, 'P = VI = 220 × 5 = 1100 W.'),
      mcq('s2-5', 'Resistivity of a material depends on', ['Length', 'Area', 'Nature of material and temperature', 'Current'], 2, 'Resistivity is a property of the material (and its temperature), not its size.'),
    ],
    cards: [
      card('sc2-1', "State Ohm's law as a formula.", 'V = IR'),
      card('sc2-2', 'Formula for power?', 'P = VI = I²R = V²/R'),
      card('sc2-3', 'Equivalent resistance in parallel?', '1/R = 1/R₁ + 1/R₂ + …'),
    ],
  }),
  chapter({
    id: 'sci-chem',
    subjectId: 'science',
    title: l('Chemical Reactions and Equations', 'रासायनिक अभिक्रियाएँ एवं समीकरण'),
    notes: [
      l(
        'A chemical equation shows reactants and products. It must be balanced so that the number of atoms of each element is equal on both sides, as mass is conserved in a reaction.',
        'रासायनिक समीकरण में अभिकारक और उत्पाद दिखाए जाते हैं। इसे संतुलित करना ज़रूरी है ताकि दोनों ओर प्रत्येक तत्व के परमाणु बराबर हों, क्योंकि अभिक्रिया में द्रव्यमान संरक्षित रहता है।',
      ),
      l('Types of reactions: combination, decomposition, displacement, double displacement, and oxidation–reduction (redox).'),
    ],
    definitions: [
      { term: l('Oxidation', 'ऑक्सीकरण'), meaning: l('Gain of oxygen or loss of hydrogen (also loss of electrons).', 'ऑक्सीजन का जुड़ना या हाइड्रोजन का निकलना।') },
      { term: l('Exothermic reaction', 'ऊष्माक्षेपी अभिक्रिया'), meaning: l('A reaction in which heat is released.', 'वह अभिक्रिया जिसमें ऊष्मा निकलती है।') },
    ],
    formulas: [
      { name: l('Combination', 'संयोजन'), expr: '2Mg + O₂ → 2MgO' },
      { name: l('Decomposition', 'वियोजन'), expr: 'CaCO₃ → CaO + CO₂ (on heating)' },
      { name: l('Displacement', 'विस्थापन'), expr: 'Fe + CuSO₄ → FeSO₄ + Cu' },
      { name: l('Double displacement', 'द्विविस्थापन'), expr: 'Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl' },
    ],
    keyPoints: [
      l('Always balance by changing coefficients, never subscripts.'),
      l('Rusting of iron and burning of fuels are oxidation reactions.'),
      l('Quicklime reacting with water is a highly exothermic reaction.'),
    ],
    important: [
      l('Balance: Fe + H₂O → Fe₃O₄ + H₂.'),
      l('What is the difference between displacement and double displacement reactions?'),
      l('Why should an equation be balanced?'),
    ],
    mcqs: [
      mcq('s3-1', '2Mg + O₂ → 2MgO is a', ['Decomposition reaction', 'Combination reaction', 'Displacement reaction', 'Double displacement reaction'], 1, 'Two substances combine to form one product.'),
      mcq('s3-2', 'Heating calcium carbonate is an example of', ['Combination', 'Decomposition', 'Displacement', 'Neutralisation'], 1, 'One compound breaks into simpler substances (CaO and CO₂).'),
      mcq('s3-3', 'Fe + CuSO₄ → FeSO₄ + Cu is a', ['Combination reaction', 'Displacement reaction', 'Decomposition reaction', 'Precipitation only'], 1, 'Iron is more reactive than copper and displaces it.'),
      mcq('s3-4', 'Rusting of iron is an example of', ['Reduction only', 'Oxidation', 'Physical change', 'Neutralisation'], 1, 'Iron reacts with oxygen and moisture to form hydrated iron oxide.'),
    ],
    cards: [
      card('sc3-1', 'Why balance a chemical equation?', 'To obey the law of conservation of mass.'),
      card('sc3-2', 'Example of a decomposition reaction?', 'CaCO₃ → CaO + CO₂'),
      card('sc3-3', 'What is an exothermic reaction?', 'A reaction that releases heat.'),
    ],
  }),
];

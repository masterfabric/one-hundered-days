enum AllergenType { big9, other }

class Allergen {
  const Allergen({
    required this.id,
    required this.name,
    required this.type,
    required this.prevalence,
    this.examples = const [],
  });

  final String id;
  final String name;
  final AllergenType type;
  final String prevalence;
  final List<String> examples;
}

const kBig9Allergens = [
  Allergen(
    id: 'a1',
    name: 'Milk',
    type: AllergenType.big9,
    prevalence: '2–3% of children under 3',
    examples: ['Cow milk', 'Butter', 'Cheese', 'Yogurt'],
  ),
  Allergen(
    id: 'a2',
    name: 'Egg',
    type: AllergenType.big9,
    prevalence: '1.3% of children',
    examples: ['Whole egg', 'Egg white', 'Egg yolk'],
  ),
  Allergen(
    id: 'a3',
    name: 'Peanut',
    type: AllergenType.big9,
    prevalence: '2% of children',
    examples: ['Peanut butter', 'Peanut oil', 'Mixed nuts'],
  ),
  Allergen(
    id: 'a4',
    name: 'Tree Nut',
    type: AllergenType.big9,
    prevalence: '1% of children',
    examples: ['Walnut', 'Almond', 'Cashew', 'Pistachio'],
  ),
  Allergen(
    id: 'a5',
    name: 'Wheat',
    type: AllergenType.big9,
    prevalence: '0.4% of children',
    examples: ['Bread', 'Pasta', 'Cereal', 'Crackers'],
  ),
  Allergen(
    id: 'a6',
    name: 'Soy',
    type: AllergenType.big9,
    prevalence: '0.4% of children',
    examples: ['Tofu', 'Soy milk', 'Edamame', 'Miso'],
  ),
  Allergen(
    id: 'a7',
    name: 'Fish',
    type: AllergenType.big9,
    prevalence: '0.6% of children',
    examples: ['Salmon', 'Tuna', 'Cod', 'Halibut'],
  ),
  Allergen(
    id: 'a8',
    name: 'Shellfish',
    type: AllergenType.big9,
    prevalence: '2% of population',
    examples: ['Shrimp', 'Crab', 'Lobster', 'Oyster'],
  ),
  Allergen(
    id: 'a9',
    name: 'Sesame',
    type: AllergenType.big9,
    prevalence: '0.1% of children',
    examples: ['Sesame oil', 'Tahini', 'Hummus', 'Sesame seeds'],
  ),
];

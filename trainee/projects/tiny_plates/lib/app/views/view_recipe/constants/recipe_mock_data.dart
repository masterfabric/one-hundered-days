import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';

// ─── Safety guardrail constants ───────────────────────────────────────────────

/// Ingredients always blocked regardless of profile (for < 12 months).
const kAlwaysBlockedIngredients = [
  'honey',
  'salt',
  'sugar',
  'whole nuts',
  'raw egg',
  'shellfish',
];

// ─── Mode 1: Ingredient-based mock recipes ────────────────────────────────────

const kMode1MockRecipes = <Recipe>[
  Recipe(
    id: 'm1_1',
    name: 'Carrot & Sweet Potato Purée',
    mode: RecipeGenerationMode.ingredientBased,
    ingredients: [
      RecipeIngredient(name: 'Carrot', amount: '1 medium'),
      RecipeIngredient(name: 'Sweet Potato', amount: '½ medium'),
    ],
    prepSteps: [
      PrepStep(
        order: 1,
        instruction: 'Peel and chop carrot and sweet potato into small cubes.',
        textureNote: 'Smaller pieces cook more evenly for smooth blending.',
      ),
      PrepStep(
        order: 2,
        instruction: 'Steam for 15 minutes until very tender.',
        textureNote: 'Steaming preserves more nutrients than boiling.',
      ),
      PrepStep(
        order: 3,
        instruction: 'Blend with a small amount of cooking water until smooth.',
        textureNote: 'For lumpy texture: mash with a fork instead of blending.',
      ),
    ],
    safetyCheck: SafetyCheckResult(passed: true),
    rationale:
        'Carrot and sweet potato are rich in beta-carotene and naturally sweet — ideal for first foods.',
    sensoryTips: [
      'Warm slightly before serving to enhance sweetness.',
      'Thin with breast milk or formula for a familiar taste.',
    ],
    targetNutrients: ['Vitamin A', 'Fibre'],
    estimatedCalories: 65,
    prepTimeMinutes: 20,
  ),
  Recipe(
    id: 'm1_2',
    name: 'Spinach & Potato Mash',
    mode: RecipeGenerationMode.ingredientBased,
    ingredients: [
      RecipeIngredient(name: 'Spinach', amount: '1 handful'),
      RecipeIngredient(name: 'Potato', amount: '1 small'),
    ],
    prepSteps: [
      PrepStep(
        order: 1,
        instruction: 'Peel and dice potato. Wash spinach thoroughly.',
      ),
      PrepStep(
        order: 2,
        instruction: 'Boil potato 12 minutes, add spinach for last 2 minutes.',
        textureNote: 'Do not overcook spinach — add at the very end.',
      ),
      PrepStep(
        order: 3,
        instruction: 'Drain and mash together with a fork.',
        textureNote:
            'For smoother texture: blend with a small amount of water.',
      ),
    ],
    safetyCheck: SafetyCheckResult(passed: true),
    rationale:
        'Spinach provides iron and folate. Potato adds energy and a mild flavour base.',
    sensoryTips: [
      'The green colour may be new — offer in small amounts first.',
      'Combine with a familiar food like sweet potato to ease introduction.',
    ],
    targetNutrients: ['Iron', 'Folate'],
    estimatedCalories: 80,
    prepTimeMinutes: 15,
  ),
  Recipe(
    id: 'm1_3',
    name: 'Banana & Avocado Blend',
    mode: RecipeGenerationMode.ingredientBased,
    ingredients: [
      RecipeIngredient(name: 'Banana', amount: '½ ripe'),
      RecipeIngredient(name: 'Avocado', amount: '¼ ripe'),
    ],
    prepSteps: [
      PrepStep(
        order: 1,
        instruction: 'Peel and mash banana and avocado together.',
        textureNote: 'Use very ripe fruits for easiest mashing.',
      ),
      PrepStep(
        order: 2,
        instruction: 'Mix until smooth. Serve immediately.',
        textureNote:
            'No cooking required. Add breast milk for thinner consistency.',
      ),
    ],
    safetyCheck: SafetyCheckResult(passed: true),
    rationale:
        'Avocado provides healthy fats essential for brain development. Banana adds natural sweetness and potassium.',
    sensoryTips: [
      'No-cook recipe — ideal for on-the-go.',
      'Avocado browns quickly; serve fresh.',
    ],
    targetNutrients: ['Healthy Fats', 'Potassium'],
    estimatedCalories: 120,
    prepTimeMinutes: 3,
  ),
  Recipe(
    id: 'm1_4',
    name: 'Lentil & Carrot Soup',
    mode: RecipeGenerationMode.ingredientBased,
    ingredients: [
      RecipeIngredient(name: 'Lentil', amount: '3 tbsp red lentils'),
      RecipeIngredient(name: 'Carrot', amount: '1 medium'),
    ],
    prepSteps: [
      PrepStep(
        order: 1,
        instruction: 'Rinse lentils thoroughly. Peel and dice carrot.',
      ),
      PrepStep(
        order: 2,
        instruction: 'Simmer lentils and carrot in water for 20 minutes.',
        textureNote: 'Lentils should be very soft and beginning to fall apart.',
      ),
      PrepStep(
        order: 3,
        instruction: 'Blend until smooth, adjusting consistency with water.',
      ),
    ],
    safetyCheck: SafetyCheckResult(passed: true),
    rationale:
        'Red lentils are an excellent plant-based iron source and pair naturally with carrot.',
    sensoryTips: [
      'Mild earthy flavour — introduce in small quantities.',
      'Can be combined with pumpkin for extra sweetness.',
    ],
    targetNutrients: ['Iron', 'Protein', 'Fibre'],
    estimatedCalories: 110,
    prepTimeMinutes: 25,
  ),
  Recipe(
    id: 'm1_5',
    name: 'Chicken & Rice Porridge',
    mode: RecipeGenerationMode.ingredientBased,
    ingredients: [
      RecipeIngredient(name: 'Chicken', amount: '30g boneless breast'),
      RecipeIngredient(name: 'Rice', amount: '2 tbsp'),
    ],
    prepSteps: [
      PrepStep(
        order: 1,
        instruction:
            'Cook rice and chicken together in water for 20 minutes.',
      ),
      PrepStep(
        order: 2,
        instruction:
            'Shred chicken finely and blend or mash with rice.',
        textureNote:
            'For older babies: leave rice slightly textured, shred chicken into tiny pieces.',
      ),
    ],
    safetyCheck: SafetyCheckResult(passed: true),
    rationale:
        'Chicken provides complete protein and zinc. Rice adds easily digestible carbohydrates.',
    sensoryTips: [
      'Neutral flavour is well accepted by most babies.',
      'Add a small amount of vegetable purée for extra nutrients.',
    ],
    targetNutrients: ['Protein', 'Zinc', 'B Vitamins'],
    estimatedCalories: 130,
    prepTimeMinutes: 25,
  ),
  Recipe(
    id: 'm1_6',
    name: 'Pumpkin & Oat Porridge',
    mode: RecipeGenerationMode.ingredientBased,
    ingredients: [
      RecipeIngredient(name: 'Pumpkin', amount: '3 tbsp cooked'),
      RecipeIngredient(name: 'Oat', amount: '2 tbsp rolled oats'),
    ],
    prepSteps: [
      PrepStep(
        order: 1,
        instruction: 'Cook oats in water until very soft, about 8 minutes.',
      ),
      PrepStep(
        order: 2,
        instruction: 'Stir in steamed pumpkin purée and mix well.',
        textureNote:
            'For smooth texture: blend briefly. For textured: mix without blending.',
      ),
    ],
    safetyCheck: SafetyCheckResult(passed: true),
    rationale:
        'Oats are an iron-fortified grain with slow-release energy. Pumpkin adds sweetness and vitamins.',
    sensoryTips: [
      'Creamy warm texture is usually well accepted.',
      'Can be made ahead and refrigerated for up to 24 hours.',
    ],
    targetNutrients: ['Iron', 'Fibre', 'Vitamin A'],
    estimatedCalories: 95,
    prepTimeMinutes: 12,
  ),
];

// ─── Mode 2: Proactive recommendation mock recipes ────────────────────────────

const kMode2MockRecipes = <Recipe>[
  Recipe(
    id: 'm2_1',
    name: 'Iron Boost: Beef & Pea Mash',
    mode: RecipeGenerationMode.proactiveRecommendation,
    ingredients: [
      RecipeIngredient(name: 'Beef (minced)', amount: '30g'),
      RecipeIngredient(name: 'Peas', amount: '2 tbsp'),
    ],
    prepSteps: [
      PrepStep(
        order: 1,
        instruction: 'Cook beef mince in a small pan until fully done.',
      ),
      PrepStep(
        order: 2,
        instruction: 'Steam peas 5 minutes until tender.',
      ),
      PrepStep(
        order: 3,
        instruction: 'Blend beef and peas together with a little water.',
        textureNote:
            'Beef can be coarse — blend well for younger babies.',
      ),
    ],
    safetyCheck: SafetyCheckResult(passed: true),
    rationale:
        'Haem iron from beef is the most bioavailable form. Peas provide vitamin C which enhances iron absorption.',
    sensoryTips: [
      'The strong savoury flavour may need gradual introduction.',
      'Pair with a familiar food to improve acceptance.',
    ],
    targetNutrients: ['Iron', 'Zinc', 'Protein'],
    estimatedCalories: 115,
    prepTimeMinutes: 15,
  ),
  Recipe(
    id: 'm2_2',
    name: 'Calcium Boost: Yogurt & Banana',
    mode: RecipeGenerationMode.proactiveRecommendation,
    ingredients: [
      RecipeIngredient(name: 'Yogurt (plain, full-fat)', amount: '3 tbsp'),
      RecipeIngredient(name: 'Banana', amount: '¼ ripe'),
    ],
    prepSteps: [
      PrepStep(
        order: 1,
        instruction: 'Mash banana until smooth.',
      ),
      PrepStep(
        order: 2,
        instruction: 'Stir banana into yogurt. Serve immediately.',
        textureNote: 'No cooking required. Natural creamy texture.',
      ),
    ],
    safetyCheck: SafetyCheckResult(passed: true),
    rationale:
        'Plain full-fat yogurt is the highest calcium food for babies. Banana provides potassium and natural sweetness.',
    sensoryTips: [
      'Cold yogurt — consider room temperature for first introduction.',
      'Creamy texture is usually very well accepted.',
    ],
    targetNutrients: ['Calcium', 'Probiotics', 'Potassium'],
    estimatedCalories: 85,
    prepTimeMinutes: 3,
  ),
  Recipe(
    id: 'm2_3',
    name: 'Protein Boost: Egg Yolk & Broccoli',
    mode: RecipeGenerationMode.proactiveRecommendation,
    ingredients: [
      RecipeIngredient(name: 'Egg (yolk only, hard boiled)', amount: '1'),
      RecipeIngredient(name: 'Broccoli', amount: '2 florets'),
    ],
    prepSteps: [
      PrepStep(
        order: 1,
        instruction: 'Hard boil egg for 10 minutes. Use yolk only.',
      ),
      PrepStep(
        order: 2,
        instruction: 'Steam broccoli 8 minutes until very tender.',
      ),
      PrepStep(
        order: 3,
        instruction:
            'Mash yolk with a fork, blend broccoli, combine together.',
        textureNote:
            'Egg yolk is naturally crumbly — add water or breast milk to bind.',
      ),
    ],
    safetyCheck: SafetyCheckResult(passed: true),
    rationale:
        'Egg yolk is dense in choline and protein, critical for brain development. Broccoli adds vitamin C and folate.',
    sensoryTips: [
      'Introduce egg yolk alone first before combining.',
      'Watch for reaction 72 hours after first introduction.',
    ],
    targetNutrients: ['Protein', 'Choline', 'Vitamin C'],
    estimatedCalories: 100,
    prepTimeMinutes: 15,
  ),
  Recipe(
    id: 'm2_4',
    name: 'Omega-3 Boost: Fish & Sweet Potato',
    mode: RecipeGenerationMode.proactiveRecommendation,
    ingredients: [
      RecipeIngredient(name: 'White fish (cod/salmon)', amount: '30g'),
      RecipeIngredient(name: 'Sweet Potato', amount: '½ medium'),
    ],
    prepSteps: [
      PrepStep(
        order: 1,
        instruction: 'Steam fish and sweet potato together 12 minutes.',
      ),
      PrepStep(
        order: 2,
        instruction:
            'Check fish carefully for any bones. Blend together until smooth.',
        textureNote:
            'Fish blends to a very smooth texture. Ideal for early textures.',
      ),
    ],
    safetyCheck: SafetyCheckResult(passed: true),
    rationale:
        'Oily fish provides DHA omega-3 essential for brain and eye development. Sweet potato balances the flavour.',
    sensoryTips: [
      'Fish has a distinct smell — introduce gradually.',
      'Salmon gives a pink tint which may visually interest some babies.',
    ],
    targetNutrients: ['Omega-3 DHA', 'Vitamin A', 'Iodine'],
    estimatedCalories: 105,
    prepTimeMinutes: 15,
  ),
  Recipe(
    id: 'm2_5',
    name: 'Vitamin D Boost: Salmon & Zucchini',
    mode: RecipeGenerationMode.proactiveRecommendation,
    ingredients: [
      RecipeIngredient(name: 'Salmon', amount: '30g skinless'),
      RecipeIngredient(name: 'Zucchini', amount: '¼ medium'),
    ],
    prepSteps: [
      PrepStep(
        order: 1,
        instruction: 'Steam salmon and zucchini together for 10–12 minutes.',
      ),
      PrepStep(
        order: 2,
        instruction:
            'Remove any remaining bones from salmon. Blend until smooth.',
      ),
    ],
    safetyCheck: SafetyCheckResult(passed: true),
    rationale:
        'Salmon is one of the best dietary sources of vitamin D for babies. Zucchini provides a mild, watery base.',
    sensoryTips: [
      'Mild flavour combination is easy to accept.',
      'Can be frozen in ice cube trays for quick future meals.',
    ],
    targetNutrients: ['Vitamin D', 'Omega-3', 'B12'],
    estimatedCalories: 90,
    prepTimeMinutes: 15,
  ),
  Recipe(
    id: 'm2_6',
    name: 'Energy Boost: Avocado & Quinoa',
    mode: RecipeGenerationMode.proactiveRecommendation,
    ingredients: [
      RecipeIngredient(name: 'Avocado', amount: '¼ ripe'),
      RecipeIngredient(name: 'Quinoa', amount: '2 tbsp cooked'),
    ],
    prepSteps: [
      PrepStep(
        order: 1,
        instruction: 'Cook quinoa in water 15 minutes. Let cool slightly.',
      ),
      PrepStep(
        order: 2,
        instruction: 'Mash avocado and stir into cooled quinoa.',
        textureNote:
            'Quinoa has small soft seeds — good for introducing texture.',
      ),
    ],
    safetyCheck: SafetyCheckResult(passed: true),
    rationale:
        'Avocado provides calorie-dense healthy fats. Quinoa is a complete protein with all essential amino acids.',
    sensoryTips: [
      'Dense calorie meal — good for babies needing energy boost.',
      'Avocado oxidises quickly; prepare fresh each time.',
    ],
    targetNutrients: ['Healthy Fats', 'Complete Protein', 'Magnesium'],
    estimatedCalories: 150,
    prepTimeMinutes: 18,
  ),
];

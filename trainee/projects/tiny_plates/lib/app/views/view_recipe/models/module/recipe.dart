enum RecipeGenerationMode { ingredientBased, proactiveRecommendation }

class RecipeIngredient {
  const RecipeIngredient({required this.name, required this.amount});
  final String name;
  final String amount;
}

class PrepStep {
  const PrepStep({
    required this.order,
    required this.instruction,
    this.textureNote = '',
  });
  final int order;
  final String instruction;
  final String textureNote;
}

class SafetyCheckResult {
  const SafetyCheckResult({required this.passed, this.reason = ''});
  final bool passed;
  final String reason;
}

class Recipe {
  const Recipe({
    required this.id,
    required this.name,
    required this.mode,
    required this.ingredients,
    required this.prepSteps,
    required this.safetyCheck,
    required this.rationale,
    required this.sensoryTips,
    required this.targetNutrients,
    required this.estimatedCalories,
    required this.prepTimeMinutes,
  });

  final String id;
  final String name;
  final RecipeGenerationMode mode;
  final List<RecipeIngredient> ingredients;
  final List<PrepStep> prepSteps;
  final SafetyCheckResult safetyCheck;

  /// AI rationale: why this recipe was suggested.
  final String rationale;
  final List<String> sensoryTips;

  /// e.g. ['Iron', 'Protein'] — nutrients this recipe targets.
  final List<String> targetNutrients;
  final int estimatedCalories;
  final int prepTimeMinutes;
}

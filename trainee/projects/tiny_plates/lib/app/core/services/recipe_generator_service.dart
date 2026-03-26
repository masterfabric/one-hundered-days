import 'package:tiny_plates/app/views/view_pantry/models/module/ingredient.dart';
import 'package:tiny_plates/app/views/view_recipe/constants/recipe_mock_data.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';
import 'package:tiny_plates/app/views/view_user_profile/models/module/child_profile.dart';

/// Orchestrates recipe generation for both Mode 1 and Mode 2.
///
/// - [Safety Guardrail]: Filters out allergens and age-unsafe ingredients.
/// - [3-Day Rule]: Blocks recently introduced foods (< 3 days).
/// - [Texture Adaptation]: Adjusts prep step notes to child's texture level.
class RecipeGeneratorService {
  // ─── Safety Guardrail ─────────────────────────────────────────────────────

  /// Returns true if the recipe passes the safety guardrail for the given profile.
  SafetyCheckResult runSafetyGuardrail({
    required Recipe recipe,
    required ChildProfile profile,
  }) {
    final blockedNames = [
      ...kAlwaysBlockedIngredients,
      ...profile.allergies.map((a) => a.toLowerCase()),
    ];

    for (final ingredient in recipe.ingredients) {
      final name = ingredient.name.toLowerCase();
      for (final blocked in blockedNames) {
        if (name.contains(blocked)) {
          return SafetyCheckResult(
            passed: false,
            reason: '${ingredient.name} is not safe for this child\'s profile.',
          );
        }
      }
    }
    return const SafetyCheckResult(passed: true);
  }

  // ─── 3-Day Rule ───────────────────────────────────────────────────────────

  /// Returns true if any ingredient in [recipe] was introduced within the last 3 days.
  bool isBlockedByThreeDayRule({
    required Recipe recipe,
    required List<String> recentlyIntroducedFoods,
  }) {
    final recipeIngredientNames =
        recipe.ingredients.map((i) => i.name.toLowerCase()).toSet();
    return recentlyIntroducedFoods.any(
      (food) => recipeIngredientNames.contains(food.toLowerCase()),
    );
  }

  // ─── Texture Adaptation ───────────────────────────────────────────────────

  /// Returns the adapted sensory tip based on the child's texture tolerance.
  String textureAdaptationNote(TextureToleranceLevel level) {
    return switch (level) {
      TextureToleranceLevel.smooth =>
        'Blend all ingredients until completely smooth with no lumps.',
      TextureToleranceLevel.mashed =>
        'Mash ingredients well with a fork — some small soft pieces are fine.',
      TextureToleranceLevel.lumpy =>
        'Mash lightly — small soft lumps help develop chewing skills.',
      TextureToleranceLevel.chopped =>
        'Chop ingredients into small soft pieces instead of blending.',
      TextureToleranceLevel.solid =>
        'Serve as soft finger food pieces sized for self-feeding.',
    };
  }

  // ─── Mode 1: Ingredient-based generation ─────────────────────────────────

  /// Generates safe recipes using only ingredients from the user's pantry selection.
  List<Recipe> generateMode1Recipes({
    required List<Ingredient> selectedIngredients,
    required ChildProfile profile,
    List<String> recentlyIntroducedFoods = const [],
  }) {
    if (selectedIngredients.isEmpty) return [];

    final selectedNames =
        selectedIngredients.map((i) => i.name.toLowerCase()).toSet();

    return kMode1MockRecipes.where((recipe) {
      // Must contain at least one selected ingredient
      final hasMatch = recipe.ingredients.any(
        (ri) => selectedNames.contains(ri.name.toLowerCase()),
      );
      if (!hasMatch) { return false; }

      // Safety guardrail
      final safety = runSafetyGuardrail(recipe: recipe, profile: profile);
      if (!safety.passed) { return false; }

      // 3-Day Rule
      if (isBlockedByThreeDayRule(
        recipe: recipe,
        recentlyIntroducedFoods: recentlyIntroducedFoods,
      )) return false;

      return true;
    }).toList();
  }

  // ─── Mode 2: Proactive recommendation ────────────────────────────────────

  /// Generates goal-oriented recipes to fill nutritional gaps.
  List<Recipe> generateMode2Recipes({
    required ChildProfile profile,
    List<String> priorityNutrients = const [],
    List<String> recentlyIntroducedFoods = const [],
  }) {
    return kMode2MockRecipes.where((recipe) {
      // Safety guardrail
      final safety = runSafetyGuardrail(recipe: recipe, profile: profile);
      if (!safety.passed) { return false; }

      // 3-Day Rule
      if (isBlockedByThreeDayRule(
        recipe: recipe,
        recentlyIntroducedFoods: recentlyIntroducedFoods,
      )) { return false; }

      return true;
    }).toList();
  }
}

import 'package:tiny_plates/app/views/view_pantry/models/module/pantry_item.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe_nutrient_info.dart';

enum RecipeStatus { initial, loading, loaded, error }

class RecipeState {
  const RecipeState({
    this.status = RecipeStatus.initial,
    this.mode = RecipeGenerationMode.ingredientBased,
    this.recipes = const [],
    this.pantryItems = const [],
    this.selectedIngredientIds = const [],
    this.currentIntake = const DailyNutrientIntake(),
    this.nutrientTargets = const DailyNutrientTargets(),
    this.errorMessage,
    // Config-driven UI controls
    this.showModeSelector = true,
    this.maxRecipesShown = 6,
  });

  final RecipeStatus status;
  final RecipeGenerationMode mode;
  final List<Recipe> recipes;
  final List<PantryItem> pantryItems;
  final List<String> selectedIngredientIds;
  final DailyNutrientIntake currentIntake;
  final DailyNutrientTargets nutrientTargets;
  final String? errorMessage;

  /// Driven by app_config recipe_configuration.show_mode_selector
  final bool showModeSelector;

  /// Driven by app_config recipe_configuration.max_recipes_shown
  final int maxRecipesShown;

  RecipeState copyWith({
    RecipeStatus? status,
    RecipeGenerationMode? mode,
    List<Recipe>? recipes,
    List<PantryItem>? pantryItems,
    List<String>? selectedIngredientIds,
    DailyNutrientIntake? currentIntake,
    DailyNutrientTargets? nutrientTargets,
    String? errorMessage,
    bool? showModeSelector,
    int? maxRecipesShown,
  }) {
    return RecipeState(
      status: status ?? this.status,
      mode: mode ?? this.mode,
      recipes: recipes ?? this.recipes,
      pantryItems: pantryItems ?? this.pantryItems,
      selectedIngredientIds:
          selectedIngredientIds ?? this.selectedIngredientIds,
      currentIntake: currentIntake ?? this.currentIntake,
      nutrientTargets: nutrientTargets ?? this.nutrientTargets,
      errorMessage: errorMessage,
      showModeSelector: showModeSelector ?? this.showModeSelector,
      maxRecipesShown: maxRecipesShown ?? this.maxRecipesShown,
    );
  }

  // Recipe results are not persisted — only the selected mode is.
  Map<String, dynamic> toJson() => {
        'mode': mode.name,
      };

  factory RecipeState.fromJson(Map<String, dynamic> json) => RecipeState(
        mode: RecipeGenerationMode.values.firstWhere(
          (e) => e.name == json['mode'],
          orElse: () => RecipeGenerationMode.ingredientBased,
        ),
      );
}

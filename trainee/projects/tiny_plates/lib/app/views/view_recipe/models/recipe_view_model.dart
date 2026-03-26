import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';
import 'package:masterfabric_core/masterfabric_core.dart';
import 'package:tiny_plates/app/core/services/recipe_generator_service.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/allergy_tracker_view_model.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/module/allergy_tracker_state.dart';
import 'package:tiny_plates/app/views/view_pantry/models/pantry_view_model.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe_state.dart';
import 'package:tiny_plates/app/views/view_user_profile/models/module/child_profile.dart';
import 'package:tiny_plates/app/views/view_user_profile/models/module/user_profile_state.dart';
import 'package:tiny_plates/app/views/view_user_profile/models/user_profile_view_model.dart';

@injectable
class RecipeViewModel extends BaseViewModelHydratedCubit<RecipeState> {
  RecipeViewModel() : super(const RecipeState());

  final _service = RecipeGeneratorService();

  void initialize() {
    final configHelper = AssetConfigHelper();
    final config =
        configHelper.getAllConfig()?['recipe_configuration'] as Map<String, dynamic>?;
    final showModeSelector = config?['show_mode_selector'] as bool? ?? true;
    final maxRecipesShown = config?['max_recipes_shown'] as int? ?? 6;

    // Read pantry items from hydrated PantryViewModel
    final pantryVm = GetIt.instance.get<PantryViewModel>();
    final pantryItems = pantryVm.state.pantryItems;

    stateChanger(state.copyWith(
      status: RecipeStatus.loaded,
      pantryItems: pantryItems,
      showModeSelector: showModeSelector,
      maxRecipesShown: maxRecipesShown,
    ));
  }

  // ─── Mode selection ───────────────────────────────────────────────────────

  void setMode(RecipeGenerationMode mode) {
    stateChanger(state.copyWith(
      mode: mode,
      recipes: [],
      selectedIngredientIds: [],
    ));
  }

  // ─── Ingredient selection (Mode 1) ────────────────────────────────────────

  void toggleIngredient(String ingredientId) {
    final updated = List<String>.from(state.selectedIngredientIds);
    if (updated.contains(ingredientId)) {
      updated.remove(ingredientId);
    } else {
      updated.add(ingredientId);
    }
    stateChanger(state.copyWith(selectedIngredientIds: updated));
  }

  // ─── Recipe generation ────────────────────────────────────────────────────

  void generateRecipes() {
    stateChanger(state.copyWith(status: RecipeStatus.loading, recipes: []));

    final profile = _getChildProfile();
    final recentFoods = _getRecentlyIntroducedFoods();

    List<Recipe> recipes;

    if (state.mode == RecipeGenerationMode.ingredientBased) {
      final selectedIngredients = state.pantryItems
          .where((item) =>
              state.selectedIngredientIds.contains(item.ingredient.id))
          .map((item) => item.ingredient)
          .toList();

      recipes = _service.generateMode1Recipes(
        selectedIngredients: selectedIngredients,
        profile: profile,
        recentlyIntroducedFoods: recentFoods,
      );
    } else {
      recipes = _service.generateMode2Recipes(
        profile: profile,
        recentlyIntroducedFoods: recentFoods,
      );
    }

    stateChanger(state.copyWith(
      status: RecipeStatus.loaded,
      recipes: recipes.take(state.maxRecipesShown).toList(),
    ));
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  ChildProfile _getChildProfile() {
    try {
      final profileVm = GetIt.instance.get<UserProfileViewModel>();
      final profileState = profileVm.state;
      if (profileState is UserProfileSavedState) return profileState.profile;
      if (profileState is UserProfileStepState) return profileState.profile;
    } catch (_) {}
    return ChildProfile.empty();
  }

  /// Returns food names introduced within the last 3 days.
  List<String> _getRecentlyIntroducedFoods() {
    try {
      final allergyVm = GetIt.instance.get<AllergyTrackerViewModel>();
      final allergyState = allergyVm.state;
      if (allergyState is AllergyTrackerLoadedState) {
        final threeDaysAgo =
            DateTime.now().subtract(const Duration(days: 3));
        return allergyState.introductions
            .where((intro) => intro.dateIntroduced.isAfter(threeDaysAgo))
            .map((intro) => intro.foodName)
            .toList();
      }
    } catch (_) {}
    return [];
  }

  // ─── Hydration ────────────────────────────────────────────────────────────

  @override
  RecipeState? fromJson(Map<String, dynamic> json) {
    try {
      return RecipeState.fromJson(json);
    } catch (_) {
      return null;
    }
  }

  @override
  Map<String, dynamic>? toJson(RecipeState state) => state.toJson();
}

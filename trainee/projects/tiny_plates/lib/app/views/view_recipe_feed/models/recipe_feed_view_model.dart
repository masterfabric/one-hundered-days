import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';
import 'package:masterfabric_core/masterfabric_core.dart';
import 'package:tiny_plates/app/core/services/recipe_generator_service.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/allergy_tracker_view_model.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/module/allergy_tracker_state.dart';
import 'package:tiny_plates/app/views/view_pantry/models/pantry_view_model.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';
import 'package:tiny_plates/app/views/view_recipe_feed/constants/recipe_feed_config.dart';
import 'package:tiny_plates/app/views/view_recipe_feed/models/module/recipe_feed_item.dart';
import 'package:tiny_plates/app/views/view_recipe_feed/models/module/recipe_feed_state.dart';
import 'package:tiny_plates/app/views/view_user_profile/models/module/child_profile.dart';
import 'package:tiny_plates/app/views/view_user_profile/models/module/user_profile_state.dart';
import 'package:tiny_plates/app/views/view_user_profile/models/user_profile_view_model.dart';

@injectable
class RecipeFeedViewModel
    extends BaseViewModelHydratedCubit<RecipeFeedState> {
  RecipeFeedViewModel() : super(RecipeFeedInitialState());

  final _service = RecipeGeneratorService();

  // ─── Public API ───────────────────────────────────────────────────────────

  void initialize() {
    final config = RecipeFeedConfig.fromMap(
      AssetConfigHelper().getAllConfig()?['recipe_feed_configuration']
          as Map<String, dynamic>?,
    );
    loadFeed(config: config);
  }

  void loadFeed({RecipeFeedConfig? config}) {
    final effectiveConfig = config ??
        (_loadedConfig() ?? const RecipeFeedConfig());

    emit(RecipeFeedLoadingState());

    final profile = _getChildProfile();
    final recentFoods = _getRecentlyIntroducedFoods();
    final pantryItems =
        GetIt.instance.get<PantryViewModel>().state.pantryItems;

    final allRecipes = <Recipe>[];

    if (pantryItems.isNotEmpty) {
      final ingredients = pantryItems.map((i) => i.ingredient).toList();
      allRecipes.addAll(_service.generateMode1Recipes(
        selectedIngredients: ingredients,
        profile: profile,
        recentlyIntroducedFoods: recentFoods,
      ));
    }

    allRecipes.addAll(_service.generateMode2Recipes(
      profile: profile,
      recentlyIntroducedFoods: recentFoods,
    ));

    final seen = <String>{};
    final pantryNames = pantryItems
        .map((i) => i.ingredient.name.toLowerCase())
        .toSet();

    final feedItems = allRecipes
        .where((r) => seen.add(r.id))
        .map((recipe) => _buildFeedItem(
              recipe: recipe,
              pantryIngredientNames: pantryNames,
              ageMonths: profile.ageMonths,
            ))
        .toList()
      ..sort((a, b) => b.matchScore.compareTo(a.matchScore));

    emit(RecipeFeedLoadedState(
      feedItems: feedItems.take(effectiveConfig.maxFeedItems).toList(),
      config: effectiveConfig,
    ));
  }

  // ─── Feed item builder ────────────────────────────────────────────────────

  RecipeFeedItem _buildFeedItem({
    required Recipe recipe,
    required Set<String> pantryIngredientNames,
    required int ageMonths,
  }) {
    final totalIngredients = recipe.ingredients.length;
    final availableCount = recipe.ingredients
        .where((i) => pantryIngredientNames.contains(i.name.toLowerCase()))
        .length;

    final matchScore = totalIngredients > 0
        ? availableCount / totalIngredients
        : 0.5;

    final matchLabel =
        recipe.mode == RecipeGenerationMode.ingredientBased &&
                totalIngredients > 0
            ? '$availableCount/$totalIngredients ingredients available'
            : recipe.targetNutrients.take(3).join(' · ');

    final suitabilityNote =
        _buildSuitabilityNote(recipe: recipe, ageMonths: ageMonths);

    final hasSensoryAdaptation =
        recipe.prepSteps.any((s) => s.textureNote.isNotEmpty);

    return RecipeFeedItem(
      recipe: recipe,
      matchScore: matchScore,
      matchLabel: matchLabel,
      suitabilityNote: suitabilityNote,
      hasSensoryAdaptation: hasSensoryAdaptation,
    );
  }

  String _buildSuitabilityNote({
    required Recipe recipe,
    required int ageMonths,
  }) {
    final agePart =
        ageMonths > 0 ? 'Perfect for $ageMonths-month-old' : 'Baby-safe recipe';
    if (recipe.targetNutrients.isEmpty) return agePart;
    final nutrientPart =
        'fills ${recipe.targetNutrients.first.toLowerCase()} gap';
    return '$agePart, $nutrientPart';
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  /// Returns the config used by the current loaded state, or null.
  RecipeFeedConfig? _loadedConfig() {
    final s = state;
    return s is RecipeFeedLoadedState ? s.config : null;
  }

  ChildProfile _getChildProfile() {
    try {
      final vm = GetIt.instance.get<UserProfileViewModel>();
      final s = vm.state;
      if (s is UserProfileSavedState) return s.profile;
      if (s is UserProfileStepState) return s.profile;
    } catch (_) {}
    return ChildProfile.empty();
  }

  List<String> _getRecentlyIntroducedFoods() {
    try {
      final vm = GetIt.instance.get<AllergyTrackerViewModel>();
      final s = vm.state;
      if (s is AllergyTrackerLoadedState) {
        final cutoff = DateTime.now().subtract(const Duration(days: 3));
        return s.introductions
            .where((i) => i.dateIntroduced.isAfter(cutoff))
            .map((i) => i.foodName)
            .toList();
      }
    } catch (_) {}
    return [];
  }

  // ─── Hydration ────────────────────────────────────────────────────────────

  @override
  RecipeFeedState? fromJson(Map<String, dynamic> json) =>
      RecipeFeedInitialState();

  @override
  Map<String, dynamic>? toJson(RecipeFeedState state) {
    if (state is RecipeFeedLoadedState) {
      return {'cachedItemCount': state.feedItems.length};
    }
    return null;
  }
}

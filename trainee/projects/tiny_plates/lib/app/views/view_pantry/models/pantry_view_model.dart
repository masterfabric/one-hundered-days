import 'package:injectable/injectable.dart';
import 'package:masterfabric_core/masterfabric_core.dart';
import 'package:tiny_plates/app/views/view_pantry/constants/pantry_mock_ingredients.dart';
import 'package:tiny_plates/app/views/view_pantry/models/module/ingredient.dart';
import 'package:tiny_plates/app/views/view_pantry/models/module/pantry_item.dart';
import 'package:tiny_plates/app/views/view_pantry/models/module/pantry_state.dart';

// ─── PantryViewModel ─────────────────────────────────────────────────────────

@injectable
class PantryViewModel extends BaseViewModelHydratedCubit<PantryState> {
  PantryViewModel() : super(const PantryState());

  void initialize() {
    final configHelper = AssetConfigHelper();
    final config = configHelper.getAllConfig()?['pantry_configuration'] as Map<String, dynamic>?;
    final searchEnabled = config?['search_enabled'] as bool? ?? true;
    final showEmptyBanner = config?['show_empty_banner'] as bool? ?? true;

    stateChanger(state.copyWith(
      status: PantryStatus.loaded,
      searchResults: kMockIngredients,
      searchEnabled: searchEnabled,
      showEmptyBanner: showEmptyBanner,
    ));
  }

  // ─── Search ──────────────────────────────────────────────────────────────

  void search(String query) {
    final results = query.isEmpty
        ? kMockIngredients
        : kMockIngredients
            .where((i) => i.name.toLowerCase().contains(query.toLowerCase()))
            .toList();

    stateChanger(state.copyWith(
      searchQuery: query,
      searchResults: results,
    ));
  }

  // ─── Pantry operations ────────────────────────────────────────────────────

  bool isAdded(String ingredientId) =>
      state.pantryItems.any((item) => item.ingredient.id == ingredientId);

  void addIngredient(Ingredient ingredient) {
    if (isAdded(ingredient.id)) return;
    final updated = List<PantryItem>.from(state.pantryItems)
      ..add(PantryItem(
        id: '${DateTime.now().millisecondsSinceEpoch}',
        ingredient: ingredient,
      ));
    stateChanger(state.copyWith(pantryItems: updated));
  }

  void removeItem(String itemId) {
    final updated = state.pantryItems.where((item) => item.id != itemId).toList();
    stateChanger(state.copyWith(pantryItems: updated));
  }

  // ─── Hydration ────────────────────────────────────────────────────────────

  @override
  PantryState? fromJson(Map<String, dynamic> json) {
    try {
      return PantryState.fromJson(json).copyWith(
        searchResults: kMockIngredients,
      );
    } catch (_) {
      return null;
    }
  }

  @override
  Map<String, dynamic>? toJson(PantryState state) => state.toJson();
}

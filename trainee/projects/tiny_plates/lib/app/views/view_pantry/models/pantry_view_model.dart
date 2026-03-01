import 'package:injectable/injectable.dart';
import 'package:masterfabric_core/masterfabric_core.dart';
import 'package:tiny_plates/app/views/view_pantry/models/module/ingredient.dart';
import 'package:tiny_plates/app/views/view_pantry/models/module/pantry_item.dart';
import 'package:tiny_plates/app/views/view_pantry/models/module/pantry_state.dart';

// ─── Mock ingredient data ────────────────────────────────────────────────────

const _kMockIngredients = [
  // Vegetables
  Ingredient(id: 'v1', name: 'Carrot', category: IngredientCategory.vegetables),
  Ingredient(id: 'v2', name: 'Potato', category: IngredientCategory.vegetables),
  Ingredient(id: 'v3', name: 'Spinach', category: IngredientCategory.vegetables),
  Ingredient(id: 'v4', name: 'Broccoli', category: IngredientCategory.vegetables),
  Ingredient(id: 'v5', name: 'Peas', category: IngredientCategory.vegetables),
  Ingredient(id: 'v6', name: 'Zucchini', category: IngredientCategory.vegetables),
  Ingredient(id: 'v7', name: 'Sweet Potato', category: IngredientCategory.vegetables),
  Ingredient(id: 'v8', name: 'Pumpkin', category: IngredientCategory.vegetables),
  Ingredient(id: 'v9', name: 'Tomato', category: IngredientCategory.vegetables),
  Ingredient(id: 'v10', name: 'Cucumber', category: IngredientCategory.vegetables),
  // Fruits
  Ingredient(id: 'f1', name: 'Apple', category: IngredientCategory.fruits),
  Ingredient(id: 'f2', name: 'Banana', category: IngredientCategory.fruits),
  Ingredient(id: 'f3', name: 'Pear', category: IngredientCategory.fruits),
  Ingredient(id: 'f4', name: 'Mango', category: IngredientCategory.fruits),
  Ingredient(id: 'f5', name: 'Peach', category: IngredientCategory.fruits),
  Ingredient(id: 'f6', name: 'Avocado', category: IngredientCategory.fruits),
  Ingredient(id: 'f7', name: 'Strawberry', category: IngredientCategory.fruits),
  Ingredient(id: 'f8', name: 'Blueberry', category: IngredientCategory.fruits),
  Ingredient(id: 'f9', name: 'Watermelon', category: IngredientCategory.fruits),
  // Grains
  Ingredient(id: 'g1', name: 'Rice', category: IngredientCategory.grains),
  Ingredient(id: 'g2', name: 'Oat', category: IngredientCategory.grains),
  Ingredient(id: 'g3', name: 'Pasta', category: IngredientCategory.grains),
  Ingredient(id: 'g4', name: 'Bread', category: IngredientCategory.grains),
  Ingredient(id: 'g5', name: 'Corn', category: IngredientCategory.grains),
  Ingredient(id: 'g6', name: 'Quinoa', category: IngredientCategory.grains),
  // Proteins
  Ingredient(id: 'p1', name: 'Chicken', category: IngredientCategory.proteins),
  Ingredient(id: 'p2', name: 'Beef', category: IngredientCategory.proteins),
  Ingredient(id: 'p3', name: 'Fish', category: IngredientCategory.proteins),
  Ingredient(id: 'p4', name: 'Lentil', category: IngredientCategory.proteins),
  Ingredient(id: 'p5', name: 'Egg', category: IngredientCategory.proteins),
  Ingredient(id: 'p6', name: 'Tofu', category: IngredientCategory.proteins),
  Ingredient(id: 'p7', name: 'Yogurt', category: IngredientCategory.proteins),
  Ingredient(id: 'p8', name: 'Cheese', category: IngredientCategory.proteins),
];

// ─── PantryViewModel ─────────────────────────────────────────────────────────

@injectable
class PantryViewModel extends BaseViewModelHydratedCubit<PantryState> {
  PantryViewModel() : super(PantryInitialState());

  final List<PantryItem> _pantryItems = [];
  String _searchQuery = '';

  void initialize() {
    _emitLoaded();
  }

  // ─── Search ──────────────────────────────────────────────────────────────

  void search(String query) {
    _searchQuery = query;
    _emitLoaded();
  }

  List<Ingredient> _filteredIngredients() {
    if (_searchQuery.isEmpty) return _kMockIngredients;
    final q = _searchQuery.toLowerCase();
    return _kMockIngredients.where((i) => i.name.toLowerCase().contains(q)).toList();
  }

  // ─── Pantry operations ────────────────────────────────────────────────────

  bool isAdded(String ingredientId) =>
      _pantryItems.any((item) => item.ingredient.id == ingredientId);

  void addIngredient(Ingredient ingredient) {
    if (isAdded(ingredient.id)) return;
    _pantryItems.add(PantryItem(
      id: '${DateTime.now().millisecondsSinceEpoch}',
      ingredient: ingredient,
    ));
    _emitLoaded();
  }

  void removeItem(String itemId) {
    _pantryItems.removeWhere((item) => item.id == itemId);
    _emitLoaded();
  }

  void _emitLoaded() {
    emit(PantryLoadedState(
      pantryItems: List.from(_pantryItems),
      searchQuery: _searchQuery,
      searchResults: _filteredIngredients(),
    ));
  }

  // ─── Hydration ────────────────────────────────────────────────────────────

  @override
  PantryState? fromJson(Map<String, dynamic> json) {
    try {
      _pantryItems.clear();
      final items = json['pantryItems'] as List? ?? [];
      _pantryItems.addAll(
        items.map((e) => PantryItem.fromJson(e as Map<String, dynamic>)),
      );
      _searchQuery = '';
      return PantryLoadedState(
        pantryItems: List.from(_pantryItems),
        searchQuery: '',
        searchResults: _kMockIngredients,
      );
    } catch (_) {
      return null;
    }
  }

  @override
  Map<String, dynamic>? toJson(PantryState state) {
    if (state is PantryLoadedState) {
      return {
        'pantryItems':
            state.pantryItems.map((item) => item.toJson()).toList(),
      };
    }
    return null;
  }
}

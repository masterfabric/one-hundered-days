import 'package:tiny_plates/app/views/view_pantry/models/module/ingredient.dart';
import 'package:tiny_plates/app/views/view_pantry/models/module/pantry_item.dart';

abstract class PantryState {}

class PantryInitialState extends PantryState {}

class PantryLoadedState extends PantryState {
  PantryLoadedState({
    required this.pantryItems,
    required this.searchQuery,
    required this.searchResults,
  });

  final List<PantryItem> pantryItems;
  final String searchQuery;
  final List<Ingredient> searchResults;
}

import 'package:tiny_plates/app/views/view_pantry/models/module/ingredient.dart';
import 'package:tiny_plates/app/views/view_pantry/models/module/pantry_item.dart';

enum PantryStatus { initial, loaded }

class PantryState {
  const PantryState({
    this.status = PantryStatus.initial,
    this.pantryItems = const [],
    this.searchQuery = '',
    this.searchResults = const [],
    this.searchEnabled = true,
    this.showEmptyBanner = true,
  });

  final PantryStatus status;
  final List<PantryItem> pantryItems;
  final String searchQuery;
  final List<Ingredient> searchResults;

  /// Driven by app_config pantry_configuration.search_enabled
  final bool searchEnabled;

  /// Driven by app_config pantry_configuration.show_empty_banner
  final bool showEmptyBanner;

  PantryState copyWith({
    PantryStatus? status,
    List<PantryItem>? pantryItems,
    String? searchQuery,
    List<Ingredient>? searchResults,
    bool? searchEnabled,
    bool? showEmptyBanner,
  }) {
    return PantryState(
      status: status ?? this.status,
      pantryItems: pantryItems ?? this.pantryItems,
      searchQuery: searchQuery ?? this.searchQuery,
      searchResults: searchResults ?? this.searchResults,
      searchEnabled: searchEnabled ?? this.searchEnabled,
      showEmptyBanner: showEmptyBanner ?? this.showEmptyBanner,
    );
  }

  Map<String, dynamic> toJson() => {
        'pantryItems': pantryItems.map((item) => item.toJson()).toList(),
      };

  factory PantryState.fromJson(Map<String, dynamic> json) {
    final items = json['pantryItems'] as List? ?? [];
    return PantryState(
      status: PantryStatus.loaded,
      pantryItems:
          items.map((e) => PantryItem.fromJson(e as Map<String, dynamic>)).toList(),
      searchQuery: '',
      searchResults: const [],
    );
  }
}

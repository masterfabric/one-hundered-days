import 'package:tiny_plates/app/views/view_pantry/models/module/ingredient.dart';

class PantryItem {
  const PantryItem({
    required this.id,
    required this.ingredient,
    this.quantity = '',
  });

  final String id;
  final Ingredient ingredient;
  final String quantity;

  PantryItem copyWith({String? quantity}) => PantryItem(
        id: id,
        ingredient: ingredient,
        quantity: quantity ?? this.quantity,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'ingredient': ingredient.toJson(),
        'quantity': quantity,
      };

  factory PantryItem.fromJson(Map<String, dynamic> json) => PantryItem(
        id: json['id'] as String,
        ingredient: Ingredient.fromJson(
          json['ingredient'] as Map<String, dynamic>,
        ),
        quantity: (json['quantity'] as String?) ?? '',
      );
}

enum IngredientCategory { vegetables, fruits, grains, proteins }

class Ingredient {
  const Ingredient({
    required this.id,
    required this.name,
    required this.category,
  });

  final String id;
  final String name;
  final IngredientCategory category;

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'category': category.name,
      };

  factory Ingredient.fromJson(Map<String, dynamic> json) => Ingredient(
        id: json['id'] as String,
        name: json['name'] as String,
        category: IngredientCategory.values.firstWhere(
          (e) => e.name == json['category'],
          orElse: () => IngredientCategory.vegetables,
        ),
      );
}

import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';

/// A wrapper around [Recipe] enriched with computed metadata for the feed UI.
class RecipeFeedItem {
  const RecipeFeedItem({
    required this.recipe,
    required this.matchScore,
    required this.matchLabel,
    required this.suitabilityNote,
    this.hasSensoryAdaptation = false,
  });

  final Recipe recipe;

  /// 0.0–1.0 indicating how well the recipe matches the user's context.
  final double matchScore;

  /// e.g. "4/5 ingredients available" or "Iron · Protein · Calcium"
  final String matchLabel;

  /// e.g. "Perfect for 8-month-old, fills protein gap"
  final String suitabilityNote;

  /// True when texture adaptation notes are present in any prep step.
  final bool hasSensoryAdaptation;

  Map<String, dynamic> toJson() => {
        'recipeId': recipe.id,
        'matchScore': matchScore,
        'matchLabel': matchLabel,
        'suitabilityNote': suitabilityNote,
        'hasSensoryAdaptation': hasSensoryAdaptation,
      };
}

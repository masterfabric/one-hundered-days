/// App-Config-driven UI controls for the Recipe Feed screen.
///
/// Values are read from `recipe_feed_configuration` in `app_config.json`
/// via [AssetConfigHelper] and passed into [RecipeFeedLoadedState].
/// All page-level toggles live here — never hardcoded in widgets.
class RecipeFeedConfig {
  const RecipeFeedConfig({
    this.showMatchScore = true,
    this.showSensoryBadge = true,
    this.maxFeedItems = 10,
  });

  /// Whether to render the "X/Y ingredients available" match-score row.
  final bool showMatchScore;

  /// Whether to render the sensory-adaptation badge on a card.
  final bool showSensoryBadge;

  /// Maximum number of feed cards to display after deduplication.
  final int maxFeedItems;

  factory RecipeFeedConfig.fromMap(Map<String, dynamic>? map) =>
      RecipeFeedConfig(
        showMatchScore: map?['show_match_score'] as bool? ?? true,
        showSensoryBadge: map?['show_sensory_badge'] as bool? ?? true,
        maxFeedItems: map?['max_feed_items'] as int? ?? 10,
      );
}

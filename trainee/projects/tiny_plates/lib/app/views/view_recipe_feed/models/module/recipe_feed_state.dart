import 'package:tiny_plates/app/views/view_recipe_feed/constants/recipe_feed_config.dart';
import 'package:tiny_plates/app/views/view_recipe_feed/models/module/recipe_feed_item.dart';

/// Base state for the Recipe Feed screen.
abstract class RecipeFeedState {}

/// Emitted before [initialize] is called.
class RecipeFeedInitialState extends RecipeFeedState {}

/// Emitted while recipes are being generated.
class RecipeFeedLoadingState extends RecipeFeedState {}

/// Emitted when the feed is ready to display.
class RecipeFeedLoadedState extends RecipeFeedState {
  RecipeFeedLoadedState({
    required this.feedItems,
    required this.config,
  });

  final List<RecipeFeedItem> feedItems;

  /// App-Config-driven UI controls (show_match_score, show_sensory_badge, …).
  final RecipeFeedConfig config;
}

/// Emitted when recipe generation fails unexpectedly.
class RecipeFeedErrorState extends RecipeFeedState {
  RecipeFeedErrorState({required this.message});
  final String message;
}

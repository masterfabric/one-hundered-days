import 'package:flutter/material.dart';
import 'package:osmea_components/osmea_components.dart';
import 'package:tiny_plates/app/views/view_recipe_feed/models/module/recipe_feed_state.dart';
import 'package:tiny_plates/app/views/view_recipe_feed/models/recipe_feed_view_model.dart';
import 'package:tiny_plates/app/views/view_recipe_feed/widgets/recipe_feed_card.dart';
import 'package:tiny_plates/gen/strings.g.dart';

// ─── RecipeFeedContent ────────────────────────────────────────────────────────

class RecipeFeedContent extends StatelessWidget {
  const RecipeFeedContent({
    super.key,
    required this.state,
    required this.viewModel,
  });

  final RecipeFeedLoadedState state;
  final RecipeFeedViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);
    final config = state.config;

    return SafeArea(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header ──────────────────────────────────────────────────
          Padding(
            padding: EdgeInsets.fromLTRB(
              context.spacing24,
              context.spacing16,
              context.spacing24,
              0,
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      OsmeaComponents.text(
                        t.recipeFeedTitle,
                        variant: OsmeaTextVariant.headlineMedium,
                        fontWeight: FontWeight.w700,
                        color: theme.colorScheme.onSurface,
                      ),
                      OsmeaComponents.sizedBox(height: context.spacing4),
                      OsmeaComponents.text(
                        '${state.feedItems.length} ${t.recipeFeedSubtitle}',
                        variant: OsmeaTextVariant.bodySmall,
                        color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                      ),
                    ],
                  ),
                ),
                // Refresh button
                GestureDetector(
                  onTap: viewModel.loadFeed,
                  child: Container(
                    padding: EdgeInsets.all(context.spacing8),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.surface,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: theme.colorScheme.outline.withValues(alpha: 0.2),
                      ),
                    ),
                    child: Icon(
                      Icons.refresh_outlined,
                      size: 18,
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
                    ),
                  ),
                ),
              ],
            ),
          ),

          OsmeaComponents.sizedBox(height: context.spacing16),

          // ── Feed list or empty state ───────────────────────────────
          Expanded(
            child: state.feedItems.isEmpty
                ? _EmptyFeed(viewModel: viewModel)
                : ListView.builder(
                    padding: EdgeInsets.symmetric(
                      horizontal: context.spacing24,
                    ),
                    itemCount: state.feedItems.length,
                    itemBuilder: (context, index) {
                      final item = state.feedItems[index];
                      return RecipeFeedCard(
                        key: ValueKey(item.recipe.id),
                        item: item,
                        showMatchScore: config.showMatchScore,
                        showSensoryBadge: config.showSensoryBadge,
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

// ─── Empty state ──────────────────────────────────────────────────────────────

class _EmptyFeed extends StatelessWidget {
  const _EmptyFeed({required this.viewModel});
  final RecipeFeedViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);

    return OsmeaComponents.center(
      child: Padding(
        padding: EdgeInsets.symmetric(horizontal: context.spacing32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: theme.colorScheme.primaryContainer.withValues(alpha: 0.2),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.restaurant_menu_outlined,
                size: 34,
                color: theme.colorScheme.primary.withValues(alpha: 0.5),
              ),
            ),
            OsmeaComponents.sizedBox(height: context.spacing20),
            OsmeaComponents.text(
              t.recipeFeedEmptyTitle,
              variant: OsmeaTextVariant.titleMedium,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface,
            ),
            OsmeaComponents.sizedBox(height: context.spacing8),
            OsmeaComponents.text(
              t.recipeFeedEmptySubtitle,
              variant: OsmeaTextVariant.bodySmall,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
              lineHeight: 1.5,
            ),
            OsmeaComponents.sizedBox(height: context.spacing24),
            OsmeaComponents.button(
              text: t.recipeFeedRefresh,
              onPressed: viewModel.loadFeed,
              variant: ButtonVariant.primary,
              size: ButtonSize.medium,
            ),
          ],
        ),
      ),
    );
  }
}

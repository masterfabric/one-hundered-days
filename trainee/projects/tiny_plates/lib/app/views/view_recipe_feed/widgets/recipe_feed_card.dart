import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:osmea_components/osmea_components.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';
import 'package:tiny_plates/app/views/view_recipe_feed/models/module/recipe_feed_item.dart';
import 'package:tiny_plates/gen/strings.g.dart';

// ─── Category icon helper ─────────────────────────────────────────────────────

IconData _modeIcon(RecipeGenerationMode mode) => switch (mode) {
      RecipeGenerationMode.ingredientBased => Icons.kitchen_outlined,
      RecipeGenerationMode.proactiveRecommendation =>
        Icons.auto_awesome_outlined,
    };

Color _matchColor(double score, ColorScheme cs) {
  if (score >= 0.8) { return cs.primary; }
  if (score >= 0.5) { return Colors.orange; }
  return cs.onSurface.withValues(alpha: 0.4);
}

// ─── RecipeFeedCard ───────────────────────────────────────────────────────────

class RecipeFeedCard extends StatefulWidget {
  const RecipeFeedCard({
    super.key,
    required this.item,
    required this.showMatchScore,
    required this.showSensoryBadge,
  });

  final RecipeFeedItem item;
  final bool showMatchScore;
  final bool showSensoryBadge;

  @override
  State<RecipeFeedCard> createState() => _RecipeFeedCardState();
}

class _RecipeFeedCardState extends State<RecipeFeedCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final item = widget.item;
    final recipe = item.recipe;

    return Padding(
      padding: EdgeInsets.only(bottom: context.spacing12),
      child: GestureDetector(
        onTap: () => setState(() => _expanded = !_expanded),
        child: Container(
          decoration: BoxDecoration(
            color: cs.surface,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: cs.outline.withValues(alpha: 0.18),
            ),
          ),
          padding: EdgeInsets.all(context.spacing16),
          child: _CardBody(
            item: item,
            recipe: recipe,
            t: t,
            cs: cs,
            expanded: _expanded,
            showMatchScore: widget.showMatchScore,
            showSensoryBadge: widget.showSensoryBadge,
          ),
        ),
      ),
    );
  }
}

// ─── Card body ────────────────────────────────────────────────────────────────

class _CardBody extends StatelessWidget {
  const _CardBody({
    required this.item,
    required this.recipe,
    required this.t,
    required this.cs,
    required this.expanded,
    required this.showMatchScore,
    required this.showSensoryBadge,
  });

  final RecipeFeedItem item;
  final Recipe recipe;
  final Translations t;
  final ColorScheme cs;
  final bool expanded;
  final bool showMatchScore;
  final bool showSensoryBadge;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // ── Top row: icon + title + chevron ───────────────────────────
        Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: cs.primary.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(
                _modeIcon(recipe.mode),
                color: cs.primary,
                size: 22,
              ),
            ),
            OsmeaComponents.sizedBox(width: context.spacing12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  OsmeaComponents.text(
                    recipe.name,
                    variant: OsmeaTextVariant.titleMedium,
                    fontWeight: FontWeight.w700,
                    color: cs.onSurface,
                  ),
                  OsmeaComponents.sizedBox(height: context.spacing4),
                  // Meta row: prep time + calories
                  Row(
                    children: [
                      Icon(Icons.timer_outlined,
                          size: 12,
                          color: cs.onSurface.withValues(alpha: 0.4)),
                      const SizedBox(width: 3),
                      OsmeaComponents.text(
                        '${recipe.prepTimeMinutes} ${t.recipeFeedPrepTime}',
                        variant: OsmeaTextVariant.bodySmall,
                        color: cs.onSurface.withValues(alpha: 0.4),
                      ),
                      OsmeaComponents.sizedBox(width: context.spacing12),
                      Icon(Icons.local_fire_department_outlined,
                          size: 12,
                          color: cs.onSurface.withValues(alpha: 0.4)),
                      const SizedBox(width: 3),
                      OsmeaComponents.text(
                        '${recipe.estimatedCalories} ${t.recipeFeedCalories}',
                        variant: OsmeaTextVariant.bodySmall,
                        color: cs.onSurface.withValues(alpha: 0.4),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Icon(
              expanded
                  ? Icons.keyboard_arrow_up
                  : Icons.keyboard_arrow_down,
              color: cs.onSurface.withValues(alpha: 0.35),
              size: 18,
            ),
          ],
        ),

        OsmeaComponents.sizedBox(height: context.spacing12),

        // ── Nutrient badges ────────────────────────────────────────────
        if (recipe.targetNutrients.isNotEmpty)
          Wrap(
            spacing: context.spacing6,
            runSpacing: 4,
            children: recipe.targetNutrients
                .map((n) => _NutrientBadge(nutrient: n, cs: cs))
                .toList(),
          ),

        if (recipe.targetNutrients.isNotEmpty)
          OsmeaComponents.sizedBox(height: context.spacing8),

        // ── Match score (config-driven) ────────────────────────────────
        if (showMatchScore)
          _MatchScoreRow(item: item, cs: cs),

        if (showMatchScore)
          OsmeaComponents.sizedBox(height: context.spacing6),

        // ── Suitability note ────────────────────────────────────────────
        OsmeaComponents.text(
          item.suitabilityNote,
          variant: OsmeaTextVariant.bodySmall,
          color: cs.onSurface.withValues(alpha: 0.55),
          lineHeight: 1.4,
        ),

        // ── Sensory badge (config-driven) ──────────────────────────────
        if (showSensoryBadge && item.hasSensoryAdaptation) ...[
          OsmeaComponents.sizedBox(height: context.spacing8),
          _SensoryBadge(cs: cs, t: t),
        ],

        // ── Expanded: prep steps + sensory tips ────────────────────────
        if (expanded) ...[
          OsmeaComponents.sizedBox(height: context.spacing12),
          Divider(color: cs.outline.withValues(alpha: 0.12)),
          OsmeaComponents.sizedBox(height: context.spacing10),
          _ExpandedDetail(recipe: recipe, cs: cs, t: t),
        ],
      ],
    );
  }
}

// ─── Match score row ──────────────────────────────────────────────────────────

class _MatchScoreRow extends StatelessWidget {
  const _MatchScoreRow({required this.item, required this.cs});
  final RecipeFeedItem item;
  final ColorScheme cs;

  @override
  Widget build(BuildContext context) {
    final color = _matchColor(item.matchScore, cs);
    return Row(
      children: [
        Icon(Icons.check_circle_outline, size: 13, color: color),
        const SizedBox(width: 4),
        OsmeaComponents.text(
          item.matchLabel,
          variant: OsmeaTextVariant.labelSmall,
          color: color,
          fontWeight: FontWeight.w600,
        ),
      ],
    );
  }
}

// ─── Sensory badge ────────────────────────────────────────────────────────────

class _SensoryBadge extends StatelessWidget {
  const _SensoryBadge({required this.cs, required this.t});
  final ColorScheme cs;
  final Translations t;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: cs.secondaryContainer.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.tune_outlined, size: 11, color: cs.primary),
          const SizedBox(width: 4),
          OsmeaComponents.text(
            t.recipeFeedSensoryAdapted,
            variant: OsmeaTextVariant.labelSmall,
            color: cs.primary,
          ),
        ],
      ),
    );
  }
}

// ─── Nutrient badge ───────────────────────────────────────────────────────────

class _NutrientBadge extends StatelessWidget {
  const _NutrientBadge({required this.nutrient, required this.cs});
  final String nutrient;
  final ColorScheme cs;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
      decoration: BoxDecoration(
        color: cs.primaryContainer.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(4),
      ),
      child: OsmeaComponents.text(
        nutrient,
        variant: OsmeaTextVariant.labelSmall,
        color: cs.primary,
      ),
    );
  }
}

// ─── Expanded detail ──────────────────────────────────────────────────────────

class _ExpandedDetail extends StatelessWidget {
  const _ExpandedDetail({
    required this.recipe,
    required this.cs,
    required this.t,
  });
  final Recipe recipe;
  final ColorScheme cs;
  final Translations t;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Ingredients
        OsmeaComponents.text(
          'Ingredients',
          variant: OsmeaTextVariant.labelMedium,
          fontWeight: FontWeight.w600,
          color: cs.onSurface,
        ),
        OsmeaComponents.sizedBox(height: context.spacing6),
        Wrap(
          spacing: context.spacing8,
          runSpacing: 4,
          children: recipe.ingredients
              .map((i) => Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: cs.outline.withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: OsmeaComponents.text(
                      '${i.name}  ${i.amount}',
                      variant: OsmeaTextVariant.bodySmall,
                      color: cs.onSurface.withValues(alpha: 0.7),
                    ),
                  ))
              .toList(),
        ),
        OsmeaComponents.sizedBox(height: context.spacing12),

        // Prep steps
        OsmeaComponents.text(
          'Preparation',
          variant: OsmeaTextVariant.labelMedium,
          fontWeight: FontWeight.w600,
          color: cs.onSurface,
        ),
        OsmeaComponents.sizedBox(height: context.spacing8),
        ...recipe.prepSteps.map(
          (step) => Padding(
            padding: EdgeInsets.only(bottom: context.spacing8),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 20,
                  height: 20,
                  decoration: BoxDecoration(
                    color: cs.primary.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: OsmeaComponents.text(
                      '${step.order}',
                      variant: OsmeaTextVariant.labelSmall,
                      fontWeight: FontWeight.w700,
                      color: cs.primary,
                    ),
                  ),
                ),
                OsmeaComponents.sizedBox(width: context.spacing8),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      OsmeaComponents.text(
                        step.instruction,
                        variant: OsmeaTextVariant.bodySmall,
                        color: cs.onSurface,
                        lineHeight: 1.4,
                      ),
                      if (step.textureNote.isNotEmpty) ...[
                        const SizedBox(height: 2),
                        OsmeaComponents.text(
                          step.textureNote,
                          variant: OsmeaTextVariant.bodySmall,
                          color: cs.primary.withValues(alpha: 0.65),
                          lineHeight: 1.3,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // View Details button
        OsmeaComponents.sizedBox(height: context.spacing12),
        Align(
          alignment: Alignment.centerRight,
          child: OsmeaComponents.button(
            text: t.recipeDetailViewDetails,
            onPressed: () => context.push('/recipe-detail', extra: recipe),
            variant: ButtonVariant.outlined,
            size: ButtonSize.small,
          ),
        ),
        OsmeaComponents.sizedBox(height: context.spacing8),

        // Sensory tips
        if (recipe.sensoryTips.isNotEmpty) ...[
          OsmeaComponents.sizedBox(height: context.spacing4),
          Container(
            padding: EdgeInsets.all(context.spacing10),
            decoration: BoxDecoration(
              color: cs.secondaryContainer.withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OsmeaComponents.text(
                  t.recipeFeedSensoryTips,
                  variant: OsmeaTextVariant.labelSmall,
                  fontWeight: FontWeight.w600,
                  color: cs.onSurface,
                ),
                OsmeaComponents.sizedBox(height: context.spacing4),
                ...recipe.sensoryTips.map(
                  (tip) => Padding(
                    padding: EdgeInsets.only(bottom: context.spacing4),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(Icons.lightbulb_outline,
                            size: 11,
                            color: cs.primary.withValues(alpha: 0.6)),
                        const SizedBox(width: 4),
                        Expanded(
                          child: OsmeaComponents.text(
                            tip,
                            variant: OsmeaTextVariant.bodySmall,
                            color: cs.onSurface.withValues(alpha: 0.65),
                            lineHeight: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}

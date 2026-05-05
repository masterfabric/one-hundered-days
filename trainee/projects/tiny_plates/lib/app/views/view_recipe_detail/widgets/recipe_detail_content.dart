import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:osmea_components/osmea_components.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';
import 'package:tiny_plates/app/views/view_recipe_detail/models/module/recipe_detail_state.dart';
import 'package:tiny_plates/app/views/view_recipe_detail/models/recipe_detail_view_model.dart';
import 'package:tiny_plates/gen/strings.g.dart';

// ─── RecipeDetailContent ──────────────────────────────────────────────────────

class RecipeDetailContent extends StatelessWidget {
  const RecipeDetailContent({
    super.key,
    required this.state,
    required this.viewModel,
    required this.goRoute,
  });

  final RecipeDetailLoadedState state;
  final RecipeDetailViewModel viewModel;
  final void Function(String) goRoute;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    final recipe = state.recipe;

    return SafeArea(
      child: Column(
        children: [
          // ── Custom app bar ───────────────────────────────────────────
          _DetailAppBar(
            recipe: recipe,
            isFavorited: state.isFavorited,
            onBack: () => context.pop(),
            onToggleFavorite: viewModel.toggleFavorite,
            cs: cs,
            t: t,
          ),

          // ── Scrollable body ──────────────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.fromLTRB(
                context.spacing24,
                context.spacing16,
                context.spacing24,
                context.spacing24,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // ── Meta row ─────────────────────────────────────────
                  _MetaRow(recipe: recipe, cs: cs, t: t),
                  OsmeaComponents.sizedBox(height: context.spacing12),

                  // ── Nutrient target badges ────────────────────────────
                  if (recipe.targetNutrients.isNotEmpty) ...[
                    _SectionLabel(
                      label: t.recipeDetailNutrientsTargeted,
                      cs: cs,
                    ),
                    OsmeaComponents.sizedBox(height: context.spacing8),
                    Wrap(
                      spacing: context.spacing8,
                      runSpacing: 4,
                      children: recipe.targetNutrients
                          .map((n) => _NutrientBadge(nutrient: n, cs: cs))
                          .toList(),
                    ),
                    OsmeaComponents.sizedBox(height: context.spacing20),
                  ],

                  // ── Ingredients ───────────────────────────────────────
                  _SectionLabel(label: t.recipeDetailIngredients, cs: cs),
                  OsmeaComponents.sizedBox(height: context.spacing10),
                  ...recipe.ingredients.map(
                    (i) => _IngredientRow(ingredient: i, cs: cs),
                  ),
                  OsmeaComponents.sizedBox(height: context.spacing20),

                  Divider(color: cs.outline.withValues(alpha: 0.12)),
                  OsmeaComponents.sizedBox(height: context.spacing20),

                  // ── Instructions ──────────────────────────────────────
                  _SectionLabel(label: t.recipeDetailInstructions, cs: cs),
                  OsmeaComponents.sizedBox(height: context.spacing12),
                  ...recipe.prepSteps.map(
                    (step) => _PrepStepRow(
                      step: step,
                      cs: cs,
                      textureNoteLabel: t.recipeDetailTextureNote,
                    ),
                  ),

                  // ── Sensory guidance ──────────────────────────────────
                  if (recipe.sensoryTips.isNotEmpty) ...[
                    OsmeaComponents.sizedBox(height: context.spacing20),
                    Divider(color: cs.outline.withValues(alpha: 0.12)),
                    OsmeaComponents.sizedBox(height: context.spacing20),
                    _SensorySection(
                      tips: recipe.sensoryTips,
                      cs: cs,
                      t: t,
                    ),
                  ],

                  OsmeaComponents.sizedBox(height: context.spacing20),
                  Divider(color: cs.outline.withValues(alpha: 0.12)),
                  OsmeaComponents.sizedBox(height: context.spacing20),

                  // ── AI Rationale ──────────────────────────────────────
                  _RationaleSection(
                    rationale: recipe.rationale,
                    cs: cs,
                    t: t,
                  ),
                  OsmeaComponents.sizedBox(height: context.spacing32),
                ],
              ),
            ),
          ),

          // ── Bottom action ────────────────────────────────────────────
          _BottomAction(
            isMealLogged: state.isMealLogged,
            onLogMeal: viewModel.logMeal,
            t: t,
          ),
        ],
      ),
    );
  }
}

// ─── Custom app bar ───────────────────────────────────────────────────────────

class _DetailAppBar extends StatelessWidget {
  const _DetailAppBar({
    required this.recipe,
    required this.isFavorited,
    required this.onBack,
    required this.onToggleFavorite,
    required this.cs,
    required this.t,
  });

  final Recipe recipe;
  final bool isFavorited;
  final VoidCallback onBack;
  final VoidCallback onToggleFavorite;
  final ColorScheme cs;
  final Translations t;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.fromLTRB(
        context.spacing12,
        context.spacing8,
        context.spacing16,
        context.spacing8,
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: onBack,
            icon: Icon(
              Icons.arrow_back_ios_new_rounded,
              size: 20,
              color: cs.onSurface,
            ),
          ),
          Expanded(
            child: OsmeaComponents.text(
              recipe.name,
              variant: OsmeaTextVariant.titleMedium,
              fontWeight: FontWeight.w700,
              color: cs.onSurface,
            ),
          ),
          GestureDetector(
            onTap: onToggleFavorite,
            child: Container(
              padding: EdgeInsets.all(context.spacing8),
              decoration: BoxDecoration(
                color: isFavorited
                    ? cs.primaryContainer.withValues(alpha: 0.35)
                    : cs.outline.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(
                isFavorited ? Icons.favorite_rounded : Icons.favorite_border_rounded,
                size: 20,
                color: isFavorited ? cs.primary : cs.onSurface.withValues(alpha: 0.45),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Meta row (calories + prep time) ─────────────────────────────────────────

class _MetaRow extends StatelessWidget {
  const _MetaRow({required this.recipe, required this.cs, required this.t});
  final Recipe recipe;
  final ColorScheme cs;
  final Translations t;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _MetaChip(
          icon: Icons.local_fire_department_outlined,
          label: '${recipe.estimatedCalories} ${t.recipeDetailCalories}',
          cs: cs,
        ),
        OsmeaComponents.sizedBox(width: context.spacing12),
        _MetaChip(
          icon: Icons.timer_outlined,
          label: '${recipe.prepTimeMinutes} ${t.recipeDetailPrepTime}',
          cs: cs,
        ),
        OsmeaComponents.sizedBox(width: context.spacing12),
        _MetaChip(
          icon: recipe.mode == RecipeGenerationMode.ingredientBased
              ? Icons.kitchen_outlined
              : Icons.auto_awesome_outlined,
          label: recipe.mode == RecipeGenerationMode.ingredientBased
              ? 'Pantry'
              : 'AI Rec.',
          cs: cs,
        ),
      ],
    );
  }
}

class _MetaChip extends StatelessWidget {
  const _MetaChip({
    required this.icon,
    required this.label,
    required this.cs,
  });
  final IconData icon;
  final String label;
  final ColorScheme cs;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: cs.outline.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 13, color: cs.onSurface.withValues(alpha: 0.5)),
          const SizedBox(width: 4),
          OsmeaComponents.text(
            label,
            variant: OsmeaTextVariant.labelSmall,
            color: cs.onSurface.withValues(alpha: 0.65),
          ),
        ],
      ),
    );
  }
}

// ─── Section label ────────────────────────────────────────────────────────────

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.label, required this.cs});
  final String label;
  final ColorScheme cs;

  @override
  Widget build(BuildContext context) {
    return OsmeaComponents.text(
      label,
      variant: OsmeaTextVariant.labelLarge,
      fontWeight: FontWeight.w700,
      color: cs.onSurface,
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
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: cs.primaryContainer.withValues(alpha: 0.35),
        borderRadius: BorderRadius.circular(6),
      ),
      child: OsmeaComponents.text(
        nutrient,
        variant: OsmeaTextVariant.labelSmall,
        color: cs.primary,
        fontWeight: FontWeight.w600,
      ),
    );
  }
}

// ─── Ingredient row ───────────────────────────────────────────────────────────

class _IngredientRow extends StatelessWidget {
  const _IngredientRow({required this.ingredient, required this.cs});
  final RecipeIngredient ingredient;
  final ColorScheme cs;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.spacing8),
      child: Row(
        children: [
          Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
              color: cs.primary.withValues(alpha: 0.6),
              shape: BoxShape.circle,
            ),
          ),
          OsmeaComponents.sizedBox(width: context.spacing12),
          Expanded(
            child: OsmeaComponents.text(
              ingredient.name,
              variant: OsmeaTextVariant.bodyMedium,
              color: cs.onSurface,
            ),
          ),
          OsmeaComponents.text(
            ingredient.amount,
            variant: OsmeaTextVariant.bodyMedium,
            color: cs.onSurface.withValues(alpha: 0.5),
          ),
        ],
      ),
    );
  }
}

// ─── Prep step row ────────────────────────────────────────────────────────────

class _PrepStepRow extends StatelessWidget {
  const _PrepStepRow({
    required this.step,
    required this.cs,
    required this.textureNoteLabel,
  });
  final PrepStep step;
  final ColorScheme cs;
  final String textureNoteLabel;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.spacing16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 24,
            height: 24,
            decoration: BoxDecoration(
              color: cs.primary,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: OsmeaComponents.text(
                '${step.order}',
                variant: OsmeaTextVariant.labelSmall,
                fontWeight: FontWeight.w700,
                color: cs.onPrimary,
              ),
            ),
          ),
          OsmeaComponents.sizedBox(width: context.spacing12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OsmeaComponents.text(
                  step.instruction,
                  variant: OsmeaTextVariant.bodyMedium,
                  color: cs.onSurface,
                  lineHeight: 1.5,
                ),
                if (step.textureNote.isNotEmpty) ...[
                  OsmeaComponents.sizedBox(height: context.spacing6),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(
                      color: cs.secondaryContainer.withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.tips_and_updates_outlined,
                          size: 13,
                          color: cs.primary.withValues(alpha: 0.7),
                        ),
                        const SizedBox(width: 5),
                        Expanded(
                          child: OsmeaComponents.text(
                            step.textureNote,
                            variant: OsmeaTextVariant.bodySmall,
                            color: cs.onSurface.withValues(alpha: 0.65),
                            lineHeight: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Sensory section ──────────────────────────────────────────────────────────

class _SensorySection extends StatelessWidget {
  const _SensorySection({
    required this.tips,
    required this.cs,
    required this.t,
  });
  final List<String> tips;
  final ColorScheme cs;
  final Translations t;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.tune_outlined, size: 16, color: cs.primary),
            OsmeaComponents.sizedBox(width: context.spacing8),
            OsmeaComponents.text(
              t.recipeDetailSensoryGuidance,
              variant: OsmeaTextVariant.labelLarge,
              fontWeight: FontWeight.w700,
              color: cs.onSurface,
            ),
          ],
        ),
        OsmeaComponents.sizedBox(height: context.spacing12),
        Container(
          padding: EdgeInsets.all(context.spacing16),
          decoration: BoxDecoration(
            color: cs.secondaryContainer.withValues(alpha: 0.18),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(
              color: cs.primary.withValues(alpha: 0.12),
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: tips
                .map(
                  (tip) => Padding(
                    padding: EdgeInsets.only(bottom: context.spacing8),
                    child: Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(
                          Icons.lightbulb_outline_rounded,
                          size: 14,
                          color: cs.primary.withValues(alpha: 0.65),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: OsmeaComponents.text(
                            tip,
                            variant: OsmeaTextVariant.bodySmall,
                            color: cs.onSurface.withValues(alpha: 0.75),
                            lineHeight: 1.5,
                          ),
                        ),
                      ],
                    ),
                  ),
                )
                .toList(),
          ),
        ),
      ],
    );
  }
}

// ─── AI Rationale section ─────────────────────────────────────────────────────

class _RationaleSection extends StatelessWidget {
  const _RationaleSection({
    required this.rationale,
    required this.cs,
    required this.t,
  });
  final String rationale;
  final ColorScheme cs;
  final Translations t;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(Icons.auto_awesome_outlined, size: 16, color: cs.primary),
            OsmeaComponents.sizedBox(width: context.spacing8),
            OsmeaComponents.text(
              t.recipeDetailAiRationale,
              variant: OsmeaTextVariant.labelLarge,
              fontWeight: FontWeight.w700,
              color: cs.onSurface,
            ),
          ],
        ),
        OsmeaComponents.sizedBox(height: context.spacing12),
        OsmeaComponents.text(
          rationale,
          variant: OsmeaTextVariant.bodyMedium,
          color: cs.onSurface.withValues(alpha: 0.75),
          lineHeight: 1.6,
        ),
      ],
    );
  }
}

// ─── Bottom action ────────────────────────────────────────────────────────────

class _BottomAction extends StatelessWidget {
  const _BottomAction({
    required this.isMealLogged,
    required this.onLogMeal,
    required this.t,
  });
  final bool isMealLogged;
  final VoidCallback onLogMeal;
  final Translations t;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.fromLTRB(
        context.spacing24,
        context.spacing12,
        context.spacing24,
        context.spacing20,
      ),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        border: Border(
          top: BorderSide(
            color: Theme.of(context).colorScheme.outline.withValues(alpha: 0.1),
          ),
        ),
      ),
      child: OsmeaComponents.button(
        text: isMealLogged ? t.recipeDetailMealLogged : t.recipeDetailCookedThis,
        onPressed: isMealLogged ? () {} : onLogMeal,
        variant: isMealLogged ? ButtonVariant.success : ButtonVariant.primary,
        size: ButtonSize.large,
      ),
    );
  }
}

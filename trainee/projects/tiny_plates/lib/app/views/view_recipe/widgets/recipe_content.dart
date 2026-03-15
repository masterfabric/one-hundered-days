import 'package:flutter/material.dart';
import 'package:osmea_components/osmea_components.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe_nutrient_info.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe_state.dart';
import 'package:tiny_plates/app/views/view_recipe/models/recipe_view_model.dart';
import 'package:tiny_plates/gen/strings.g.dart';

// ─── RecipeContent ────────────────────────────────────────────────────────────

class RecipeContent extends StatelessWidget {
  const RecipeContent({
    super.key,
    required this.state,
    required this.viewModel,
  });

  final RecipeState state;
  final RecipeViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);

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
            child: OsmeaComponents.text(
              t.recipeEngineTitle,
              variant: OsmeaTextVariant.headlineMedium,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
          ),

          // ── Mode selector (config-driven) ────────────────────────────
          if (state.showModeSelector)
            Padding(
              padding: EdgeInsets.symmetric(
                horizontal: context.spacing24,
                vertical: context.spacing12,
              ),
              child: _ModeSelectorRow(state: state, viewModel: viewModel),
            ),

          // ── Scrollable body ──────────────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: context.spacing24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Mode 1: ingredient picker
                  if (state.mode == RecipeGenerationMode.ingredientBased)
                    _IngredientPickerSection(
                      state: state,
                      viewModel: viewModel,
                    ),

                  // Mode 2: nutrient gap overview
                  if (state.mode ==
                      RecipeGenerationMode.proactiveRecommendation)
                    _NutrientGapSection(state: state),

                  OsmeaComponents.sizedBox(height: context.spacing16),

                  // Generate button
                  _GenerateButton(state: state, viewModel: viewModel),

                  OsmeaComponents.sizedBox(height: context.spacing24),

                  // Results
                  if (state.status == RecipeStatus.loading)
                    _LoadingRecipes(theme: theme)
                  else if (state.recipes.isNotEmpty)
                    _RecipeResultsSection(state: state)
                  else if (state.status == RecipeStatus.loaded &&
                      state.recipes.isEmpty &&
                      state.selectedIngredientIds.isNotEmpty)
                    _NoRecipesFound(theme: theme),

                  OsmeaComponents.sizedBox(height: context.spacing24),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Mode selector row ────────────────────────────────────────────────────────

class _ModeSelectorRow extends StatelessWidget {
  const _ModeSelectorRow({required this.state, required this.viewModel});
  final RecipeState state;
  final RecipeViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    return Row(
      children: [
        Expanded(
          child: _ModeChip(
            label: t.recipeEngineMode1Label,
            selected:
                state.mode == RecipeGenerationMode.ingredientBased,
            onTap: () =>
                viewModel.setMode(RecipeGenerationMode.ingredientBased),
          ),
        ),
        OsmeaComponents.sizedBox(width: context.spacing8),
        Expanded(
          child: _ModeChip(
            label: t.recipeEngineMode2Label,
            selected:
                state.mode == RecipeGenerationMode.proactiveRecommendation,
            onTap: () => viewModel
                .setMode(RecipeGenerationMode.proactiveRecommendation),
          ),
        ),
      ],
    );
  }
}

class _ModeChip extends StatelessWidget {
  const _ModeChip({
    required this.label,
    required this.selected,
    required this.onTap,
  });
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: EdgeInsets.symmetric(
          vertical: context.spacing10,
          horizontal: context.spacing12,
        ),
        decoration: BoxDecoration(
          color: selected
              ? theme.colorScheme.primary
              : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(8.0),
          border: Border.all(
            color: selected
                ? theme.colorScheme.primary
                : theme.colorScheme.outline.withValues(alpha: 0.3),
          ),
        ),
        child: OsmeaComponents.text(
          label,
          variant: OsmeaTextVariant.labelMedium,
          fontWeight: FontWeight.w600,
          color: selected
              ? theme.colorScheme.onPrimary
              : theme.colorScheme.onSurface.withValues(alpha: 0.6),
        ),
      ),
    );
  }
}

// ─── Mode 1: Ingredient picker ────────────────────────────────────────────────

class _IngredientPickerSection extends StatelessWidget {
  const _IngredientPickerSection({
    required this.state,
    required this.viewModel,
  });
  final RecipeState state;
  final RecipeViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);

    if (state.pantryItems.isEmpty) {
      return Padding(
        padding: EdgeInsets.symmetric(vertical: context.spacing16),
        child: Container(
          padding: EdgeInsets.all(context.spacing16),
          decoration: BoxDecoration(
            color: theme.colorScheme.secondaryContainer
                .withValues(alpha: 0.3),
            borderRadius: BorderRadius.circular(8.0),
          ),
          child: Row(
            children: [
              Icon(Icons.kitchen_outlined,
                  color: theme.colorScheme.primary.withValues(alpha: 0.6),
                  size: 20),
              OsmeaComponents.sizedBox(width: context.spacing12),
              Expanded(
                child: OsmeaComponents.text(
                  t.recipeEngineNoPantryItems,
                  variant: OsmeaTextVariant.bodySmall,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                  lineHeight: 1.4,
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        OsmeaComponents.sizedBox(height: context.spacing8),
        OsmeaComponents.text(
          t.recipeEngineSelectIngredients,
          variant: OsmeaTextVariant.titleSmall,
          fontWeight: FontWeight.w600,
          color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
        ),
        OsmeaComponents.sizedBox(height: context.spacing12),
        Wrap(
          spacing: context.spacing8,
          runSpacing: context.spacing8,
          children: state.pantryItems.map((item) {
            final selected =
                state.selectedIngredientIds.contains(item.ingredient.id);
            return OsmeaComponents.chips(
              text: item.ingredient.name,
              selected: selected,
              onSelected: (_) =>
                  viewModel.toggleIngredient(item.ingredient.id),
              variant: ChipsVariant.primary,
              style: selected ? ChipsStyle.soft : ChipsStyle.outlined,
              activeColor: theme.colorScheme.primary,
            );
          }).toList(),
        ),
        OsmeaComponents.sizedBox(height: context.spacing8),
      ],
    );
  }
}

// ─── Mode 2: Nutrient gap bars ────────────────────────────────────────────────

class _NutrientGapSection extends StatelessWidget {
  const _NutrientGapSection({required this.state});
  final RecipeState state;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);
    final gaps = state.nutrientTargets.gapRatios(state.currentIntake);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        OsmeaComponents.sizedBox(height: context.spacing8),
        OsmeaComponents.text(
          t.recipeEngineNutrientGaps,
          variant: OsmeaTextVariant.titleSmall,
          fontWeight: FontWeight.w600,
          color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
        ),
        OsmeaComponents.sizedBox(height: context.spacing12),
        ...gaps.entries.map((entry) => _NutrientBar(
              nutrient: entry.key,
              ratio: entry.value,
              theme: theme,
            )),
        OsmeaComponents.sizedBox(height: context.spacing8),
      ],
    );
  }
}

class _NutrientBar extends StatelessWidget {
  const _NutrientBar({
    required this.nutrient,
    required this.ratio,
    required this.theme,
  });
  final String nutrient;
  final double ratio;
  final ThemeData theme;

  Color get _barColor {
    if (ratio < 0.4) { return theme.colorScheme.error; }
    if (ratio < 0.7) { return Colors.orange; }
    return theme.colorScheme.primary;
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.spacing8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              OsmeaComponents.text(
                nutrient,
                variant: OsmeaTextVariant.bodySmall,
                color: theme.colorScheme.onSurface,
              ),
              OsmeaComponents.text(
                '${(ratio * 100).toInt()}%',
                variant: OsmeaTextVariant.labelSmall,
                color: _barColor,
              ),
            ],
          ),
          OsmeaComponents.sizedBox(height: 4),
          OsmeaComponents.progress(
            type: ProgressType.linear,
            value: ratio,
            size: ProgressSize.small,
            progressColor: _barColor,
          ),
        ],
      ),
    );
  }
}

// ─── Generate button ──────────────────────────────────────────────────────────

class _GenerateButton extends StatelessWidget {
  const _GenerateButton({required this.state, required this.viewModel});
  final RecipeState state;
  final RecipeViewModel viewModel;

  bool get _canGenerate {
    if (state.status == RecipeStatus.loading) { return false; }
    if (state.mode == RecipeGenerationMode.ingredientBased) {
      return state.selectedIngredientIds.isNotEmpty;
    }
    return true;
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final isLoading = state.status == RecipeStatus.loading;

    return SizedBox(
      width: double.infinity,
      child: OsmeaComponents.button(
        text: isLoading ? t.recipeEngineGenerating : t.recipeEngineGenerate,
        onPressed: _canGenerate ? viewModel.generateRecipes : null,
        variant: ButtonVariant.primary,
        size: ButtonSize.large,
      ),
    );
  }
}

// ─── Loading placeholder ──────────────────────────────────────────────────────

class _LoadingRecipes extends StatelessWidget {
  const _LoadingRecipes({required this.theme});
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return OsmeaComponents.center(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: context.spacing32),
        child: Column(
          children: [
            OsmeaComponents.loading(
              type: LoadingType.rotatingDots,
              size: 36,
              color: theme.colorScheme.primary,
            ),
            OsmeaComponents.sizedBox(height: context.spacing12),
            OsmeaComponents.text(
              context.t.recipeEngineGenerating,
              variant: OsmeaTextVariant.bodySmall,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Recipe results section ───────────────────────────────────────────────────

class _RecipeResultsSection extends StatelessWidget {
  const _RecipeResultsSection({required this.state});
  final RecipeState state;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        OsmeaComponents.text(
          t.recipeEngineResults,
          variant: OsmeaTextVariant.titleSmall,
          fontWeight: FontWeight.w600,
          color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
        ),
        OsmeaComponents.sizedBox(height: context.spacing12),
        ...state.recipes.map((recipe) => _RecipeCard(recipe: recipe)),
      ],
    );
  }
}

// ─── Recipe card ──────────────────────────────────────────────────────────────

class _RecipeCard extends StatefulWidget {
  const _RecipeCard({required this.recipe});
  final Recipe recipe;

  @override
  State<_RecipeCard> createState() => _RecipeCardState();
}

class _RecipeCardState extends State<_RecipeCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);
    final recipe = widget.recipe;

    return Padding(
      padding: EdgeInsets.only(bottom: context.spacing12),
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(8.0),
          border: Border.all(
            color: theme.colorScheme.outline.withValues(alpha: 0.2),
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Card header ────────────────────────────────────────────
            InkWell(
              borderRadius: BorderRadius.circular(8.0),
              onTap: () => setState(() => _expanded = !_expanded),
              child: Padding(
                padding: EdgeInsets.all(context.spacing16),
                child: Row(
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          OsmeaComponents.text(
                            recipe.name,
                            variant: OsmeaTextVariant.titleSmall,
                            fontWeight: FontWeight.w600,
                            color: theme.colorScheme.onSurface,
                          ),
                          OsmeaComponents.sizedBox(height: context.spacing4),
                          Row(
                            children: [
                              Icon(Icons.timer_outlined,
                                  size: 12,
                                  color: theme.colorScheme.onSurface
                                      .withValues(alpha: 0.45)),
                              const SizedBox(width: 4),
                              OsmeaComponents.text(
                                '${recipe.prepTimeMinutes} ${t.recipeEnginePrepTime}',
                                variant: OsmeaTextVariant.bodySmall,
                                color: theme.colorScheme.onSurface
                                    .withValues(alpha: 0.45),
                              ),
                              OsmeaComponents.sizedBox(width: context.spacing12),
                              Icon(Icons.local_fire_department_outlined,
                                  size: 12,
                                  color: theme.colorScheme.onSurface
                                      .withValues(alpha: 0.45)),
                              const SizedBox(width: 4),
                              OsmeaComponents.text(
                                '${recipe.estimatedCalories} ${t.recipeEngineCalories}',
                                variant: OsmeaTextVariant.bodySmall,
                                color: theme.colorScheme.onSurface
                                    .withValues(alpha: 0.45),
                              ),
                            ],
                          ),
                          if (recipe.targetNutrients.isNotEmpty) ...[
                            OsmeaComponents.sizedBox(height: context.spacing6),
                            Wrap(
                              spacing: 4,
                              children: recipe.targetNutrients
                                  .map((n) => _NutrientBadge(nutrient: n))
                                  .toList(),
                            ),
                          ],
                        ],
                      ),
                    ),
                    Icon(
                      _expanded
                          ? Icons.keyboard_arrow_up
                          : Icons.keyboard_arrow_down,
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
                    ),
                  ],
                ),
              ),
            ),

            // ── Expanded detail ────────────────────────────────────────
            if (_expanded)
              Padding(
                padding: EdgeInsets.fromLTRB(
                  context.spacing16,
                  0,
                  context.spacing16,
                  context.spacing16,
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Divider(
                        color:
                            theme.colorScheme.outline.withValues(alpha: 0.15)),
                    OsmeaComponents.sizedBox(height: context.spacing8),

                    // Rationale
                    OsmeaComponents.text(
                      recipe.rationale,
                      variant: OsmeaTextVariant.bodySmall,
                      color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
                      lineHeight: 1.5,
                    ),
                    OsmeaComponents.sizedBox(height: context.spacing12),

                    // Ingredients
                    OsmeaComponents.text(
                      'Ingredients',
                      variant: OsmeaTextVariant.labelMedium,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                    OsmeaComponents.sizedBox(height: context.spacing6),
                    ...recipe.ingredients.map(
                      (i) => Padding(
                        padding: EdgeInsets.only(bottom: context.spacing4),
                        child: Row(
                          children: [
                            Icon(Icons.circle,
                                size: 5,
                                color: theme.colorScheme.primary),
                            OsmeaComponents.sizedBox(width: context.spacing8),
                            OsmeaComponents.text(
                              '${i.name}  ${i.amount}',
                              variant: OsmeaTextVariant.bodySmall,
                              color: theme.colorScheme.onSurface,
                            ),
                          ],
                        ),
                      ),
                    ),
                    OsmeaComponents.sizedBox(height: context.spacing12),

                    // Prep steps
                    OsmeaComponents.text(
                      'Preparation',
                      variant: OsmeaTextVariant.labelMedium,
                      fontWeight: FontWeight.w600,
                      color: theme.colorScheme.onSurface,
                    ),
                    OsmeaComponents.sizedBox(height: context.spacing6),
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
                                color: theme.colorScheme.primary
                                    .withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: OsmeaComponents.text(
                                  '${step.order}',
                                  variant: OsmeaTextVariant.labelSmall,
                                  fontWeight: FontWeight.w700,
                                  color: theme.colorScheme.primary,
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
                                    color: theme.colorScheme.onSurface,
                                    lineHeight: 1.4,
                                  ),
                                  if (step.textureNote.isNotEmpty) ...[
                                    OsmeaComponents.sizedBox(height: 2),
                                    OsmeaComponents.text(
                                      step.textureNote,
                                      variant: OsmeaTextVariant.bodySmall,
                                      color: theme.colorScheme.primary
                                          .withValues(alpha: 0.7),
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

                    // Sensory tips
                    if (recipe.sensoryTips.isNotEmpty) ...[
                      OsmeaComponents.sizedBox(height: context.spacing8),
                      Container(
                        padding: EdgeInsets.all(context.spacing12),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.secondaryContainer
                              .withValues(alpha: 0.25),
                          borderRadius: BorderRadius.circular(8.0),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            OsmeaComponents.text(
                              t.recipeEngineSensoryTips,
                              variant: OsmeaTextVariant.labelSmall,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.onSurface,
                            ),
                            OsmeaComponents.sizedBox(height: context.spacing6),
                            ...recipe.sensoryTips.map(
                              (tip) => Padding(
                                padding:
                                    EdgeInsets.only(bottom: context.spacing4),
                                child: Row(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Icon(Icons.lightbulb_outline,
                                        size: 12,
                                        color: theme.colorScheme.primary
                                            .withValues(alpha: 0.7)),
                                    OsmeaComponents.sizedBox(
                                        width: context.spacing6),
                                    Expanded(
                                      child: OsmeaComponents.text(
                                        tip,
                                        variant: OsmeaTextVariant.bodySmall,
                                        color: theme.colorScheme.onSurface
                                            .withValues(alpha: 0.7),
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
                ),
              ),
          ],
        ),
      ),
    );
  }
}

class _NutrientBadge extends StatelessWidget {
  const _NutrientBadge({required this.nutrient});
  final String nutrient;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: theme.colorScheme.primaryContainer.withValues(alpha: 0.4),
        borderRadius: BorderRadius.circular(4),
      ),
      child: OsmeaComponents.text(
        nutrient,
        variant: OsmeaTextVariant.labelSmall,
        color: theme.colorScheme.primary,
      ),
    );
  }
}

// ─── No recipes found ─────────────────────────────────────────────────────────

class _NoRecipesFound extends StatelessWidget {
  const _NoRecipesFound({required this.theme});
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: context.spacing24),
      child: OsmeaComponents.center(
        child: Column(
          children: [
            Icon(Icons.no_food_outlined,
                size: 40,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
            OsmeaComponents.sizedBox(height: context.spacing8),
            OsmeaComponents.text(
              context.t.recipeEngineNoRecipes,
              variant: OsmeaTextVariant.bodyMedium,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
            ),
          ],
        ),
      ),
    );
  }
}

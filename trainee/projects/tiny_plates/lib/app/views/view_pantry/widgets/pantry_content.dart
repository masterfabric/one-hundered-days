import 'package:flutter/material.dart';
import 'package:osmea_components/osmea_components.dart';
import 'package:tiny_plates/app/views/view_pantry/models/module/ingredient.dart';
import 'package:tiny_plates/app/views/view_pantry/models/module/pantry_item.dart';
import 'package:tiny_plates/app/views/view_pantry/models/module/pantry_state.dart';
import 'package:tiny_plates/app/views/view_pantry/models/pantry_view_model.dart';
import 'package:tiny_plates/gen/strings.g.dart';

// ─── Category label helpers ───────────────────────────────────────────────────

bool _isTurkish(BuildContext context) =>
    Localizations.localeOf(context).languageCode == 'tr';

String _categoryLabel(BuildContext context, IngredientCategory category) {
  final t = context.t;
  if (_isTurkish(context)) {
    return switch (category) {
      IngredientCategory.vegetables => t.pantryCategoryVegetables,
      IngredientCategory.fruits => t.pantryCategoryFruits,
      IngredientCategory.grains => t.pantryCategoryGrains,
      IngredientCategory.proteins => t.pantryCategoryProteins,
    };
  }
  return switch (category) {
    IngredientCategory.vegetables => t.pantryCategoryVegetables,
    IngredientCategory.fruits => t.pantryCategoryFruits,
    IngredientCategory.grains => t.pantryCategoryGrains,
    IngredientCategory.proteins => t.pantryCategoryProteins,
  };
}

IconData _categoryIcon(IngredientCategory category) => switch (category) {
      IngredientCategory.vegetables => Icons.eco_outlined,
      IngredientCategory.fruits => Icons.local_florist_outlined,
      IngredientCategory.grains => Icons.grain_outlined,
      IngredientCategory.proteins => Icons.egg_outlined,
    };

// ─── PantryContent ───────────────────────────────────────────────────────────

class PantryContent extends StatefulWidget {
  const PantryContent({
    super.key,
    required this.state,
    required this.viewModel,
  });

  final PantryLoadedState state;
  final PantryViewModel viewModel;

  @override
  State<PantryContent> createState() => _PantryContentState();
}

class _PantryContentState extends State<PantryContent> {
  late final TextEditingController _searchController;

  @override
  void initState() {
    super.initState();
    _searchController =
        TextEditingController(text: widget.state.searchQuery);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);
    final state = widget.state;
    final vm = widget.viewModel;

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
              t.pantryTitle,
              variant: OsmeaTextVariant.headlineMedium,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
          ),

          // ── Search bar ──────────────────────────────────────────────
          Padding(
            padding: EdgeInsets.symmetric(
              horizontal: context.spacing24,
              vertical: context.spacing12,
            ),
            child: TextField(
              controller: _searchController,
              onChanged: vm.search,
              decoration: InputDecoration(
                hintText: t.pantrySearchHint,
                hintStyle: TextStyle(
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
                  fontSize: 14,
                ),
                prefixIcon: Icon(
                  Icons.search,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
                  size: 20,
                ),
                suffixIcon: state.searchQuery.isNotEmpty
                    ? GestureDetector(
                        onTap: () {
                          _searchController.clear();
                          vm.search('');
                        },
                        child: Icon(
                          Icons.close,
                          color: theme.colorScheme.onSurface
                              .withValues(alpha: 0.4),
                          size: 20,
                        ),
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide(
                    color: theme.colorScheme.outline.withValues(alpha: 0.4),
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide(
                    color: theme.colorScheme.outline.withValues(alpha: 0.3),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8.0),
                  borderSide: BorderSide(
                    color: theme.colorScheme.primary,
                  ),
                ),
                filled: true,
                fillColor: theme.colorScheme.surface,
              ),
            ),
          ),

          // ── Content ─────────────────────────────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.symmetric(horizontal: context.spacing24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Added ingredients
                  if (state.pantryItems.isNotEmpty) ...[
                    _SectionHeader(title: t.pantryAddedIngredients),
                    OsmeaComponents.sizedBox(height: context.spacing8),
                    ...state.pantryItems.map(
                      (item) => _PantryItemTile(
                        item: item,
                        onRemove: () => vm.removeItem(item.id),
                      ),
                    ),
                    OsmeaComponents.sizedBox(height: context.spacing24),
                  ],

                  // Search results / all ingredients
                  _SectionHeader(title: t.pantrySearchResults),
                  OsmeaComponents.sizedBox(height: context.spacing8),

                  if (state.searchResults.isEmpty)
                    _EmptySearchResult(theme: theme)
                  else
                    ...state.searchResults.map(
                      (ingredient) => _IngredientTile(
                        ingredient: ingredient,
                        isAdded: vm.isAdded(ingredient.id),
                        categoryLabel:
                            _categoryLabel(context, ingredient.category),
                        categoryIcon: _categoryIcon(ingredient.category),
                        onAdd: () => vm.addIngredient(ingredient),
                        theme: theme,
                      ),
                    ),

                  // Pantry empty state (only when no items and no search)
                  if (state.pantryItems.isEmpty &&
                      state.searchQuery.isEmpty) ...[
                    OsmeaComponents.sizedBox(height: context.spacing16),
                    _PantryEmptyBanner(t: t, theme: theme),
                  ],

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

// ─── Section header ───────────────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return OsmeaComponents.text(
      title,
      variant: OsmeaTextVariant.titleSmall,
      fontWeight: FontWeight.w600,
      color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
    );
  }
}

// ─── Added pantry item tile ──────────────────────────────────────────────────

class _PantryItemTile extends StatelessWidget {
  const _PantryItemTile({
    required this.item,
    required this.onRemove,
  });

  final PantryItem item;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Padding(
      padding: EdgeInsets.only(bottom: context.spacing8),
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.primaryContainer.withValues(alpha: 0.3),
          borderRadius: BorderRadius.circular(8.0),
          border: Border.all(
            color: theme.colorScheme.primary.withValues(alpha: 0.3),
          ),
        ),
        child: ListTile(
          dense: true,
          leading: Icon(
            _categoryIcon(item.ingredient.category),
            color: theme.colorScheme.primary,
            size: 20,
          ),
          title: OsmeaComponents.text(
            item.ingredient.name,
            variant: OsmeaTextVariant.bodyMedium,
            fontWeight: FontWeight.w500,
            color: theme.colorScheme.onSurface,
          ),
          trailing: GestureDetector(
            onTap: onRemove,
            child: Icon(
              Icons.close,
              color: theme.colorScheme.error,
              size: 20,
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Search result ingredient tile ───────────────────────────────────────────

class _IngredientTile extends StatelessWidget {
  const _IngredientTile({
    required this.ingredient,
    required this.isAdded,
    required this.categoryLabel,
    required this.categoryIcon,
    required this.onAdd,
    required this.theme,
  });

  final Ingredient ingredient;
  final bool isAdded;
  final String categoryLabel;
  final IconData categoryIcon;
  final VoidCallback onAdd;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: context.spacing8),
      child: Container(
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(8.0),
          border: Border.all(
            color: theme.colorScheme.outline.withValues(alpha: 0.2),
          ),
        ),
        child: ListTile(
          dense: true,
          leading: Icon(categoryIcon,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
              size: 20),
          title: OsmeaComponents.text(
            ingredient.name,
            variant: OsmeaTextVariant.bodyMedium,
            color: theme.colorScheme.onSurface,
          ),
          subtitle: OsmeaComponents.text(
            categoryLabel,
            variant: OsmeaTextVariant.bodySmall,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.45),
          ),
          trailing: isAdded
              ? Icon(Icons.check_circle,
                  color: theme.colorScheme.primary, size: 20)
              : GestureDetector(
                  onTap: onAdd,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 4),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: OsmeaComponents.text(
                      context.t.pantryAddIngredient,
                      variant: OsmeaTextVariant.labelSmall,
                      color: theme.colorScheme.onPrimary,
                    ),
                  ),
                ),
        ),
      ),
    );
  }
}

// ─── Empty search result ──────────────────────────────────────────────────────

class _EmptySearchResult extends StatelessWidget {
  const _EmptySearchResult({required this.theme});
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(vertical: context.spacing24),
      child: OsmeaComponents.center(
        child: Column(
          children: [
            Icon(Icons.search_off,
                size: 40,
                color: theme.colorScheme.onSurface.withValues(alpha: 0.3)),
            OsmeaComponents.sizedBox(height: context.spacing8),
            OsmeaComponents.text(
              context.t.pantryNoResults,
              variant: OsmeaTextVariant.bodyMedium,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Pantry empty hint banner ─────────────────────────────────────────────────

class _PantryEmptyBanner extends StatelessWidget {
  const _PantryEmptyBanner({required this.t, required this.theme});
  final Translations t;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.spacing16),
      decoration: BoxDecoration(
        color: theme.colorScheme.secondaryContainer.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(context.radiusMedium),
        border: Border.all(
          color: theme.colorScheme.outline.withValues(alpha: 0.15),
        ),
      ),
      child: Row(
        children: [
          Icon(Icons.info_outline,
              color: theme.colorScheme.primary.withValues(alpha: 0.7),
              size: 20),
          OsmeaComponents.sizedBox(width: context.spacing12),
          Expanded(
            child: OsmeaComponents.text(
              t.pantryEmptySubtitle,
              variant: OsmeaTextVariant.bodySmall,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
              lineHeight: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

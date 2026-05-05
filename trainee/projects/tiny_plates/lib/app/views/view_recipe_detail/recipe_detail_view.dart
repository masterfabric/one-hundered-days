import 'package:flutter/material.dart';
import 'package:masterfabric_core/masterfabric_core.dart' hide LoadingType;
import 'package:osmea_components/osmea_components.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';
import 'package:tiny_plates/app/views/view_recipe_detail/models/module/recipe_detail_state.dart';
import 'package:tiny_plates/app/views/view_recipe_detail/models/recipe_detail_view_model.dart';
import 'package:tiny_plates/app/views/view_recipe_detail/widgets/recipe_detail_content.dart';

class RecipeDetailView
    extends MasterViewHydratedCubit<RecipeDetailViewModel, RecipeDetailState> {
  RecipeDetailView({
    super.key,
    super.arguments,
    super.currentView,
    super.snackBarFunction,
    super.appBarPadding = const AppBarPaddingVisibility.disabled(),
    super.navbarSpacer = const SpacerVisibility.disabled(),
    super.footerSpacer = const SpacerVisibility.disabled(),
    super.verticalPadding = const PaddingVisibility.disabled(),
    super.horizontalPadding = const PaddingVisibility.disabled(),
    required super.goRoute,
    required this.recipe,
  });

  final Recipe recipe;

  @override
  void initialContent(RecipeDetailViewModel viewModel, BuildContext context) {
    viewModel.loadRecipe(recipe);
  }

  @override
  Widget viewContent(
    BuildContext context,
    RecipeDetailViewModel viewModel,
    RecipeDetailState state,
  ) {
    if (state is RecipeDetailLoadedState) {
      return RecipeDetailContent(
        state: state,
        viewModel: viewModel,
        goRoute: goRoute,
      );
    }

    return OsmeaComponents.center(
      child: OsmeaComponents.loading(
        type: LoadingType.rotatingDots,
        size: 36,
        color: Theme.of(context).colorScheme.primary,
      ),
    );
  }
}

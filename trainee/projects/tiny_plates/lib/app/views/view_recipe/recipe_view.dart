import 'package:flutter/material.dart';
import 'package:masterfabric_core/masterfabric_core.dart' hide LoadingType;
import 'package:osmea_components/osmea_components.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe_state.dart';
import 'package:tiny_plates/app/views/view_recipe/models/recipe_view_model.dart';
import 'package:tiny_plates/app/views/view_recipe/widgets/recipe_content.dart';

class RecipeView
    extends MasterViewHydratedCubit<RecipeViewModel, RecipeState> {
  RecipeView({
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
  });

  @override
  void initialContent(RecipeViewModel viewModel, BuildContext context) {
    viewModel.initialize();
  }

  @override
  Widget viewContent(
    BuildContext context,
    RecipeViewModel viewModel,
    RecipeState state,
  ) {
    if (state.status == RecipeStatus.initial) {
      return OsmeaComponents.center(
        child: OsmeaComponents.loading(
          type: LoadingType.rotatingDots,
          size: 36,
          color: Theme.of(context).colorScheme.primary,
        ),
      );
    }

    return RecipeContent(state: state, viewModel: viewModel);
  }
}

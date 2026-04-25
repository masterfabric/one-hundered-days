import 'package:flutter/material.dart';
import 'package:masterfabric_core/masterfabric_core.dart' hide LoadingType;
import 'package:osmea_components/osmea_components.dart';
import 'package:tiny_plates/app/views/view_recipe_feed/models/module/recipe_feed_state.dart';
import 'package:tiny_plates/app/views/view_recipe_feed/models/recipe_feed_view_model.dart';
import 'package:tiny_plates/app/views/view_recipe_feed/widgets/recipe_feed_content.dart';

class RecipeFeedView
    extends MasterViewHydratedCubit<RecipeFeedViewModel, RecipeFeedState> {
  RecipeFeedView({
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
  void initialContent(RecipeFeedViewModel viewModel, BuildContext context) {
    viewModel.initialize();
  }

  @override
  Widget viewContent(
    BuildContext context,
    RecipeFeedViewModel viewModel,
    RecipeFeedState state,
  ) {
    if (state is RecipeFeedInitialState || state is RecipeFeedLoadingState) {
      return OsmeaComponents.center(
        child: OsmeaComponents.loading(
          type: LoadingType.rotatingDots,
          size: context.iconSizeHigh,
          color: Theme.of(context).colorScheme.primary,
        ),
      );
    }

    if (state is RecipeFeedLoadedState) {
      return RecipeFeedContent(state: state, viewModel: viewModel);
    }

    if (state is RecipeFeedErrorState) {
      return OsmeaComponents.center(
        child: OsmeaComponents.text(
          state.message,
          variant: OsmeaTextVariant.bodyMedium,
          color: Theme.of(context).colorScheme.error,
        ),
      );
    }

    return OsmeaComponents.center(
      child: OsmeaComponents.loading(
        type: LoadingType.rotatingDots,
        size: context.iconSizeHigh,
      ),
    );
  }
}

import 'package:flutter/material.dart';
import 'package:masterfabric_core/masterfabric_core.dart' hide LoadingType;
import 'package:osmea_components/osmea_components.dart';
import 'package:tiny_plates/app/views/view_pantry/models/pantry_view_model.dart';
import 'package:tiny_plates/app/views/view_pantry/models/module/pantry_state.dart';
import 'package:tiny_plates/app/views/view_pantry/widgets/pantry_content.dart';

class PantryView
    extends MasterViewHydratedCubit<PantryViewModel, PantryState> {
  PantryView({
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
  void initialContent(PantryViewModel viewModel, BuildContext context) {
    viewModel.initialize();
  }

  @override
  Widget viewContent(
    BuildContext context,
    PantryViewModel viewModel,
    PantryState state,
  ) {
    if (state is PantryInitialState) {
      return OsmeaComponents.center(
        child: OsmeaComponents.loading(
          type: LoadingType.rotatingDots,
          size: 36,
          color: Theme.of(context).colorScheme.primary,
        ),
      );
    }

    if (state is PantryLoadedState) {
      return PantryContent(state: state, viewModel: viewModel);
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

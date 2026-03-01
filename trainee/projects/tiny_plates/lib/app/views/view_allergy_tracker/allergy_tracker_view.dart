import 'package:flutter/material.dart';
import 'package:masterfabric_core/masterfabric_core.dart' hide LoadingType;
import 'package:osmea_components/osmea_components.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/allergy_tracker_view_model.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/module/allergy_tracker_state.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/widgets/allergy_tracker_content.dart';

class AllergyTrackerView
    extends MasterViewHydratedCubit<AllergyTrackerViewModel, AllergyTrackerState> {
  AllergyTrackerView({
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
  void initialContent(
      AllergyTrackerViewModel viewModel, BuildContext context) {
    viewModel.initialize();
  }

  @override
  Widget viewContent(
    BuildContext context,
    AllergyTrackerViewModel viewModel,
    AllergyTrackerState state,
  ) {
    if (state is AllergyTrackerInitialState) {
      return OsmeaComponents.center(
        child: OsmeaComponents.loading(
          type: LoadingType.rotatingDots,
          size: 36,
          color: Theme.of(context).colorScheme.primary,
        ),
      );
    }

    if (state is AllergyTrackerLoadedState) {
      return AllergyTrackerContent(state: state, viewModel: viewModel);
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

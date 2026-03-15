/*
 * HomeView - Tiny Plates Home Page
 * --------------------------------
 * Uses MasterViewHydratedCubit pattern with HydratedBloc state management.
 * No static UI: all from OsmeaComponents, sizer/text extensions, slang (context.t).
 */

import 'package:flutter/material.dart';
import 'package:masterfabric_core/masterfabric_core.dart' hide LoadingType;
import 'package:osmea_components/osmea_components.dart';
import 'package:tiny_plates/app/views/view_home/models/home_view_model.dart';
import 'package:tiny_plates/app/views/view_home/models/module/states.dart';
import 'package:tiny_plates/gen/strings.g.dart';

class HomeView extends MasterViewHydratedCubit<HomeViewModel, HomeState> {
  HomeView({
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
  void initialContent(HomeViewModel viewModel, BuildContext context) {
    viewModel.setArguments(arguments);
    viewModel.setGoRoute(goRoute);
    viewModel.initial();
  }

  @override
  Widget viewContent(
    BuildContext context,
    HomeViewModel viewModel,
    HomeState state,
  ) {
    if (state is HomeLoadingState || state is HomeInitialState) {
      return OsmeaComponents.center(
        child: OsmeaComponents.loading(
          type: LoadingType.rotatingDots,
          size: context.iconSizeHigh,
        ),
      );
    }

    if (state is HomeLoadedState) {
      return _HomeContent(viewModel: viewModel);
    }

    return OsmeaComponents.center(
      child: OsmeaComponents.loading(
        type: LoadingType.rotatingDots,
        size: context.iconSizeHigh,
      ),
    );
  }
}

// ─── Home content ─────────────────────────────────────────────────────────────

class _HomeContent extends StatelessWidget {
  const _HomeContent({required this.viewModel});

  final HomeViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);

    return SafeArea(
      child: SingleChildScrollView(
        padding: EdgeInsets.all(context.spacing24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header ──────────────────────────────────────────────────
            OsmeaComponents.sizedBox(height: context.spacing8),
            OsmeaComponents.text(
              t.homeWelcome,
              variant: OsmeaTextVariant.headlineMedium,
              fontWeight: FontWeight.w700,
              color: theme.colorScheme.onSurface,
            ),
            OsmeaComponents.sizedBox(height: context.spacing4),
            OsmeaComponents.text(
              t.homeSubtitle,
              variant: OsmeaTextVariant.bodyMedium,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.55),
            ),

            OsmeaComponents.sizedBox(height: context.spacing32),

            // ── Feature cards ────────────────────────────────────────────
            _FeatureCard(
              icon: Icons.kitchen_outlined,
              title: t.homeFeaturePantry,
              description: t.homeFeaturePantryDesc,
              color: const Color(0xFF4CAF50),
              onTap: () => viewModel.navigate('/pantry'),
              theme: theme,
            ),
            OsmeaComponents.sizedBox(height: context.spacing16),
            _FeatureCard(
              icon: Icons.health_and_safety_outlined,
              title: t.homeFeatureAllergy,
              description: t.homeFeatureAllergyDesc,
              color: const Color(0xFFFF7043),
              onTap: () => viewModel.navigate('/allergy-tracker'),
              theme: theme,
            ),
            OsmeaComponents.sizedBox(height: context.spacing16),
            _FeatureCard(
              icon: Icons.child_care_outlined,
              title: t.homeFeatureProfile,
              description: t.homeFeatureProfileDesc,
              color: const Color(0xFF7E57C2),
              onTap: () => viewModel.navigate('/user-profile'),
              theme: theme,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Feature card ─────────────────────────────────────────────────────────────

class _FeatureCard extends StatelessWidget {
  const _FeatureCard({
    required this.icon,
    required this.title,
    required this.description,
    required this.color,
    required this.onTap,
    required this.theme,
  });

  final IconData icon;
  final String title;
  final String description;
  final Color color;
  final VoidCallback onTap;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: EdgeInsets.all(context.spacing20),
        decoration: BoxDecoration(
          color: theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(context.radiusMedium),
          border: Border.all(
            color: theme.colorScheme.outline.withValues(alpha: 0.15),
          ),
          boxShadow: [
            BoxShadow(
              color: theme.colorScheme.shadow.withValues(alpha: 0.05),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            // Icon container
            Container(
              width: 52,
              height: 52,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(icon, color: color, size: 26),
            ),
            OsmeaComponents.sizedBox(width: context.spacing16),

            // Text
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  OsmeaComponents.text(
                    title,
                    variant: OsmeaTextVariant.titleMedium,
                    fontWeight: FontWeight.w600,
                    color: theme.colorScheme.onSurface,
                  ),
                  OsmeaComponents.sizedBox(height: context.spacing4),
                  OsmeaComponents.text(
                    description,
                    variant: OsmeaTextVariant.bodySmall,
                    color:
                        theme.colorScheme.onSurface.withValues(alpha: 0.5),
                  ),
                ],
              ),
            ),

            // Arrow
            Icon(
              Icons.arrow_forward_ios,
              size: 14,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.3),
            ),
          ],
        ),
      ),
    );
  }
}

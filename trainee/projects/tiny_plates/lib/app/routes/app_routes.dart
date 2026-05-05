import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:masterfabric_core/masterfabric_core.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/allergy_tracker_view.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';
import 'package:tiny_plates/app/views/view_recipe/recipe_view.dart';
import 'package:tiny_plates/app/views/view_recipe_detail/recipe_detail_view.dart';
import 'package:tiny_plates/app/views/view_recipe_feed/recipe_feed_view.dart';
import 'package:tiny_plates/app/views/view_dashboard/dashboard_shell.dart';
import 'package:tiny_plates/app/views/view_diary/diary_view.dart';
import 'package:tiny_plates/app/views/view_home/home_view.dart';
import 'package:tiny_plates/app/views/view_onboarding/onboarding_view.dart';
import 'package:tiny_plates/app/views/view_pantry/pantry_view.dart';
import 'package:tiny_plates/app/views/view_settings/settings_view.dart';
import 'package:tiny_plates/app/views/view_user_profile/user_profile_view.dart';

/// Splash from masterfabric_core. Onboarding from tiny_plates view_onboarding.
/// After splash, check onboarding and navigate to /onboarding or /home.
Future<void> _handleSplashNavigation(BuildContext context) async {
  try {
    final onboardingHelper = OnboardingStorageHelper();
    final hasSeenOnboarding = await onboardingHelper.hasSeenOnboarding();

    final configHelper = AssetConfigHelper();
    final onboardingEnabled = configHelper.getBool(
      'feature_flags.onboarding_enabled',
      true,
    );

    if (!context.mounted) return;

    if (onboardingEnabled && !hasSeenOnboarding) {
      debugPrint('📚 First-time user, navigating to onboarding');
      context.go('/onboarding');
    } else {
      debugPrint('🏠 Navigating to home');
      context.go('/home');
    }
  } catch (e) {
    debugPrint('⚠️ Error checking onboarding state: $e');
    if (context.mounted) {
      context.go('/home');
    }
  }
}

final GoRouter appRouter = GoRouter(
  initialLocation: '/',
  routes: <RouteBase>[
    GoRoute(
      path: '/',
      builder: (BuildContext context, GoRouterState state) {
        return SplashView(
          goRoute: (String path) {
            debugPrint('🎯 Splash completed, checking onboarding');
            _handleSplashNavigation(context);
          },
        );
      },
    ),
    GoRoute(
      path: '/onboarding',
      builder: (BuildContext context, GoRouterState state) {
        return TinyPlatesOnboardingView(
          goRoute: (String path) {
            debugPrint('🎯 Onboarding navigate: $path');
            context.go(path);
          },
          arguments: const {'onboarding': true},
        );
      },
    ),

    /// User profile setup – outside dashboard shell (no bottom nav).
    GoRoute(
      path: '/user-profile',
      builder: (BuildContext context, GoRouterState state) {
        return UserProfileView(
          goRoute: (String path) => context.go(path),
          arguments: const {'view': 'userProfile'},
        );
      },
    ),

    /// Pantry manager – outside dashboard shell (full screen).
    GoRoute(
      path: '/pantry',
      builder: (BuildContext context, GoRouterState state) {
        return PantryView(
          goRoute: (String path) => context.go(path),
          arguments: const {'view': 'pantry'},
        );
      },
    ),

    /// Allergy tracker – outside dashboard shell (full screen).
    GoRoute(
      path: '/allergy-tracker',
      builder: (BuildContext context, GoRouterState state) {
        return AllergyTrackerView(
          goRoute: (String path) => context.go(path),
          arguments: const {'view': 'allergyTracker'},
        );
      },
    ),

    /// Recipe feed – outside dashboard shell (full screen).
    GoRoute(
      path: '/recipe-feed',
      builder: (BuildContext context, GoRouterState state) {
        return RecipeFeedView(
          goRoute: (String path) => context.go(path),
          arguments: const {'view': 'recipeFeed'},
        );
      },
    ),

    /// Recipe detail – pushed on top of feed or engine (supports back nav).
    GoRoute(
      path: '/recipe-detail',
      builder: (BuildContext context, GoRouterState state) {
        final recipe = state.extra as Recipe;
        return RecipeDetailView(
          goRoute: (String path) => context.go(path),
          recipe: recipe,
        );
      },
    ),

    /// Recipe engine – outside dashboard shell (full screen).
    GoRoute(
      path: '/recipe-engine',
      builder: (BuildContext context, GoRouterState state) {
        return RecipeView(
          goRoute: (String path) => context.go(path),
          arguments: const {'view': 'recipeEngine'},
        );
      },
    ),

    /// Dashboard shell: wraps /home, /diary, /settings with bottom navbar.
    ShellRoute(
      builder: (BuildContext context, GoRouterState state, Widget child) {
        return DashboardShell(child: child);
      },
      routes: [
        GoRoute(
          path: '/home',
          builder: (BuildContext context, GoRouterState state) {
            final args = state.uri.queryParameters.isEmpty
                ? <String, dynamic>{'home': true}
                : Map<String, dynamic>.from(state.uri.queryParameters);
            return HomeView(
              goRoute: (String path) => context.go(path),
              arguments: args,
            );
          },
        ),
        GoRoute(
          path: '/diary',
          builder: (BuildContext context, GoRouterState state) {
            return const DiaryView();
          },
        ),
        GoRoute(
          path: '/settings',
          builder: (BuildContext context, GoRouterState state) {
            return const SettingsView();
          },
        ),
      ],
    ),
  ],
);

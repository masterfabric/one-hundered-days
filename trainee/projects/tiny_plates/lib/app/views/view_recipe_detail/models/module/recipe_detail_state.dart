import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';

abstract class RecipeDetailState {}

class RecipeDetailInitialState extends RecipeDetailState {}

class RecipeDetailLoadedState extends RecipeDetailState {
  RecipeDetailLoadedState({
    required this.recipe,
    this.isFavorited = false,
    this.isMealLogged = false,
  });

  final Recipe recipe;
  final bool isFavorited;
  final bool isMealLogged;

  RecipeDetailLoadedState copyWith({
    Recipe? recipe,
    bool? isFavorited,
    bool? isMealLogged,
  }) =>
      RecipeDetailLoadedState(
        recipe: recipe ?? this.recipe,
        isFavorited: isFavorited ?? this.isFavorited,
        isMealLogged: isMealLogged ?? this.isMealLogged,
      );
}

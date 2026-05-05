import 'package:injectable/injectable.dart';
import 'package:masterfabric_core/masterfabric_core.dart';
import 'package:tiny_plates/app/views/view_recipe/models/module/recipe.dart';
import 'package:tiny_plates/app/views/view_recipe_detail/models/module/recipe_detail_state.dart';

@injectable
class RecipeDetailViewModel
    extends BaseViewModelHydratedCubit<RecipeDetailState> {
  RecipeDetailViewModel() : super(RecipeDetailInitialState());

  void loadRecipe(Recipe recipe) {
    emit(RecipeDetailLoadedState(recipe: recipe));
  }

  void toggleFavorite() {
    final s = state;
    if (s is RecipeDetailLoadedState) {
      emit(s.copyWith(isFavorited: !s.isFavorited));
    }
  }

  void logMeal() {
    final s = state;
    if (s is RecipeDetailLoadedState && !s.isMealLogged) {
      emit(s.copyWith(isMealLogged: true));
    }
  }

  @override
  RecipeDetailState? fromJson(Map<String, dynamic> json) =>
      RecipeDetailInitialState();

  @override
  Map<String, dynamic>? toJson(RecipeDetailState state) => null;
}

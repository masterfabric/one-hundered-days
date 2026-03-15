import 'package:tiny_plates/app/views/view_allergy_tracker/models/module/food_introduction.dart';

enum RiskClassification { low, moderate, high }

abstract class AllergyTrackerState {}

class AllergyTrackerInitialState extends AllergyTrackerState {}

class AllergyTrackerLoadedState extends AllergyTrackerState {
  AllergyTrackerLoadedState({
    required this.introductions,
    required this.familyAllergyHistory,
    required this.riskClassification,
  });

  final List<FoodIntroduction> introductions;
  final String familyAllergyHistory;
  final RiskClassification riskClassification;
}

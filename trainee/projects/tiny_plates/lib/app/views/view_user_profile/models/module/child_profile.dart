import 'package:tiny_plates/app/views/view_user_profile/models/module/food_restriction.dart';

enum ChewingLevel { none, minimal, soft, moderate, full }

enum TextureToleranceLevel { smooth, mashed, lumpy, chopped, solid }

enum FamilyRiskClassification { low, moderate, high }

class ChildProfile {
  const ChildProfile({
    required this.ageMonths,
    required this.allergies,
    required this.chewingLevel,
    required this.specialDietaryNeeds,
    required this.isPremature,
    required this.foodIntolerances,
    required this.textureToleranceLevel,
    required this.sensoryPreferences,
    required this.dailyCalorieTarget,
    required this.dailyProteinTarget,
    required this.foodRestrictions,
    this.familyAllergyHistory = '',
    this.familyRiskClassification = FamilyRiskClassification.low,
  });

  final int ageMonths;
  final List<String> allergies;
  final ChewingLevel chewingLevel;
  final String specialDietaryNeeds;
  final bool isPremature;
  final String foodIntolerances;
  final TextureToleranceLevel textureToleranceLevel;
  final List<String> sensoryPreferences;
  final int dailyCalorieTarget;
  final int dailyProteinTarget;
  final List<FoodRestriction> foodRestrictions;
  final String familyAllergyHistory;
  final FamilyRiskClassification familyRiskClassification;

  factory ChildProfile.empty() => const ChildProfile(
        ageMonths: 6,
        allergies: [],
        chewingLevel: ChewingLevel.none,
        specialDietaryNeeds: '',
        isPremature: false,
        foodIntolerances: '',
        textureToleranceLevel: TextureToleranceLevel.smooth,
        sensoryPreferences: [],
        dailyCalorieTarget: 0,
        dailyProteinTarget: 0,
        foodRestrictions: [],
      );

  ChildProfile copyWith({
    int? ageMonths,
    List<String>? allergies,
    ChewingLevel? chewingLevel,
    String? specialDietaryNeeds,
    bool? isPremature,
    String? foodIntolerances,
    TextureToleranceLevel? textureToleranceLevel,
    List<String>? sensoryPreferences,
    int? dailyCalorieTarget,
    int? dailyProteinTarget,
    List<FoodRestriction>? foodRestrictions,
    String? familyAllergyHistory,
    FamilyRiskClassification? familyRiskClassification,
  }) =>
      ChildProfile(
        ageMonths: ageMonths ?? this.ageMonths,
        allergies: allergies ?? this.allergies,
        chewingLevel: chewingLevel ?? this.chewingLevel,
        specialDietaryNeeds: specialDietaryNeeds ?? this.specialDietaryNeeds,
        isPremature: isPremature ?? this.isPremature,
        foodIntolerances: foodIntolerances ?? this.foodIntolerances,
        textureToleranceLevel:
            textureToleranceLevel ?? this.textureToleranceLevel,
        sensoryPreferences: sensoryPreferences ?? this.sensoryPreferences,
        dailyCalorieTarget: dailyCalorieTarget ?? this.dailyCalorieTarget,
        dailyProteinTarget: dailyProteinTarget ?? this.dailyProteinTarget,
        foodRestrictions: foodRestrictions ?? this.foodRestrictions,
        familyAllergyHistory:
            familyAllergyHistory ?? this.familyAllergyHistory,
        familyRiskClassification:
            familyRiskClassification ?? this.familyRiskClassification,
      );

  Map<String, dynamic> toJson() => {
        'ageMonths': ageMonths,
        'allergies': allergies,
        'chewingLevel': chewingLevel.name,
        'specialDietaryNeeds': specialDietaryNeeds,
        'isPremature': isPremature,
        'foodIntolerances': foodIntolerances,
        'textureToleranceLevel': textureToleranceLevel.name,
        'sensoryPreferences': sensoryPreferences,
        'dailyCalorieTarget': dailyCalorieTarget,
        'dailyProteinTarget': dailyProteinTarget,
        'foodRestrictions':
            foodRestrictions.map((r) => r.toJson()).toList(),
        'familyAllergyHistory': familyAllergyHistory,
        'familyRiskClassification': familyRiskClassification.name,
      };

  factory ChildProfile.fromJson(Map<String, dynamic> json) => ChildProfile(
        ageMonths: (json['ageMonths'] as int?) ?? 6,
        allergies: List<String>.from(json['allergies'] as List? ?? []),
        chewingLevel: ChewingLevel.values.firstWhere(
          (e) => e.name == json['chewingLevel'],
          orElse: () => ChewingLevel.none,
        ),
        specialDietaryNeeds:
            (json['specialDietaryNeeds'] as String?) ?? '',
        isPremature: (json['isPremature'] as bool?) ?? false,
        foodIntolerances: (json['foodIntolerances'] as String?) ?? '',
        textureToleranceLevel: TextureToleranceLevel.values.firstWhere(
          (e) => e.name == json['textureToleranceLevel'],
          orElse: () => TextureToleranceLevel.smooth,
        ),
        sensoryPreferences:
            List<String>.from(json['sensoryPreferences'] as List? ?? []),
        dailyCalorieTarget: (json['dailyCalorieTarget'] as int?) ?? 0,
        dailyProteinTarget: (json['dailyProteinTarget'] as int?) ?? 0,
        foodRestrictions: (json['foodRestrictions'] as List? ?? [])
            .map((e) =>
                FoodRestriction.fromJson(e as Map<String, dynamic>))
            .toList(),
        familyAllergyHistory:
            (json['familyAllergyHistory'] as String?) ?? '',
        familyRiskClassification: FamilyRiskClassification.values.firstWhere(
          (e) => e.name == json['familyRiskClassification'],
          orElse: () => FamilyRiskClassification.low,
        ),
      );
}

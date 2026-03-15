class DailyNutrientIntake {
  const DailyNutrientIntake({
    this.calories = 0,
    this.proteinGrams = 0.0,
    this.ironMg = 0.0,
    this.calciumMg = 0.0,
    this.vitaminDUg = 0.0,
    this.zincMg = 0.0,
  });

  final int calories;
  final double proteinGrams;
  final double ironMg;
  final double calciumMg;
  final double vitaminDUg;
  final double zincMg;

  Map<String, dynamic> toJson() => {
        'calories': calories,
        'proteinGrams': proteinGrams,
        'ironMg': ironMg,
        'calciumMg': calciumMg,
        'vitaminDUg': vitaminDUg,
        'zincMg': zincMg,
      };

  factory DailyNutrientIntake.fromJson(Map<String, dynamic> json) =>
      DailyNutrientIntake(
        calories: (json['calories'] as int?) ?? 0,
        proteinGrams: (json['proteinGrams'] as num?)?.toDouble() ?? 0.0,
        ironMg: (json['ironMg'] as num?)?.toDouble() ?? 0.0,
        calciumMg: (json['calciumMg'] as num?)?.toDouble() ?? 0.0,
        vitaminDUg: (json['vitaminDUg'] as num?)?.toDouble() ?? 0.0,
        zincMg: (json['zincMg'] as num?)?.toDouble() ?? 0.0,
      );
}

class DailyNutrientTargets {
  const DailyNutrientTargets({
    this.calories = 700,
    this.proteinGrams = 11.0,
    this.ironMg = 11.0,
    this.calciumMg = 270.0,
    this.vitaminDUg = 10.0,
    this.zincMg = 3.0,
  });

  final int calories;
  final double proteinGrams;
  final double ironMg;
  final double calciumMg;
  final double vitaminDUg;
  final double zincMg;

  /// Returns a value between 0.0 and 1.0 for each nutrient gap.
  Map<String, double> gapRatios(DailyNutrientIntake intake) => {
        'Calories': (intake.calories / calories).clamp(0.0, 1.0),
        'Protein': (intake.proteinGrams / proteinGrams).clamp(0.0, 1.0),
        'Iron': (intake.ironMg / ironMg).clamp(0.0, 1.0),
        'Calcium': (intake.calciumMg / calciumMg).clamp(0.0, 1.0),
        'Vitamin D': (intake.vitaminDUg / vitaminDUg).clamp(0.0, 1.0),
        'Zinc': (intake.zincMg / zincMg).clamp(0.0, 1.0),
      };
}

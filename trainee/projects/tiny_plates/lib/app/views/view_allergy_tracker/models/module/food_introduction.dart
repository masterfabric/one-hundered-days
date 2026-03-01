import 'package:tiny_plates/app/views/view_allergy_tracker/models/module/reaction_entry.dart';

class FoodIntroduction {
  const FoodIntroduction({
    required this.id,
    required this.foodName,
    required this.dateIntroduced,
    required this.reactionObserved,
    required this.reactionDetails,
  });

  final String id;
  final String foodName;
  final DateTime dateIntroduced;
  final bool reactionObserved;
  final List<ReactionEntry> reactionDetails;

  FoodIntroduction copyWith({
    String? foodName,
    DateTime? dateIntroduced,
    bool? reactionObserved,
    List<ReactionEntry>? reactionDetails,
  }) =>
      FoodIntroduction(
        id: id,
        foodName: foodName ?? this.foodName,
        dateIntroduced: dateIntroduced ?? this.dateIntroduced,
        reactionObserved: reactionObserved ?? this.reactionObserved,
        reactionDetails: reactionDetails ?? this.reactionDetails,
      );

  Map<String, dynamic> toJson() => {
        'id': id,
        'foodName': foodName,
        'dateIntroduced': dateIntroduced.toIso8601String(),
        'reactionObserved': reactionObserved,
        'reactionDetails':
            reactionDetails.map((e) => e.toJson()).toList(),
      };

  factory FoodIntroduction.fromJson(Map<String, dynamic> json) =>
      FoodIntroduction(
        id: json['id'] as String,
        foodName: json['foodName'] as String,
        dateIntroduced:
            DateTime.parse(json['dateIntroduced'] as String),
        reactionObserved:
            (json['reactionObserved'] as bool?) ?? false,
        reactionDetails: (json['reactionDetails'] as List? ?? [])
            .map((e) =>
                ReactionEntry.fromJson(e as Map<String, dynamic>))
            .toList(),
      );
}

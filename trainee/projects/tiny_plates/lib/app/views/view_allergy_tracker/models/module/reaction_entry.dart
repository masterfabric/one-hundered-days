enum ReactionSeverity { mild, moderate, severe, anaphylaxis }

class ReactionEntry {
  const ReactionEntry({
    required this.date,
    required this.severity,
    required this.symptoms,
    required this.actionTaken,
  });

  final DateTime date;
  final ReactionSeverity severity;
  final String symptoms;
  final String actionTaken;

  ReactionEntry copyWith({
    DateTime? date,
    ReactionSeverity? severity,
    String? symptoms,
    String? actionTaken,
  }) =>
      ReactionEntry(
        date: date ?? this.date,
        severity: severity ?? this.severity,
        symptoms: symptoms ?? this.symptoms,
        actionTaken: actionTaken ?? this.actionTaken,
      );

  Map<String, dynamic> toJson() => {
        'date': date.toIso8601String(),
        'severity': severity.name,
        'symptoms': symptoms,
        'actionTaken': actionTaken,
      };

  factory ReactionEntry.fromJson(Map<String, dynamic> json) => ReactionEntry(
        date: DateTime.parse(json['date'] as String),
        severity: ReactionSeverity.values.firstWhere(
          (e) => e.name == json['severity'],
          orElse: () => ReactionSeverity.mild,
        ),
        symptoms: (json['symptoms'] as String?) ?? '',
        actionTaken: (json['actionTaken'] as String?) ?? '',
      );
}

import 'package:injectable/injectable.dart';
import 'package:masterfabric_core/masterfabric_core.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/module/allergy_tracker_state.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/module/food_introduction.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/module/reaction_entry.dart';

@injectable
class AllergyTrackerViewModel
    extends BaseViewModelHydratedCubit<AllergyTrackerState> {
  AllergyTrackerViewModel() : super(AllergyTrackerInitialState());

  final List<FoodIntroduction> _introductions = [];
  String _familyAllergyHistory = '';
  RiskClassification _riskClassification = RiskClassification.low;

  void initialize() => _emitLoaded();

  // ─── Food introductions ────────────────────────────────────────────────────

  void logFoodIntroduction({
    required String foodName,
    required DateTime dateIntroduced,
  }) {
    _introductions.insert(
      0,
      FoodIntroduction(
        id: '${DateTime.now().millisecondsSinceEpoch}',
        foodName: foodName,
        dateIntroduced: dateIntroduced,
        reactionObserved: false,
        reactionDetails: [],
      ),
    );
    _emitLoaded();
  }

  void removeIntroduction(String id) {
    _introductions.removeWhere((i) => i.id == id);
    _emitLoaded();
  }

  // ─── Reaction recording ───────────────────────────────────────────────────

  void recordReaction({
    required String introductionId,
    required ReactionSeverity severity,
    required String symptoms,
    required String actionTaken,
  }) {
    final idx = _introductions.indexWhere((i) => i.id == introductionId);
    if (idx < 0) return;
    final entry = ReactionEntry(
      date: DateTime.now(),
      severity: severity,
      symptoms: symptoms,
      actionTaken: actionTaken,
    );
    _introductions[idx] = _introductions[idx].copyWith(
      reactionObserved: true,
      reactionDetails: [
        ..._introductions[idx].reactionDetails,
        entry,
      ],
    );
    _emitLoaded();
  }

  // ─── Family history ───────────────────────────────────────────────────────

  void updateFamilyHistory({
    required String familyAllergyHistory,
    required RiskClassification riskClassification,
  }) {
    _familyAllergyHistory = familyAllergyHistory;
    _riskClassification = riskClassification;
    _emitLoaded();
  }

  void _emitLoaded() {
    emit(AllergyTrackerLoadedState(
      introductions: List.from(_introductions),
      familyAllergyHistory: _familyAllergyHistory,
      riskClassification: _riskClassification,
    ));
  }

  // ─── Hydration ────────────────────────────────────────────────────────────

  @override
  AllergyTrackerState? fromJson(Map<String, dynamic> json) {
    try {
      _introductions.clear();
      final items = json['introductions'] as List? ?? [];
      _introductions.addAll(
        items.map(
          (e) => FoodIntroduction.fromJson(e as Map<String, dynamic>),
        ),
      );
      _familyAllergyHistory =
          (json['familyAllergyHistory'] as String?) ?? '';
      _riskClassification = RiskClassification.values.firstWhere(
        (e) => e.name == json['riskClassification'],
        orElse: () => RiskClassification.low,
      );
      return AllergyTrackerLoadedState(
        introductions: List.from(_introductions),
        familyAllergyHistory: _familyAllergyHistory,
        riskClassification: _riskClassification,
      );
    } catch (_) {
      return null;
    }
  }

  @override
  Map<String, dynamic>? toJson(AllergyTrackerState state) {
    if (state is AllergyTrackerLoadedState) {
      return {
        'introductions':
            state.introductions.map((i) => i.toJson()).toList(),
        'familyAllergyHistory': state.familyAllergyHistory,
        'riskClassification': state.riskClassification.name,
      };
    }
    return null;
  }
}

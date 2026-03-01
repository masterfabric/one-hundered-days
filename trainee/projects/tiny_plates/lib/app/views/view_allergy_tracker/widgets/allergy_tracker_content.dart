import 'package:flutter/material.dart';
import 'package:osmea_components/osmea_components.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/allergy_tracker_view_model.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/module/allergen.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/module/allergy_tracker_state.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/module/food_introduction.dart';
import 'package:tiny_plates/app/views/view_allergy_tracker/models/module/reaction_entry.dart';
import 'package:tiny_plates/gen/strings.g.dart';

// ─── AllergyTrackerContent ────────────────────────────────────────────────────

class AllergyTrackerContent extends StatelessWidget {
  const AllergyTrackerContent({
    super.key,
    required this.state,
    required this.viewModel,
  });

  final AllergyTrackerLoadedState state;
  final AllergyTrackerViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);

    return DefaultTabController(
      length: 3,
      child: SafeArea(
        child: Column(
          children: [
            // ── Header ──────────────────────────────────────────────────
            Padding(
              padding: EdgeInsets.fromLTRB(
                context.spacing24,
                context.spacing16,
                context.spacing24,
                0,
              ),
              child: OsmeaComponents.text(
                t.allergyTrackerTitle,
                variant: OsmeaTextVariant.headlineMedium,
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface,
              ),
            ),

            // ── Tabs ─────────────────────────────────────────────────────
            Padding(
              padding: EdgeInsets.symmetric(
                  horizontal: context.spacing16,
                  vertical: context.spacing8),
              child: TabBar(
                labelColor: theme.colorScheme.primary,
                unselectedLabelColor:
                    theme.colorScheme.onSurface.withValues(alpha: 0.5),
                indicatorColor: theme.colorScheme.primary,
                labelStyle: const TextStyle(
                    fontSize: 12, fontWeight: FontWeight.w600),
                tabs: [
                  Tab(text: t.allergyTrackerFoodsIntroduced),
                  Tab(text: t.allergyTrackerThreeDayRuleTitle),
                  Tab(text: t.allergyTrackerEmergencyTitle),
                ],
              ),
            ),

            // ── Tab views ────────────────────────────────────────────────
            Expanded(
              child: TabBarView(
                children: [
                  _IntroductionsTab(state: state, viewModel: viewModel),
                  _GuidanceTab(state: state, viewModel: viewModel),
                  _EmergencyTab(state: state, viewModel: viewModel),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Tab 1: Food Introductions ────────────────────────────────────────────────

class _IntroductionsTab extends StatelessWidget {
  const _IntroductionsTab({required this.state, required this.viewModel});

  final AllergyTrackerLoadedState state;
  final AllergyTrackerViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: EdgeInsets.all(context.spacing24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Add food button
          OsmeaComponents.button(
            text: t.allergyTrackerAddFood,
            onPressed: () => _showLogFoodDialog(context, viewModel),
            variant: ButtonVariant.ghost,
            size: ButtonSize.medium,
            backgroundColor: theme.colorScheme.primary,
            textColor: theme.colorScheme.onPrimary,
          ),

          OsmeaComponents.sizedBox(height: context.spacing20),

          // List
          if (state.introductions.isEmpty)
            _EmptyIntroductions(t: t, theme: theme)
          else ...[
            OsmeaComponents.text(
              '${t.allergyTrackerFoodsIntroduced} (${state.introductions.length})',
              variant: OsmeaTextVariant.titleSmall,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
            ),
            OsmeaComponents.sizedBox(height: context.spacing12),
            ...state.introductions.map(
              (intro) => _IntroductionTile(
                introduction: intro,
                onRemove: () => viewModel.removeIntroduction(intro.id),
                onRecordReaction: () =>
                    _showReactionDialog(context, viewModel, intro),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

void _showLogFoodDialog(
    BuildContext context, AllergyTrackerViewModel viewModel) {
  showDialog(
    context: context,
    builder: (ctx) => _LogFoodDialog(viewModel: viewModel),
  );
}

void _showReactionDialog(BuildContext context,
    AllergyTrackerViewModel viewModel, FoodIntroduction intro) {
  showDialog(
    context: context,
    builder: (ctx) =>
        _ReactionDialog(viewModel: viewModel, introduction: intro),
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

class _EmptyIntroductions extends StatelessWidget {
  const _EmptyIntroductions({required this.t, required this.theme});
  final Translations t;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: EdgeInsets.symmetric(vertical: context.spacing32),
        child: Column(
          children: [
            Icon(
              Icons.no_food_outlined,
              size: 48,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.3),
            ),
            OsmeaComponents.sizedBox(height: context.spacing12),
            OsmeaComponents.text(
              t.allergyTrackerNoIntroductions,
              variant: OsmeaTextVariant.titleSmall,
              fontWeight: FontWeight.w600,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
            ),
            OsmeaComponents.sizedBox(height: context.spacing8),
            OsmeaComponents.text(
              t.allergyTrackerNoIntroductionsSubtitle,
              variant: OsmeaTextVariant.bodySmall,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
              lineHeight: 1.4,
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Introduction tile ────────────────────────────────────────────────────────

class _IntroductionTile extends StatelessWidget {
  const _IntroductionTile({
    required this.introduction,
    required this.onRemove,
    required this.onRecordReaction,
  });

  final FoodIntroduction introduction;
  final VoidCallback onRemove;
  final VoidCallback onRecordReaction;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);
    final hasReaction = introduction.reactionObserved;
    final dateStr =
        '${introduction.dateIntroduced.day.toString().padLeft(2, '0')}/'
        '${introduction.dateIntroduced.month.toString().padLeft(2, '0')}/'
        '${introduction.dateIntroduced.year}';

    return Padding(
      padding: EdgeInsets.only(bottom: context.spacing8),
      child: Container(
        decoration: BoxDecoration(
          color: hasReaction
              ? theme.colorScheme.errorContainer.withValues(alpha: 0.15)
              : theme.colorScheme.surface,
          borderRadius: BorderRadius.circular(8.0),
          border: Border.all(
            color: hasReaction
                ? theme.colorScheme.error.withValues(alpha: 0.3)
                : theme.colorScheme.outline.withValues(alpha: 0.2),
          ),
        ),
        child: ListTile(
          leading: CircleAvatar(
            radius: 18,
            backgroundColor: hasReaction
                ? theme.colorScheme.error.withValues(alpha: 0.15)
                : theme.colorScheme.primary.withValues(alpha: 0.12),
            child: Icon(
              hasReaction ? Icons.warning_amber : Icons.check_circle_outline,
              size: 18,
              color: hasReaction
                  ? theme.colorScheme.error
                  : theme.colorScheme.primary,
            ),
          ),
          title: OsmeaComponents.text(
            introduction.foodName,
            variant: OsmeaTextVariant.bodyMedium,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurface,
          ),
          subtitle: OsmeaComponents.text(
            '$dateStr${hasReaction ? ' • ${t.allergyTrackerReactionObserved}' : ''}',
            variant: OsmeaTextVariant.bodySmall,
            color: hasReaction
                ? theme.colorScheme.error
                : theme.colorScheme.onSurface.withValues(alpha: 0.45),
          ),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (!hasReaction)
                GestureDetector(
                  onTap: onRecordReaction,
                  child: Icon(
                    Icons.add_circle_outline,
                    color: theme.colorScheme.onSurface.withValues(alpha: 0.4),
                    size: 20,
                  ),
                ),
              OsmeaComponents.sizedBox(width: context.spacing8),
              GestureDetector(
                onTap: onRemove,
                child: Icon(
                  Icons.close,
                  color: theme.colorScheme.error.withValues(alpha: 0.6),
                  size: 20,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ─── Log food dialog ──────────────────────────────────────────────────────────

class _LogFoodDialog extends StatefulWidget {
  const _LogFoodDialog({required this.viewModel});
  final AllergyTrackerViewModel viewModel;

  @override
  State<_LogFoodDialog> createState() => _LogFoodDialogState();
}

class _LogFoodDialogState extends State<_LogFoodDialog> {
  final _foodController = TextEditingController();
  DateTime _selectedDate = DateTime.now();

  @override
  void dispose() {
    _foodController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);
    final dateStr =
        '${_selectedDate.day.toString().padLeft(2, '0')}/'
        '${_selectedDate.month.toString().padLeft(2, '0')}/'
        '${_selectedDate.year}';

    return AlertDialog(
      title: OsmeaComponents.text(
        t.allergyTrackerAddFood,
        variant: OsmeaTextVariant.titleMedium,
        fontWeight: FontWeight.w700,
        color: theme.colorScheme.onSurface,
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          OsmeaComponents.textField(
            controller: _foodController,
            label: t.allergyTrackerFoodName,
            hint: t.allergyTrackerFoodNameHint,
            fullWidth: true,
            variant: TextFieldVariant.outlined,
          ),
          OsmeaComponents.sizedBox(height: context.spacing16),
          OsmeaComponents.text(
            t.allergyTrackerDateIntroduced,
            variant: OsmeaTextVariant.labelMedium,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
          ),
          OsmeaComponents.sizedBox(height: context.spacing8),
          GestureDetector(
            onTap: () async {
              final picked = await showDatePicker(
                context: context,
                initialDate: _selectedDate,
                firstDate:
                    DateTime.now().subtract(const Duration(days: 365)),
                lastDate: DateTime.now(),
              );
              if (picked != null) {
                setState(() => _selectedDate = picked);
              }
            },
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                border: Border.all(
                    color:
                        theme.colorScheme.outline.withValues(alpha: 0.4)),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(Icons.calendar_today,
                      size: 16,
                      color: theme.colorScheme.primary),
                  OsmeaComponents.sizedBox(width: context.spacing8),
                  OsmeaComponents.text(
                    dateStr,
                    variant: OsmeaTextVariant.bodyMedium,
                    color: theme.colorScheme.onSurface,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: OsmeaComponents.text(
            t.cancel,
            variant: OsmeaTextVariant.labelLarge,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
          ),
        ),
        OsmeaComponents.button(
          text: t.allergyTrackerLogIntroduction,
          onPressed: () {
            final name = _foodController.text.trim();
            if (name.isNotEmpty) {
              widget.viewModel.logFoodIntroduction(
                foodName: name,
                dateIntroduced: _selectedDate,
              );
            }
            Navigator.of(context).pop();
          },
          variant: ButtonVariant.ghost,
          size: ButtonSize.small,
          backgroundColor: theme.colorScheme.primary,
          textColor: theme.colorScheme.onPrimary,
        ),
      ],
    );
  }
}

// ─── Record reaction dialog ───────────────────────────────────────────────────

class _ReactionDialog extends StatefulWidget {
  const _ReactionDialog(
      {required this.viewModel, required this.introduction});
  final AllergyTrackerViewModel viewModel;
  final FoodIntroduction introduction;

  @override
  State<_ReactionDialog> createState() => _ReactionDialogState();
}

class _ReactionDialogState extends State<_ReactionDialog> {
  ReactionSeverity _severity = ReactionSeverity.mild;
  final _symptomsController = TextEditingController();
  final _actionController = TextEditingController();

  @override
  void dispose() {
    _symptomsController.dispose();
    _actionController.dispose();
    super.dispose();
  }

  String _severityLabel(BuildContext context, ReactionSeverity s) {
    final t = context.t;
    return switch (s) {
      ReactionSeverity.mild => t.allergyTrackerSeverityMild,
      ReactionSeverity.moderate => t.allergyTrackerSeverityModerate,
      ReactionSeverity.severe => t.allergyTrackerSeveritySevere,
      ReactionSeverity.anaphylaxis => t.allergyTrackerSeverityAnaphylaxis,
    };
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);

    return AlertDialog(
      title: OsmeaComponents.text(
        '${t.allergyTrackerReactionTitle}: ${widget.introduction.foodName}',
        variant: OsmeaTextVariant.titleMedium,
        fontWeight: FontWeight.w700,
        color: theme.colorScheme.onSurface,
      ),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Severity
            OsmeaComponents.text(
              t.allergyTrackerSeverityMild,
              variant: OsmeaTextVariant.labelMedium,
              color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
            ),
            OsmeaComponents.sizedBox(height: context.spacing8),
            ...ReactionSeverity.values.map(
              (s) => Padding(
                padding: EdgeInsets.only(bottom: context.spacing4),
                child: OsmeaComponents.radioButton<ReactionSeverity>(
                  value: s,
                  groupValue: _severity,
                  onChanged: (v) {
                    if (v != null) setState(() => _severity = v);
                  },
                  label: _severityLabel(context, s),
                  variant: RadioVariant.tile,
                  fullWidth: true,
                  activeColor: _severityColor(theme, s),
                ),
              ),
            ),
            OsmeaComponents.sizedBox(height: context.spacing16),
            OsmeaComponents.textField(
              controller: _symptomsController,
              label: t.allergyTrackerSymptoms,
              hint: t.allergyTrackerSymptomsHint,
              fullWidth: true,
              maxLines: 2,
              variant: TextFieldVariant.outlined,
            ),
            OsmeaComponents.sizedBox(height: context.spacing12),
            OsmeaComponents.textField(
              controller: _actionController,
              label: t.allergyTrackerActionTaken,
              hint: t.allergyTrackerActionTakenHint,
              fullWidth: true,
              maxLines: 2,
              variant: TextFieldVariant.outlined,
            ),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: OsmeaComponents.text(
            t.cancel,
            variant: OsmeaTextVariant.labelLarge,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
          ),
        ),
        OsmeaComponents.button(
          text: t.allergyTrackerSaveReaction,
          onPressed: () {
            widget.viewModel.recordReaction(
              introductionId: widget.introduction.id,
              severity: _severity,
              symptoms: _symptomsController.text.trim(),
              actionTaken: _actionController.text.trim(),
            );
            Navigator.of(context).pop();
          },
          variant: ButtonVariant.ghost,
          size: ButtonSize.small,
          backgroundColor: theme.colorScheme.error,
          textColor: theme.colorScheme.onError,
        ),
      ],
    );
  }

  Color _severityColor(ThemeData theme, ReactionSeverity s) => switch (s) {
        ReactionSeverity.mild => Colors.green,
        ReactionSeverity.moderate => Colors.orange,
        ReactionSeverity.severe => Colors.deepOrange,
        ReactionSeverity.anaphylaxis => theme.colorScheme.error,
      };
}

// ─── Tab 2: Guidance (3-Day Rule + Big 9 + Reaction Levels) ──────────────────

class _GuidanceTab extends StatelessWidget {
  const _GuidanceTab({required this.state, required this.viewModel});
  final AllergyTrackerLoadedState state;
  final AllergyTrackerViewModel viewModel;

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: EdgeInsets.all(context.spacing24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 3-Day Rule
          _GuidanceCard(
            icon: Icons.calendar_view_day_outlined,
            title: t.allergyTrackerThreeDayRuleTitle,
            theme: theme,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                OsmeaComponents.text(
                  t.allergyTrackerThreeDayRuleDesc,
                  variant: OsmeaTextVariant.bodySmall,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.7),
                  lineHeight: 1.5,
                ),
                OsmeaComponents.sizedBox(height: context.spacing12),
                _StepRow(step: '1', text: t.allergyTrackerThreeDayRuleStep1, theme: theme),
                OsmeaComponents.sizedBox(height: context.spacing8),
                _StepRow(step: '2', text: t.allergyTrackerThreeDayRuleStep2, theme: theme),
                OsmeaComponents.sizedBox(height: context.spacing8),
                _StepRow(step: '3', text: t.allergyTrackerThreeDayRuleStep3, theme: theme),
              ],
            ),
          ),

          OsmeaComponents.sizedBox(height: context.spacing20),

          // Reaction levels
          _GuidanceCard(
            icon: Icons.monitor_heart_outlined,
            title: t.allergyTrackerReactionLevelsTitle,
            theme: theme,
            child: Column(
              children: [
                _ReactionLevelRow(
                  color: Colors.green,
                  label: t.allergyTrackerSeverityMild,
                  desc: t.allergyTrackerSeverityMildDesc,
                  theme: theme,
                ),
                OsmeaComponents.sizedBox(height: context.spacing8),
                _ReactionLevelRow(
                  color: Colors.orange,
                  label: t.allergyTrackerSeverityModerate,
                  desc: t.allergyTrackerSeverityModerateDesc,
                  theme: theme,
                ),
                OsmeaComponents.sizedBox(height: context.spacing8),
                _ReactionLevelRow(
                  color: Colors.deepOrange,
                  label: t.allergyTrackerSeveritySevere,
                  desc: t.allergyTrackerSeveritySevereDesc,
                  theme: theme,
                ),
                OsmeaComponents.sizedBox(height: context.spacing8),
                _ReactionLevelRow(
                  color: theme.colorScheme.error,
                  label: t.allergyTrackerSeverityAnaphylaxis,
                  desc: t.allergyTrackerSeverityAnaphylaxisDesc,
                  theme: theme,
                ),
              ],
            ),
          ),

          OsmeaComponents.sizedBox(height: context.spacing20),

          // Big 9 allergens
          _GuidanceCard(
            icon: Icons.biotech_outlined,
            title: t.allergyTrackerBigNineTitle,
            theme: theme,
            child: Column(
              children: kBig9Allergens.map((allergen) {
                return Padding(
                  padding: EdgeInsets.only(bottom: context.spacing10),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Container(
                        width: 6,
                        height: 6,
                        margin: const EdgeInsets.only(top: 6),
                        decoration: BoxDecoration(
                          color: theme.colorScheme.primary,
                          shape: BoxShape.circle,
                        ),
                      ),
                      OsmeaComponents.sizedBox(width: context.spacing8),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            OsmeaComponents.text(
                              allergen.name,
                              variant: OsmeaTextVariant.bodySmall,
                              fontWeight: FontWeight.w600,
                              color: theme.colorScheme.onSurface,
                            ),
                            OsmeaComponents.text(
                              allergen.prevalence,
                              variant: OsmeaTextVariant.bodySmall,
                              color: theme.colorScheme.onSurface
                                  .withValues(alpha: 0.5),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              }).toList(),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── Tab 3: Emergency + Family History ────────────────────────────────────────

class _EmergencyTab extends StatefulWidget {
  const _EmergencyTab({required this.state, required this.viewModel});
  final AllergyTrackerLoadedState state;
  final AllergyTrackerViewModel viewModel;

  @override
  State<_EmergencyTab> createState() => _EmergencyTabState();
}

class _EmergencyTabState extends State<_EmergencyTab> {
  late final TextEditingController _historyController;
  RiskClassification _selectedRisk = RiskClassification.low;

  @override
  void initState() {
    super.initState();
    _historyController = TextEditingController(
        text: widget.state.familyAllergyHistory);
    _selectedRisk = widget.state.riskClassification;
  }

  @override
  void dispose() {
    _historyController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final t = context.t;
    final theme = Theme.of(context);

    return SingleChildScrollView(
      padding: EdgeInsets.all(context.spacing24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Emergency banner
          Container(
            padding: EdgeInsets.all(context.spacing16),
            decoration: BoxDecoration(
              color: theme.colorScheme.error.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(context.radiusMedium),
              border: Border.all(
                  color: theme.colorScheme.error.withValues(alpha: 0.3)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.emergency, color: theme.colorScheme.error, size: 22),
                    OsmeaComponents.sizedBox(width: context.spacing8),
                    OsmeaComponents.text(
                      t.allergyTrackerEmergencyTitle,
                      variant: OsmeaTextVariant.titleMedium,
                      fontWeight: FontWeight.w700,
                      color: theme.colorScheme.error,
                    ),
                  ],
                ),
                OsmeaComponents.sizedBox(height: context.spacing12),
                OsmeaComponents.text(
                  t.allergyTrackerEmergencyDesc,
                  variant: OsmeaTextVariant.bodySmall,
                  color: theme.colorScheme.onSurface.withValues(alpha: 0.8),
                  lineHeight: 1.5,
                ),
                OsmeaComponents.sizedBox(height: context.spacing16),
                OsmeaComponents.button(
                  text: t.allergyTrackerCallEmergency,
                  onPressed: () {},
                  variant: ButtonVariant.ghost,
                  size: ButtonSize.medium,
                  backgroundColor: theme.colorScheme.error,
                  textColor: theme.colorScheme.onError,
                ),
              ],
            ),
          ),

          OsmeaComponents.sizedBox(height: context.spacing24),

          // Family history
          OsmeaComponents.text(
            t.allergyTrackerFamilyHistoryTitle,
            variant: OsmeaTextVariant.titleMedium,
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurface,
          ),
          OsmeaComponents.sizedBox(height: context.spacing12),
          OsmeaComponents.textField(
            controller: _historyController,
            hint: t.allergyTrackerFamilyHistoryHint,
            fullWidth: true,
            maxLines: 3,
            variant: TextFieldVariant.outlined,
          ),
          OsmeaComponents.sizedBox(height: context.spacing16),

          // Risk classification
          OsmeaComponents.text(
            'Risk Classification',
            variant: OsmeaTextVariant.labelMedium,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
          ),
          OsmeaComponents.sizedBox(height: context.spacing8),
          ...RiskClassification.values.map((risk) {
            final label = switch (risk) {
              RiskClassification.low => t.allergyTrackerRiskLow,
              RiskClassification.moderate => t.allergyTrackerRiskModerate,
              RiskClassification.high => t.allergyTrackerRiskHigh,
            };
            return Padding(
              padding: EdgeInsets.only(bottom: context.spacing6),
              child: OsmeaComponents.radioButton<RiskClassification>(
                value: risk,
                groupValue: _selectedRisk,
                onChanged: (v) {
                  if (v != null) setState(() => _selectedRisk = v);
                },
                label: label,
                variant: RadioVariant.tile,
                fullWidth: true,
                activeColor: _riskColor(theme, risk),
              ),
            );
          }),

          OsmeaComponents.sizedBox(height: context.spacing20),

          OsmeaComponents.button(
            text: t.allergyTrackerSaveHistory,
            onPressed: () {
              widget.viewModel.updateFamilyHistory(
                familyAllergyHistory: _historyController.text.trim(),
                riskClassification: _selectedRisk,
              );
            },
            variant: ButtonVariant.ghost,
            size: ButtonSize.large,
            backgroundColor: theme.colorScheme.primary,
            textColor: theme.colorScheme.onPrimary,
          ),
        ],
      ),
    );
  }

  Color _riskColor(ThemeData theme, RiskClassification risk) => switch (risk) {
        RiskClassification.low => Colors.green,
        RiskClassification.moderate => Colors.orange,
        RiskClassification.high => theme.colorScheme.error,
      };
}

// ─── Reusable sub-widgets ─────────────────────────────────────────────────────

class _GuidanceCard extends StatelessWidget {
  const _GuidanceCard({
    required this.icon,
    required this.title,
    required this.theme,
    required this.child,
  });

  final IconData icon;
  final String title;
  final ThemeData theme;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.all(context.spacing16),
      decoration: BoxDecoration(
        color: theme.colorScheme.surface,
        borderRadius: BorderRadius.circular(context.radiusMedium),
        border: Border.all(
            color: theme.colorScheme.outline.withValues(alpha: 0.2)),
        boxShadow: [
          BoxShadow(
            color: theme.colorScheme.shadow.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, color: theme.colorScheme.primary, size: 18),
              OsmeaComponents.sizedBox(width: context.spacing8),
              OsmeaComponents.text(
                title,
                variant: OsmeaTextVariant.titleSmall,
                fontWeight: FontWeight.w700,
                color: theme.colorScheme.onSurface,
              ),
            ],
          ),
          OsmeaComponents.sizedBox(height: context.spacing12),
          child,
        ],
      ),
    );
  }
}

class _StepRow extends StatelessWidget {
  const _StepRow(
      {required this.step, required this.text, required this.theme});
  final String step;
  final String text;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 22,
          height: 22,
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: theme.colorScheme.primary,
            shape: BoxShape.circle,
          ),
          child: OsmeaComponents.text(
            step,
            variant: OsmeaTextVariant.labelSmall,
            color: theme.colorScheme.onPrimary,
            fontWeight: FontWeight.w700,
          ),
        ),
        OsmeaComponents.sizedBox(width: context.spacing8),
        Expanded(
          child: OsmeaComponents.text(
            text,
            variant: OsmeaTextVariant.bodySmall,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.8),
            lineHeight: 1.4,
          ),
        ),
      ],
    );
  }
}

class _ReactionLevelRow extends StatelessWidget {
  const _ReactionLevelRow({
    required this.color,
    required this.label,
    required this.desc,
    required this.theme,
  });
  final Color color;
  final String label;
  final String desc;
  final ThemeData theme;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          width: 10,
          height: 10,
          margin: const EdgeInsets.only(top: 4),
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
        OsmeaComponents.sizedBox(width: context.spacing8),
        Expanded(
          child: OsmeaComponents.text(
            desc,
            variant: OsmeaTextVariant.bodySmall,
            color: theme.colorScheme.onSurface.withValues(alpha: 0.75),
            lineHeight: 1.4,
          ),
        ),
      ],
    );
  }
}

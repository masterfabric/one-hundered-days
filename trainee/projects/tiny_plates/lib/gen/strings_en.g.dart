///
/// Generated file. Do not edit.
///
// coverage:ignore-file
// ignore_for_file: type=lint, unused_import
// dart format off

part of 'strings.g.dart';

// Path: <root>
typedef TranslationsEn = Translations; // ignore: unused_element
class Translations with BaseTranslations<AppLocale, Translations> {
	/// Returns the current translations of the given [context].
	///
	/// Usage:
	/// final t = Translations.of(context);
	static Translations of(BuildContext context) => InheritedLocaleData.of<AppLocale, Translations>(context).translations;

	/// You can call this constructor and build your own translation instance of this locale.
	/// Constructing via the enum [AppLocale.build] is preferred.
	Translations({Map<String, Node>? overrides, PluralResolver? cardinalResolver, PluralResolver? ordinalResolver, TranslationMetadata<AppLocale, Translations>? meta})
		: assert(overrides == null, 'Set "translation_overrides: true" in order to enable this feature.'),
		  $meta = meta ?? TranslationMetadata(
		    locale: AppLocale.en,
		    overrides: overrides ?? {},
		    cardinalResolver: cardinalResolver,
		    ordinalResolver: ordinalResolver,
		  ) {
		$meta.setFlatMapFunction(_flatMapFunction);
	}

	/// Metadata for the translations of <en>.
	@override final TranslationMetadata<AppLocale, Translations> $meta;

	/// Access flat map
	dynamic operator[](String key) => $meta.getTranslation(key);

	late final Translations _root = this; // ignore: unused_field

	Translations $copyWith({TranslationMetadata<AppLocale, Translations>? meta}) => Translations(meta: meta ?? this.$meta);

	// Translations

	/// en: 'en_US'
	String get localLanguageCode => 'en_US';

	/// en: 'Tiny Plates'
	String get appTitle => 'Tiny Plates';

	/// en: 'Home'
	String get home => 'Home';

	/// en: 'Tiny Plates'
	String get homeTitle => 'Tiny Plates';

	/// en: 'Settings'
	String get settings => 'Settings';

	/// en: 'Save'
	String get save => 'Save';

	/// en: 'Cancel'
	String get cancel => 'Cancel';

	/// en: 'Loading...'
	String get loading => 'Loading...';

	/// en: 'Error'
	String get error => 'Error';

	/// en: 'Retry'
	String get retry => 'Retry';

	/// en: 'Skip'
	String get onboardingSkip => 'Skip';

	/// en: 'Previous'
	String get onboardingPrevious => 'Previous';

	/// en: 'Next'
	String get onboardingNext => 'Next';

	/// en: 'Get started'
	String get onboardingGetStarted => 'Get started';

	/// en: 'No onboarding pages'
	String get onboardingNoPages => 'No onboarding pages';

	/// en: 'Load failed'
	String get onboardingLoadFailed => 'Load failed';

	/// en: 'Diary'
	String get diary => 'Diary';

	/// en: 'Child Profile'
	String get profileSetupTitle => 'Child Profile';

	/// en: 'Step'
	String get profileStep => 'Step';

	/// en: 'Next'
	String get profileNext => 'Next';

	/// en: 'Previous'
	String get profilePrevious => 'Previous';

	/// en: 'Save Profile'
	String get profileSave => 'Save Profile';

	/// en: 'Continue'
	String get profileContinue => 'Continue';

	/// en: 'How old is your child?'
	String get profileAgeTitle => 'How old is your child?';

	/// en: 'Enter your child's age in months so we can personalise their nutrition plan.'
	String get profileAgeDescription => 'Enter your child\'s age in months so we can personalise their nutrition plan.';

	/// en: 'Age (months)'
	String get profileAgeLabel => 'Age (months)';

	/// en: 'e.g. 8'
	String get profileAgeHint => 'e.g. 8';

	/// en: 'Enter a value between 0 and 36 months.'
	String get profileAgeNote => 'Enter a value between 0 and 36 months.';

	/// en: 'Any allergies?'
	String get profileAllergiesTitle => 'Any allergies?';

	/// en: 'Select all allergens that apply. We will filter out unsafe foods automatically.'
	String get profileAllergiesDescription => 'Select all allergens that apply. We will filter out unsafe foods automatically.';

	/// en: 'Chewing level'
	String get profileChewingTitle => 'Chewing level';

	/// en: 'Texture tolerance'
	String get profileTextureTitle => 'Texture tolerance';

	/// en: 'Special conditions & sensory'
	String get profileSpecialTitle => 'Special conditions & sensory';

	/// en: 'My child was born premature'
	String get profileIsPrematureLabel => 'My child was born premature';

	/// en: 'Special dietary needs'
	String get profileDietaryNeedsLabel => 'Special dietary needs';

	/// en: 'e.g. vegan, halal, kosher…'
	String get profileDietaryNeedsHint => 'e.g. vegan, halal, kosher…';

	/// en: 'Food intolerances'
	String get profileFoodIntolerancesLabel => 'Food intolerances';

	/// en: 'e.g. lactose, gluten…'
	String get profileFoodIntolerancesHint => 'e.g. lactose, gluten…';

	/// en: 'Sensory preferences'
	String get profileSensoryTitle => 'Sensory preferences';

	/// en: 'Profile saved!'
	String get profileSavedTitle => 'Profile saved!';

	/// en: 'Here is a personalised tip based on your child's texture level.'
	String get profileSavedSubtitle => 'Here is a personalised tip based on your child\'s texture level.';

	/// en: 'AI Texture Tip'
	String get profileGuidanceTitle => 'AI Texture Tip';

	/// en: 'Welcome to Tiny Plates'
	String get homeWelcome => 'Welcome to Tiny Plates';

	/// en: 'Personalised nutrition for your little one'
	String get homeSubtitle => 'Personalised nutrition for your little one';

	/// en: 'My Pantry'
	String get homeFeaturePantry => 'My Pantry';

	/// en: 'Manage ingredients at home'
	String get homeFeaturePantryDesc => 'Manage ingredients at home';

	/// en: 'Allergy Tracker'
	String get homeFeatureAllergy => 'Allergy Tracker';

	/// en: 'Log foods & track reactions'
	String get homeFeatureAllergyDesc => 'Log foods & track reactions';

	/// en: 'Child Profile'
	String get homeFeatureProfile => 'Child Profile';

	/// en: 'Update profile & preferences'
	String get homeFeatureProfileDesc => 'Update profile & preferences';

	/// en: 'My Pantry'
	String get pantryTitle => 'My Pantry';

	/// en: 'Search ingredients…'
	String get pantrySearchHint => 'Search ingredients…';

	/// en: 'Your pantry is empty'
	String get pantryEmptyTitle => 'Your pantry is empty';

	/// en: 'Search and add ingredients you have at home.'
	String get pantryEmptySubtitle => 'Search and add ingredients you have at home.';

	/// en: 'Add'
	String get pantryAddIngredient => 'Add';

	/// en: 'No ingredients found'
	String get pantryNoResults => 'No ingredients found';

	/// en: 'Vegetables'
	String get pantryCategoryVegetables => 'Vegetables';

	/// en: 'Fruits'
	String get pantryCategoryFruits => 'Fruits';

	/// en: 'Grains'
	String get pantryCategoryGrains => 'Grains';

	/// en: 'Proteins'
	String get pantryCategoryProteins => 'Proteins';

	/// en: 'Added Ingredients'
	String get pantryAddedIngredients => 'Added Ingredients';

	/// en: 'All Ingredients'
	String get pantrySearchResults => 'All Ingredients';

	/// en: 'Allergy Tracker'
	String get allergyTrackerTitle => 'Allergy Tracker';

	/// en: 'Log New Food'
	String get allergyTrackerAddFood => 'Log New Food';

	/// en: 'Food name'
	String get allergyTrackerFoodName => 'Food name';

	/// en: 'e.g. Strawberry'
	String get allergyTrackerFoodNameHint => 'e.g. Strawberry';

	/// en: 'Date introduced'
	String get allergyTrackerDateIntroduced => 'Date introduced';

	/// en: 'Reaction observed?'
	String get allergyTrackerReactionObserved => 'Reaction observed?';

	/// en: 'Log Introduction'
	String get allergyTrackerLogIntroduction => 'Log Introduction';

	/// en: 'No foods logged yet'
	String get allergyTrackerNoIntroductions => 'No foods logged yet';

	/// en: 'Start logging new foods following the 3-Day Rule.'
	String get allergyTrackerNoIntroductionsSubtitle => 'Start logging new foods following the 3-Day Rule.';

	/// en: '3-Day Rule'
	String get allergyTrackerThreeDayRuleTitle => '3-Day Rule';

	/// en: 'Introduce one new food at a time, wait 3 days before introducing another.'
	String get allergyTrackerThreeDayRuleDesc => 'Introduce one new food at a time, wait 3 days before introducing another. This helps identify food reactions.';

	/// en: 'Day 1: Offer a small amount of the new food'
	String get allergyTrackerThreeDayRuleStep1 => 'Day 1: Offer a small amount of the new food';

	/// en: 'Day 2: Offer slightly more if no reaction'
	String get allergyTrackerThreeDayRuleStep2 => 'Day 2: Offer slightly more if no reaction';

	/// en: 'Day 3: Full serving if no reaction after 3 days'
	String get allergyTrackerThreeDayRuleStep3 => 'Day 3: Full serving if no reaction after 3 days';

	/// en: 'Record Reaction'
	String get allergyTrackerReactionTitle => 'Record Reaction';

	/// en: 'Mild'
	String get allergyTrackerSeverityMild => 'Mild';

	/// en: 'Moderate'
	String get allergyTrackerSeverityModerate => 'Moderate';

	/// en: 'Severe'
	String get allergyTrackerSeveritySevere => 'Severe';

	/// en: 'Anaphylaxis'
	String get allergyTrackerSeverityAnaphylaxis => 'Anaphylaxis';

	/// en: 'Symptoms'
	String get allergyTrackerSymptoms => 'Symptoms';

	/// en: 'Describe observed symptoms…'
	String get allergyTrackerSymptomsHint => 'Describe observed symptoms…';

	/// en: 'Action taken'
	String get allergyTrackerActionTaken => 'Action taken';

	/// en: 'What did you do?'
	String get allergyTrackerActionTakenHint => 'What did you do?';

	/// en: 'Save Reaction'
	String get allergyTrackerSaveReaction => 'Save Reaction';

	/// en: 'The Big 9 Allergens'
	String get allergyTrackerBigNineTitle => 'The Big 9 Allergens';

	/// en: 'Emergency Protocols'
	String get allergyTrackerEmergencyTitle => 'Emergency Protocols';

	/// en: 'Call 112'
	String get allergyTrackerCallEmergency => 'Call 112';

	/// en: 'Call emergency services immediately if your child shows signs of anaphylaxis.'
	String get allergyTrackerEmergencyDesc => 'Call emergency services immediately if your child shows signs of anaphylaxis: severe breathing difficulty, throat swelling, sudden blood pressure drop, or loss of consciousness.';

	/// en: 'Family Allergy History'
	String get allergyTrackerFamilyHistoryTitle => 'Family Allergy History';

	/// en: 'Describe any family allergy history…'
	String get allergyTrackerFamilyHistoryHint => 'Describe any family allergy history…';

	/// en: 'Low Risk'
	String get allergyTrackerRiskLow => 'Low Risk';

	/// en: 'Moderate Risk'
	String get allergyTrackerRiskModerate => 'Moderate Risk';

	/// en: 'High Risk'
	String get allergyTrackerRiskHigh => 'High Risk';

	/// en: 'Save Family History'
	String get allergyTrackerSaveHistory => 'Save Family History';

	/// en: 'Foods Introduced'
	String get allergyTrackerFoodsIntroduced => 'Foods Introduced';

	/// en: 'Reaction Levels'
	String get allergyTrackerReactionLevelsTitle => 'Reaction Levels';

	/// en: 'Mild: Localised rash, runny nose, mild itching'
	String get allergyTrackerSeverityMildDesc => 'Mild: Localised rash, runny nose, mild itching';

	/// en: 'Moderate: Hives, vomiting, abdominal pain'
	String get allergyTrackerSeverityModerateDesc => 'Moderate: Hives, vomiting, abdominal pain';

	/// en: 'Severe: Widespread hives, breathing difficulty, swelling'
	String get allergyTrackerSeveritySevereDesc => 'Severe: Widespread hives, breathing difficulty, swelling';

	/// en: 'Anaphylaxis: Life-threatening. Call 112 immediately!'
	String get allergyTrackerSeverityAnaphylaxisDesc => 'Anaphylaxis: Life-threatening. Call 112 immediately!';
}

/// The flat map containing all translations for locale <en>.
/// Only for edge cases! For simple maps, use the map function of this library.
///
/// The Dart AOT compiler has issues with very large switch statements,
/// so the map is split into smaller functions (512 entries each).
extension on Translations {
	dynamic _flatMapFunction(String path) {
		return switch (path) {
			'localLanguageCode' => 'en_US',
			'appTitle' => 'Tiny Plates',
			'home' => 'Home',
			'homeTitle' => 'Tiny Plates',
			'settings' => 'Settings',
			'save' => 'Save',
			'cancel' => 'Cancel',
			'loading' => 'Loading...',
			'error' => 'Error',
			'retry' => 'Retry',
			'onboardingSkip' => 'Skip',
			'onboardingPrevious' => 'Previous',
			'onboardingNext' => 'Next',
			'onboardingGetStarted' => 'Get started',
			'onboardingNoPages' => 'No onboarding pages',
			'onboardingLoadFailed' => 'Load failed',
			'diary' => 'Diary',
			'profileSetupTitle' => 'Child Profile',
			'profileStep' => 'Step',
			'profileNext' => 'Next',
			'profilePrevious' => 'Previous',
			'profileSave' => 'Save Profile',
			'profileContinue' => 'Continue',
			'profileAgeTitle' => 'How old is your child?',
			'profileAgeDescription' => 'Enter your child\'s age in months so we can personalise their nutrition plan.',
			'profileAgeLabel' => 'Age (months)',
			'profileAgeHint' => 'e.g. 8',
			'profileAgeNote' => 'Enter a value between 0 and 36 months.',
			'profileAllergiesTitle' => 'Any allergies?',
			'profileAllergiesDescription' => 'Select all allergens that apply. We will filter out unsafe foods automatically.',
			'profileChewingTitle' => 'Chewing level',
			'profileTextureTitle' => 'Texture tolerance',
			'profileSpecialTitle' => 'Special conditions & sensory',
			'profileIsPrematureLabel' => 'My child was born premature',
			'profileDietaryNeedsLabel' => 'Special dietary needs',
			'profileDietaryNeedsHint' => 'e.g. vegan, halal, kosher…',
			'profileFoodIntolerancesLabel' => 'Food intolerances',
			'profileFoodIntolerancesHint' => 'e.g. lactose, gluten…',
			'profileSensoryTitle' => 'Sensory preferences',
			'profileSavedTitle' => 'Profile saved!',
			'profileSavedSubtitle' => 'Here is a personalised tip based on your child\'s texture level.',
			'profileGuidanceTitle' => 'AI Texture Tip',
			'homeWelcome' => 'Welcome to Tiny Plates',
			'homeSubtitle' => 'Personalised nutrition for your little one',
			'homeFeaturePantry' => 'My Pantry',
			'homeFeaturePantryDesc' => 'Manage ingredients at home',
			'homeFeatureAllergy' => 'Allergy Tracker',
			'homeFeatureAllergyDesc' => 'Log foods & track reactions',
			'homeFeatureProfile' => 'Child Profile',
			'homeFeatureProfileDesc' => 'Update profile & preferences',
			'pantryTitle' => 'My Pantry',
			'pantrySearchHint' => 'Search ingredients…',
			'pantryEmptyTitle' => 'Your pantry is empty',
			'pantryEmptySubtitle' => 'Search and add ingredients you have at home.',
			'pantryAddIngredient' => 'Add',
			'pantryNoResults' => 'No ingredients found',
			'pantryCategoryVegetables' => 'Vegetables',
			'pantryCategoryFruits' => 'Fruits',
			'pantryCategoryGrains' => 'Grains',
			'pantryCategoryProteins' => 'Proteins',
			'pantryAddedIngredients' => 'Added Ingredients',
			'pantrySearchResults' => 'All Ingredients',
			'allergyTrackerTitle' => 'Allergy Tracker',
			'allergyTrackerAddFood' => 'Log New Food',
			'allergyTrackerFoodName' => 'Food name',
			'allergyTrackerFoodNameHint' => 'e.g. Strawberry',
			'allergyTrackerDateIntroduced' => 'Date introduced',
			'allergyTrackerReactionObserved' => 'Reaction observed?',
			'allergyTrackerLogIntroduction' => 'Log Introduction',
			'allergyTrackerNoIntroductions' => 'No foods logged yet',
			'allergyTrackerNoIntroductionsSubtitle' => 'Start logging new foods following the 3-Day Rule.',
			'allergyTrackerThreeDayRuleTitle' => '3-Day Rule',
			'allergyTrackerThreeDayRuleDesc' => 'Introduce one new food at a time, wait 3 days before introducing another. This helps identify food reactions.',
			'allergyTrackerThreeDayRuleStep1' => 'Day 1: Offer a small amount of the new food',
			'allergyTrackerThreeDayRuleStep2' => 'Day 2: Offer slightly more if no reaction',
			'allergyTrackerThreeDayRuleStep3' => 'Day 3: Full serving if no reaction after 3 days',
			'allergyTrackerReactionTitle' => 'Record Reaction',
			'allergyTrackerSeverityMild' => 'Mild',
			'allergyTrackerSeverityModerate' => 'Moderate',
			'allergyTrackerSeveritySevere' => 'Severe',
			'allergyTrackerSeverityAnaphylaxis' => 'Anaphylaxis',
			'allergyTrackerSymptoms' => 'Symptoms',
			'allergyTrackerSymptomsHint' => 'Describe observed symptoms…',
			'allergyTrackerActionTaken' => 'Action taken',
			'allergyTrackerActionTakenHint' => 'What did you do?',
			'allergyTrackerSaveReaction' => 'Save Reaction',
			'allergyTrackerBigNineTitle' => 'The Big 9 Allergens',
			'allergyTrackerEmergencyTitle' => 'Emergency Protocols',
			'allergyTrackerCallEmergency' => 'Call 112',
			'allergyTrackerEmergencyDesc' => 'Call emergency services immediately if your child shows signs of anaphylaxis: severe breathing difficulty, throat swelling, sudden blood pressure drop, or loss of consciousness.',
			'allergyTrackerFamilyHistoryTitle' => 'Family Allergy History',
			'allergyTrackerFamilyHistoryHint' => 'Describe any family allergy history…',
			'allergyTrackerRiskLow' => 'Low Risk',
			'allergyTrackerRiskModerate' => 'Moderate Risk',
			'allergyTrackerRiskHigh' => 'High Risk',
			'allergyTrackerSaveHistory' => 'Save Family History',
			'allergyTrackerFoodsIntroduced' => 'Foods Introduced',
			'allergyTrackerReactionLevelsTitle' => 'Reaction Levels',
			'allergyTrackerSeverityMildDesc' => 'Mild: Localised rash, runny nose, mild itching',
			'allergyTrackerSeverityModerateDesc' => 'Moderate: Hives, vomiting, abdominal pain',
			'allergyTrackerSeveritySevereDesc' => 'Severe: Widespread hives, breathing difficulty, swelling',
			'allergyTrackerSeverityAnaphylaxisDesc' => 'Anaphylaxis: Life-threatening. Call 112 immediately!',
			_ => null,
		};
	}
}

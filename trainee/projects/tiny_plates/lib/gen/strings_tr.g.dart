///
/// Generated file. Do not edit.
///
// coverage:ignore-file
// ignore_for_file: type=lint, unused_import
// dart format off

import 'package:flutter/widgets.dart';
import 'package:intl/intl.dart';
import 'package:slang/generated.dart';
import 'strings.g.dart';

// Path: <root>
class TranslationsTr with BaseTranslations<AppLocale, Translations> implements Translations {
	/// You can call this constructor and build your own translation instance of this locale.
	/// Constructing via the enum [AppLocale.build] is preferred.
	TranslationsTr({Map<String, Node>? overrides, PluralResolver? cardinalResolver, PluralResolver? ordinalResolver, TranslationMetadata<AppLocale, Translations>? meta})
		: assert(overrides == null, 'Set "translation_overrides: true" in order to enable this feature.'),
		  $meta = meta ?? TranslationMetadata(
		    locale: AppLocale.tr,
		    overrides: overrides ?? {},
		    cardinalResolver: cardinalResolver,
		    ordinalResolver: ordinalResolver,
		  ) {
		$meta.setFlatMapFunction(_flatMapFunction);
	}

	/// Metadata for the translations of <tr>.
	@override final TranslationMetadata<AppLocale, Translations> $meta;

	/// Access flat map
	@override dynamic operator[](String key) => $meta.getTranslation(key);

	late final TranslationsTr _root = this; // ignore: unused_field

	@override 
	TranslationsTr $copyWith({TranslationMetadata<AppLocale, Translations>? meta}) => TranslationsTr(meta: meta ?? this.$meta);

	// Translations
	@override String get localLanguageCode => 'tr_TR';
	@override String get appTitle => 'Tiny Plates';
	@override String get home => 'Ana Sayfa';
	@override String get homeTitle => 'Tiny Plates';
	@override String get settings => 'Ayarlar';
	@override String get save => 'Kaydet';
	@override String get cancel => 'İptal';
	@override String get loading => 'Yükleniyor...';
	@override String get error => 'Hata';
	@override String get retry => 'Tekrar Dene';
	@override String get onboardingSkip => 'Atla';
	@override String get onboardingPrevious => 'Önceki';
	@override String get onboardingNext => 'İleri';
	@override String get onboardingGetStarted => 'Başla';
	@override String get onboardingNoPages => 'Onboarding sayfası yok';
	@override String get onboardingLoadFailed => 'Yüklenemedi';
	@override String get diary => 'Günlük';
	@override String get profileSetupTitle => 'Çocuk Profili';
	@override String get profileStep => 'Adım';
	@override String get profileNext => 'İleri';
	@override String get profilePrevious => 'Geri';
	@override String get profileSave => 'Profili Kaydet';
	@override String get profileContinue => 'Devam Et';
	@override String get profileAgeTitle => 'Çocuğunuz kaç aylık?';
	@override String get profileAgeDescription => 'Beslenme planını kişiselleştirmek için çocuğunuzun yaşını ay olarak girin.';
	@override String get profileAgeLabel => 'Yaş (ay)';
	@override String get profileAgeHint => 'ör. 8';
	@override String get profileAgeNote => '0 ile 36 ay arasında bir değer girin.';
	@override String get profileAllergiesTitle => 'Alerji var mı?';
	@override String get profileAllergiesDescription => 'Geçerli olan tüm alerjenleri seçin. Güvensiz yiyecekleri otomatik olarak filtreleyeceğiz.';
	@override String get profileChewingTitle => 'Çiğneme düzeyi';
	@override String get profileTextureTitle => 'Doku toleransı';
	@override String get profileSpecialTitle => 'Özel durumlar ve duyusal tercihler';
	@override String get profileIsPrematureLabel => 'Çocuğum prematüre doğdu';
	@override String get profileDietaryNeedsLabel => 'Özel diyet ihtiyaçları';
	@override String get profileDietaryNeedsHint => 'ör. vegan, helal, kosher…';
	@override String get profileFoodIntolerancesLabel => 'Gıda intoleransları';
	@override String get profileFoodIntolerancesHint => 'ör. laktoz, gluten…';
	@override String get profileSensoryTitle => 'Duyusal tercihler';
	@override String get profileSavedTitle => 'Profil kaydedildi!';
	@override String get profileSavedSubtitle => 'Çocuğunuzun doku düzeyine göre kişiselleştirilmiş bir ipucu.';
	@override String get profileGuidanceTitle => 'AI Doku İpucu';
	@override String get homeWelcome => 'Tiny Plates\'e Hoşgeldiniz';
	@override String get homeSubtitle => 'Minik yemeğiniz için kişiselleştirilmiş beslenme';
	@override String get homeFeaturePantry => 'Kilerim';
	@override String get homeFeaturePantryDesc => 'Evdeki malzemeleri yönetin';
	@override String get homeFeatureAllergy => 'Alerji Takibi';
	@override String get homeFeatureAllergyDesc => 'Besin kaydedin ve reaksiyonları takip edin';
	@override String get homeFeatureProfile => 'Çocuk Profili';
	@override String get homeFeatureProfileDesc => 'Profil ve tercihleri güncelleyin';
	@override String get pantryTitle => 'Kilerim';
	@override String get pantrySearchHint => 'Malzeme ara…';
	@override String get pantryEmptyTitle => 'Kileriniz boş';
	@override String get pantryEmptySubtitle => 'Evdeki malzemeleri arayın ve ekleyin.';
	@override String get pantryAddIngredient => 'Ekle';
	@override String get pantryNoResults => 'Malzeme bulunamadı';
	@override String get pantryCategoryVegetables => 'Sebzeler';
	@override String get pantryCategoryFruits => 'Meyveler';
	@override String get pantryCategoryGrains => 'Tahıllar';
	@override String get pantryCategoryProteins => 'Proteinler';
	@override String get pantryAddedIngredients => 'Eklenen Malzemeler';
	@override String get pantrySearchResults => 'Tüm Malzemeler';
	@override String get allergyTrackerTitle => 'Alerji Takibi';
	@override String get allergyTrackerAddFood => 'Yeni Besin Kaydet';
	@override String get allergyTrackerFoodName => 'Besin adı';
	@override String get allergyTrackerFoodNameHint => 'ör. Çilek';
	@override String get allergyTrackerDateIntroduced => 'Tanıtım tarihi';
	@override String get allergyTrackerReactionObserved => 'Reaksiyon gözlemlendi mi?';
	@override String get allergyTrackerLogIntroduction => 'Tanıtımı Kaydet';
	@override String get allergyTrackerNoIntroductions => 'Henüz besin kaydedilmedi';
	@override String get allergyTrackerNoIntroductionsSubtitle => '3 Günlük Kuralı takip ederek yeni besinler kaydetmeye başlayın.';
	@override String get allergyTrackerThreeDayRuleTitle => '3 Günlük Kural';
	@override String get allergyTrackerThreeDayRuleDesc => 'Aynı anda tek bir yeni besin tanıtın, bir sonrakini tanıtmadan önce 3 gün bekleyin.';
	@override String get allergyTrackerThreeDayRuleStep1 => '1. Gün: Az miktarda yeni besin sunun';
	@override String get allergyTrackerThreeDayRuleStep2 => '2. Gün: Reaksiyon yoksa biraz daha sunun';
	@override String get allergyTrackerThreeDayRuleStep3 => '3. Gün: Reaksiyon yoksa tam porsiyon sunun';
	@override String get allergyTrackerReactionTitle => 'Reaksiyon Kaydet';
	@override String get allergyTrackerSeverityMild => 'Hafif';
	@override String get allergyTrackerSeverityModerate => 'Orta';
	@override String get allergyTrackerSeveritySevere => 'Şiddetli';
	@override String get allergyTrackerSeverityAnaphylaxis => 'Anafilaksi';
	@override String get allergyTrackerSymptoms => 'Belirtiler';
	@override String get allergyTrackerSymptomsHint => 'Gözlemlenen belirtileri açıklayın…';
	@override String get allergyTrackerActionTaken => 'Yapılan müdahale';
	@override String get allergyTrackerActionTakenHint => 'Ne yaptınız?';
	@override String get allergyTrackerSaveReaction => 'Reaksiyonu Kaydet';
	@override String get allergyTrackerBigNineTitle => 'En Yaygın 9 Alerjen';
	@override String get allergyTrackerEmergencyTitle => 'Acil Durumlar';
	@override String get allergyTrackerCallEmergency => '112\'yi Ara';
	@override String get allergyTrackerEmergencyDesc => 'Çocuğunuzda anafilaksi belirtileri varsa hemen acil servisi arayın: şiddetli nefes darlığı, boğazda şişme, ani kan basıncı düşüşü veya bilinç kaybı.';
	@override String get allergyTrackerFamilyHistoryTitle => 'Aile Alerji Geçmişi';
	@override String get allergyTrackerFamilyHistoryHint => 'Aile alerji geçmişini açıklayın…';
	@override String get allergyTrackerRiskLow => 'Düşük Risk';
	@override String get allergyTrackerRiskModerate => 'Orta Risk';
	@override String get allergyTrackerRiskHigh => 'Yüksek Risk';
	@override String get allergyTrackerSaveHistory => 'Aile Geçmişini Kaydet';
	@override String get allergyTrackerFoodsIntroduced => 'Tanıtılan Besinler';
	@override String get allergyTrackerReactionLevelsTitle => 'Reaksiyon Seviyeleri';
	@override String get allergyTrackerSeverityMildDesc => 'Hafif: Lokal döküntü, burun akıntısı, hafif kaşıntı';
	@override String get allergyTrackerSeverityModerateDesc => 'Orta: Kurdeşen, kusma, karın ağrısı';
	@override String get allergyTrackerSeveritySevereDesc => 'Şiddetli: Yaygın kurdeşen, nefes alma güçlüğü, şişme';
	@override String get allergyTrackerSeverityAnaphylaxisDesc => 'Anafilaksi: Hayati tehlike. Hemen 112\'yi arayın!';
}

/// The flat map containing all translations for locale <tr>.
/// Only for edge cases! For simple maps, use the map function of this library.
///
/// The Dart AOT compiler has issues with very large switch statements,
/// so the map is split into smaller functions (512 entries each).
extension on TranslationsTr {
	dynamic _flatMapFunction(String path) {
		return switch (path) {
			'localLanguageCode' => 'tr_TR',
			'appTitle' => 'Tiny Plates',
			'home' => 'Ana Sayfa',
			'homeTitle' => 'Tiny Plates',
			'settings' => 'Ayarlar',
			'save' => 'Kaydet',
			'cancel' => 'İptal',
			'loading' => 'Yükleniyor...',
			'error' => 'Hata',
			'retry' => 'Tekrar Dene',
			'onboardingSkip' => 'Atla',
			'onboardingPrevious' => 'Önceki',
			'onboardingNext' => 'İleri',
			'onboardingGetStarted' => 'Başla',
			'onboardingNoPages' => 'Onboarding sayfası yok',
			'onboardingLoadFailed' => 'Yüklenemedi',
			'diary' => 'Günlük',
			'profileSetupTitle' => 'Çocuk Profili',
			'profileStep' => 'Adım',
			'profileNext' => 'İleri',
			'profilePrevious' => 'Geri',
			'profileSave' => 'Profili Kaydet',
			'profileContinue' => 'Devam Et',
			'profileAgeTitle' => 'Çocuğunuz kaç aylık?',
			'profileAgeDescription' => 'Beslenme planını kişiselleştirmek için çocuğunuzun yaşını ay olarak girin.',
			'profileAgeLabel' => 'Yaş (ay)',
			'profileAgeHint' => 'ör. 8',
			'profileAgeNote' => '0 ile 36 ay arasında bir değer girin.',
			'profileAllergiesTitle' => 'Alerji var mı?',
			'profileAllergiesDescription' => 'Geçerli olan tüm alerjenleri seçin. Güvensiz yiyecekleri otomatik olarak filtreleyeceğiz.',
			'profileChewingTitle' => 'Çiğneme düzeyi',
			'profileTextureTitle' => 'Doku toleransı',
			'profileSpecialTitle' => 'Özel durumlar ve duyusal tercihler',
			'profileIsPrematureLabel' => 'Çocuğum prematüre doğdu',
			'profileDietaryNeedsLabel' => 'Özel diyet ihtiyaçları',
			'profileDietaryNeedsHint' => 'ör. vegan, helal, kosher…',
			'profileFoodIntolerancesLabel' => 'Gıda intoleransları',
			'profileFoodIntolerancesHint' => 'ör. laktoz, gluten…',
			'profileSensoryTitle' => 'Duyusal tercihler',
			'profileSavedTitle' => 'Profil kaydedildi!',
			'profileSavedSubtitle' => 'Çocuğunuzun doku düzeyine göre kişiselleştirilmiş bir ipucu.',
			'profileGuidanceTitle' => 'AI Doku İpucu',
			'homeWelcome' => 'Tiny Plates\'e Hoşgeldiniz',
			'homeSubtitle' => 'Minik yemeğiniz için kişiselleştirilmiş beslenme',
			'homeFeaturePantry' => 'Kilerim',
			'homeFeaturePantryDesc' => 'Evdeki malzemeleri yönetin',
			'homeFeatureAllergy' => 'Alerji Takibi',
			'homeFeatureAllergyDesc' => 'Besin kaydedin ve reaksiyonları takip edin',
			'homeFeatureProfile' => 'Çocuk Profili',
			'homeFeatureProfileDesc' => 'Profil ve tercihleri güncelleyin',
			'pantryTitle' => 'Kilerim',
			'pantrySearchHint' => 'Malzeme ara…',
			'pantryEmptyTitle' => 'Kileriniz boş',
			'pantryEmptySubtitle' => 'Evdeki malzemeleri arayın ve ekleyin.',
			'pantryAddIngredient' => 'Ekle',
			'pantryNoResults' => 'Malzeme bulunamadı',
			'pantryCategoryVegetables' => 'Sebzeler',
			'pantryCategoryFruits' => 'Meyveler',
			'pantryCategoryGrains' => 'Tahıllar',
			'pantryCategoryProteins' => 'Proteinler',
			'pantryAddedIngredients' => 'Eklenen Malzemeler',
			'pantrySearchResults' => 'Tüm Malzemeler',
			'allergyTrackerTitle' => 'Alerji Takibi',
			'allergyTrackerAddFood' => 'Yeni Besin Kaydet',
			'allergyTrackerFoodName' => 'Besin adı',
			'allergyTrackerFoodNameHint' => 'ör. Çilek',
			'allergyTrackerDateIntroduced' => 'Tanıtım tarihi',
			'allergyTrackerReactionObserved' => 'Reaksiyon gözlemlendi mi?',
			'allergyTrackerLogIntroduction' => 'Tanıtımı Kaydet',
			'allergyTrackerNoIntroductions' => 'Henüz besin kaydedilmedi',
			'allergyTrackerNoIntroductionsSubtitle' => '3 Günlük Kuralı takip ederek yeni besinler kaydetmeye başlayın.',
			'allergyTrackerThreeDayRuleTitle' => '3 Günlük Kural',
			'allergyTrackerThreeDayRuleDesc' => 'Aynı anda tek bir yeni besin tanıtın, bir sonrakini tanıtmadan önce 3 gün bekleyin.',
			'allergyTrackerThreeDayRuleStep1' => '1. Gün: Az miktarda yeni besin sunun',
			'allergyTrackerThreeDayRuleStep2' => '2. Gün: Reaksiyon yoksa biraz daha sunun',
			'allergyTrackerThreeDayRuleStep3' => '3. Gün: Reaksiyon yoksa tam porsiyon sunun',
			'allergyTrackerReactionTitle' => 'Reaksiyon Kaydet',
			'allergyTrackerSeverityMild' => 'Hafif',
			'allergyTrackerSeverityModerate' => 'Orta',
			'allergyTrackerSeveritySevere' => 'Şiddetli',
			'allergyTrackerSeverityAnaphylaxis' => 'Anafilaksi',
			'allergyTrackerSymptoms' => 'Belirtiler',
			'allergyTrackerSymptomsHint' => 'Gözlemlenen belirtileri açıklayın…',
			'allergyTrackerActionTaken' => 'Yapılan müdahale',
			'allergyTrackerActionTakenHint' => 'Ne yaptınız?',
			'allergyTrackerSaveReaction' => 'Reaksiyonu Kaydet',
			'allergyTrackerBigNineTitle' => 'En Yaygın 9 Alerjen',
			'allergyTrackerEmergencyTitle' => 'Acil Durumlar',
			'allergyTrackerCallEmergency' => '112\'yi Ara',
			'allergyTrackerEmergencyDesc' => 'Çocuğunuzda anafilaksi belirtileri varsa hemen acil servisi arayın: şiddetli nefes darlığı, boğazda şişme, ani kan basıncı düşüşü veya bilinç kaybı.',
			'allergyTrackerFamilyHistoryTitle' => 'Aile Alerji Geçmişi',
			'allergyTrackerFamilyHistoryHint' => 'Aile alerji geçmişini açıklayın…',
			'allergyTrackerRiskLow' => 'Düşük Risk',
			'allergyTrackerRiskModerate' => 'Orta Risk',
			'allergyTrackerRiskHigh' => 'Yüksek Risk',
			'allergyTrackerSaveHistory' => 'Aile Geçmişini Kaydet',
			'allergyTrackerFoodsIntroduced' => 'Tanıtılan Besinler',
			'allergyTrackerReactionLevelsTitle' => 'Reaksiyon Seviyeleri',
			'allergyTrackerSeverityMildDesc' => 'Hafif: Lokal döküntü, burun akıntısı, hafif kaşıntı',
			'allergyTrackerSeverityModerateDesc' => 'Orta: Kurdeşen, kusma, karın ağrısı',
			'allergyTrackerSeveritySevereDesc' => 'Şiddetli: Yaygın kurdeşen, nefes alma güçlüğü, şişme',
			'allergyTrackerSeverityAnaphylaxisDesc' => 'Anafilaksi: Hayati tehlike. Hemen 112\'yi arayın!',
			_ => null,
		};
	}
}

import type { Language } from "./store";

/* ── Translation dictionaries ── */

const en = {
  // Axes
  axis_economy: "Economy",
  axis_governance: "Governance",
  axis_civil_liberties: "Civil Liberties",
  axis_society: "Society",
  axis_diplomacy: "Diplomacy",
  axis_environment: "Environment",
  axis_justice: "Justice",
  axis_technology: "Technology",

  // Navigation
  tab_compass: "Compass",
  tab_session: "Session",
  tab_history: "History",
  tab_wallet: "Wallet",

  // Dashboard
  dashboard_title: "Dashboard",
  disconnect: "Disconnect",
  save_snapshot: "Save Snapshot",
  snapshot_placeholder: "Snapshot name (optional)",
  view_2d: "2D",
  view_3d: "3D",

  // Session
  session_ready_title: "Ready to refine your compass?",
  session_ready_desc: "Answer 3 more propositions to deepen your civic profile.",
  start_session: "Start Session",
  loading_questions: "Loading questions…",
  session_complete: "Session Complete!",
  session_all_done: "You've answered all available questions. Check back when new ones are added!",
  session_updated: "Your compass has been updated. Switch to the Compass tab to see your changes.",
  view_compass: "View Compass",
  another_round: "Another Round",
  question_of: "Question {current} of {total}",

  // History / Timeline
  no_snapshots: "No snapshots yet. Save your first one from the Compass tab.",
  timeline: "Timeline",
  compare: "Compare",
  select_to_compare: "Select two snapshots to compare",
  comparing: "Comparing",
  vs: "vs",
  clear_selection: "Clear",
  diff_title: "Compass Diff",
  total_shift: "Total Shift",
  biggest_shift: "Biggest Shift",
  no_change: "No significant changes",
  from_label: "From",
  to_label: "To",
  delta_label: "Delta",
  snapshot_saved: "Snapshot saved!",
  auto_snapshot: "Auto-save after session",

  // Frequency
  frequency_title: "Reflection Frequency",
  frequency_desc: "How often do you want to be reminded?",
  freq_daily: "Daily",
  freq_weekly: "Weekly",
  freq_monthly: "Monthly",
  freq_saved: "Preference saved",

  // Wallet
  civic_tokens: "$CIVIC tokens",
  wallet_details: "Wallet Details",
  address: "Address",
  type: "Type",
  no_wallet: "No wallet found.",

  // Share
  share: "Share",
  download: "Download",
  copy_link: "Copy Link",
  share_on_x: "Share on X",
  copied: "Copied!",

  // Theme
  light_mode: "Light",
  dark_mode: "Dark",

  // Language
  language: "Language",
  lang_en: "English",
  lang_fa: "فارسی",

  // Landing
  landing_badge: "Phase 1 · Web MVP",
  landing_title: "Track your civic identity as it evolves",
  landing_desc: "Eight dimensions. One compass. Your beliefs change — now you can see how.",
  get_started: "Get Started",

  // Onboarding
  onboard_title: "Your Civic Compass",
  begin_calibration: "Begin Calibration",

  // Connect
  connect_title: "Connect to Civic Compass",
  connect_desc: "In the full version, you'll connect MetaMask or create a smart wallet. For now, click below to get started instantly.",
  connect_button: "Quick Start (Dev Mode)",
  connect_button_loading: "Connecting...",
  connect_error: "Failed to connect. Is the backend running on port 3001?",
  connect_footer: "MetaMask & WalletConnect coming in Phase 1 completion",

  // Onboarding detail
  onboard_welcome: "Welcome to Civic Compass",
  onboard_manifesto_1: "Your beliefs evolve. Shouldn't your compass?",
  onboard_manifesto_2: "Civic Compass maps your civic identity across 8 dimensions — Economy, Governance, Civil Liberties, Society, Diplomacy, Environment, Justice, and Technology.",
  onboard_manifesto_3: "It's not a quiz. It's a companion. Answer propositions over time, and watch your compass sharpen as your thinking deepens.",
  onboard_manifesto_4: "Your data is yours. Private by default. No one sees your compass unless you choose to share it.",
  onboard_research_label: "Optional",
  onboard_research_title: "Research Mode",
  onboard_research_desc: "Have an invite code from our research team? Enter it below to help validate the instrument and earn extra $CIVIC tokens.",
  onboard_research_placeholder: "e.g. CIVIC-RESEARCH-2026",
  onboard_research_activate: "Activate",
  onboard_research_error: "Failed to activate research mode.",

  // Calibration
  calibration_title: "Calibration",
  calibration_desc: "Answer these 8 questions to initialize your compass",
  calibration_loading: "Loading calibration questions...",
  calibration_no_questions: "No questions found. Make sure the backend has seeded questions.",

  // Question card
  strongly_disagree: "Strongly Disagree",
  strongly_agree: "Strongly Agree",
  neutral: "Neutral",
  agree: "Agree",
  disagree: "Disagree",
  submit: "Submit",

  // Accessibility
  font_size: "Text Size",
  font_normal: "A",
  font_large: "A+",
  font_xlarge: "A++",
  font_desc: "Larger text for better readability",

  // Compass chart
  compass_name: "Compass",
  score_label: "Score",
  answers_label: "Answers",

  // Result card / share
  civic_compass: "Civic Compass",
  share_text: "My Civic Compass 🧭",
  share_discover: "Discover yours →",
  site_url: "civiccompass.app",

  // Community / Matchmaking
  tab_community: "Community",
  community_title: "Find Your Match",
  mode_mirror: "Mirror",
  mode_mirror_desc: "Find your civic soulmate — closest compass shape",
  mode_challenger: "Challenger",
  mode_challenger_desc: "Find your opposite — meaningful debate partner",
  mode_complement: "Complement",
  mode_complement_desc: "Find balance — shared core values, diverse strengths",
  match_score: "Match",
  no_matches: "No matches found. Try adjusting your threshold or sharing mode.",
  loading_matches: "Finding matches…",
  view_match: "View",
  anonymous_user: "Anonymous",

  // Privacy / Sharing
  privacy_title: "Privacy & Sharing",
  sharing_mode: "Sharing Mode",
  mode_ghost: "Ghost",
  mode_ghost_desc: "Private — invisible to others",
  mode_public: "Public",
  mode_public_desc: "Discoverable in search & matchmaking",
  mode_selective: "Selective",
  mode_selective_desc: "Only visible to high-compatibility matches",
  display_name: "Display Name",
  display_name_placeholder: "Anonymous handle (optional)",
  match_threshold_label: "Match Threshold",
  match_threshold_desc: "Minimum compatibility % to show",
  settings_saved: "Settings saved",

  // Welcome
  welcome_choose_lang: "Choose your language to get started",
  tap_switch_appearance: "Tap to switch appearance",
};

const fa: typeof en = {
  // Axes
  axis_economy: "اقتصاد",
  axis_governance: "حکمرانی",
  axis_civil_liberties: "آزادی‌های مدنی",
  axis_society: "جامعه",
  axis_diplomacy: "دیپلماسی",
  axis_environment: "محیط زیست",
  axis_justice: "عدالت",
  axis_technology: "فناوری",

  // Navigation
  tab_compass: "قطب‌نما",
  tab_session: "جلسه",
  tab_history: "تاریخچه",
  tab_wallet: "کیف پول",

  // Dashboard
  dashboard_title: "داشبورد",
  disconnect: "قطع اتصال",
  save_snapshot: "ذخیره تصویر",
  snapshot_placeholder: "نام تصویر (اختیاری)",
  view_2d: "۲بعدی",
  view_3d: "۳بعدی",

  // Session
  session_ready_title: "آماده‌اید قطب‌نمایتان را بهتر کنید؟",
  session_ready_desc: "به ۳ گزاره دیگر پاسخ دهید تا پروفایل مدنی‌تان عمیق‌تر شود.",
  start_session: "شروع جلسه",
  loading_questions: "بارگذاری سؤالات…",
  session_complete: "جلسه تمام شد!",
  session_all_done: "شما به تمام سؤالات موجود پاسخ داده‌اید. با اضافه شدن سؤالات جدید بازگردید!",
  session_updated: "قطب‌نمای شما به‌روزرسانی شد. به تب قطب‌نما بروید تا تغییرات را ببینید.",
  view_compass: "مشاهده قطب‌نما",
  another_round: "دور دیگر",
  question_of: "سؤال {current} از {total}",

  // History / Timeline
  no_snapshots: "هنوز تصویری ذخیره نشده. اولین خود را از تب قطب\u200cنما ذخیره کنید.",
  timeline: "خط زمانی",
  compare: "مقایسه",
  select_to_compare: "دو تصویر را برای مقایسه انتخاب کنید",
  comparing: "مقایسه",
  vs: "در برابر",
  clear_selection: "پاک کردن",
  diff_title: "تفاوت قطب\u200cنما",
  total_shift: "تغییر کل",
  biggest_shift: "بزرگ\u200cترین تغییر",
  no_change: "تغییر قابل توجهی نیست",
  from_label: "از",
  to_label: "به",
  delta_label: "تفاوت",
  snapshot_saved: "تصویر ذخیره شد!",
  auto_snapshot: "ذخیره خودکار پس از جلسه",

  // Frequency
  frequency_title: "تناوب تأمل",
  frequency_desc: "هر چند وقت یکبار می\u200cخواهید یادآوری شوید؟",
  freq_daily: "روزانه",
  freq_weekly: "هفتگی",
  freq_monthly: "ماهانه",
  freq_saved: "ترجیح ذخیره شد",

  // Wallet
  civic_tokens: "توکن $CIVIC",
  wallet_details: "جزئیات کیف پول",
  address: "آدرس",
  type: "نوع",
  no_wallet: "کیف پولی یافت نشد.",

  // Share
  share: "اشتراک‌گذاری",
  download: "دانلود",
  copy_link: "کپی لینک",
  share_on_x: "اشتراک در X",
  copied: "کپی شد!",

  // Theme
  light_mode: "روشن",
  dark_mode: "تاریک",

  // Language
  language: "زبان",
  lang_en: "English",
  lang_fa: "فارسی",

  // Landing
  landing_badge: "فاز ۱ · وب MVP",
  landing_title: "هویت مدنی خود را دنبال کنید",
  landing_desc: "هشت بُعد. یک قطب‌نما. باورهایتان تغییر می‌کنند — حالا می‌توانید ببینید چگونه.",
  get_started: "شروع کنید",

  // Onboarding
  onboard_title: "قطب‌نمای مدنی شما",
  begin_calibration: "شروع کالیبراسیون",

  // Connect
  connect_title: "اتصال به قطب‌نمای مدنی",
  connect_desc: "در نسخه کامل، با MetaMask یا کیف پول هوشمند متصل می‌شوید. فعلاً روی دکمه زیر کلیک کنید.",
  connect_button: "شروع سریع (حالت توسعه)",
  connect_button_loading: "در حال اتصال...",
  connect_error: "اتصال ناموفق. آیا بک‌اند روی پورت 3001 اجرا می‌شود؟",
  connect_footer: "MetaMask و WalletConnect در تکمیل فاز ۱",

  // Onboarding detail
  onboard_welcome: "به قطب‌نمای مدنی خوش آمدید",
  onboard_manifesto_1: "باورهای شما تغییر می‌کنند. آیا قطب‌نمایتان هم نباید؟",
  onboard_manifesto_2: "قطب‌نمای مدنی هویت مدنی شما را در ۸ بُعد ترسیم می‌کند — اقتصاد، حکمرانی، آزادی‌های مدنی، جامعه، دیپلماسی، محیط زیست، عدالت و فناوری.",
  onboard_manifesto_3: "این یک آزمون نیست. یک همراه است. با گذشت زمان به گزاره‌ها پاسخ دهید و ببینید قطب‌نمایتان چگونه دقیق‌تر می‌شود.",
  onboard_manifesto_4: "داده‌هایتان متعلق به شماست. به‌صورت پیش‌فرض خصوصی. هیچ‌کس قطب‌نمایتان را نمی‌بیند مگر خودتان اشتراک‌گذاری کنید.",
  onboard_research_label: "اختیاری",
  onboard_research_title: "حالت پژوهش",
  onboard_research_desc: "کد دعوت از تیم پژوهشی ما دارید؟ آن را وارد کنید تا در اعتبارسنجی ابزار کمک کنید و توکن اضافی $CIVIC بگیرید.",
  onboard_research_placeholder: "مثلاً CIVIC-RESEARCH-2026",
  onboard_research_activate: "فعال‌سازی",
  onboard_research_error: "فعال‌سازی حالت پژوهش ناموفق بود.",

  // Calibration
  calibration_title: "کالیبراسیون",
  calibration_desc: "به این ۸ سؤال پاسخ دهید تا قطب‌نمایتان مقداردهی شود",
  calibration_loading: "در حال بارگذاری سؤالات کالیبراسیون...",
  calibration_no_questions: "سؤالی یافت نشد. مطمئن شوید بک‌اند سؤالات را بارگذاری کرده است.",

  // Question card
  strongly_disagree: "کاملاً مخالفم",
  strongly_agree: "کاملاً موافقم",
  neutral: "خنثی",
  agree: "موافق",
  disagree: "مخالف",
  submit: "ثبت",

  // Accessibility
  font_size: "اندازه متن",
  font_normal: "A",
  font_large: "+A",
  font_xlarge: "++A",
  font_desc: "متن بزرگ‌تر برای خوانایی بهتر",

  // Compass chart
  compass_name: "قطب‌نما",
  score_label: "امتیاز",
  answers_label: "پاسخ‌ها",

  // Result card / share
  civic_compass: "قطب‌نمای مدنی",
  share_text: "قطب‌نمای مدنی من 🧭",
  share_discover: "قطب‌نمای خودت را کشف کن ←",
  site_url: "civiccompass.app",

  // Community / Matchmaking
  tab_community: "جامعه",
  community_title: "همتای خود را پیدا کنید",
  mode_mirror: "آینه",
  mode_mirror_desc: "همتای مدنی خود را پیدا کنید — نزدیک‌ترین شکل قطب‌نما",
  mode_challenger: "چالشگر",
  mode_challenger_desc: "مقابل خود را پیدا کنید — شریک بحث معنادار",
  mode_complement: "مکمل",
  mode_complement_desc: "تعادل بیابید — ارزش‌های مشترک، نقاط قوت متنوع",
  match_score: "تطابق",
  no_matches: "تطابقی پیدا نشد. آستانه یا حالت اشتراک‌گذاری را تنظیم کنید.",
  loading_matches: "در حال یافتن تطابق‌ها…",
  view_match: "مشاهده",
  anonymous_user: "ناشناس",

  // Privacy / Sharing
  privacy_title: "حریم خصوصی و اشتراک‌گذاری",
  sharing_mode: "حالت اشتراک‌گذاری",
  mode_ghost: "مخفی",
  mode_ghost_desc: "خصوصی — برای دیگران نامرئی",
  mode_public: "عمومی",
  mode_public_desc: "قابل کشف در جستجو و تطبیق",
  mode_selective: "انتخابی",
  mode_selective_desc: "فقط برای تطابق‌های بالا نمایش داده می‌شود",
  display_name: "نام نمایشی",
  display_name_placeholder: "نام مستعار (اختیاری)",
  match_threshold_label: "آستانه تطابق",
  match_threshold_desc: "حداقل درصد سازگاری برای نمایش",
  settings_saved: "تنظیمات ذخیره شد",

  // Welcome
  welcome_choose_lang: "برای شروع زبان خود را انتخاب کنید",
  tap_switch_appearance: "برای تغییر ظاهر بزنید",
};

const dictionaries: Record<Language, typeof en> = { en, fa };

/* ── Hook-like accessor ── */

export function t(key: keyof typeof en, lang: Language = "en", vars?: Record<string, string | number>): string {
  let str = dictionaries[lang]?.[key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}

/** Get translated axis label from axis key like "economy" */
export function axisLabel(axisKey: string, lang: Language = "en"): string {
  const tKey = `axis_${axisKey}` as keyof typeof en;
  return dictionaries[lang]?.[tKey] ?? dictionaries.en[tKey] ?? axisKey;
}

/** All axis keys */
export const AXIS_KEYS = [
  "economy",
  "governance",
  "civil_liberties",
  "society",
  "diplomacy",
  "environment",
  "justice",
  "technology",
] as const;

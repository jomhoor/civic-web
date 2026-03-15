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
  tab_session: "Questionnaires",
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
  session_ready_desc: "Choose a questionnaire and answer propositions to shape your civic profile.",
  start_session: "Start Session",
  loading_questions: "Loading questions…",
  session_complete: "Session Complete!",
  session_all_done: "You've answered all available questions. Check back when new ones are added!",
  session_updated: "Your compass has been updated. Switch to the Compass tab to see your changes.",
  view_compass: "View Compass",
  another_round: "Another Round",
  question_of: "Question {current} of {total}",
  previous_question: "Previous",

  // Questionnaires
  questionnaire_choose: "Choose a Questionnaire",
  questionnaire_questions: "{count} questions",
  questionnaire_progress: "answered",
  questionnaire_completed: "Completed",
  questionnaire_start: "Start",
  questionnaire_continue: "Continue",
  questionnaire_retake: "Retake",
  questionnaire_back: "All Questionnaires",

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
  connect_desc: "To experience the full version, connect with a smart wallet",
  connect_button: "Connect Wallet",
  connect_button_loading: "Connecting...",
  connect_error: "Failed to connect. Is the backend running on port 3001?",
  connect_footer: "MetaMask & WalletConnect",
  skip_connect: "Continue without wallet",
  connect_wallet: "Connect Wallet",
  wallet_info_title: "What is a Wallet?",
  wallet_info_body: "A crypto wallet is a digital tool that lets you securely store, send, and receive digital assets. It works like a personal vault that only you control — no bank or company can access it. Your wallet creates a unique address (like an account number) and a private key (like a password) that proves ownership.",
  wallet_info_link: "https://en.wikipedia.org/wiki/Cryptocurrency_wallet",
  wallet_info_link_label: "Learn more on Wikipedia",
  wallet_info_close: "Got it",
  guest_connect_title: "Wallet Required",
  guest_connect_community: "Connect your wallet to discover people with similar or opposing views, send pokes, and build connections.",
  guest_connect_chat: "Connect your wallet to enable end-to-end encrypted messaging with your connections.",
  guest_connect_wallet: "Connect your wallet to view your token balance and transaction history.",

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
  calibration_choose_desc: "Pick a questionnaire to begin. We'll start with a few key questions to map your compass.",
  calibration_desc: "Answer these questions to initialize your compass",
  calibration_loading: "Loading calibration questions...",
  calibration_no_questions: "No questions found. Make sure the backend has seeded questions.",
  political_compass_attribution: "Inspired by the classic two-axis political compass concept (Nolan 1969, Eysenck 1956). All questions are original.",
  nine_axes_attribution: "Inspired by the 9Axes quiz (MIT License, based on 8values). All questions are original.",

  // Question card
  strongly_disagree: "Strongly Disagree",
  strongly_agree: "Strongly Agree",
  neutral: "Neutral",
  agree: "Agree",
  disagree: "Disagree",
  submit: "Submit",
  saving: "Saving...",
  saved: "Saved ✓",

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

  // Political Compass axes & quadrants
  axis_authoritarian: "Authoritarian",
  axis_libertarian: "Libertarian",
  axis_econ_left: "Left",
  axis_econ_right: "Right",
  quad_auth_left: "Authoritarian Left",
  quad_auth_right: "Authoritarian Right",
  quad_lib_left: "Libertarian Left",
  quad_lib_right: "Libertarian Right",
  show_id: "Show ID",
  toggle_id: "Show your ID on the chart so others can find you",

  // Result card / share
  civic_compass: "Civic Compass",
  share_text: "My Civic Compass 🧭",
  share_discover: "Discover yours →",
  site_url: "civiccompass.app",

  // Profile
  profile_title: "Civic Profile",
  profile_not_found: "This profile could not be found.",
  back_to_dashboard: "Back to Dashboard",
  share_profile: "Share Profile",
  copy_id: "Copy ID",
  joined: "Joined",
  loading: "Loading",

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

  // Connections
  connections_title: "Connections",
  incoming_requests: "Incoming Requests",
  no_incoming: "No pending requests",
  connect_btn: "Connect",
  pending_btn: "Pending",
  cancel_btn: "Cancel",
  accept_btn: "Accept",
  decline_btn: "Decline",
  connected_label: "Connected",
  chat_blockscan: "Chat on Blockscan",
  connection_sent: "Request sent!",
  connection_accepted: "Connection accepted!",
  connection_declined: "Request declined",
  connection_cancelled: "Request cancelled",
  connection_intro_placeholder: "Say hi… (optional)",
  wallet_revealed: "Wallet address revealed — start chatting!",
  your_connections: "Your Connections",
  no_connections: "No connections yet. Find a match and connect!",
  match_mode_label: "matched via",

  // Analytics
  analytics_title: "Public Analytics",
  analytics_subtitle: "Aggregate civic compass data — anonymised & open",
  analytics_overview: "Overview",
  analytics_aggregate: "Aggregate Compass",
  analytics_distribution: "Distribution",
  analytics_trends: "Trends",
  analytics_total_users: "Total Users",
  analytics_public_users: "Public Users",
  analytics_total_snapshots: "Total Snapshots",
  analytics_total_responses: "Total Responses",
  analytics_top_countries: "Top Countries",
  analytics_sample_size: "Sample Size",
  analytics_filter_country: "Filter by country",
  analytics_all_countries: "All Countries",
  analytics_no_data: "No data yet. Users need to complete their compass and set their sharing mode to Public.",
  analytics_mean: "Mean",
  analytics_median: "Median",
  analytics_std_dev: "Std Dev",
  analytics_monthly_trends: "Monthly Trends",
  analytics_back: "Back to Dashboard",
  analytics_explore: "Explore Analytics",

  // Poke
  poke_user: "Poke",
  poke_sent: "Poked",
  poke_back: "Poke Back",
  poke_mutual: "Mutual — you can now chat!",
  pokes_title: "Pokes",
  no_pokes: "No pokes yet",
  poke_from: "poked you",
  start_chat: "Start Chat",

  // E2E Chat
  tab_chat: "Chat",
  chat_title: "Encrypted Messages",
  chat_placeholder: "Type a message…",
  send_message: "Send",
  no_messages: "No messages yet. Say hello!",
  chat_not_enabled: "This user hasn't enabled encrypted chat yet.",
  no_chats: "No conversations yet. Poke someone to start chatting!",
  chat_back: "All Chats",
  chat_enable: "Enable Encrypted Chat",
  chat_enable_desc: "Sign a message with your wallet to derive encryption keys. Your messages will be end-to-end encrypted.",
  chat_signing: "Signing…",
  unseen_messages: "new messages",
  unseen_pokes: "new pokes",

  // Welcome
  welcome_choose_lang: "Choose your language to get started",
  tap_switch_appearance: "Tap to switch appearance",

  // Flashcards / Learn
  tab_learn: "Learn",
  learn_title: "Human Rights",
  learn_subtitle: "Learn & memorize fundamental rights and freedoms",
  flashcard_cards: "cards",
  flashcard_completed: "completed",
  flashcard_start: "Start Learning",
  flashcard_continue: "Continue",
  flashcard_review: "Review Again",
  flashcard_locked: "Locked",
  flashcard_reward_info: "Complete to earn ~1 USDC reward",
  flashcard_reward_info_guest: "Connect Jomhoor Wallet to earn rewards",
  learn_banner: "Learn human rights & earn rewards",
  learn_banner_guest: "Learn human rights for free",
  learn_banner_cta: "Go to Learn",
  flashcard_reward_requires_wallet: "Requires Jomhoor Wallet",
  flashcard_reward_claimed: "Reward sent!",
  flashcard_show_answer: "Show Answer",
  flashcard_knew_it: "Knew it",
  flashcard_almost: "Almost",
  flashcard_didnt_know: "Didn't know",
  flashcard_progress: "Progress",
  flashcard_complete_title: "Congratulations!",
  flashcard_complete_msg: "You completed this deck and earned a badge!",
  flashcard_complete_msg_guest: "You mastered this deck! Connect with Jomhoor Wallet to earn ~1 USDC for each deck you complete.",
  flashcard_reward_pending: "Your reward is being processed…",
  flashcard_wallet_cta: "Coming Soon",
  flashcard_mastered: "Mastered",
  flashcard_of: "of",
  flashcard_back_to_decks: "Back to decks",
  flashcard_article: "Article",
  profile_badges: "Mastered Decks",
  profile_no_badges: "No completed decks yet",
  tab_profile: "Profile",
  profile_bio: "About",
  profile_bio_placeholder: "Tell others a bit about yourself...",
  profile_wallet_address: "Wallet Address",
  profile_share_link: "Share Profile",
  profile_link_copied: "Link copied!",
  profile_save: "Save",
  profile_saved: "Saved!",
  profile_member_since: "Member since",
  profile_view_public: "View public profile",
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
  tab_session: "پرسشنامه‌ها",
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
  session_ready_desc: "یک پرسشنامه انتخاب کنید و به گزاره‌ها پاسخ دهید تا پروفایل مدنی‌تان شکل بگیرد.",
  start_session: "شروع جلسه",
  loading_questions: "بارگذاری سؤالات…",
  session_complete: "جلسه تمام شد!",
  session_all_done: "شما به تمام سؤالات موجود پاسخ داده‌اید. با اضافه شدن سؤالات جدید بازگردید!",
  session_updated: "قطب‌نمای شما به‌روزرسانی شد. به تب قطب‌نما بروید تا تغییرات را ببینید.",
  view_compass: "مشاهده قطب‌نما",
  another_round: "دور دیگر",
  question_of: "سؤال {current} از {total}",
  previous_question: "قبلی",

  // Questionnaires
  questionnaire_choose: "یک پرسشنامه انتخاب کنید",
  questionnaire_questions: "{count} سؤال",
  questionnaire_progress: "پاسخ داده شده",
  questionnaire_completed: "تکمیل شده",
  questionnaire_start: "شروع",
  questionnaire_continue: "ادامه",  questionnaire_retake: "شروع مجدد",  questionnaire_back: "همه پرسشنامه‌ها",

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
  connect_desc: "برای تجربه‌ی کامل امکانات با کیف پول هوشمند متصل شوید",
  connect_button: "شروع سریع ",
  connect_button_loading: "در حال اتصال...",
  connect_error: "اتصال ناموفق. آیا بک‌اند روی پورت 3001 اجرا می‌شود؟",
  connect_footer: "MetaMask و WalletConnect",
  skip_connect: "ادامه بدون کیف پول",
  connect_wallet: "اتصال کیف پول",
  wallet_info_title: "کیف پول چیست؟",
  wallet_info_body: "کیف پول رمزارزی یک ابزار دیجیتال است که به شما امکان ذخیره، ارسال و دریافت دارایی‌های دیجیتال را به‌صورت امن می‌دهد. مانند یک صندوق شخصی عمل می‌کند که فقط شما کنترلش را دارید — هیچ بانک یا شرکتی به آن دسترسی ندارد. کیف پول شما یک آدرس منحصربه‌فرد (مانند شماره حساب) و یک کلید خصوصی (مانند رمز عبور) ایجاد می‌کند که مالکیت را اثبات می‌کند.",
  wallet_info_link: "https://fa.wikipedia.org/wiki/%DA%A9%DB%8C%D9%81_%D9%BE%D9%88%D9%84_%D8%B1%D9%85%D8%B2%D8%A7%D8%B1%D8%B2",
  wallet_info_link_label: "بیشتر بخوانید در ویکی‌پدیا",
  wallet_info_close: "متوجه شدم",
  guest_connect_title: "کیف پول لازم است",
  guest_connect_community: "برای کشف افراد با دیدگاه مشابه یا متفاوت، ارسال پوک و ایجاد ارتباط، کیف پول خود را متصل کنید.",
  guest_connect_chat: "برای فعال‌سازی پیام‌رسانی رمزگذاری‌شده با ارتباطات خود، کیف پول خود را متصل کنید.",
  guest_connect_wallet: "برای مشاهده موجودی توکن و تاریخچه تراکنش‌ها، کیف پول خود را متصل کنید.",

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
  calibration_choose_desc: "یک پرسشنامه انتخاب کنید. با چند سؤال کلیدی قطب‌نمای شما ترسیم می‌شود.",
  calibration_desc: "به این سؤالات پاسخ دهید تا قطب‌نمایتان مقداردهی شود",
  calibration_loading: "در حال بارگذاری سؤالات کالیبراسیون...",
  calibration_no_questions: "سؤالی یافت نشد. مطمئن شوید بک‌اند سؤالات را بارگذاری کرده است.",
  political_compass_attribution: "الهام‌گرفته از مفهوم قطب‌نمای سیاسی دومحوره (نولان ۱۹۶۹، آیزنک ۱۹۵۶). تمام سؤالات اصیل هستند.",
  nine_axes_attribution: "الهام‌گرفته از آزمون ۹ محور (مجوز MIT، بر پایه 8values). تمام سؤالات اصیل هستند.",

  // Question card
  strongly_disagree: "کاملاً مخالفم",
  strongly_agree: "کاملاً موافقم",
  neutral: "خنثی",
  agree: "موافق",
  disagree: "مخالف",
  submit: "ثبت",
  saving: "در حال ذخیره...",
  saved: "ذخیره شد ✓",

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

  // Political Compass axes & quadrants
  axis_authoritarian: "اقتدارگرا",
  axis_libertarian: "آزادی‌خواه",
  axis_econ_left: "چپ",
  axis_econ_right: "راست",
  quad_auth_left: "اقتدارگرای چپ",
  quad_auth_right: "اقتدارگرای راست",
  quad_lib_left: "آزادی‌خواه چپ",
  quad_lib_right: "آزادی‌خواه راست",
  show_id: "نمایش شناسه",
  toggle_id: "شناسه خود را روی نمودار نشان دهید تا دیگران شما را پیدا کنند",

  // Result card / share
  civic_compass: "قطب‌نمای مدنی",
  share_text: "قطب‌نمای مدنی من 🧭",
  share_discover: "قطب‌نمای خودت را کشف کن ←",
  site_url: "civiccompass.app",

  // Profile
  profile_title: "پروفایل مدنی",
  profile_not_found: "این پروفایل یافت نشد.",
  back_to_dashboard: "بازگشت به داشبورد",
  share_profile: "اشتراک پروفایل",
  copy_id: "کپی شناسه",
  joined: "عضویت",
  loading: "بارگذاری",

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

  // Connections
  connections_title: "اتصالات",
  incoming_requests: "درخواست‌های دریافتی",
  no_incoming: "درخواست معلقی نیست",
  connect_btn: "اتصال",
  pending_btn: "در انتظار",
  cancel_btn: "لغو",
  accept_btn: "پذیرش",
  decline_btn: "رد",
  connected_label: "متصل",
  chat_blockscan: "گفتگو در بلاک‌اسکن",
  connection_sent: "درخواست ارسال شد!",
  connection_accepted: "اتصال پذیرفته شد!",
  connection_declined: "درخواست رد شد",
  connection_cancelled: "درخواست لغو شد",
  connection_intro_placeholder: "سلام بگویید… (اختیاری)",
  wallet_revealed: "آدرس کیف پول نمایان شد — گفتگو را شروع کنید!",
  your_connections: "اتصالات شما",
  no_connections: "هنوز اتصالی ندارید. یک همتا پیدا کنید و متصل شوید!",
  match_mode_label: "تطبیق از طریق",

  // Analytics
  analytics_title: "تحلیل عمومی",
  analytics_subtitle: "داده‌های تجمیعی قطب‌نمای مدنی — ناشناس و باز",
  analytics_overview: "نمای کلی",
  analytics_aggregate: "قطب‌نمای تجمیعی",
  analytics_distribution: "توزیع",
  analytics_trends: "روندها",
  analytics_total_users: "کل کاربران",
  analytics_public_users: "کاربران عمومی",
  analytics_total_snapshots: "کل تصاویر",
  analytics_total_responses: "کل پاسخ‌ها",
  analytics_top_countries: "کشورهای برتر",
  analytics_sample_size: "اندازه نمونه",
  analytics_filter_country: "فیلتر بر اساس کشور",
  analytics_all_countries: "همه کشورها",
  analytics_no_data: "هنوز داده‌ای نیست. کاربران باید قطب‌نمای خود را تکمیل کرده و حالت اشتراک‌گذاری را عمومی کنند.",
  analytics_mean: "میانگین",
  analytics_median: "میانه",
  analytics_std_dev: "انحراف معیار",
  analytics_monthly_trends: "روندهای ماهانه",
  analytics_back: "بازگشت به داشبورد",
  analytics_explore: "مشاهده تحلیل‌ها",

  // Poke
  poke_user: "سقلمه",
  poke_sent: "ارسال شد",
  poke_back: "سقلمه متقابل",
  poke_mutual: "متقابل — حالا می‌توانید گفتگو کنید!",
  pokes_title: "سقلمه‌ها",
  no_pokes: "هنوز سقلمه‌ای نیست",
  poke_from: "شما را سقلمه زد",
  start_chat: "شروع گفتگو",

  // E2E Chat
  tab_chat: "گفتگو",
  chat_title: "پیام‌های رمزنگاری‌شده",
  chat_placeholder: "پیامی بنویسید…",
  send_message: "ارسال",
  no_messages: "هنوز پیامی نیست. سلام کنید!",
  chat_not_enabled: "این کاربر هنوز گفتگوی رمزنگاری‌شده را فعال نکرده است.",
  no_chats: "هنوز گفتگویی ندارید. کسی را سقلمه بزنید تا گفتگو شروع شود!",
  chat_back: "همه گفتگوها",
  chat_enable: "فعال‌سازی گفتگوی رمزنگاری‌شده",
  chat_enable_desc: "یک پیام با کیف پول خود امضا کنید تا کلیدهای رمزنگاری ساخته شود. پیام‌های شما به صورت سرتاسر رمزنگاری می‌شوند.",
  chat_signing: "در حال امضا…",
  unseen_messages: "پیام جدید",
  unseen_pokes: "سقلمه جدید",

  // Welcome
  welcome_choose_lang: "برای شروع زبان خود را انتخاب کنید",
  tap_switch_appearance: "برای تغییر ظاهر بزنید",

  // Flashcards / Learn
  tab_learn: "یادگیری",
  learn_title: "حقوق بشر",
  learn_subtitle: "یادگیری و حفظ حقوق و آزادی‌های بنیادین",
  flashcard_cards: "کارت",
  flashcard_completed: "تکمیل شده",
  flashcard_start: "شروع یادگیری",
  flashcard_continue: "ادامه",
  flashcard_review: "مرور دوباره",
  flashcard_locked: "قفل",
  flashcard_reward_info: "با تکمیل، ~۱ USDC پاداش بگیرید",
  flashcard_reward_info_guest: "برای پاداش، با کیف‌پول جمهور وارد شوید",
  learn_banner: "حقوق بشر را یاد بگیرید و پاداش کسب کنید",
  learn_banner_guest: "حقوق بشر را رایگان یاد بگیرید",
  learn_banner_cta: "رفتن به یادگیری",
  flashcard_reward_requires_wallet: "نیاز به کیف‌پول جمهور",
  flashcard_reward_claimed: "پاداش ارسال شد!",
  flashcard_show_answer: "نمایش پاسخ",
  flashcard_knew_it: "بلد بودم",
  flashcard_almost: "تقریباً",
  flashcard_didnt_know: "بلد نبودم",
  flashcard_progress: "پیشرفت",
  flashcard_complete_title: "تبریک!",
  flashcard_complete_msg: "این مجموعه را تکمیل کردید و نشان دریافت کردید!",
  flashcard_complete_msg_guest: "این مجموعه را یاد گرفتید! با کیف‌پول جمهور وارد شوید تا برای هر مجموعه ~۱ USDC پاداش بگیرید.",
  flashcard_reward_pending: "پاداش شما در حال پردازش است…",
  flashcard_wallet_cta: "به‌زودی",
  flashcard_mastered: "تسلط",
  flashcard_of: "از",
  flashcard_back_to_decks: "بازگشت به مجموعه‌ها",
  flashcard_article: "ماده",
  profile_badges: "مجموعه‌های تکمیل‌شده",
  profile_no_badges: "هنوز مجموعه‌ای تکمیل نشده",
  tab_profile: "پروفایل",
  profile_bio: "درباره",
  profile_bio_placeholder: "کمی درباره خودتان بنویسید...",
  profile_wallet_address: "آدرس کیف پول",
  profile_share_link: "اشتراک‌گذاری پروفایل",
  profile_link_copied: "لینک کپی شد!",
  profile_save: "ذخیره",
  profile_saved: "ذخیره شد!",
  profile_member_since: "عضو از",
  profile_view_public: "مشاهده پروفایل عمومی",
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

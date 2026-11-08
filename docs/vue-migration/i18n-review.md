# Translation terms needing native-speaker review

Phases 1-2 cover page titles and the application shell (navigation, settings, theme and text-size controls, status labels, dialog and toast text, placeholder copy) in 中文, Bahasa Melayu and தமிழ். All wording is a first-pass translation by the assistant and must be reviewed before any real use. This list grows with each phase.

| English | 中文 | Bahasa Melayu | தமிழ் | Review note |
|---|---|---|---|---|
| Moments | 动态 | Momen | தருணங்கள் | Natural term for a "resident update/moment" in each language |
| Visits | 探访 | Lawatan | வருகைகள் | 探访 vs 探望 (warmer) |
| Community | 社区 | Komuniti | சமூகம் | |
| Resident Updates | 住户状态更新 | Kemas Kini Penghuni | குடியிருப்பாளர் புதுப்பிப்புகள் | "Resident" term (住户/院友; penghuni; குடியிருப்பாளர்) |
| Inquiries | 咨询 | Pertanyaan | கேள்விகள் | |
| Staff | 员工 | Kakitangan | ஊழியர் | |
| Caregiver (demo role) | 家属 | Penjaga | பராமரிப்பாளர் | 家属 = "family member"; alternatives 照顾者 |
| Demo view | 演示视图 | Paparan demo | டெமோ காட்சி | |
| Feeling Well | 状态良好 | Berasa Sihat | நலமாக உள்ளார் | Gentle, non-medical wording; Tamil uses honorific form |
| Resting | 休息中 | Sedang Berehat | ஓய்வில் உள்ளார் | |
| Please Contact Staff | 请联系员工 | Sila Hubungi Kakitangan | ஊழியர்களைத் தொடர்பு கொள்ளவும் | Must not sound alarming |
| Available / Limited / Fully Booked | 可预约 / 名额有限 / 已约满 | Tersedia / Terhad / Penuh | கிடைக்கிறது / குறைவான இடங்கள் / முழுமையாக முன்பதிவு | Visit slot availability |
| Dashboard (sidebar / tab) | 工作台 / 工作台 | Papan Pemuka / Utama | முகப்புப் பலகை / முகப்பு | Short tab labels are deliberately brief for 320px |
| Updates (tab) | 状态更新 | Kemas Kini | புதுப்பிப்பு | |
| Inquiries (tab) | 咨询 | Soalan | கேள்விகள் | "Soalan" (questions) chosen to fit 320px |
| Text size: Standard | 标准 | Biasa | இயல்பு | Shortened for the Tamil toggle width |
| Text size: Large / Extra large | 大 / 特大 | Besar / Sangat besar | பெரியது / மிகப் பெரியது | |
| Theme: Light / Dark / System | 浅色 / 深色 / 跟随系统 | Cerah / Gelap / Sistem | ஒளி / இருள் / கணினி | "கணினி" = computer/system; consider "சாதனம்" (device) |
| Settings | 设置 | Tetapan | அமைப்புகள் | |
| Footer disclaimer | see locale files | | | Legal-ish wording: have it checked |

## Phase 3: mock content and messages
Everything under `seed.*` (moments, inquiries and replies, events, news, volunteer opportunities, one resident note), the reply templates, enumeration labels (`category`, `eventCategory`, `topic`, `relationship`, `staffRole`, `inquiryStatus`, `visitStatus`, `checkIn`, `volunteerAvailability`) and all `errors.*` messages are first-pass translations by the assistant. Terms to check first:

| English | 中文 | Bahasa Melayu | தமிழ் | Review note |
|---|---|---|---|---|
| Pending / In Review / Answered | 待处理 / 处理中 / 已回复 | Menunggu / Sedang Disemak / Telah Dijawab | நிலுவையில் / மதிப்பாய்வில் / பதிலளிக்கப்பட்டது | Inquiry status chips |
| Aunt | 阿姨 | Makcik | அத்தை | Relationship wording varies by family |
| Nursing home (in reply template) | 疗养院 | rumah jagaan | முதியோர் இல்லம் | Which term does SAS use in each language? |
| Madam / Mr in captions | 女士 / 先生 | Puan / Encik | திருமதி / திரு | Honorifics inside seeded captions |
| Photo consent message | 未同意拍照 | persetujuan foto | புகைப்பட ஒப்புதல் | Privacy wording: have it checked |
| Fully-booked / capacity messages | 约满 / 容量 | penuh / kapasiti | முன்பதிவு / கொள்ளளவு | |
| Volunteer commitment lines | 每周约2小时 etc. | Kira-kira 2 jam seminggu etc. | வாரத்துக்கு சுமார் 2 மணி நேரம் etc. | |

## Phase 4: caregiver pages
All `home.*`, `resident.*`, `moments.*`, `ask.*`, `visits.*`, `pass.*`, `book.*`, `community.*`, `share.*`, `volunteer.*`, `support.*`, `form.*`, `time.*` text is a first-pass translation by the assistant. Please review these first:

| English | 中文 | Bahasa Melayu | தமிழ் | Review note |
|---|---|---|---|---|
| Good morning / afternoon / evening, {name} | 早上好 / 下午好 / 晚上好 | Selamat pagi / petang / malam | காலை / மதிய / மாலை வணக்கம் | Greeting convention; Malay "petang" vs "tengah hari" |
| Moments | 动态 | Momen | தருணங்கள் | Is there a warmer word families would use? |
| Today's well-being | 今日状态 | Kesejahteraan hari ini | இன்றைய நலம் | Must not read as a medical result |
| General updates, not medical assessments (disclaimer) | 一般性更新，并非医疗评估 | kemas kini umum, bukan penilaian perubatan | பொதுவான புதுப்பிப்புகள்; மருத்துவ மதிப்பீடுகள் அல்ல | Legal-ish: have it checked |
| Ask the care team | 咨询护理团队 | Tanya pasukan penjagaan | பராமரிப்புக் குழுவிடம் கேளுங்கள் | "Care team" term |
| Urgent: call the nursing home directly | 紧急情况请直接致电疗养院 | Untuk perkara segera, sila telefon rumah jagaan | அவசர விஷயங்களுக்கு முதியோர் இல்லத்தை நேரடியாக அழைக்கவும் | Safety message: must be clear |
| Visit pass / Demo pass | 探访通行证 / 演示通行证 | Pas lawatan / Pas demo | வருகை அனுமதிச் சீட்டு | "Pass" wording |
| Fully booked / Limited / Available | 已约满 / 名额有限 / 可预约 | Penuh / Terhad / Tersedia | முழுமையாக முன்பதிவு / குறைவான இடங்கள் / கிடைக்கிறது | Shown on calendar and slots |
| {n} space(s) left | 剩余 {n} 个名额 | {n} ruang lagi | {n} இடம் மீதம் | Plural forms (en, ta) |
| Reschedule | 改期 | Jadual semula | மறுதிட்டமிடு | |
| Express interest | 表达意愿 | Nyatakan minat | ஆர்வம் தெரிவி | Volunteer call-to-action |
| Volunteering | 义工服务 | Sukarelawan | தன்னார்வப் பணி | 义工 (Singapore usage) vs 志愿者 |
| Support SAS / Donate | 支持 SAS / 捐款 | Sokong SAS / Derma | SAS-ஐ ஆதரியுங்கள் / நன்கொடை | Fundraising tone |
| Residents & families only | 仅限住户及家属 | Penghuni & keluarga sahaja | குடியிருப்பாளர்கள் & குடும்பத்தினர் மட்டும் | |
| Dates and times | zh-SG, ms-SG, ta-SG via Intl | | | Check weekday/month names and 12-hour times read naturally to native users |

## Phase 5: staff pages
All `staff.*` text (dashboard, resident updates, post a moment, inquiries, visits & events, event form) is a first-pass translation by the assistant. Please review these first:

| English | 中文 | Bahasa Melayu | தமிழ் | Review note |
|---|---|---|---|---|
| Save & next resident | 保存并前往下一位 | Simpan & penghuni seterusnya | சேமித்து அடுத்த குடியிருப்பாளர் | Primary staff action; keep short for 320 px |
| Check in / Scan a pass (demo) | 签到 / 扫描通行证（演示） | Daftar masuk / Imbas pas (demo) | பதிவு செய் / அனுமதிச் சீட்டை ஸ்கேன் செய் (டெமோ) | "Check in" as arrival registration, not a hotel check-in |
| Visitor capacity / {n} of {capacity} places taken | 访客名额 / 已占用 {taken}/{capacity} 个名额 | Kapasiti pelawat / {taken} daripada {capacity} tempat digunakan | வருகையாளர் கொள்ளளவு | Capacity vs. quota wording |
| I confirm everyone in this photo agreed to it being shared with their family | 我确认照片中的所有人都同意与其家属分享此照片 | Saya mengesahkan semua dalam foto ini bersetuju… | … | Consent statement: have it checked by SAS (legal wording) |
| No photo consent | 未同意拍照 | Tiada persetujuan foto | புகைப்பட ஒப்புதல் இல்லை | Shown beside a resident's name |
| Quick replies | 快捷回复 | Balasan pantas | விரைவுப் பதில்கள்  | |
| Draft / Publish | 草稿 / 发布 | Draf / Terbitkan | வரைவு / வெளியிடு | |

## Phase 6: account, settings and beginner's guide
All `account.*` and `guide.*` text is a first-pass translation by the assistant. Please review these first:

| English | 中文 | Bahasa Melayu | தமிழ் | Review note |
|---|---|---|---|---|
| Family caregiver | 家属照护者 | Penjaga keluarga | குடும்பப் பராமரிப்பாளர் | Role label shown on the profile |
| Demo account | 演示账户 | Akaun demo | டெமோ கணக்கு | Must read as "not a real account" |
| Demo view (role switch) | 演示视图 | Paparan demo | டெமோ காட்சி | Not a sign-in |
| Beginner's guide | 新手指南 | Panduan permulaan | தொடக்க வழிகாட்டி | Friendly, non-technical term |
| Step {n} of {total} | 第 {n} 步，共 {total} 步 | Langkah {n} daripada {total} | படி {n} / {total} | Read aloud by screen readers on each step |
| Skip guide / Not now | 跳过指南 / 暂不需要 | Langkau panduan / Bukan sekarang | வழிகாட்டியைத் தவிர் / இப்போது வேண்டாம் | |
| Disclaimer: not a medical assessment or emergency service; call the nursing home or 995 | 并非医疗评估或紧急服务；致电疗养院或 995 | bukan penilaian perubatan atau perkhidmatan kecemasan; telefon rumah jagaan atau 995 | மருத்துவ மதிப்பீடோ அவசர சேவையோ அல்ல; 995 | Safety wording: have it checked by SAS |
| Guide step bodies (caregiver s1–s5, staff s1–s4) | | | | Check tone is warm and simple for older caregivers |

## Phase 7: polish
New empty-state sentences (`home.noMomentsText`, `visits.noUpcomingText`, `visits.noPastText`, `community.noUpcomingText`, `community.noPastText`, `staff.dash.noInquiries`, `staff.ve.noTodayText`, `staff.ve.noUpcomingText`, `staff.ve.noEventsText`) and the Not Found page (`notFound.*`) are first-pass translations by the assistant. Please check the friendly tone ("Well done!" / 做得好 / Syabas / நன்று) feels natural for staff, and that the Not Found wording is not too casual.
Layout notes from the visual audit (no translation change): Tamil letters are wider, so the mobile tab labels use 0.75rem in Tamil only; Chinese at Extra Large wraps the date tile ("11月 / 7") and long names, which is expected.

## Phase 8: priority list for native-speaker review (not yet reviewed by anyone)
No translation in this project has been checked by a native speaker or professionally. Review these first, because wording matters most here:

| Area | Keys (en.json) | Why it matters |
|---|---|---|
| Not a medical assessment / emergency (call the nursing home or 995) | `account.demo4`, `app.disclaimer` (footer), `moments.disclaimer` | Safety and legal wording |
| Urgent questions note in Ask the care team | `ask.urgent` | Tells families this is not real-time; must be unmistakable |
| Photo consent | `staff.moment.consent`, `consentNeeded`, `photoRule`, `dropped`, `noConsent` | Privacy and consent wording |
| Status labels (Feeling Well / Resting / Please Contact Staff) | `status.*` | Must not alarm or sound like a clinical result |
| Caregiver / resident / nursing home terms | `relationship.*`, `staffRole.*`, `resident.*` | Which term SAS itself uses in each language |
| Staff instructions and reply templates | `staff.*`, `replyTemplate.*` | Tone staff would actually send to families |
| Beginner's guide | `guide.*` | Plain, warm language for older caregivers |

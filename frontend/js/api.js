// ============================================================
//  WaitWise — Shared JS utility (api.js)
//  Cinematic Blue & Warm Amber Style (Besloor Reference)
// ============================================================

const I18n = (() => {
  const dictionaries = {
    ta: {
      'Home': 'முகப்பு', 'Dashboard': 'கட்டுப்பாட்டுப் பலகை', 'Live Waiting Board': 'நேரடி காத்திருப்பு பலகை',
      'Live Board': 'நேரடி பலகை', 'Logout': 'வெளியேறு', 'Register / Login': 'பதிவு / உள்நுழைவு',
      'Patient': 'நோயாளர்', 'Doctor': 'மருத்துவர்', 'Admin': 'நிர்வாகி', 'Administrator': 'நிர்வாகி',
      'Care Without The Waiting Room': 'காத்திருப்பு அறையின்றி சிகிச்சை',
      'OUTPATIENT (OP) ZERO-CONTACT QUEUE': 'வெளிநோயாளர் டிஜிட்டல் வரிசை',
      'Register or Sign In': 'பதிவு செய்யவும் அல்லது உள்நுழையவும்',
      'Please select your role to access WaitWise': 'WaitWise-ஐ அணுக உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்',
      'Two General Psychiatry Doctors': 'இரண்டு பொது மனநல மருத்துவர்கள்',
      'Patient Portal': 'நோயாளர் தளம்', 'Doctor Portal': 'மருத்துவர் தளம்', 'Admin Dashboard': 'நிர்வாகப் பலகை',
      'Language': 'மொழி',
      'Overview System View': 'மொத்த அமைப்பு விவரம்',
      'Queue Administration & Doctors': 'வரிசை நிர்வாகம் மற்றும் மருத்துவர்கள்',
      'HOSPITAL ADMINISTRATION': 'மருத்துவமனை நிர்வாகம்',
      '📊 Overall System View': '📊 மொத்த அமைப்பு விவரம்',
      '👨‍⚕️ Psychiatry Doctors (Max 2)': '👨‍⚕️ மனநல மருத்துவர்கள் (அதிகபட்சம் 2)',
      '📋 All Appointments & Queues': '📋 அனைத்து முன்பதிவுகள் மற்றும் வரிசைகள்',
      'Today’s Total OP Bookings': 'இன்றைய மொத்த முன்பதிவுகள்',
      "Today's Total OP Bookings": 'இன்றைய மொத்த முன்பதிவுகள்',
      '👨‍⚕️ OP Doctors Live Load & Status': '👨‍⚕️ மருத்துவர்களின் தற்போதைய நிலை',
      '🔄 Refresh Dashboard': '🔄 பலகையைப் புதுப்பிக்கவும்',
      '🌱 Verify System Setup': '🌱 அமைப்பு அமைப்பைச் சரிபார்க்கவும்',
      '+ Register Doctor': '+ மருத்துவரைப் பதிவு செய்யவும்',
      '✕ Close Form': '✕ படிவத்தை மூடு',
      'DOCTOR CLINICAL PORTAL': 'மருத்துவர் மருத்துவத் தளம்',
      'Refresh OP Queue': 'ஆலோசனை வரிசையைப் புதுப்பிக்கவும்',
      'OP Consultation Availability': 'ஆலோசனை கிடைக்கும் நிலை',
      'Waiting in Queue': 'வரிசையில் காத்திருக்கிறது',
      'In Consultation Room': 'ஆலோசனை அறையில்',
      'Consultations Done': 'முடிக்கப்பட்ட ஆலோசனைகள்',
      'Total OP Bookings': 'மொத்த முன்பதிவுகள்',
      '🩺 Patient Currently Inside Consultation Room': '🩺 நோயாளர் ஆலோசனை அறையில் உள்ளார்',
      "Doctor's Consultation Notes / Prescription (Optional)": 'மருத்துவர் குறிப்புகள் / மருந்துச் சீட்டு (விருப்பம்)',
      '✅ Complete Consultation & Advance Queue': '✅ ஆலோசனையை முடித்து வரிசையை முன்னேற்றவும்',
      'Today’s Patient Queue & Consultations': 'இன்றைய நோயாளர் வரிசை மற்றும் ஆலோசனைகள்',
      "Today's Patient Queue & Consultations": 'இன்றைய நோயாளர் வரிசை மற்றும் ஆலோசனைகள்',
      'All (': 'அனைத்தும் (', 'Waiting (': 'காத்திருப்பு (', 'In-Room (': 'அறையில் (',
      'Past Consultations (': 'முந்தைய ஆலோசனைகள் (', '🩺 Call In Room': '🩺 அறைக்கு அழைக்கவும்',
      '✅ Complete': '✅ முடிக்கவும்', 'Mark Unavailable': 'கிடைக்கவில்லை எனக் குறிக்கவும்',
      'Mark Available': 'கிடைக்கிறது எனக் குறிக்கவும்',
      'PATIENT CLINICAL PORTAL': 'நோயாளர் மருத்துவத் தளம்',
      'Welcome to WaitWise • Arrive only when your digital token is called': 'WaitWise-க்கு வரவேற்கிறோம் • உங்கள் டோக்கன் அழைக்கப்படும் போது மட்டும் வரவும்',
      '🏥 Strictly Outpatient (OP) Consultations.': '🏥 வெளிநோயாளர் ஆலோசனைகள் மட்டும்.',
      'Physical hospital presence is required': 'மருத்துவமனைக்கு வருவது அவசியம்',
      'ONLY when your token is called': 'உங்கள் டோக்கன் அழைக்கப்படும் போது மட்டும்',
      '🔔 YOUR TURN HAS ARRIVED! Please enter the Doctor’s OP Consultation Room immediately.': '🔔 உங்கள் முறை வந்துவிட்டது! ஆலோசனை அறைக்குச் செல்லவும்.',
      'Queue positions advance automatically as doctors finish past consultations.': 'மருத்துவர் ஆலோசனையை முடிக்கும்போது வரிசை தானாக முன்னேறும்.',
      'PORTAL ACCESS': 'தளம் அணுகல்', 'Sign In as Patient': 'நோயாளராக உள்நுழையவும்',
      'Email Address': 'மின்னஞ்சல் முகவரி', 'Password': 'கடவுச்சொல்',
      '📊 Live Queue Board': '📊 நேரடி வரிசை பலகை',
      'Outpatient Queue & Tokens': 'வெளிநோயாளர் வரிசை மற்றும் டோக்கன்கள்',
      'Book OP Consultation Slot': 'ஆலோசனை நேரத்தை முன்பதிவு செய்',
      'My Tokens & Live Tracking': 'என் டோக்கன்கள் மற்றும் நேரடி கண்காணிப்பு',
      'Reserve OP Consultation & Generate Token': 'ஆலோசனையை முன்பதிவு செய்து டோக்கன் பெறுங்கள்',
      'Select General Psychiatry Doctor': 'பொது மனநல மருத்துவரைத் தேர்ந்தெடுக்கவும்',
      'Select Consultation Date': 'ஆலோசனை தேதியைத் தேர்ந்தெடுக்கவும்',
      'Available Sessions & Appointment Times': 'கிடைக்கும் அமர்வுகள் மற்றும் நேரங்கள்',
      'Generate OP Digital Token': 'டிஜிட்டல் டோக்கனைப் பெறுங்கள்',
      'Your Booked OP Tokens': 'உங்கள் முன்பதிவு டோக்கன்கள்',
      'Refresh Tokens': 'டோக்கன்களைப் புதுப்பிக்கவும்',
      'No tokens booked yet': 'இதுவரை டோக்கன்கள் முன்பதிவு செய்யப்படவில்லை',
      'Forenoon': 'முற்பகல்', 'Afternoon': 'பிற்பகல்', 'Session': 'அமர்வு',
      'Waiting in Queue': 'வரிசையில் காத்திருக்கிறது', 'In Consultation': 'ஆலோசனை நடைபெறுகிறது',
      'Completed': 'முடிந்தது', 'Cancelled': 'ரத்து செய்யப்பட்டது',
      '⏳ Waiting in Queue': '⏳ வரிசையில் காத்திருக்கிறது', '🩺 In Consultation': '🩺 ஆலோசனை நடைபெறுகிறது',
      '✅ Completed': '✅ முடிந்தது', '✕ Cancelled': '✕ ரத்து செய்யப்பட்டது',
      'Track Live Queue': 'நேரடி வரிசையைக் கண்காணிக்கவும்', 'Cancel': 'ரத்து செய்',
      'Queue Position': 'வரிசை இடம்', 'Est. Wait Remaining': 'மதிப்பிடப்பட்ட காத்திருப்பு நேரம்',
      'Hospital Entry': 'மருத்துவமனை நுழைவு', 'Remain Off-Site Until Turn': 'உங்கள் முறை வரும் வரை வெளியே காத்திருக்கவும்',
      'Turn notifications enabled! You will receive an alert when your turn is next.': 'உங்கள் முறை நெருங்கும்போது அறிவிப்பு வரும்.',
      'Patients': 'நோயாளர்கள்', 'Total Patients': 'மொத்த நோயாளர்கள்',
      'General Psychiatry Doctors (Max 2)': 'பொது மனநல மருத்துவர்கள் (அதிகபட்சம் 2)',
      'Psychiatry Clinic Doctors': 'மனநல மருத்துவமனை மருத்துவர்கள்',
      'Overall System View': 'மொத்த அமைப்பு விவரம்', 'Psychiatry Doctors (Max 2)': 'மனநல மருத்துவர்கள் (அதிகபட்சம் 2)',
      'All Appointments & Queues': 'அனைத்து முன்பதிவுகள் மற்றும் வரிசைகள்',
      'Register General Psychiatry Doctor': 'பொது மனநல மருத்துவரைப் பதிவு செய்யவும்',
      'Full Name': 'முழுப் பெயர்', 'Email Address': 'மின்னஞ்சல் முகவரி', 'Password': 'கடவுச்சொல்',
      'Fixed consultation schedule (Monday–Saturday)': 'நிலையான ஆலோசனை நேரங்கள் (திங்கள்–சனி)',
      'Doctor Name': 'மருத்துவர் பெயர்', 'Specialization': 'சிறப்பு', 'Consult Time': 'ஆலோசனை நேரம்',
      'Availability & Ward Status': 'கிடைக்கும் நிலை', 'Admin Actions': 'நிர்வாகச் செயல்கள்',
      'Session / Slot': 'அமர்வு / நேரம்', 'Status': 'நிலை', 'Waiting': 'காத்திருக்கிறது',
      'In Consultation Room': 'ஆலோசனை அறையில்', 'Consultations Done': 'முடிக்கப்பட்ட ஆலோசனைகள்',
      'Total OP Bookings': 'மொத்த முன்பதிவுகள்', 'Refresh Dashboard': 'பலகையைப் புதுப்பிக்கவும்',
      'Refresh Queue': 'வரிசையைப் புதுப்பிக்கவும்', 'OP Doctors Live Load & Status': 'மருத்துவர்களின் தற்போதைய நிலை',
      'Patient Registration': 'நோயாளர் பதிவு', 'Create Patient Account': 'நோயாளர் கணக்கை உருவாக்கவும்',
      'Portal Access': 'வாயில் அணுகல்', 'Sign In as Patient': 'நோயாளராக உள்நுழையவும்',
      'Email Address': 'மின்னஞ்சல் முகவரி', 'Confirm Password': 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
      'Phone Number': 'தொலைபேசி எண்', 'Age': 'வயது', 'Gender': 'பாலினம்',
      'Outpatient Live Waiting Board': 'வெளிநோயாளர் நேரடி காத்திருப்பு பலகை',
      'Exit to Home': 'முகப்புக்குச் செல்லவும்', 'Waiting:': 'காத்திருப்பு:',
      'Completed:': 'முடிந்தது:', 'Queue Empty': 'வரிசை காலியாக உள்ளது',
      'FN Session — Forenoon': 'FN அமர்வு — முற்பகல்', 'AN Session — Afternoon': 'AN அமர்வு — பிற்பகல்',
      '📅 Book OP Consultation Slot': '📅 ஆலோசனை நேரத்தை முன்பதிவு செய்',
      '🎟️ My Tokens & Live Tracking': '🎟️ என் டோக்கன்கள் மற்றும் நேரடி கண்காணிப்பு',
      '🔔 Enable Turn Audio Alerts': '🔔 உங்கள் முறை ஒலி அறிவிப்பை இயக்கு',
      'Portal Access — WaitWise': 'வாயில் அணுகல் — WaitWise',
      'Patient OP Portal — WaitWise': 'நோயாளர் தளம் — WaitWise',
      'Doctor OP Portal — WaitWise': 'மருத்துவர் தளம் — WaitWise',
      'Admin Dashboard — WaitWise': 'நிர்வாகப் பலகை — WaitWise',
      'Live OP Waiting Board — WaitWise': 'நேரடி காத்திருப்பு பலகை — WaitWise',
      'Patient Registration — WaitWise': 'நோயாளர் பதிவு — WaitWise',
      'In-Room': 'அறையில்', 'Done': 'முடிந்தது', '● Available': '● கிடைக்கிறது',
      '● Available for OP Consultations': '● ஆலோசனைக்கு கிடைக்கிறது',
      'Available': 'கிடைக்கிறது', 'Unavailable': 'கிடைக்கவில்லை', 'No appointments found': 'முன்பதிவுகள் இல்லை',
      'Total Patients': 'மொத்த நோயாளர்கள்', 'Today': 'இன்று', 'Waiting': 'காத்திருக்கிறது',
      'Completed Consultations': 'முடிக்கப்பட்ட ஆலோசனைகள்', 'Register Doctor Into System': 'மருத்துவரைப் பதிவு செய்யவும்',
      'Monday–Saturday': 'திங்கள்–சனி', 'All OP Patient Appointments & Tokens': 'அனைத்து நோயாளர் முன்பதிவுகள் மற்றும் டோக்கன்கள்',
      'Today’s Patient Queue & Consultations': 'இன்றைய நோயாளர் வரிசை மற்றும் ஆலோசனைகள்',
      'OP Consultation Availability': 'ஆலோசனை கிடைக்கும் நிலை', 'Waiting in Queue': 'வரிசையில் காத்திருக்கிறது',
      'Consultations Done': 'முடிக்கப்பட்ட ஆலோசனைகள்', 'Total OP Bookings': 'மொத்த முன்பதிவுகள்',
      'Enable Turn Audio Alerts': 'உங்கள் முறை ஒலி அறிவிப்பை இயக்கு',
      'Select an OP Doctor': 'மனநல மருத்துவரைத் தேர்ந்தெடுக்கவும்',
      'No doctors available yet': 'மருத்துவர்கள் இன்னும் இல்லை',
      'No available slots for this date.': 'இந்த தேதிக்கு நேரங்கள் இல்லை.',
      'Checking slots...': 'நேரங்களைச் சரிபார்க்கிறது...',
      'Passwords do not match.': 'கடவுச்சொற்கள் பொருந்தவில்லை.',
      'Password must be at least 6 characters.': 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.',
      'Sign in as Patient →': 'நோயாளராக உள்நுழையவும் →',
      'Create Patient Account →': 'நோயாளர் கணக்கை உருவாக்கவும் →',
      'Refresh OP Queue': 'ஆலோசனை வரிசையைப் புதுப்பிக்கவும்'
    },
    hi: {
      'Home': 'होम', 'Dashboard': 'डैशबोर्ड', 'Live Waiting Board': 'लाइव प्रतीक्षा बोर्ड',
      'Live Board': 'लाइव बोर्ड', 'Logout': 'लॉग आउट', 'Register / Login': 'पंजीकरण / लॉगिन',
      'Patient': 'मरीज़', 'Doctor': 'डॉक्टर', 'Admin': 'व्यवस्थापक', 'Administrator': 'व्यवस्थापक',
      'Care Without The Waiting Room': 'प्रतीक्षा कक्ष के बिना देखभाल',
      'OUTPATIENT (OP) ZERO-CONTACT QUEUE': 'ओपीडी डिजिटल कतार',
      'Register or Sign In': 'पंजीकरण करें या लॉगिन करें',
      'Please select your role to access WaitWise': 'WaitWise तक पहुँचने के लिए अपनी भूमिका चुनें',
      'Two General Psychiatry Doctors': 'दो सामान्य मनोचिकित्सक',
      'Patient Portal': 'मरीज़ पोर्टल', 'Doctor Portal': 'डॉक्टर पोर्टल', 'Admin Dashboard': 'व्यवस्थापक डैशबोर्ड',
      'Queue Administration & Doctors': 'कतार प्रबंधन और डॉक्टर',
      'HOSPITAL ADMINISTRATION': 'अस्पताल प्रशासन',
      '📊 Overall System View': '📊 सिस्टम का अवलोकन',
      '👨‍⚕️ Psychiatry Doctors (Max 2)': '👨‍⚕️ मनोचिकित्सक (अधिकतम 2)',
      '📋 All Appointments & Queues': '📋 सभी अपॉइंटमेंट और कतारें',
      'Today’s Total OP Bookings': 'आज की कुल ओपीडी बुकिंग',
      "Today's Total OP Bookings": 'आज की कुल ओपीडी बुकिंग',
      '👨‍⚕️ OP Doctors Live Load & Status': '👨‍⚕️ डॉक्टरों की लाइव स्थिति',
      '🔄 Refresh Dashboard': '🔄 डैशबोर्ड रीफ़्रेश करें',
      '🌱 Verify System Setup': '🌱 सिस्टम सेटअप जाँचें',
      '+ Register Doctor': '+ डॉक्टर पंजीकृत करें',
      '✕ Close Form': '✕ फ़ॉर्म बंद करें',
      'DOCTOR CLINICAL PORTAL': 'डॉक्टर क्लिनिकल पोर्टल',
      'Refresh OP Queue': 'ओपीडी कतार रीफ़्रेश करें',
      'OP Consultation Availability': 'परामर्श उपलब्धता',
      'In Consultation Room': 'परामर्श कक्ष में',
      '🩺 Patient Currently Inside Consultation Room': '🩺 मरीज़ परामर्श कक्ष में हैं',
      "Doctor's Consultation Notes / Prescription (Optional)": 'डॉक्टर के नोट्स / पर्चा (वैकल्पिक)',
      '✅ Complete Consultation & Advance Queue': '✅ परामर्श पूरा करें और कतार आगे बढ़ाएँ',
      'Today’s Patient Queue & Consultations': 'आज की मरीज़ कतार और परामर्श',
      "Today's Patient Queue & Consultations": 'आज की मरीज़ कतार और परामर्श',
      'Past Consultations (': 'पिछले परामर्श (', '🩺 Call In Room': '🩺 कमरे में बुलाएँ',
      '✅ Complete': '✅ पूरा करें', 'Mark Unavailable': 'अनुपलब्ध करें',
      'Mark Available': 'उपलब्ध करें',
      'PATIENT CLINICAL PORTAL': 'मरीज़ क्लिनिकल पोर्टल',
      'PORTAL ACCESS': 'पोर्टल प्रवेश',
      '📊 Live Queue Board': '📊 लाइव कतार बोर्ड',
      'Language': 'भाषा',
      'Outpatient Queue & Tokens': 'ओपीडी कतार और टोकन',
      'Book OP Consultation Slot': 'परामर्श समय बुक करें',
      'My Tokens & Live Tracking': 'मेरे टोकन और लाइव ट्रैकिंग',
      'Reserve OP Consultation & Generate Token': 'परामर्श बुक करें और टोकन प्राप्त करें',
      'Select General Psychiatry Doctor': 'सामान्य मनोचिकित्सक चुनें',
      'Select Consultation Date': 'परामर्श की तारीख चुनें',
      'Available Sessions & Appointment Times': 'उपलब्ध सत्र और समय',
      'Generate OP Digital Token': 'डिजिटल टोकन प्राप्त करें',
      'Your Booked OP Tokens': 'आपके बुक किए गए टोकन',
      'Refresh Tokens': 'टोकन रीफ़्रेश करें',
      'No tokens booked yet': 'अभी तक कोई टोकन बुक नहीं किया गया',
      'Forenoon': 'पूर्वाह्न', 'Afternoon': 'अपराह्न', 'Session': 'सत्र',
      'Waiting in Queue': 'कतार में प्रतीक्षा', 'In Consultation': 'परामर्श जारी है',
      'Completed': 'पूरा हुआ', 'Cancelled': 'रद्द',
      '⏳ Waiting in Queue': '⏳ कतार में प्रतीक्षा', '🩺 In Consultation': '🩺 परामर्श जारी है',
      '✅ Completed': '✅ पूरा हुआ', '✕ Cancelled': '✕ रद्द',
      'Track Live Queue': 'लाइव कतार देखें', 'Cancel': 'रद्द करें',
      'Queue Position': 'कतार में स्थान', 'Est. Wait Remaining': 'अनुमानित प्रतीक्षा समय',
      'Hospital Entry': 'अस्पताल में प्रवेश', 'Remain Off-Site Until Turn': 'आपकी बारी आने तक बाहर प्रतीक्षा करें',
      'Turn notifications enabled! You will receive an alert when your turn is next.': 'आपकी बारी नज़दीक आने पर सूचना मिलेगी।',
      'Patients': 'मरीज़', 'Total Patients': 'कुल मरीज़',
      'General Psychiatry Doctors (Max 2)': 'सामान्य मनोचिकित्सक (अधिकतम 2)',
      'Psychiatry Clinic Doctors': 'मनोचिकित्सा क्लिनिक के डॉक्टर',
      'Overall System View': 'सिस्टम का अवलोकन', 'Psychiatry Doctors (Max 2)': 'मनोचिकित्सक (अधिकतम 2)',
      'All Appointments & Queues': 'सभी अपॉइंटमेंट और कतारें',
      'Register General Psychiatry Doctor': 'सामान्य मनोचिकित्सक पंजीकृत करें',
      'Full Name': 'पूरा नाम', 'Email Address': 'ईमेल पता', 'Password': 'पासवर्ड',
      'Fixed consultation schedule (Monday–Saturday)': 'निश्चित परामर्श समय (सोमवार–शनिवार)',
      'Doctor Name': 'डॉक्टर का नाम', 'Specialization': 'विशेषज्ञता', 'Consult Time': 'परामर्श समय',
      'Availability & Ward Status': 'उपलब्धता स्थिति', 'Admin Actions': 'व्यवस्थापक क्रियाएँ',
      'Session / Slot': 'सत्र / समय', 'Status': 'स्थिति', 'Waiting': 'प्रतीक्षा',
      'In Consultation Room': 'परामर्श कक्ष में', 'Consultations Done': 'पूरे हुए परामर्श',
      'Total OP Bookings': 'कुल ओपीडी बुकिंग', 'Refresh Dashboard': 'डैशबोर्ड रीफ़्रेश करें',
      'Refresh Queue': 'कतार रीफ़्रेश करें', 'OP Doctors Live Load & Status': 'डॉक्टरों की लाइव स्थिति',
      'Patient Registration': 'मरीज़ पंजीकरण', 'Create Patient Account': 'मरीज़ खाता बनाएँ',
      'Portal Access': 'पोर्टल प्रवेश', 'Sign In as Patient': 'मरीज़ के रूप में लॉगिन',
      'Confirm Password': 'पासवर्ड की पुष्टि करें', 'Phone Number': 'फ़ोन नंबर', 'Age': 'उम्र', 'Gender': 'लिंग',
      'Outpatient Live Waiting Board': 'ओपीडी लाइव प्रतीक्षा बोर्ड',
      'Exit to Home': 'होम पर जाएँ', 'Waiting:': 'प्रतीक्षा:', 'Completed:': 'पूरा:',
      'Queue Empty': 'कतार खाली है',
      'FN Session — Forenoon': 'FN सत्र — पूर्वाह्न', 'AN Session — Afternoon': 'AN सत्र — अपराह्न',
      '📅 Book OP Consultation Slot': '📅 परामर्श समय बुक करें',
      '🎟️ My Tokens & Live Tracking': '🎟️ मेरे टोकन और लाइव ट्रैकिंग',
      '🔔 Enable Turn Audio Alerts': '🔔 बारी की ध्वनि सूचना चालू करें',
      'Portal Access — WaitWise': 'पोर्टल प्रवेश — WaitWise',
      'Patient OP Portal — WaitWise': 'मरीज़ पोर्टल — WaitWise',
      'Doctor OP Portal — WaitWise': 'डॉक्टर पोर्टल — WaitWise',
      'Admin Dashboard — WaitWise': 'व्यवस्थापक डैशबोर्ड — WaitWise',
      'Live OP Waiting Board — WaitWise': 'लाइव प्रतीक्षा बोर्ड — WaitWise',
      'Patient Registration — WaitWise': 'मरीज़ पंजीकरण — WaitWise',
      'In-Room': 'कक्ष में', 'Done': 'पूरा', '● Available': '● उपलब्ध',
      '● Available for OP Consultations': '● परामर्श के लिए उपलब्ध',
      'Available': 'उपलब्ध', 'Unavailable': 'अनुपलब्ध', 'No appointments found': 'कोई अपॉइंटमेंट नहीं',
      'Today': 'आज', 'Completed Consultations': 'पूरे हुए परामर्श',
      'Register Doctor Into System': 'डॉक्टर पंजीकृत करें',
      'Monday–Saturday': 'सोमवार–शनिवार', 'All OP Patient Appointments & Tokens': 'सभी मरीज़ अपॉइंटमेंट और टोकन',
      'Today’s Patient Queue & Consultations': 'आज की मरीज़ कतार और परामर्श',
      'OP Consultation Availability': 'परामर्श उपलब्धता', 'Enable Turn Audio Alerts': 'बारी की ध्वनि सूचना चालू करें',
      'Select an OP Doctor': 'मनोचिकित्सक चुनें', 'No doctors available yet': 'अभी कोई डॉक्टर उपलब्ध नहीं है',
      'No available slots for this date.': 'इस तारीख के लिए कोई समय उपलब्ध नहीं है।',
      'Checking slots...': 'समय जाँचे जा रहे हैं...',
      'Passwords do not match.': 'पासवर्ड मेल नहीं खाते।',
      'Password must be at least 6 characters.': 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।',
      'Sign in as Patient →': 'मरीज़ के रूप में लॉगिन →',
      'Create Patient Account →': 'मरीज़ खाता बनाएँ →',
      'Refresh OP Queue': 'ओपीडी कतार रीफ़्रेश करें'
    }
  };
  const localeByLanguage = { en: 'en-US', ta: 'ta-IN', hi: 'hi-IN' };
  const originalText = new WeakMap();
  const renderedText = new WeakMap();
  const originalAttributes = new WeakMap();
  const savedLanguage = localStorage.getItem('ww_language');
  let language = ['en', 'ta', 'hi'].includes(savedLanguage) ? savedLanguage : 'en';
  const sourceTitle = document.title;

  function translateTextNode(node) {
    let source = originalText.get(node);
    if (source === undefined || node.nodeValue !== renderedText.get(node)) {
      source = node.nodeValue;
      originalText.set(node, source);
    }
    const trimmed = source.trim();
    if (!trimmed) {
      renderedText.set(node, source);
      return;
    }
    const dictionary = dictionaries[language] || {};
    const greeting = trimmed.match(/^Hello, (.+) — Queue digitally from home; enter only when your turn arrives\.$/);
    const emptyQueue = trimmed.match(/^No appointments found in '(.+)' status\.$/);
    const consultationDuration = trimmed.match(/^General Psychiatry · (\d+) min consultation slot duration$/);
    let translated = dictionary[trimmed];
    if (!translated && emptyQueue) {
      translated = language === 'ta'
        ? `“${emptyQueue[1]}” நிலையில் முன்பதிவுகள் இல்லை.`
        : `“${emptyQueue[1]}” स्थिति में कोई अपॉइंटमेंट नहीं।`;
    } else if (!translated && consultationDuration) {
      translated = language === 'ta'
        ? `பொது மனநல மருத்துவம் · ஒவ்வொரு ஆலோசனையும் ${consultationDuration[1]} நிமிடம்`
        : `सामान्य मनोचिकित्सा · प्रत्येक परामर्श ${consultationDuration[1]} मिनट`;
    } else if (!translated && greeting) {
      translated = language === 'ta'
        ? `வணக்கம், ${greeting[1]} — உங்கள் முறை வரும் வரை டிஜிட்டல் வரிசையில் காத்திருக்கவும்.`
        : `नमस्ते, ${greeting[1]} — अपनी बारी आने तक डिजिटल कतार में प्रतीक्षा करें।`;
    }
    if (!translated) translated = trimmed;
    const leading = source.match(/^\s*/)[0];
    const trailing = source.match(/\s*$/)[0];
    const value = `${leading}${translated}${trailing}`;
    if (node.nodeValue !== value) node.nodeValue = value;
    renderedText.set(node, value);
  }

  function translateElement(element) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) translateTextNode(walker.currentNode);
    ['placeholder', 'title', 'aria-label'].forEach(attribute => {
      if (!element.hasAttribute(attribute)) return;
      let values = originalAttributes.get(element);
      if (!values) {
        values = {};
        originalAttributes.set(element, values);
      }
      if (values[attribute] === undefined || element.getAttribute(attribute) !== values[`${attribute}Rendered`]) {
        values[attribute] = element.getAttribute(attribute);
      }
      const source = values[attribute];
      const translated = (dictionaries[language] || {})[source] || source;
      element.setAttribute(attribute, translated);
      values[`${attribute}Rendered`] = translated;
    });
    element.querySelectorAll('[placeholder], [title], [aria-label]').forEach(child => {
      ['placeholder', 'title', 'aria-label'].forEach(attribute => {
        if (!child.hasAttribute(attribute)) return;
        let values = originalAttributes.get(child);
        if (!values) {
          values = {};
          originalAttributes.set(child, values);
        }
        if (values[attribute] === undefined || child.getAttribute(attribute) !== values[`${attribute}Rendered`]) {
          values[attribute] = child.getAttribute(attribute);
        }
        const source = values[attribute];
        const translated = (dictionaries[language] || {})[source] || source;
        child.setAttribute(attribute, translated);
        values[`${attribute}Rendered`] = translated;
      });
    });
  }

  function apply() {
    document.documentElement.lang = language;
    translateElement(document.body);
    document.title = (dictionaries[language] || {})[sourceTitle] || sourceTitle;
    const selector = document.getElementById('languageSelector');
    if (selector) selector.value = language;
  }

  function setLanguage(nextLanguage) {
    if (!['en', 'ta', 'hi'].includes(nextLanguage)) return;
    language = nextLanguage;
    localStorage.setItem('ww_language', language);
    apply();
  }

  function installSelector() {
    if (document.getElementById('languageSelector')) return;
    const container = document.querySelector('.nav-right') || document.querySelector('.display-header > div:last-child') || document.querySelector('header');
    if (!container) return;
    const selector = document.createElement('select');
    selector.id = 'languageSelector';
    selector.className = 'form-select';
    selector.setAttribute('aria-label', 'Language');
    selector.style.cssText = 'width:auto;min-width:110px;padding:7px 10px;';
    selector.innerHTML = '<option value="en">English</option><option value="ta">தமிழ்</option><option value="hi">हिन्दी</option>';
    selector.value = language;
    selector.onchange = () => setLanguage(selector.value);
    container.appendChild(selector);
    apply();
  }

  const observer = new MutationObserver(records => {
    records.forEach(record => {
      if (record.type === 'characterData') translateTextNode(record.target);
      record.addedNodes && record.addedNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) translateTextNode(node);
        else if (node.nodeType === Node.ELEMENT_NODE) translateElement(node);
      });
    });
  });
  if (document.body) observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  document.addEventListener('DOMContentLoaded', installSelector);

  return {
    get language() { return language; },
    get locale() { return localeByLanguage[language]; },
    setLanguage,
    t(text) { return (dictionaries[language] || {})[text] || text; }
  };
})();

/* ---------- Auth helpers ---------- */
const Auth = {
  get token()   { return localStorage.getItem('ww_token'); },
  get user()    { try { return JSON.parse(localStorage.getItem('ww_user')); } catch { return null; } },
  get role()    { return this.user?.role || null; },
  get isAuth()  { return !!(this.token && this.user); },

  login(token, user) {
    localStorage.setItem('ww_token', token);
    localStorage.setItem('ww_user', JSON.stringify(user));
  },
  logout() {
    localStorage.removeItem('ww_token');
    localStorage.removeItem('ww_user');
    window.location.href = '/';
  }
};

/* ---------- Fetch wrapper ---------- */
async function api(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  };
  if (Auth.token) opts.headers['Authorization'] = `Bearer ${Auth.token}`;
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(path, opts);
  const data = await res.json();
  if (!res.ok) throw { status: res.status, message: data.message || 'Request failed' };
  return data;
}

/* ---------- Navbar (Besloor Style) ---------- */
function renderNavbar(containerId = 'navbar') {
  const el = document.getElementById(containerId);
  if (!el) return;

  const roleLabel = { admin: 'Admin', doctor: 'Doctor', patient: 'Patient' };
  const dashLink  = { admin: '/pages/admin.html', doctor: '/pages/doctor.html', patient: '/pages/patient.html' };

  if (Auth.isAuth) {
    el.innerHTML = `
      <nav class="navbar">
        <a class="nav-brand" href="${dashLink[Auth.role] || '/'}">
          <span class="nav-brand-title">WAITWISE</span>
          <span class="nav-brand-sub">HOSPITAL QUEUE MANAGEMENT</span>
        </a>
        <div class="nav-links">
          <a href="${dashLink[Auth.role] || '/'}" class="active">Dashboard</a>
          <a href="/pages/display.html">Live Waiting Board</a>
          <a href="/">Home</a>
        </div>
        <div class="nav-right">
          <span class="nav-role-tag">${roleLabel[Auth.role] || Auth.role}</span>
          <span class="nav-user">${Auth.user?.name || ''}</span>
          <button class="btn btn-outline btn-sm" id="logoutBtn">Logout</button>
        </div>
      </nav>`;
    document.getElementById('logoutBtn').onclick = () => Auth.logout();
  } else {
    el.innerHTML = `
      <nav class="navbar">
        <a class="nav-brand" href="/">
          <span class="nav-brand-title">WAITWISE</span>
          <span class="nav-brand-sub">HOSPITAL QUEUE MANAGEMENT</span>
        </a>
        <div class="nav-links">
          <a href="/" class="active">Home</a>
          <a href="/#specialists">OP Doctors</a>
          <a href="/pages/display.html">Live Board</a>
        </div>
        <div class="nav-right">
          <a class="btn btn-orange btn-sm" href="/pages/login.html">Register / Login</a>
        </div>
      </nav>`;
  }
}

/* ---------- Guard: redirect if not logged in / wrong role ---------- */
function guardPage(requiredRole) {
  if (!Auth.isAuth) {
    window.location.href = `/pages/login.html?role=${requiredRole}`;
    return false;
  }
  if (Auth.role !== requiredRole) {
    const map = { admin: '/pages/admin.html', doctor: '/pages/doctor.html', patient: '/pages/patient.html' };
    window.location.href = map[Auth.role] || '/';
    return false;
  }
  return true;
}

/* ---------- Small DOM helpers ---------- */
function $(sel, ctx = document) { return ctx.querySelector(sel); }
function $$(sel, ctx = document) { return [...ctx.querySelectorAll(sel)]; }
function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html) e.innerHTML = html;
  return e;
}
function showAlert(container, type, msg) {
  if (!container) return;
  container.innerHTML = `<div class="alert alert-${type}">${msg}</div>`;
}
function clearAlert(container) { if (container) container.innerHTML = ''; }

function statusBadge(status) {
  const map = {
    waiting: 'waiting',
    'in-consultation': 'in-consultation',
    completed: 'completed',
    cancelled: 'cancelled'
  };
  const labels = {
    waiting: '⏳ Waiting in Queue',
    'in-consultation': '🩺 In Consultation',
    completed: '✅ Completed',
    cancelled: '✕ Cancelled'
  };
  return `<span class="badge badge-${map[status] || ''}">${labels[status] || status}</span>`;
}

function fmtDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString(I18n.locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

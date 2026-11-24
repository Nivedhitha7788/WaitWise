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
      'Queue Position': 'வரிசை இடம்', '📅 Scheduled': '📅 முன்பதிவு செய்யப்பட்டது',
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

  };
  const extraTranslations = {
    ta: {
      'Contact': 'தொடர்பு', 'Contact Us': 'எங்களைத் தொடர்புகொள்ளவும்',
      'WAITWISE SUPPORT': 'WAITWISE உதவி', 'We are here to help with your outpatient appointments and questions.': 'வெளிநோயாளர் முன்பதிவுகள் மற்றும் கேள்விகளுக்கு உதவ நாங்கள் இருக்கிறோம்.',
      'Contact information': 'தொடர்பு விவரங்கள்', 'Address': 'முகவரி', 'Phone': 'தொலைபேசி', 'Email': 'மின்னஞ்சல்',
      'WaitWise Hospital, Outpatient Department': 'WaitWise மருத்துவமனை, வெளிநோயாளர் பிரிவு',
      'Chennai, Tamil Nadu, India': 'சென்னை, தமிழ்நாடு, இந்தியா',
      'For emergencies, please go directly to the hospital emergency department.': 'அவசரநிலைகளுக்கு மருத்துவமனை அவசர சிகிச்சைப் பிரிவுக்குச் செல்லவும்.',
      'Send us a message': 'எங்களுக்கு செய்தி அனுப்புங்கள்', 'Complete the form and our team will get back to you.': 'படிவத்தை நிரப்புங்கள்; எங்கள் குழு உங்களைத் தொடர்புகொள்ளும்.',
      'Full name': 'முழுப் பெயர்', 'Email address': 'மின்னஞ்சல் முகவரி', 'Phone number': 'தொலைபேசி எண்',
      'Subject': 'பொருள்', 'Message': 'செய்தி', 'Send message': 'செய்தியை அனுப்பு',
      'Your message has been received. We will be in touch soon.': 'உங்கள் செய்தி பெறப்பட்டது. விரைவில் உங்களைத் தொடர்புகொள்வோம்.',
      'Name, email, subject, and message are required.': 'பெயர், மின்னஞ்சல், பொருள் மற்றும் செய்தி அவசியம்.',
      'Please provide valid contact details and a message within the allowed length.': 'சரியான தொடர்பு விவரங்களையும் அனுமதிக்கப்பட்ட அளவிலான செய்தியையும் வழங்கவும்.',
      'Server error saving your message.': 'உங்கள் செய்தியைச் சேமிக்கும்போது சேவையகப் பிழை ஏற்பட்டது.',
      'Rate your visit': 'உங்கள் வருகைக்கு மதிப்பிடுங்கள்', 'Your feedback helps us improve our care.': 'எங்கள் சேவையை மேம்படுத்த உங்கள் கருத்து உதவும்.',
      'Your rating': 'உங்கள் மதிப்பீடு', 'stars': 'நட்சத்திரங்கள்', 'Comment': 'கருத்து',
      'Tell us about your visit': 'உங்கள் வருகையைப் பற்றி தெரிவிக்கவும்', 'Submit feedback': 'கருத்தைச் சமர்ப்பிக்கவும்',
      'Thank you for your feedback!': 'உங்கள் கருத்துக்கு நன்றி!', 'Please select a star rating.': 'நட்சத்திர மதிப்பீட்டைத் தேர்ந்தெடுக்கவும்.',
      'A rating from 1 to 5 and a comment of up to 2000 characters are required.': '1 முதல் 5 வரையிலான மதிப்பீடும் 2000 எழுத்துகளுக்குள் கருத்தும் அவசியம்.',
      'Feedback is available after the consultation is completed.': 'ஆலோசனை முடிந்த பிறகு கருத்தைச் சமர்ப்பிக்கலாம்.',
      'Feedback has already been submitted for this appointment.': 'இந்த முன்பதிவுக்கான கருத்து ஏற்கனவே சமர்ப்பிக்கப்பட்டது.',
      'Appointment not found.': 'முன்பதிவு கிடைக்கவில்லை.', 'Thank you for sharing your feedback.': 'உங்கள் கருத்தைப் பகிர்ந்ததற்கு நன்றி.',
      'Server error saving feedback.': 'கருத்தைச் சேமிக்கும்போது சேவையகப் பிழை ஏற்பட்டது.',
      'OP Doctors': 'வெளிநோயாளர் மருத்துவர்கள்', 'Available': 'கிடைக்கிறது', '● Available': '● கிடைக்கிறது',
      'General Psychiatry': 'பொது மனநல மருத்துவம்', 'Book OP Slot →': 'ஆலோசனை நேரத்தை முன்பதிவு செய் →',
      'Doctor Portal →': 'மருத்துவர் தளம் →', 'Live Display Board': 'நேரடி காத்திருப்பு பலகை',
      'General Psychiatry • FN Session:': 'பொது மனநல மருத்துவம் • FN அமர்வு:',
      'General Psychiatry • AN Session:': 'பொது மனநல மருத்துவம் • AN அமர்வு:',
      '1 stars': '1 நட்சத்திரம்', '2 stars': '2 நட்சத்திரங்கள்', '3 stars': '3 நட்சத்திரங்கள்',
      '4 stars': '4 நட்சத்திரங்கள்', '5 stars': '5 நட்சத்திரங்கள்',
      'Reserve your Outpatient consultation slot digitally. Track your token live from home and enter hospital grounds only when your turn arrives.': 'வெளிநோயாளர் ஆலோசனை நேரத்தை இணையத்தில் முன்பதிவு செய்யுங்கள். வீட்டிலிருந்தே டோக்கனைக் கண்காணித்து, உங்கள் முறை வந்ததும் மருத்துவமனைக்கு வாருங்கள்.',
      'Psychiatry consultations with fixed 60-minute appointments in FN and AN sessions.': 'FN மற்றும் AN அமர்வுகளில் நிர்ணயிக்கப்பட்ட 60 நிமிட மனநல ஆலோசனைகள்.',
      'General psychiatry consultations with the same fixed daily session schedule.': 'அதே நிர்ணயிக்கப்பட்ட தினசரி அமர்வு நேரங்களில் பொது மனநல ஆலோசனைகள்.',
      'Two General Psychiatry Doctors': 'இரண்டு பொது மனநல மருத்துவர்கள்',
      'Loading doctors from hospital database...': 'மருத்துவமனை தரவுத்தளத்திலிருந்து மருத்துவர்கள் ஏற்றப்படுகிறார்கள்...',
      'Select a date to display available OP slots.': 'கிடைக்கும் ஆலோசனை நேரங்களைக் காண தேதியைத் தேர்ந்தெடுக்கவும்.',
      '🎟️ Generate OP Digital Token →': '🎟️ டிஜிட்டல் டோக்கனைப் பெறுங்கள் →',
      'Your Booked OP Tokens': 'உங்கள் முன்பதிவு டோக்கன்கள்', 'Queue positions advance automatically as doctors finish past consultations.': 'மருத்துவர்கள் ஆலோசனையை முடிக்கும்போது வரிசை தானாக முன்னேறும்.',
      '🔄 Refresh Tokens': '🔄 டோக்கன்களைப் புதுப்பிக்கவும்', 'Loading tokens...': 'டோக்கன்கள் ஏற்றப்படுகின்றன...',
      'No tokens booked yet': 'இதுவரை டோக்கன்கள் முன்பதிவு செய்யப்படவில்லை',
      "Use the 'Book OP Consultation Slot' tab to reserve your appointment.": 'முன்பதிவு செய்ய “ஆலோசனை நேரத்தை முன்பதிவு செய்” தாவலைப் பயன்படுத்தவும்.',
      'Date:': 'தேதி:', '🔍 Track Live Queue': '🔍 நேரடி வரிசையைக் கண்காணிக்கவும்',
      '📅 Scheduled': '📅 முன்பதிவு செய்யப்பட்டது', 'Hospital Entry': 'மருத்துவமனை நுழைவு',
      'Remain Off-Site Until Turn': 'உங்கள் முறை வரும் வரை வெளியே காத்திருக்கவும்',
      '✅ Consultation complete. Thank you!': '✅ ஆலோசனை முடிந்தது. நன்றி!',
      '❌ Appointment was cancelled.': '❌ முன்பதிவு ரத்து செய்யப்பட்டது.',
      '🩺 You are currently inside the Consultation Room.': '🩺 நீங்கள் தற்போது ஆலோசனை அறையில் இருக்கிறீர்கள்.',
      '🔔 YOUR TURN IS NEXT! Please proceed to the room.': '🔔 அடுத்தது உங்கள் முறை! ஆலோசனை அறைக்குச் செல்லவும்.',
      'TOKEN': 'டோக்கன்', 'Queue Position': 'வரிசை இடம்',
      'minutes': 'நிமிடங்கள்', '💡 Position updates automatically when doctor finishes prior consultations.': '💡 மருத்துவர் முந்தைய ஆலோசனையை முடித்ததும் உங்கள் வரிசை இடம் தானாகப் புதுப்பிக்கப்படும்.',
      'Portal Access': 'தள அணுகல்', 'Select your role to access the outpatient queue management system': 'வெளிநோயாளர் வரிசை மேலாண்மை அமைப்பை அணுக உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்',
      'Email Address': 'மின்னஞ்சல் முகவரி', 'Sign In as Patient →': 'நோயாளராக உள்நுழையவும் →',
      'New patient to the hospital?': 'மருத்துவமனைக்கு நீங்கள் புதிய நோயாளரா?',
      'Register here →': 'இங்கே பதிவு செய்யவும் →', 'Doctor registration is managed by Hospital Administration.': 'மருத்துவர்களின் பதிவை மருத்துவமனை நிர்வாகம் நிர்வகிக்கிறது.',
      'Authorized hospital administrative personnel only.': 'அங்கீகரிக்கப்பட்ட மருத்துவமனை நிர்வாகப் பணியாளர்களுக்கு மட்டும்.',
      'Sign In': 'உள்நுழையவும்', 'Select...': 'தேர்ந்தெடுக்கவும்...', 'Male': 'ஆண்', 'Female': 'பெண்', 'Other': 'மற்றவை',
      'Already have a patient account?': 'ஏற்கனவே நோயாளர் கணக்கு உள்ளதா?', 'Sign in here →': 'இங்கே உள்நுழையவும் →',
      'OP Consultation Availability': 'ஆலோசனை கிடைக்கும் நிலை', 'Checking status...': 'நிலையைச் சரிபார்க்கிறது...',
      'Loading...': 'ஏற்றப்படுகிறது...', 'Waiting in Queue': 'வரிசையில் காத்திருக்கிறது',
      'In Consultation Room': 'ஆலோசனை அறையில்', 'Consultations Done': 'முடிக்கப்பட்ட ஆலோசனைகள்',
      'Total OP Bookings': 'மொத்த முன்பதிவுகள்', 'No appointments found': 'முன்பதிவுகள் இல்லை',
      'Connecting to WaitWise Live Waiting Board...': 'WaitWise நேரடி காத்திருப்பு பலகையுடன் இணைக்கிறது...',
      'No doctors registered in system.': 'அமைப்பில் மருத்துவர்கள் பதிவு செய்யப்படவில்லை.',
      'AWAY / ROUNDS': 'வெளியே / சுற்றுப்பார்வை', 'IN ROOM': 'அறையில்', 'READY FOR NEXT': 'அடுத்தவருக்குத் தயார்',
      'Doctor Away From OP Clinic': 'மருத்துவர் வெளிநோயாளர் பிரிவில் இல்லை',
      'Now In Consultation': 'தற்போது ஆலோசனையில்', 'Consultation room is ready': 'ஆலோசனை அறை தயார்',
      'Next To Enter:': 'அடுத்து உள்ளே வருபவர்:', 'Queue Empty': 'வரிசை காலியாக உள்ளது',
      'Waiting:': 'காத்திருப்பு:', 'Completed:': 'முடிந்தது:', 'Slot:': 'நேரம்:',
      'Auto-refreshes every 5 seconds': 'ஒவ்வொரு 5 விநாடிக்கும் தானாகப் புதுப்பிக்கப்படும்',
      'Contact': 'தொடர்பு',
      'Contact — WaitWise': 'தொடர்பு — WaitWise', 'WaitWise — Hospital OP Queue Management System': 'WaitWise — மருத்துவமனை வெளிநோயாளர் வரிசை மேலாண்மை',
      'HOSPITAL QUEUE MANAGEMENT': 'மருத்துவமனை வரிசை மேலாண்மை', 'Register / Login →': 'பதிவு / உள்நுழைவு →',
      '🚨': '🚨', 'Strictly Outpatient (OP) Consultations.': 'வெளிநோயாளர் ஆலோசனைகள் மட்டும்.',
      'WaitWise manages scheduled OP queues without waiting room entry. For trauma or emergency care, proceed directly to the': 'காத்திருப்பு அறைக்குச் செல்லாமல் திட்டமிட்ட வெளிநோயாளர் வரிசைகளை WaitWise நிர்வகிக்கிறது. காயம் அல்லது அவசரநிலைக்கு நேரடியாகச் செல்லவும்',
      'Hospital Emergency & Trauma Ward': 'மருத்துவமனை அவசர மற்றும் விபத்து சிகிச்சைப் பிரிவு',
      'Dedicated outpatient clinics connected to real-time hospital queues': 'நேரடி மருத்துவமனை வரிசைகளுடன் இணைக்கப்பட்ட வெளிநோயாளர் பிரிவுகள்',
      'OP Room 01': 'வெளிநோயாளர் அறை 01', 'OP Room 02': 'வெளிநோயாளர் அறை 02',
      'Doctor Portal': 'மருத்துவர் தளம்', 'Admin Dashboard': 'நிர்வாகப் பலகை',
      'Please select your role to access WaitWise': 'WaitWise-ஐ அணுக உங்கள் பங்கைத் தேர்ந்தெடுக்கவும்',
      'Book a psychiatry consultation, generate your digital token, and track live queue progress from home.': 'மனநல ஆலோசனையை முன்பதிவு செய்து, டிஜிட்டல் டோக்கனைப் பெற்று, வீட்டிலிருந்தே வரிசையைக் கண்காணிக்கவும்.',
      'Patient Sign In →': 'நோயாளர் உள்நுழைவு →', 'Register as Patient →': 'நோயாளராகப் பதிவு செய் →',
      'Direct login for registered OP specialists. Call in patients, record consultations, and toggle availability during ward rounds.': 'பதிவு செய்யப்பட்ட வெளிநோயாளர் நிபுணர்களுக்கான நேரடி உள்நுழைவு. நோயாளிகளை அழைத்து, ஆலோசனைகளைப் பதிவு செய்து, வார்டு சுற்றுப்பார்வையின்போது கிடைக்கும் நிலையை மாற்றவும்.',
      'Doctor Sign In →': 'மருத்துவர் உள்நுழைவு →', 'Doctor registration is managed by Hospital Admin': 'மருத்துவர் பதிவை மருத்துவமனை நிர்வாகம் நிர்வகிக்கிறது',
      'Hospital administration dashboard and management of the two General Psychiatry doctors.': 'மருத்துவமனை நிர்வாகப் பலகை மற்றும் இரண்டு பொது மனநல மருத்துவர்களின் மேலாண்மை.',
      'Admin Sign In →': 'நிர்வாகி உள்நுழைவு →', 'Authorized hospital personnel only': 'அங்கீகரிக்கப்பட்ட மருத்துவமனைப் பணியாளர்களுக்கு மட்டும்',
      'Close dialog': 'உரையாடலை மூடு', 'All rights reserved.': 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
      'OP Consultation Availability': 'ஆலோசனை கிடைக்கும் நிலை', 'DOCTOR CLINICAL PORTAL': 'மருத்துவர் மருத்துவத் தளம்',
      'Doctor OP Portal': 'மருத்துவர் வெளிநோயாளர் தளம்', 'Loading specialization...': 'சிறப்புப் பிரிவு ஏற்றப்படுகிறது...',
      '🔄 Refresh OP Queue': '🔄 வெளிநோயாளர் வரிசையைப் புதுப்பிக்கவும்',
      '🚨': '🚨', 'OP Consultations Strictly.': 'வெளிநோயாளர் ஆலோசனைகள் மட்டும்.',
      'Do NOT accept emergency consultations in this digital queue. Direct emergency cases immediately to the': 'இந்த டிஜிட்டல் வரிசையில் அவசர ஆலோசனைகளை ஏற்க வேண்டாம். அவசர நோயாளிகளை உடனடியாக அனுப்பவும்',
      'Availability & Ward Status': 'கிடைக்கும் நிலை மற்றும் வார்டு நிலை',
      'Visiting existing patients in ward (In-Patient rounds)': 'வார்டில் உள்ள நோயாளிகளைப் பார்வையிடுதல்',
      'Emergency ward consultation call': 'அவசர வார்டு ஆலோசனை அழைப்பு',
      'Hospital clinical review meeting': 'மருத்துவமனை மருத்துவ ஆய்வுக் கூட்டம்',
      'Other reason...': 'வேறு காரணம்...', 'Custom reason': 'தனிப்பயன் காரணம்',
      'OP Consultation Availability': 'ஆலோசனை கிடைக்கும் நிலை', 'Checking status...': 'நிலையைச் சரிபார்க்கிறது...',
      'Loading...': 'ஏற்றப்படுகிறது...', 'Mark Unavailable': 'கிடைக்கவில்லை எனக் குறிக்கவும்', 'Mark Available': 'கிடைக்கிறது எனக் குறிக்கவும்',
      'Waiting in Queue': 'வரிசையில் காத்திருக்கிறது', 'In Consultation Room': 'ஆலோசனை அறையில்',
      'Consultations Done': 'முடிக்கப்பட்ட ஆலோசனைகள்', 'Total OP Bookings': 'மொத்த முன்பதிவுகள்',
      '🩺 Patient Currently Inside Consultation Room': '🩺 நோயாளர் ஆலோசனை அறையில் உள்ளார்',
      'Doctor’s Consultation Notes / Prescription (Optional)': 'மருத்துவர் ஆலோசனைக் குறிப்புகள் / மருந்துச் சீட்டு (விருப்பம்)',
      'Doctor\'s Consultation Notes / Prescription (Optional)': 'மருத்துவர் ஆலோசனைக் குறிப்புகள் / மருந்துச் சீட்டு (விருப்பம்)',
      'e.g. Prescribed medication, routine review in 5 days': 'எ.கா. மருந்து பரிந்துரை, 5 நாட்களில் மறுபரிசீலனை',
      '✅ Complete Consultation & Advance Queue': '✅ ஆலோசனையை முடித்து வரிசையை முன்னேற்றவும்',
      'Today’s Patient Queue & Consultations': 'இன்றைய நோயாளர் வரிசை மற்றும் ஆலோசனைகள்',
      'Queue advances automatically for waiting patients when you finish past consultations.': 'முந்தைய ஆலோசனையை முடித்ததும் காத்திருக்கும் நோயாளிகளின் வரிசை தானாக முன்னேறும்.',
      'All (': 'அனைத்தும் (', 'Waiting (': 'காத்திருப்பு (', 'In-Room (': 'அறையில் (',
      'Past Consultations (': 'முந்தைய ஆலோசனைகள் (', 'Loading OP queue...': 'வெளிநோயாளர் வரிசை ஏற்றப்படுகிறது...',
      'No appointments found in': 'இந்த நிலையில் முன்பதிவுகள் இல்லை',
      'No appointments found in \'all\' status.': 'முன்பதிவுகள் எதுவும் இல்லை.',
      '🩺 Call In Room': '🩺 ஆலோசனை அறைக்கு அழைக்கவும்', '✕ No Show': '✕ வரவில்லை',
      '✅ Complete': '✅ முடிக்கவும்', 'Clinical Notes:': 'மருத்துவக் குறிப்புகள்:',
      'Phone:': 'தொலைபேசி:', 'yrs,': 'வயது,', 'Reason:': 'காரணம்:',
      '● Available for OP Consultations': '● வெளிநோயாளர் ஆலோசனைக்குக் கிடைக்கிறது',
      '● Unavailable for OP Consultations': '● வெளிநோயாளர் ஆலோசனைக்குக் கிடைக்கவில்லை',
      'Failed to load OP queue.': 'வெளிநோயாளர் வரிசையை ஏற்ற முடியவில்லை.',
      'OP Doctor registered successfully into the system!': 'வெளிநோயாளர் மருத்துவர் வெற்றிகரமாகப் பதிவு செய்யப்பட்டார்!',
      'No doctors registered yet.': 'இதுவரை மருத்துவர்கள் பதிவு செய்யப்படவில்லை.',
      'No doctors registered.': 'மருத்துவர்கள் பதிவு செய்யப்படவில்லை.',
      'Today': 'இன்று', 'Waiting': 'காத்திருப்பு', 'In-Room': 'அறையில்', 'Done': 'முடிந்தது',
      '● Unavailable': '● கிடைக்கவில்லை', 'Doctor Name': 'மருத்துவர் பெயர்',
      'Specialization': 'சிறப்புப் பிரிவு', 'Consult Time': 'ஆலோசனை நேரம்',
      'Today’s Queue': 'இன்றைய வரிசை', 'Availability & Ward Status': 'கிடைக்கும் நிலை மற்றும் வார்டு நிலை',
      'Admin Actions': 'நிர்வாகச் செயல்கள்', 'min/slot': 'நிமிடம் / நேரம்', 'waiting)': 'காத்திருப்பு)',
      'No appointments recorded in the system yet.': 'அமைப்பில் இதுவரை முன்பதிவுகள் இல்லை.',
      'Token': 'டோக்கன்', 'Patient': 'நோயாளர்', 'Doctor': 'மருத்துவர்',
      'Date': 'தேதி', 'Session / Slot': 'அமர்வு / நேரம்', 'Status': 'நிலை',
      'Wait / Completed': 'காத்திருப்பு / முடிந்தது', 'Active': 'செயலில்',
      'Reason for doctor unavailability (e.g. Visiting existing patients in ward (In-Patient rounds)):': 'மருத்துவர் கிடைக்காததற்கான காரணம்:',
      'Failed to update availability.': 'கிடைக்கும் நிலையைப் புதுப்பிக்க முடியவில்லை.',
      'Failed to load OP queue.': 'வெளிநோயாளர் வரிசையை ஏற்ற முடியவில்லை.',
      'Please pick a doctor, date, and slot.': 'மருத்துவர், தேதி மற்றும் நேரத்தைத் தேர்ந்தெடுக்கவும்.',
      'Generating Token...': 'டோக்கன் உருவாக்கப்படுகிறது...', 'Tracking: refresh in 10s': 'கண்காணிப்பு: 10 நொடிகளில் புதுப்பிக்கப்படும்',
      'Track Now': 'இப்போது கண்காணி', 'Cancel this appointment token?': 'இந்த முன்பதிவு டோக்கனை ரத்து செய்யவா?',
      'Registering...': 'பதிவு செய்யப்படுகிறது...', 'Signing in...': 'உள்நுழைகிறது...',
      '✅ Registration successful! Redirecting to sign in...': '✅ பதிவு வெற்றிகரமானது! உள்நுழைவுக்குச் செல்கிறது...',
      'Registration failed.': 'பதிவு தோல்வியடைந்தது.', 'Login failed.': 'உள்நுழைவு தோல்வியடைந்தது.',
      'Failed to update availability.': 'கிடைக்கும் நிலையைப் புதுப்பிக்க முடியவில்லை.',
      'Live OP Waiting Board': 'நேரடி வெளிநோயாளர் காத்திருப்பு பலகை',
      'Outpatient Live Waiting Board': 'வெளிநோயாளர் நேரடி காத்திருப்பு பலகை',
      'Outpatient Live Waiting Board': 'வெளிநோயாளர் நேரடி காத்திருப்பு பலகை',
      'Outpatient Live Waiting Board': 'வெளிநோயாளர் நேரடி காத்திருப்பு பலகை',
      'Outpatient Live Waiting Board': 'வெளிநோயாளர் நேரடி காத்திருப்பு பலகை',
      'Outpatient Live Waiting Board': 'வெளிநோயாளர் நேரடி காத்திருப்பு பலகை',
      'Live OP Waiting Board — WaitWise': 'நேரடி வெளிநோயாளர் காத்திருப்பு பலகை — WaitWise',
      'Queue Board': 'வரிசைப் பலகை', 'Specialist Doctors': 'சிறப்பு மருத்துவர்கள்',
      '© 2024 WaitWise Hospital Queue Management System. All rights reserved.': '© 2024 WaitWise மருத்துவமனை வரிசை மேலாண்மை அமைப்பு. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
      '📊 Live Queue Board': '📊 நேரடி வரிசைப் பலகை',
      'Hospital Emergency Ward': 'மருத்துவமனை அவசர சிகிச்சைப் பிரிவு',
      '. For trauma or emergency care, proceed to the': '. காயம் அல்லது அவசரநிலைக்கு செல்லவும்',
      'Register / Login': 'பதிவு / உள்நுழைவு',
      'Dashboard': 'கட்டுப்பாட்டுப் பலகை', 'Live Waiting Board': 'நேரடி காத்திருப்பு பலகை',
      'Portal Access — WaitWise': 'தள அணுகல் — WaitWise',
      'Patient Registration — WaitWise': 'நோயாளர் பதிவு — WaitWise',
      'Patient OP Portal — WaitWise': 'நோயாளர் தளம் — WaitWise',
      'Doctor OP Portal — WaitWise': 'மருத்துவர் தளம் — WaitWise',
      'Admin Dashboard — WaitWise': 'நிர்வாகப் பலகை — WaitWise',
      'Overall view of WaitWise outpatient system, doctors & appointments': 'WaitWise வெளிநோயாளர் அமைப்பு, மருத்துவர்கள் மற்றும் முன்பதிவுகளின் மொத்த விவரம்',
      'Psychiatry Clinic Doctors (': 'மனநல மருத்துவர்கள் (',
      'of 2 slots filled)': 'இல் 2 இடங்கள் நிரம்பியுள்ளன)',
      'The clinic has two General Psychiatry doctors, with fixed 60-minute appointments.': 'மருத்துவமனையில் இரண்டு பொது மனநல மருத்துவர்கள் உள்ளனர்; ஒவ்வொரு ஆலோசனையும் 60 நிமிடங்கள்.',
      '⚠️ Both doctor positions are filled. The psychiatry clinic supports a maximum of two doctors.': '⚠️ இரண்டு மருத்துவர் பணியிடங்களும் நிரம்பியுள்ளன. மனநல மருத்துவப் பிரிவில் அதிகபட்சம் இரண்டு மருத்துவர்கள் மட்டுமே.',
      'TODAY\'S QUEUE': 'இன்றைய வரிசை', 'Real-time appointments directory across both clinic doctors': 'இரு மருத்துவர்களுக்குமான நேரடி முன்பதிவுப் பட்டியல்',
      'Today\'s Queue': 'இன்றைய வரிசை',
      '🔄 Refresh Queue': '🔄 வரிசையைப் புதுப்பிக்கவும்',
      'The clinic has exactly two active doctors, both configured for General Psychiatry.': 'மனநல மருத்துவப் பிரிவில் இரண்டு மருத்துவர்கள் மட்டுமே உள்ளனர்.',
      '✕ Close Form': '✕ படிவத்தை மூடு', '+ Register Doctor': '+ மருத்துவரைப் பதிவு செய்யவும்',
      'Register General Psychiatry Doctor': 'பொது மனநல மருத்துவரைப் பதிவு செய்யவும்',
      'Fixed consultation schedule (Monday–Saturday)': 'நிலையான ஆலோசனை நேரங்கள் (திங்கள்–சனி)',
      'e.g. Dr. Jane Smith': 'எ.கா. டாக்டர் ஜேன் ஸ்மித்', 'Min 6 characters': 'குறைந்தது 6 எழுத்துகள்',
      'Register Doctor Into System →': 'மருத்துவரைப் பதிவு செய்யவும் →',
      'The clinic has two General Psychiatry doctors, with fixed 60-minute appointments.': 'மருத்துவமனையில் இரண்டு பொது மனநல மருத்துவர்கள் உள்ளனர்; ஒவ்வொரு ஆலோசனையும் 60 நிமிடங்கள்.',
      'Patient Sign In': 'நோயாளர் உள்நுழைவு',
      'New patient to the hospital?': 'மருத்துவமனைக்கு நீங்கள் புதிய நோயாளரா?',
      'Sign in as Administrator →': 'நிர்வாகியாக உள்நுழையவும் →',
      'Sign in as Doctor →': 'மருத்துவராக உள்நுழையவும் →',
      'Hospital Administrator': 'மருத்துவமனை நிர்வாகி',
      'Password must be at least 6 characters.': 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.',
      'Currently Unavailable:': 'தற்போது கிடைக்கவில்லை:',
      'Available': 'கிடைக்கிறது', 'Unavailable': 'கிடைக்கவில்லை',
      'Doctor registration is managed by Hospital Administration.': 'மருத்துவர் பதிவை மருத்துவமனை நிர்வாகம் நிர்வகிக்கிறது.',
      'Register': 'பதிவு', 'Create an account to book outpatient consultations and receive digital tokens': 'வெளிநோயாளர் ஆலோசனையை முன்பதிவு செய்து டிஜிட்டல் டோக்கன்களைப் பெற கணக்கை உருவாக்கவும்',
      'Hospital Doctors:': 'மருத்துவமனை மருத்துவர்கள்:',
      'Doctors are registered directly by Hospital Admin. Please access the': 'மருத்துவர்களை மருத்துவமனை நிர்வாகம் நேரடியாகப் பதிவு செய்கிறது. அணுகவும்',
      'Doctor Login portal': 'மருத்துவர் உள்நுழைவு தளம்', 'Repeat password': 'கடவுச்சொல்லை மீண்டும் உள்ளிடவும்',
      'consultation': 'ஆலோசனை', 'Currently Unavailable:': 'தற்போது கிடைக்கவில்லை:',
      'consultation •': 'ஆலோசனை •',
      '⚠️ Currently Unavailable:': '⚠️ தற்போது கிடைக்கவில்லை:',
      'Initial Queue Position:': 'தொடக்க வரிசை இடம்:',
      'No consultation slots configured on': 'இந்த நாளில் ஆலோசனை நேரங்கள் அமைக்கப்படவில்லை:',
      'Doctor, date, and slot are required.': 'மருத்துவர், தேதி மற்றும் நேரம் அவசியம்.',
      'Select a valid consultation slot for this date and session.': 'இந்த தேதி மற்றும் அமர்வுக்கான சரியான ஆலோசனை நேரத்தைத் தேர்ந்தெடுக்கவும்.',
      'This consultation time has already passed.': 'இந்த ஆலோசனை நேரம் கடந்துவிட்டது.',
      'You already have an active appointment with this doctor. Complete or cancel it before booking another.': 'இந்த மருத்துவரிடம் ஏற்கனவே செயலில் உள்ள முன்பதிவு உள்ளது. மற்றொன்றை முன்பதிவு செய்வதற்கு முன் அதை முடிக்கவும் அல்லது ரத்து செய்யவும்.',
      'This slot was just booked by another patient. Please select another slot.': 'இந்த நேரம் மற்றொரு நோயாளரால் முன்பதிவு செய்யப்பட்டது. வேறு நேரத்தைத் தேர்ந்தெடுக்கவும்.',
      'Token generated successfully!': 'டோக்கன் வெற்றிகரமாக உருவாக்கப்பட்டது!',
      'Cannot cancel an appointment already completed or in progress.': 'முடிந்த அல்லது நடைபெறும் முன்பதிவை ரத்து செய்ய முடியாது.',
      'Monday': 'திங்கள்', 'Tuesday': 'செவ்வாய்', 'Wednesday': 'புதன்', 'Thursday': 'வியாழன்',
      'Friday': 'வெள்ளி', 'Saturday': 'சனி', 'Sunday': 'ஞாயிறு',
      '© 2024 WaitWise Hospital Queue Management System.': '© 2024 WaitWise மருத்துவமனை வரிசை மேலாண்மை அமைப்பு.',
      'Doctor Access': 'மருத்துவர் அணுகல்', 'For trauma or emergency care, proceed to the': 'காயம் அல்லது அவசரநிலைக்கு செல்லவும்',
      '— Select an OP Doctor —': '— வெளிநோயாளர் மருத்துவரைத் தேர்ந்தெடுக்கவும் —',
      '✓ Available': '✓ கிடைக்கிறது', '⚠️ Unavailable': '⚠️ கிடைக்கவில்லை',
      'Visiting ward': 'வார்டைப் பார்வையிடுகிறார்', '✕ Cancel': '✕ ரத்து செய்',
      'For trauma or emergency care, proceed to the': 'காயம் அல்லது அவசரநிலைக்கு செல்லவும்',
      'Physical hospital presence is required': 'மருத்துவமனைக்கு வருவது அவசியம்',
      'ONLY when your token is called': 'உங்கள் டோக்கன் அழைக்கப்படும் போது மட்டும்',
      'Enter consultation room ONLY when your token number appears below. For emergency care, report directly to the': 'உங்கள் டோக்கன் எண் கீழே தோன்றும் போது மட்டும் ஆலோசனை அறைக்குச் செல்லவும். அவசரநிலைக்கு நேரடியாகச் செல்லவும்',
      '← Exit to Home': '← முகப்புக்குச் செல்லவும்', 'ROOM 01': 'அறை 01', 'ROOM 02': 'அறை 02',
      '© 2024 WaitWise Hospital Outpatient Queue Management System • Live Queue Broadcast.': '© 2024 WaitWise மருத்துவமனை வெளிநோயாளர் வரிசை • நேரடி வரிசை ஒளிபரப்பு.'
    },

  };
  Object.assign(dictionaries.ta, extraTranslations.ta);
  Object.assign(dictionaries.ta, {
    'WAITWISE': 'வைட்வைஸ்',
    'WaitWise': 'வைட்வைஸ்',
    'English': 'ஆங்கிலம்',
    'Tamil': 'தமிழ்',
    'Dr. Rajesh Sharma': 'டாக்டர் ராஜேஷ் ஷர்மா',
    'Dr. Priya Patel': 'டாக்டர் பிரியா பட்டேல்',
    'Ensure database has admin and 2 psychiatry doctors': 'நிர்வாகியும் இரண்டு மனநல மருத்துவர்களும் தரவுத்தளத்தில் உள்ளதை உறுதிசெய்யவும்',
    'patient@example.com': 'மின்னஞ்சல் முகவரி',
    'john@example.com': 'மின்னஞ்சல் முகவரி',
    'John Doe': 'ரவி',
    'e.g. 32': 'எ.கா. 32',
    'OP Doctor': 'வெளிநோயாளர் மருத்துவர்',
    'Hospital Admin': 'மருத்துவமனை நிர்வாகி',
    'Register / Login →': 'பதிவு / உள்நுழைவு →',
    'Book OP Slot →': 'ஆலோசனை நேரத்தை முன்பதிவு செய் →',
    'Doctor Portal →': 'மருத்துவர் தளம் →',
    'Patient Sign In →': 'நோயாளர் உள்நுழைவு →',
    'Register as Patient →': 'நோயாளராகப் பதிவு செய் →',
    'Doctor Sign In →': 'மருத்துவர் உள்நுழைவு →',
    'Admin Sign In →': 'நிர்வாகி உள்நுழைவு →',
    '— Select an OP Doctor —': '— வெளிநோயாளர் மருத்துவரைத் தேர்ந்தெடுக்கவும் —',
    'Sign In as Patient →': 'நோயாளராக உள்நுழையவும் →',
    'Register here →': 'இங்கே பதிவு செய்யவும் →',
    'Create Patient Account →': 'நோயாளர் கணக்கை உருவாக்கவும் →',
    '← Exit to Home': '← முகப்புக்குச் செல்லவும்',
    'Enable Browser Alerts + Sound': 'உலாவி அறிவிப்புகளையும் ஒலியையும் இயக்கு',
    '🔔 Enable Browser Alerts + Sound': '🔔 உலாவி அறிவிப்புகளையும் ஒலியையும் இயக்கு',
    '🔔 YOUR TURN HAS ARRIVED! Please enter the Doctor\'s OP Consultation Room immediately.': '🔔 உங்கள் முறை வந்துவிட்டது! உடனே மருத்துவரின் ஆலோசனை அறைக்குச் செல்லவும்.',
    'Loading token live status...': 'டோக்கனின் நேரடி நிலை ஏற்றப்படுகிறது...',
    'Loading doctors snapshot...': 'மருத்துவர் நிலவரம் ஏற்றப்படுகிறது...',
    'Loading doctors directory...': 'மருத்துவர் பட்டியல் ஏற்றப்படுகிறது...',
    'Loading appointments...': 'முன்பதிவுகள் ஏற்றப்படுகின்றன...',
    'Register Doctor Into System →': 'மருத்துவரைப் பதிவு செய்யவும் →',
    'FN: 9:00–10:00, 10:15–11:15, 11:30–12:30': 'முற்பகல்: 9:00–10:00, 10:15–11:15, 11:30–12:30',
    'AN: 1:30–2:30, 2:45–3:45, 4:00–5:00': 'பிற்பகல்: 1:30–2:30, 2:45–3:45, 4:00–5:00',
    'No doctors available yet': 'மருத்துவர்கள் இன்னும் கிடைக்கவில்லை',
    'No available slots for this date.': 'இந்தத் தேதிக்கு நேரங்கள் இல்லை.',
    'Checking slots...': 'நேரங்கள் சரிபார்க்கப்படுகின்றன...',
    'Available': 'கிடைக்கிறது',
    'Doctor is currently unavailable:': 'மருத்துவர் தற்போது கிடைக்கவில்லை:',
    'Desktop notifications enabled.': 'கணினி அறிவிப்புகள் இயக்கப்பட்டன.',
    'Desktop notifications were not allowed.': 'கணினி அறிவிப்புகளுக்கு அனுமதி வழங்கப்படவில்லை.',
    'Desktop notifications are not supported by this browser.': 'இந்த உலாவியில் கணினி அறிவிப்புகளைப் பயன்படுத்த முடியாது.',
    'Could not enable desktop notifications.': 'கணினி அறிவிப்புகளை இயக்க முடியவில்லை.',
    'Turn sound enabled.': 'முறை அறிவிப்பு ஒலி இயக்கப்பட்டது.',
    'Turn sound is not supported by this browser.': 'இந்த உலாவியில் அறிவிப்பு ஒலியைப் பயன்படுத்த முடியாது.',
    'Could not enable sound; check browser audio settings.': 'ஒலியை இயக்க முடியவில்லை; உலாவி ஒலி அமைப்புகளைச் சரிபார்க்கவும்.',
    'Sound alert failed; check browser audio settings.': 'அறிவிப்பு ஒலி இயங்கவில்லை; உலாவி ஒலி அமைப்புகளைச் சரிபார்க்கவும்.',
    'Desktop notification failed; check browser notification settings.': 'கணினி அறிவிப்பு காட்டப்படவில்லை; உலாவி அறிவிப்பு அமைப்புகளைச் சரிபார்க்கவும்.',
    'WaitWise: YOUR TURN HAS ARRIVED!': 'வைட்வைஸ்: உங்கள் முறை வந்துவிட்டது!',
    'Please enter the OP Consultation room now.': 'இப்போது ஆலோசனை அறைக்குச் செல்லவும்.',
    'Your turn is next. Please proceed to the room.': 'அடுத்தது உங்கள் முறை. ஆலோசனை அறைக்குச் செல்லவும்.',
    'Doctor is currently unavailable: Visiting existing patients in ward (In-Patient rounds)': 'மருத்துவர் தற்போது கிடைக்கவில்லை: வார்டில் உள்ள நோயாளிகளைப் பார்வையிடுகிறார்.',
    'Date required.': 'தேதி அவசியம்.',
    'Doctor, date, and slot are required.': 'மருத்துவர், தேதி, நேரம் ஆகியவை அவசியம்.',
    'Select a valid consultation slot for this date and session.': 'இந்தத் தேதி மற்றும் அமர்வுக்கான சரியான ஆலோசனை நேரத்தைத் தேர்ந்தெடுக்கவும்.',
    'This consultation time has already passed.': 'இந்த ஆலோசனை நேரம் கடந்துவிட்டது.',
    'You already have an active appointment with this doctor. Complete or cancel it before booking another.': 'இந்த மருத்துவரிடம் ஏற்கனவே செயலில் உள்ள முன்பதிவு உள்ளது. மற்றொன்றை முன்பதிவு செய்வதற்கு முன் அதை முடிக்கவும் அல்லது ரத்து செய்யவும்.',
    'This slot was just booked by another patient. Please select another slot.': 'இந்த நேரம் மற்றொரு நோயாளரால் முன்பதிவு செய்யப்பட்டது. வேறு நேரத்தைத் தேர்ந்தெடுக்கவும்.',
    'Token generated successfully!': 'டோக்கன் வெற்றிகரமாக உருவாக்கப்பட்டது!',
    'Please pick a doctor, date, and slot.': 'மருத்துவர், தேதி, நேரம் ஆகியவற்றைத் தேர்ந்தெடுக்கவும்.',
    'No doctors registered in system.': 'அமைப்பில் மருத்துவர்கள் பதிவு செய்யப்படவில்லை.',
    'Failed to load OP queue.': 'வெளிநோயாளர் வரிசையை ஏற்ற முடியவில்லை.',
    'Failed to update availability.': 'கிடைக்கும் நிலையைப் புதுப்பிக்க முடியவில்லை.',
    'No appointments recorded in the system yet.': 'அமைப்பில் இதுவரை முன்பதிவுகள் இல்லை.',
    'No doctors registered yet.': 'மருத்துவர்கள் இன்னும் பதிவு செய்யப்படவில்லை.',
    'No doctors registered.': 'மருத்துவர்கள் பதிவு செய்யப்படவில்லை.',
    'No appointments found': 'முன்பதிவுகள் இல்லை',
    'Appointment not found.': 'முன்பதிவு கிடைக்கவில்லை.',
    'Doctor not found.': 'மருத்துவர் கிடைக்கவில்லை.',
    'Server error.': 'சேவையகப் பிழை.',
    'Invalid email or password.': 'மின்னஞ்சல் அல்லது கடவுச்சொல் தவறானது.',
    'Email already registered.': 'இந்த மின்னஞ்சல் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது.',
    'Name, email and password are required.': 'பெயர், மின்னஞ்சல், கடவுச்சொல் ஆகியவை அவசியம்.',
    'Email and password are required.': 'மின்னஞ்சல் மற்றும் கடவுச்சொல் அவசியம்.',
    'Password must be at least 6 characters.': 'கடவுச்சொல் குறைந்தது 6 எழுத்துகள் இருக்க வேண்டும்.',
    'Registration successful. You can now log in.': 'பதிவு வெற்றிகரமாக முடிந்தது. இப்போது உள்நுழையலாம்.',
    'Server error during registration.': 'பதிவின்போது சேவையகப் பிழை ஏற்பட்டது.',
    'Server error during login.': 'உள்நுழைவின்போது சேவையகப் பிழை ஏற்பட்டது.',
    'Login failed.': 'உள்நுழைவு தோல்வியடைந்தது.',
    'Registration failed.': 'பதிவு தோல்வியடைந்தது.',
    'Passwords do not match.': 'கடவுச்சொற்கள் பொருந்தவில்லை.',
    'Name, email, subject, and message are required.': 'பெயர், மின்னஞ்சல், பொருள், செய்தி ஆகியவை அவசியம்.',
    'Please provide valid contact details and a message within the allowed length.': 'சரியான தொடர்பு விவரங்களையும் அனுமதிக்கப்பட்ட அளவிலான செய்தியையும் வழங்கவும்.',
    'Your message has been received. We will be in touch soon.': 'உங்கள் செய்தி பெறப்பட்டது. விரைவில் தொடர்புகொள்வோம்.',
    'Server error saving your message.': 'செய்தியைச் சேமிக்கும்போது சேவையகப் பிழை ஏற்பட்டது.',
    'A rating from 1 to 5 and a comment of up to 2000 characters are required.': '1 முதல் 5 வரையிலான மதிப்பீடும் 2000 எழுத்துகளுக்குள் கருத்தும் அவசியம்.',
    'Feedback is available after the consultation is completed.': 'ஆலோசனை முடிந்த பிறகு கருத்தை வழங்கலாம்.',
    'Feedback has already been submitted for this appointment.': 'இந்த முன்பதிவுக்கான கருத்து ஏற்கனவே சமர்ப்பிக்கப்பட்டது.',
    'Thank you for sharing your feedback.': 'உங்கள் கருத்தைப் பகிர்ந்ததற்கு நன்றி.',
    'Server error saving feedback.': 'கருத்தைச் சேமிக்கும்போது சேவையகப் பிழை ஏற்பட்டது.',
    'Cannot cancel an appointment already completed or in progress.': 'முடிந்த அல்லது நடைபெறும் முன்பதிவை ரத்து செய்ய முடியாது.',
    'Appointment cancelled.': 'முன்பதிவு ரத்து செய்யப்பட்டது.',
    'Invalid status.': 'நிலை தவறானது.',
    'Not authorized.': 'இதற்கு அனுமதி இல்லை.',
    'No token provided.': 'டோக்கன் வழங்கப்படவில்லை.',
    'Invalid or expired token.': 'டோக்கன் தவறானது அல்லது காலாவதியானது.',
    'Internal server error': 'சேவையகத்தில் உள் பிழை ஏற்பட்டது.',
    'Please select a star rating.': 'நட்சத்திர மதிப்பீட்டைத் தேர்ந்தெடுக்கவும்.',
    'Cancel this appointment token?': 'இந்த முன்பதிவு டோக்கனை ரத்து செய்யவா?',
    'Reason for doctor unavailability (e.g. Visiting existing patients in ward (In-Patient rounds)):': 'மருத்துவர் கிடைக்காததற்கான காரணம் (எ.கா. வார்டில் உள்ள நோயாளிகளைப் பார்வையிடுதல்):',
    'Visiting existing patients in ward (In-Patient rounds)': 'வார்டில் உள்ள நோயாளிகளைப் பார்வையிடுதல்',
    'Seed error:': 'தரவு அமைப்புப் பிழை:',
    'System seeded with the default admin and 2 General Psychiatry doctors.': 'இயல்புநிலை நிர்வாகியும் இரண்டு பொது மனநல மருத்துவர்களும் அமைக்கப்பட்டனர்.',
    'Error seeding system.': 'அமைப்பைத் தொடங்கும்போது பிழை ஏற்பட்டது.',
    'Error fetching admin dashboard.': 'நிர்வாகப் பலகையைப் பெறுவதில் பிழை ஏற்பட்டது.',
    'Maximum doctor limit reached. The psychiatry clinic is configured for 2 doctors.': 'மருத்துவர்களின் அதிகபட்ச எண்ணிக்கை எட்டப்பட்டது. மனநல மருத்துவமனைக்கு இரண்டு மருத்துவர்கள் மட்டுமே அமைக்கப்பட்டுள்ளனர்.',
    'A user or doctor with this email is already registered.': 'இந்த மின்னஞ்சலில் பயனர் அல்லது மருத்துவர் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளார்.',
    'Doctor successfully registered into WaitWise system.': 'மருத்துவர் வைட்வைஸ் அமைப்பில் வெற்றிகரமாகப் பதிவு செய்யப்பட்டார்.',
    'Error registering doctor.': 'மருத்துவரைப் பதிவு செய்வதில் பிழை ஏற்பட்டது.',
    'Error fetching doctors list.': 'மருத்துவர் பட்டியலைப் பெறுவதில் பிழை ஏற்பட்டது.',
    'Error fetching appointments.': 'முன்பதிவுகளைப் பெறுவதில் பிழை ஏற்பட்டது.',
    'Not authorized for this patient appointment.': 'இந்த நோயாளரின் முன்பதிவை அணுக அனுமதி இல்லை.',
    'Consultation completed. Waiting queue positions updated automatically.': 'ஆலோசனை முடிந்தது. காத்திருப்பு வரிசை தானாகப் புதுப்பிக்கப்பட்டது.',
    'Doctor profile not found.': 'மருத்துவர் விவரம் கிடைக்கவில்லை.',
    'Server error loading queue.': 'வரிசையை ஏற்றும்போது சேவையகப் பிழை ஏற்பட்டது.',
    'Please enter a reason for unavailability.': 'கிடைக்காததற்கான காரணத்தை உள்ளிடவும்.',
    'Request failed': 'கோரிக்கை தோல்வியடைந்தது.',
    'The clinic has two General Psychiatry doctors, with fixed 60-minute appointments.': 'மருத்துவமனையில் இரண்டு பொது மனநல மருத்துவர்கள் உள்ளனர்; ஒவ்வொரு ஆலோசனையும் 60 நிமிடங்கள்.',
    'Doctor registration is managed by Hospital Admin': 'மருத்துவர்களின் பதிவை மருத்துவமனை நிர்வாகம் நிர்வகிக்கிறது.',
    'Authorized hospital personnel only': 'அங்கீகரிக்கப்பட்ட மருத்துவமனைப் பணியாளர்களுக்கு மட்டும்.',
    'No tokens booked yet': 'இதுவரை டோக்கன்கள் முன்பதிவு செய்யப்படவில்லை.',
    'Use the \'Book OP Consultation Slot\' tab to reserve your appointment.': 'முன்பதிவு செய்ய “ஆலோசனை நேரத்தை முன்பதிவு செய்” தாவலைப் பயன்படுத்தவும்.',
    'TOKEN': 'டோக்கன்',
    'Queue positions advance automatically as doctors finish past consultations.': 'மருத்துவர்கள் முந்தைய ஆலோசனைகளை முடிக்கும்போது வரிசை தானாக முன்னேறும்.',
    'General Psychiatry': 'பொது மனநல மருத்துவம்',
    'Monday': 'திங்கள்', 'Tuesday': 'செவ்வாய்', 'Wednesday': 'புதன்', 'Thursday': 'வியாழன்',
    'Friday': 'வெள்ளி', 'Saturday': 'சனி', 'Sunday': 'ஞாயிறு',
    'FN Session — Forenoon': 'முற்பகல் அமர்வு',
    'AN Session — Afternoon': 'பிற்பகல் அமர்வு',
    'FN Session:': 'முற்பகல் அமர்வு:',
    'AN Session:': 'பிற்பகல் அமர்வு:',
    'Sign In as Patient': 'நோயாளராக உள்நுழையவும்',
    'Create Patient Account': 'நோயாளர் கணக்கை உருவாக்கவும்',
    'Available Sessions & Appointment Times': 'கிடைக்கும் அமர்வுகள் மற்றும் முன்பதிவு நேரங்கள்',
    'Select Consultation Date': 'ஆலோசனைத் தேதியைத் தேர்ந்தெடுக்கவும்',
    'Select General Psychiatry Doctor': 'பொது மனநல மருத்துவரைத் தேர்ந்தெடுக்கவும்',
    'Your Booked OP Tokens': 'உங்கள் முன்பதிவு டோக்கன்கள்',
    'Appointment notifications': 'முன்பதிவு அறிவிப்புகள்',
    '© 2024 WaitWise Hospital Queue Management System. All rights reserved.': '© 2024 வைட்வைஸ் மருத்துவமனை வரிசை மேலாண்மை அமைப்பு. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.',
    '© 2024 WaitWise Hospital Queue Management System.': '© 2024 வைட்வைஸ் மருத்துவமனை வரிசை மேலாண்மை அமைப்பு.',
    '© 2024 WaitWise Hospital Outpatient Queue Management System • Live Queue Broadcast.': '© 2024 வைட்வைஸ் மருத்துவமனை வெளிநோயாளர் வரிசை • நேரடி வரிசை ஒளிபரப்பு.',
    'Status updated to waiting. Queue recalculation complete.': 'நிலை காத்திருக்கிறார் என மாற்றப்பட்டது. வரிசை மீண்டும் கணக்கிடப்பட்டது.',
    'Status updated to in-consultation. Queue recalculation complete.': 'நிலை ஆலோசனையில் உள்ளார் என மாற்றப்பட்டது. வரிசை மீண்டும் கணக்கிடப்பட்டது.',
    'Status updated to completed. Queue recalculation complete.': 'நிலை முடிக்கப்பட்டது என மாற்றப்பட்டது. வரிசை மீண்டும் கணக்கிடப்பட்டது.',
    'Status updated to cancelled. Queue recalculation complete.': 'நிலை ரத்து செய்யப்பட்டது என மாற்றப்பட்டது. வரிசை மீண்டும் கணக்கிடப்பட்டது.'
  });
  const localeByLanguage = { en: 'en-US', ta: 'ta-IN' };
  const originalText = new WeakMap();
  const renderedText = new WeakMap();
  const originalAttributes = new WeakMap();
  const languageListeners = new Set();
  const savedLanguage = localStorage.getItem('ww_language');
  let language = ['en', 'ta'].includes(savedLanguage) ? savedLanguage : 'en';
  if (savedLanguage === 'hi') localStorage.setItem('ww_language', 'en');
  const sourceTitle = document.title;

  function normalizeTranslation(value) {
    if (language !== 'ta') return value;
    return value
      .replace(/\bWaitWise\b/gi, 'வைட்வைஸ்')
      .replace(/\bOP\b/g, 'வெளிநோயாளர்')
      .replace(/\bFN\b/g, 'முற்பகல்')
      .replace(/\bAN\b/g, 'பிற்பகல்');
  }

  function translateTextNode(node) {
    if (node.parentElement && node.parentElement.closest('script, style, template')) return;
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
    const queueAhead = trimmed.match(/^⏳ (\d+) patients? ahead in queue\.$/);
    const countdown = trimmed.match(/^Tracking: refresh in (\d+)s$/);
    const ratingLabel = trimmed.match(/^(\d+) out of 5 stars$/);
    const signInRole = trimmed.match(/^Sign in as (Patient|Doctor|Administrator) →$/);
    const sessionSlot = trimmed.match(/^(FN|AN) Session: (.+)$/);
    const waitingCount = trimmed.match(/^\((\d+) waiting\)$/);
    const appointmentSummary = trimmed.match(/^(.+) • (FN|AN) Session: (.+)$/);
    const appointmentSessionLabel = trimmed.match(/^(.+) • (FN|AN) Session:$/);
    const appointmentDate = trimmed.match(/^Date: (.+)$/);
    const minutes = trimmed.match(/^(\d+) min$/);
    const starCount = trimmed.match(/^(\d+) stars$/);
    const reasonText = trimmed.match(/^Reason: (.+)$/);
    const sessionLabel = trimmed.match(/^(FN|AN) Session:$/);
    const phoneAndAge = trimmed.match(/^(?:•\s*)?Phone: (.+?)(?:\s+\((\d+) yrs, (Male|Female|Other)\))?$/);
    const phoneDetails = trimmed.match(/^(?:•\s*)?Phone: (.+)$/);
    const clinicalNote = trimmed.match(/^Clinical Notes: (.+)$/);
    const doneTime = trimmed.match(/^(?:✓ )?Done(?: at)? (.+)$/);
    const roomDuration = trimmed.match(/^Slot: (\d+)m$/);
    const compactMinutes = trimmed.match(/^(\d+)m$/);
    const ageGender = trimmed.match(/^(?:•\s*)?\((\d+) yrs, (Male|Female|Other)\)$/);
    const doctorOption = trimmed.match(/^(.+?) — (.+?) \[(✓ Available|⚠️ Unavailable)(?: \((.+)\))?\]$/);
    const doctorDuration = trimmed.match(/^(.+) • (\d+) min\/slot$/);
    const appointmentSession = trimmed.match(/^(FN|AN) Session · (.+)$/);
    const doctorSpecialty = trimmed.match(/^• (.+?)(?: •)?$/);
    const unavailableReason = trimmed.match(/^⚠️ Currently Unavailable: (.+)$/);
    const unavailableDoctor = trimmed.match(/^Doctor is currently unavailable: (.+)$/);
    const doctorMarked = trimmed.match(/^Doctor (.+) marked (available|unavailable)\.$/);
    const doctorStatusSet = trimmed.match(/^Doctor status set to (Available for OP|Unavailable: .+)$/);
    const statusUpdated = trimmed.match(/^Status updated to (.+)\. Queue recalculation complete\.$/);
    const generatedToken = trimmed.match(/^Token #(\d+) Generated!$/);
    const noSlotsForDay = trimmed.match(/^No consultation slots configured on (.+)\.$/);
    let translated = dictionary[trimmed];
    if (!translated && language === 'en') translated = trimmed;
    if (!translated && emptyQueue) {
      const localizedStatus = dictionary[emptyQueue[1]] || emptyQueue[1];
      translated = language === 'ta'
        ? `“${localizedStatus}” நிலையில் முன்பதிவுகள் இல்லை.`
        : `No appointments found in “${localizedStatus}” status.`;
    } else if (!translated && consultationDuration) {
      translated = language === 'ta'
        ? `பொது மனநல மருத்துவம் · ஒவ்வொரு ஆலோசனையும் ${consultationDuration[1]} நிமிடம்`
        : `General Psychiatry · ${consultationDuration[1]} min consultation slot duration`;
    } else if (!translated && greeting) {
      translated = language === 'ta'
        ? `வணக்கம், ${greeting[1]} — உங்கள் முறை வரும் வரை டிஜிட்டல் வரிசையில் காத்திருக்கவும்.`
        : `Hello, ${greeting[1]} — Queue digitally from home; enter only when your turn arrives.`;
    } else if (!translated && queueAhead) {
      translated = language === 'ta'
        ? `⏳ வரிசையில் ${queueAhead[1]} நோயாளர்கள் முன் உள்ளனர்.`
        : `⏳ ${queueAhead[1]} patients ahead in queue.`;
    } else if (!translated && countdown) {
      translated = language === 'ta'
        ? `கண்காணிப்பு: ${countdown[1]} நொடிகளில் புதுப்பிக்கப்படும்`
        : `Tracking: refresh in ${countdown[1]}s`;
    } else if (!translated && ratingLabel) {
      translated = language === 'ta'
        ? `5 இல் ${ratingLabel[1]} நட்சத்திரங்கள்`
        : `${ratingLabel[1]} out of 5 stars`;
    } else if (!translated && signInRole) {
      const role = dictionary[signInRole[1]] || signInRole[1];
      translated = language === 'ta'
        ? `${role} ஆக உள்நுழையவும் →`
        : `Sign in as ${signInRole[1]} →`;
    } else if (!translated && sessionSlot) {
      translated = language === 'ta'
        ? `${sessionSlot[1]} அமர்வு: ${sessionSlot[2]}`
        : `${sessionSlot[1]} Session: ${sessionSlot[2]}`;
    } else if (!translated && waitingCount) {
      translated = language === 'ta'
        ? `(${waitingCount[1]} காத்திருக்கின்றனர்)`
        : `(${waitingCount[1]} waiting)`;
    } else if (!translated && appointmentSummary) {
      const specialization = dictionary[appointmentSummary[1]] || appointmentSummary[1];
      translated = language === 'ta'
        ? `${specialization} • ${appointmentSummary[2]} அமர்வு: ${appointmentSummary[3]}`
        : `${specialization} • ${appointmentSummary[2]} Session: ${appointmentSummary[3]}`;
    } else if (!translated && appointmentSessionLabel) {
      const specialization = dictionary[appointmentSessionLabel[1]] || appointmentSessionLabel[1];
      translated = language === 'ta'
        ? `${specialization} • ${appointmentSessionLabel[2]} அமர்வு:`
        : `${specialization} • ${appointmentSessionLabel[2]} Session:`;
    } else if (!translated && appointmentDate) {
      translated = `${dictionary['Date:'] || (language === 'ta' ? 'தேதி:' : 'Date:')} ${appointmentDate[1]}`;
    } else if (!translated && minutes) {
      translated = language === 'ta'
        ? `${minutes[1]} நிமிடங்கள்`
        : `${minutes[1]} min`;
    } else if (!translated && starCount) {
      translated = language === 'ta'
        ? `${starCount[1]} நட்சத்திரங்கள்`
        : `${starCount[1]} stars`;
    } else if (!translated && reasonText) {
      translated = `${dictionary['Reason:'] || (language === 'ta' ? 'காரணம்:' : 'Reason:')} ${dictionary[reasonText[1]] || reasonText[1]}`;
    } else if (!translated && sessionLabel) {
      translated = language === 'ta'
        ? `${sessionLabel[1]} அமர்வு:`
        : `${sessionLabel[1]} Session:`;
    } else if (!translated && phoneAndAge) {
      const phoneLabel = dictionary['Phone:'] || (language === 'ta' ? 'தொலைபேசி:' : 'Phone:');
      const age = phoneAndAge[2];
      const gender = phoneAndAge[3] ? dictionary[phoneAndAge[3]] || phoneAndAge[3] : '';
      translated = `${trimmed.startsWith('•') ? '• ' : ''}${phoneLabel} ${phoneAndAge[1]}${age ? (language === 'ta' ? ` (${age} வயது, ${gender})` : ` (${age} yrs, ${gender})`) : ''}`;
    } else if (!translated && phoneDetails) {
      translated = `${trimmed.startsWith('•') ? '• ' : ''}${dictionary['Phone:'] || (language === 'ta' ? 'தொலைபேசி:' : 'Phone:')} ${phoneDetails[1]}`;
    } else if (!translated && clinicalNote) {
      translated = `${dictionary['Clinical Notes:'] || (language === 'ta' ? 'மருத்துவக் குறிப்புகள்:' : 'Clinical Notes:')} ${clinicalNote[1]}`;
    } else if (!translated && doneTime) {
      translated = language === 'ta'
        ? `✓ ${doneTime[1]} மணிக்கு முடிந்தது`
        : `✓ Done at ${doneTime[1]}`;
    } else if (!translated && roomDuration) {
      translated = language === 'ta'
        ? `நேரம்: ${roomDuration[1]} நிமிடம்`
        : `Slot: ${roomDuration[1]} min`;
    } else if (!translated && compactMinutes) {
      translated = language === 'ta'
        ? `${compactMinutes[1]} நிமிடங்கள்`
        : `${compactMinutes[1]} min`;
    } else if (!translated && ageGender) {
      const gender = dictionary[ageGender[2]] || ageGender[2];
      translated = language === 'ta'
        ? `(${ageGender[1]} வயது, ${gender})`
        : `(${ageGender[1]} yrs, ${gender})`;
    } else if (!translated && doctorOption) {
      const specialization = dictionary[doctorOption[2]] || doctorOption[2];
      const availability = dictionary[doctorOption[3]] || doctorOption[3];
      const reason = doctorOption[4] ? ` (${dictionary[doctorOption[4]] || doctorOption[4]})` : '';
      translated = `${dictionary[doctorOption[1]] || doctorOption[1]} — ${specialization} [${availability}${reason}]`;
    } else if (!translated && doctorDuration) {
      const specialization = dictionary[doctorDuration[1]] || doctorDuration[1];
      translated = language === 'ta'
        ? `${specialization} • ${doctorDuration[2]} நிமிடம் / நேரம்`
        : `${specialization} • ${doctorDuration[2]} min/slot`;
    } else if (!translated && appointmentSession) {
      translated = language === 'ta'
        ? `${appointmentSession[1]} அமர்வு · ${appointmentSession[2]}`
        : `${appointmentSession[1]} Session · ${appointmentSession[2]}`;
    } else if (!translated && doctorSpecialty) {
      translated = `• ${dictionary[doctorSpecialty[1]] || doctorSpecialty[1]} •`;
    } else if (!translated && unavailableReason) {
      translated = `${dictionary['⚠️ Currently Unavailable:'] || (language === 'ta' ? '⚠️ தற்போது கிடைக்கவில்லை:' : '⚠️ Currently Unavailable:')} ${dictionary[unavailableReason[1]] || unavailableReason[1]}`;
    } else if (!translated && unavailableDoctor) {
      translated = `${dictionary['Doctor is currently unavailable:'] || 'மருத்துவர் தற்போது கிடைக்கவில்லை:'} ${dictionary[unavailableDoctor[1]] || unavailableDoctor[1]}`;
    } else if (!translated && doctorMarked) {
      translated = `மருத்துவர் ${doctorMarked[1]} ${doctorMarked[2] === 'available' ? 'கிடைக்கிறார்' : 'கிடைக்கவில்லை'} எனக் குறிக்கப்பட்டார்.`;
    } else if (!translated && doctorStatusSet) {
      const state = doctorStatusSet[1].startsWith('Available')
        ? 'வெளிநோயாளர் ஆலோசனைக்கு கிடைக்கிறார்'
        : `கிடைக்கவில்லை: ${dictionary[doctorStatusSet[1].slice('Unavailable: '.length)] || doctorStatusSet[1].slice('Unavailable: '.length)}`;
      translated = `மருத்துவர் நிலை ${state} என அமைக்கப்பட்டது.`;
    } else if (!translated && statusUpdated) {
      const status = {
        waiting: 'காத்திருக்கிறார்',
        'in-consultation': 'ஆலோசனையில் உள்ளார்',
        completed: 'முடிக்கப்பட்டது',
        cancelled: 'ரத்து செய்யப்பட்டது'
      }[statusUpdated[1]] || statusUpdated[1];
      translated = `நிலை ${status} என மாற்றப்பட்டது. வரிசை மீண்டும் கணக்கிடப்பட்டது.`;
    } else if (!translated && generatedToken) {
      translated = language === 'ta'
        ? `டோக்கன் #${generatedToken[1]} உருவாக்கப்பட்டது!`
        : `Token #${generatedToken[1]} Generated!`;
    } else if (!translated && noSlotsForDay) {
      translated = `${dictionary['No consultation slots configured on'] || (language === 'ta' ? 'இந்த நாளில் ஆலோசனை நேரங்கள் அமைக்கப்படவில்லை:' : 'No consultation slots configured on')} ${dictionary[noSlotsForDay[1]] || noSlotsForDay[1]}.`;
    }
    if (!translated) translated = trimmed;
    translated = normalizeTranslation(translated);
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
      const translated = normalizeTranslation((dictionaries[language] || {})[source] || source);
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
        const translated = normalizeTranslation((dictionaries[language] || {})[source] || source);
        child.setAttribute(attribute, translated);
        values[`${attribute}Rendered`] = translated;
      });
    });
  }

  function apply() {
    document.documentElement.lang = language;
    const selector = document.getElementById('languageSelector');
    if (selector) {
      const englishLabel = language === 'ta' ? 'ஆங்கிலம்' : 'English';
      const tamilLabel = language === 'ta' ? 'தமிழ்' : 'Tamil';
      selector.innerHTML = `<option value="en">${englishLabel}</option><option value="ta">${tamilLabel}</option>`;
      selector.value = language;
    }
    translateElement(document.body);
    document.title = normalizeTranslation((dictionaries[language] || {})[sourceTitle] || sourceTitle);
  }

  function setLanguage(nextLanguage) {
    if (!['en', 'ta'].includes(nextLanguage)) return;
    language = nextLanguage;
    localStorage.setItem('ww_language', language);
    apply();
    languageListeners.forEach(listener => listener(language));
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
    selector.innerHTML = '<option value="en">English</option><option value="ta">தமிழ்</option>';
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
    onChange(listener) {
      languageListeners.add(listener);
      return () => languageListeners.delete(listener);
    },
    t(text) { return normalizeTranslation((dictionaries[language] || {})[text] || text); }
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
          <a href="/pages/contact.html">Contact</a>
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
          <a href="/pages/contact.html">Contact</a>
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
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
}

function clinicDateKey(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function isAppointmentToday(appointmentDate) {
  return Boolean(appointmentDate) &&
    clinicDateKey(new Date(appointmentDate)) === clinicDateKey();
}

function statusBadge(status, appointmentDate) {
  const displayStatus = status === 'waiting' && appointmentDate &&
    clinicDateKey(new Date(appointmentDate)) > clinicDateKey()
    ? 'scheduled'
    : status;
  const map = {
    waiting: 'waiting',
    scheduled: 'waiting',
    'in-consultation': 'in-consultation',
    completed: 'completed',
    cancelled: 'cancelled'
  };
  const labels = {
    waiting: '⏳ Waiting in Queue',
    scheduled: '📅 Scheduled',
    'in-consultation': '🩺 In Consultation',
    completed: '✅ Completed',
    cancelled: '✕ Cancelled'
  };
  return `<span class="badge badge-${map[displayStatus] || ''}">${labels[displayStatus] || status}</span>`;
}

function fmtDate(d) {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString(I18n.locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

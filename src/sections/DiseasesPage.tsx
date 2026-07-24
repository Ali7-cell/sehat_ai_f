import { useState, useEffect } from 'react';
import { X, Stethoscope, ShieldCheck, ChevronLeft, Activity, Languages } from 'lucide-react';

// ─── Language Type ────────────────────────────────────────────────────────────
type UILang = 'english' | 'roman' | 'urdu';

// ─── Multilingual UI Strings ──────────────────────────────────────────────────
const PAGE_TEXT: Record<UILang, {
  backToChat: string; modelVerification: string; supportedDiseases: string;
  descriptionPre: string; descriptionMid: string; descriptionPost: string;
  symptomsCount: (n: number) => string; footerNote: string; verifiedBadge: string;
  datasetSymptoms: string; precautionary: string; total: string; close: string;
  doctorFirst: string;
}> = {
  english: {
    backToChat: 'Back to Chat',
    modelVerification: 'Model Verification',
    supportedDiseases: 'Supported Diseases',
    descriptionPre: 'These',
    descriptionMid: 'diseases',
    descriptionPost: 'can be confidently predicted by all three AI models (Random Forest, XGBoost, DistilBERT). Click any disease to see its dataset-verified symptoms.',
    symptomsCount: (n: number) => `${n} symptoms`,
    footerNote: 'Symptoms sourced from Kaggle Disease Symptom Dataset · Static reference · No API calls',
    verifiedBadge: 'RF + XGBoost + BERT Verified',
    datasetSymptoms: 'Dataset-Verified Symptoms',
    precautionary: 'Precautionary Measures',
    total: 'total',
    close: 'Close',
    doctorFirst: '🏥 First consult a doctor for proper diagnosis and treatment.',
  },
  roman: {
    backToChat: 'Chat Par Wapas Jain',
    modelVerification: 'Model Verification',
    supportedDiseases: 'Supported Bimariyan',
    descriptionPre: 'Yeh',
    descriptionMid: 'bimariyan',
    descriptionPost: 'hamare teeno AI models (Random Forest, XGBoost, DistilBERT) confidently predict kar sakte hain. Kisi bhi bimari par click karein.',
    symptomsCount: (n: number) => `${n} symptoms`,
    footerNote: 'Symptoms Kaggle Disease Symptom Dataset se liye gaye hain · Static reference · Koi API calls nahi',
    verifiedBadge: 'RF + XGBoost + BERT Verified',
    datasetSymptoms: 'Dataset-Verified Symptoms',
    precautionary: 'Ehtiyati Tedabir',
    total: 'total',
    close: 'Band Karein',
    doctorFirst: '🏥 Pehle doctor se rabta karein — sahi tashkhees aur ilaj ke liye.',
  },
  urdu: {
    backToChat: 'چیٹ پر واپس جائیں',
    modelVerification: 'ماڈل تصدیق',
    supportedDiseases: 'معاون بیماریاں',
    descriptionPre: 'یہ',
    descriptionMid: 'بیماریاں',
    descriptionPost: 'ہمارے تینوں AI ماڈلز بھروسے کے ساتھ تشخیص کر سکتے ہیں۔ کسی بھی بیماری پر کلک کریں — اس کی علامات دیکھیں۔',
    symptomsCount: (n: number) => `${n} علامات`,
    footerNote: 'علامات Kaggle Disease Symptom Dataset سے لی گئی ہیں · Static reference · کوئی API calls نہیں',
    verifiedBadge: 'RF + XGBoost + BERT تصدیق شدہ',
    datasetSymptoms: 'ڈیٹاسیٹ سے تصدیق شدہ علامات',
    precautionary: 'احتیاطی تدابیر',
    total: 'کل',
    close: 'بند کریں',
    doctorFirst: '🏥 سب سے پہلے ڈاکٹر سے رجوع کریں — صحیح تشخیص اور علاج کے لیے۔',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// 21 Common diseases — symptoms taken EXACTLY from disease_symptoms.json
// All 3 models: RF + XGBoost + DistilBERT
// ─────────────────────────────────────────────────────────────────────────────
const SUPPORTED_DISEASES: Record<string, { symptoms: string[]; recommendations: Record<UILang, string[]> }> = {

  "Acne": {
    symptoms: ["Skin Rash", "Pus Filled Pimples", "Blackheads", "Scurring"],
    recommendations: {
      english: ["🧼 Wash face twice daily with mild soap", "🚫 Do not pop or squeeze pimples", "💧 Drink 8 glasses of water daily", "🥗 Reduce oily and sugary foods", "🏥 See a dermatologist for persistent acne"],
      roman: ["🧼 Din mein do baar halke sabun se chehra dhoyein", "🚫 Pimples mat dabayein ya phoren", "💧 Roz 8 gilas paani piyein", "🥗 Charbi aur meethi cheezein kam karein", "🏥 Lamba chalney wala acne ho tu dermatologist se milein"],
      urdu: ["🧼 دن میں دو بار ہلکے صابن سے چہرہ دھوئیں", "🚫 پمپلز نہ دبائیں یا پھوڑیں", "💧 روزانہ 8 گلاس پانی پئیں", "🥗 چکنائی اور میٹھی چیزیں کم کریں", "🏥 دائمی مہاسوں کے لیے ماہر جلد سے ملیں"],
    },
  },

  "Allergy": {
    symptoms: ["Continuous Sneezing", "Shivering", "Chills", "Watering From Eyes"],
    recommendations: {
      english: ["🚫 Avoid known triggers (dust, pollen, certain foods)", "💊 Antihistamines can provide relief", "🏠 Keep home dust-free", "😷 Wear mask in dusty environments"],
      roman: ["🚫 Jaani triggers se bachein (dhool, pollen, kuch khaane)", "💊 Antihistamines se aaraam mil sakta hai", "🏠 Ghar ko gard se paak rakhein", "😷 Dhool wali jagah mask pahnen"],
      urdu: ["🚫 معلوم محرکات سے بچیں (دھول، پولن، بعض کھانے)", "💊 اینٹی ہسٹامین سے آرام مل سکتا ہے", "🏠 گھر کو گرد سے پاک رکھیں", "😷 گردآلود جگہوں پر ماسک پہنیں"],
    },
  },

  "Arthritis": {
    symptoms: ["Muscle Weakness", "Stiff Neck", "Swelling Joints", "Movement Stiffness", "Painful Walking"],
    recommendations: {
      english: ["🚶 Light exercise and stretching daily", "❄️ Apply cold pack on swollen joints", "💊 Anti-inflammatory medication as prescribed", "⚖️ Maintain healthy body weight"],
      roman: ["🚶 Roz halki exercise aur stretching karein", "❄️ Soojhe hue joints par thandak lagayein", "💊 Doctor ki hidayat ke mutabiq dawa lein", "⚖️ Sehat mand wazan barqaraar rakhein"],
      urdu: ["🚶 روزانہ ہلکی ورزش اور کھنچاو کریں", "❄️ سوجے ہوئے جوڑوں پر ٹھنڈک لگائیں", "💊 ڈاکٹر کی ہدایت کے مطابق دوا لیں", "⚖️ صحت مند وزن برقرار رکھیں"],
    },
  },

  "Bronchial Asthma": {
    symptoms: ["Fatigue", "Cough", "High Fever", "Breathlessness", "Family History", "Mucoid Sputum"],
    recommendations: {
      english: ["💊 Always carry prescribed inhaler", "😷 Avoid dust, smoke, and strong smells", "🏠 Keep home dust-free", "🚭 Avoid smoking and second-hand smoke", "🌬️ Breathing exercises help long-term"],
      roman: ["💊 Hamesha prescription inhaler saath rakhein", "😷 Dhool, dhuan aur tez khushbu se bachein", "🏠 Ghar gard se paak rakhein", "🚭 Sigret aur passive smoking se bachein", "🌬️ Sans ki exercises lambe arse mein faida deti hain"],
      urdu: ["💊 ہمیشہ نسخے کا انہیلر ساتھ رکھیں", "😷 دھول، دھواں اور تیز خوشبو سے بچیں", "🏠 گھر گرد سے پاک رکھیں", "🚭 سگریٹ اور غیر فعال تمباکو نوشی سے بچیں", "🌬️ سانس کی مشقیں طویل مدت میں فائدہ دیتی ہیں"],
    },
  },

  "Cervical Spondylosis": {
    symptoms: ["Back Pain", "Weakness In Limbs", "Neck Pain", "Dizziness", "Loss Of Balance"],
    recommendations: {
      english: ["🧘 Do regular neck exercises", "🪑 Maintain good posture while sitting", "🛌 Use a supportive neck pillow while sleeping", "🔥 Apply heat or cold packs for relief"],
      roman: ["🧘 Gardan ki regular exercises karein", "🪑 Baithte waqt theek posture rakhein", "🛌 Soote waqt gardan ko sahara dene wala takia istamaal karein", "🔥 Aaraam ke liye garam ya thanda pak lagayein"],
      urdu: ["🧘 گردن کی باقاعدہ ورزشیں کریں", "🪑 بیٹھتے وقت درست پوسچر رکھیں", "🛌 سوتے وقت گردن کو سہارا دینے والا تکیہ استعمال کریں", "🔥 آرام کے لیے گرم یا ٹھنڈا پیک لگائیں"],
    },
  },

  "Chicken Pox": {
    symptoms: ["Itching", "Skin Rash", "Fatigue", "Lethargy", "High Fever", "Headache", "Loss Of Appetite", "Mild Fever", "Swelled Lymph Nodes", "Malaise", "Red Spots Over Body"],
    recommendations: {
      english: ["🚫 Isolate at home — highly contagious", "❌ Do NOT scratch blisters", "💊 Calamine lotion for itching", "💧 Stay hydrated"],
      roman: ["🚫 Ghar par izolate rahein — yeh badi tezi se phailti hai", "❌ Chhale bilkul mat khujlayein", "💊 Khujli ke liye calamine lotion lagayein", "💧 Paani zyada piyein"],
      urdu: ["🚫 گھر پر ہی رہیں — یہ بہت تیزی سے پھیلتی ہے", "❌ چھالوں کو بالکل نہ کھجائیں", "💊 خارش کے لیے کیلامائن لوشن لگائیں", "💧 پانی زیادہ پئیں"],
    },
  },

  "Common Cold": {
    symptoms: ["Continuous Sneezing", "Chills", "Fatigue", "Cough", "High Fever", "Headache", "Swelled Lymph Nodes", "Malaise", "Phlegm", "Throat Irritation", "Redness Of Eyes", "Sinus Pressure", "Runny Nose", "Congestion", "Chest Pain", "Loss Of Smell", "Muscle Pain"],
    recommendations: {
      english: ["🛏️ Rest at home", "💧 Drink warm water, green tea, and soups", "🍯 Honey with warm water helps sore throat", "💊 Paracetamol for fever if above 38.5°C", "😷 Wear a mask to avoid spreading"],
      roman: ["🛏️ Ghar par aaraam karein", "💧 Garam paani, green tea aur soups piyein", "🍯 Garm paani mein shehad gala dard mein madadgar hai", "💊 38.5°C se upar bukhar ho tu paracetamol lein", "😷 Phailne se rokne ke liye mask pahnen"],
      urdu: ["🛏️ گھر پر آرام کریں", "💧 گرم پانی، گرین ٹی اور سوپ پئیں", "🍯 گرم پانی میں شہد گلے کے درد میں مددگار ہے", "💊 38.5°C سے اوپر بخار ہو تو پیراسٹامول لیں", "😷 پھیلنے سے روکنے کے لیے ماسک پہنیں"],
    },
  },

  "Dengue": {
    symptoms: ["Skin Rash", "Chills", "Joint Pain", "Vomiting", "Fatigue", "High Fever", "Headache", "Nausea", "Loss Of Appetite", "Pain Behind The Eyes", "Back Pain", "Malaise", "Muscle Pain", "Red Spots Over Body"],
    recommendations: {
      english: ["💧 Drink 8–10 glasses of water/ORS daily", "🛏️ Complete bed rest — avoid any exertion", "🦟 Sleep under mosquito net", "❌ Do NOT take aspirin or ibuprofen — paracetamol only"],
      roman: ["💧 Roz 8–10 gilas paani/ORS piyein", "🛏️ Mukammal aaraam — koi mehnat mat karein", "🦟 Machhar dani mein soyein", "❌ Aspirin ya ibuprofen bilkul mat lein — sirf paracetamol"],
      urdu: ["💧 روزانہ 8–10 گلاس پانی/ORS پئیں", "🛏️ مکمل آرام — کوئی محنت نہ کریں", "🦟 مچھردانی میں سوئیں", "❌ اسپرین یا آئبوپروفن بالکل نہ لیں — صرف پیراسٹامول"],
    },
  },

  "Diabetes": {
    symptoms: ["Fatigue", "Weight Loss", "Restlessness", "Lethargy", "Irregular Sugar Level", "Blurred And Distorted Vision", "Obesity", "Excessive Hunger", "Increased Appetite", "Polyuria"],
    recommendations: {
      english: ["🍽️ Avoid sugar, white rice, and refined flour", "🚶 Walk 30 minutes daily", "💊 Take medication on time — never skip", "📊 Monitor blood sugar regularly at home"],
      roman: ["🍽️ Cheeni, safed chawal aur maida se bachein", "🚶 Roz 30 minute walk karein", "💊 Dawa waqt par lein — kabhi skip mat karein", "📊 Ghar par blood sugar regular check karein"],
      urdu: ["🍽️ چینی، سفید چاول اور میدہ سے بچیں", "🚶 روزانہ 30 منٹ پیدل چلیں", "💊 دوا وقت پر لیں — کبھی skip نہ کریں", "📊 گھر پر بلڈ شوگر باقاعدگی سے چیک کریں"],
    },
  },

  "Drug Reaction": {
    symptoms: ["Itching", "Skin Rash", "Stomach Pain", "Burning Micturition", "Spotting Urination"],
    recommendations: {
      english: ["❌ Stop the suspected medication immediately", "📋 Keep a record of the reaction and medication name", "💧 Drink plenty of water", "🚫 Do not self-medicate further", "🩺 Inform doctors of this reaction in future prescriptions"],
      roman: ["❌ Mashkook dawa foran band karein", "📋 Reaction aur dawa ka naam note karein", "💧 Zyada paani piyein", "🚫 Khud se aur dawa na lein", "🩺 Agalay prescription mein doctor ko yeh reaction zaroor batayein"],
      urdu: ["❌ مشکوک دوا فوراً بند کریں", "📋 ری ایکشن اور دوا کا نام نوٹ کریں", "💧 زیادہ پانی پئیں", "🚫 خود سے مزید دوا نہ لیں", "🩺 اگلے نسخے میں ڈاکٹر کو یہ ری ایکشن ضرور بتائیں"],
    },
  },

  "Fungal Infection": {
    symptoms: ["Itching", "Skin Rash", "Nodal Skin Eruptions", "Dischromic Patches"],
    recommendations: {
      english: ["🧼 Keep affected area clean and dry", "👗 Wear loose, breathable cotton clothing", "🚫 Do not share towels or clothing", "💊 Complete full antifungal course even if it looks better"],
      roman: ["🧼 Mutasirrah jagah saaf aur khushk rakhein", "👗 Dhele aur suthi kapray pahnen", "🚫 Towel ya kapray share mat karein", "💊 Antifungal course mukammal karein chahe behtar lag raha ho"],
      urdu: ["🧼 متاثرہ جگہ صاف اور خشک رکھیں", "👗 ڈھیلے اور سوتی کپڑے پہنیں", "🚫 تولیہ یا کپڑے شیئر نہ کریں", "💊 Antifungal کورس مکمل کریں چاہے بہتر لگ رہا ہو"],
    },
  },

  "Hypertension": {
    symptoms: ["Headache", "Chest Pain", "Dizziness", "Loss Of Balance", "Lack Of Concentration"],
    recommendations: {
      english: ["🧂 Reduce salt intake drastically", "🚶 Walk 30–45 minutes daily", "😴 Sleep 7–8 hours daily", "🚭 Stop smoking and avoid alcohol"],
      roman: ["🧂 Namak ki miqdar bahut kam karein", "🚶 Roz 30–45 minute walk karein", "😴 Roz 7–8 ghante soyein", "🚭 Sigret band karein aur sharaab se bachein"],
      urdu: ["🧂 نمک کی مقدار بہت کم کریں", "🚶 روزانہ 30–45 منٹ پیدل چلیں", "😴 روزانہ 7–8 گھنٹے سوئیں", "🚭 سگریٹ بند کریں اور شراب سے بچیں"],
    },
  },

  "Impetigo": {
    symptoms: ["Skin Rash", "High Fever", "Blister", "Red Sore Around Nose", "Yellow Crust Ooze"],
    recommendations: {
      english: ["🧼 Gently wash sores with soap and water", "🚫 Don't share towels or clothes", "🩹 Keep sores covered", "🧴 Apply prescribed antibiotic ointment"],
      roman: ["🧼 Zakhmon ko sabun aur paani se aahistagi se dhoyein", "🚫 Towel ya kapray share mat karein", "🩹 Zakhm dhake rakhein", "🧴 Doctor ki bataayi hui antibiotic ointment lagayein"],
      urdu: ["🧼 زخموں کو صابن اور پانی سے آہستگی سے دھوئیں", "🚫 تولیہ یا کپڑے شیئر نہ کریں", "🩹 زخم ڈھکے رکھیں", "🧴 ڈاکٹر کی بتائی ہوئی antibiotic مرہم لگائیں"],
    },
  },

  "Jaundice": {
    symptoms: ["Itching", "Vomiting", "Fatigue", "Weight Loss", "High Fever", "Yellowish Skin", "Dark Urine", "Abdominal Pain"],
    recommendations: {
      english: ["💧 Drink plenty of water and sugarcane juice", "🍽️ Eat light — boiled rice, dal, fruits", "🚫 Avoid oily, spicy, and fried foods", "🚫 No alcohol"],
      roman: ["💧 Zyada paani aur ganne ka ras piyein", "🍽️ Halka khaana khaein — ubla chawal, daal, phal", "🚫 Charbi wala, teekha aur tala khaana avoid karein", "🚫 Sharaab bilkul nahi"],
      urdu: ["💧 زیادہ پانی اور گنے کا رس پئیں", "🍽️ ہلکا کھانا کھائیں — ابلا چاول، دال، پھل", "🚫 چکنا، تیکھا اور تلا کھانا avoid کریں", "🚫 شراب بالکل نہیں"],
    },
  },

  "Malaria": {
    symptoms: ["Chills", "Vomiting", "High Fever", "Sweating", "Headache", "Nausea", "Diarrhoea", "Muscle Pain"],
    recommendations: {
      english: ["🛏️ Complete bed rest", "💧 Stay hydrated — drink ORS or fluids frequently", "🦟 Use mosquito net and repellent", "🌡️ Monitor fever every 4 hours"],
      roman: ["🛏️ Mukammal aaraam karein", "💧 ORS ya pani baar baar piyein", "🦟 Machhar dani aur repellent istemal karein", "🌡️ Har 4 ghante mein bukhar check karein"],
      urdu: ["🛏️ مکمل آرام کریں", "💧 ORS یا پانی بار بار پئیں", "🦟 مچھردانی اور repellent استعمال کریں", "🌡️ ہر 4 گھنٹے میں بخار چیک کریں"],
    },
  },

  "Migraine": {
    symptoms: ["Acidity", "Indigestion", "Headache", "Blurred And Distorted Vision", "Excessive Hunger", "Stiff Neck", "Depression", "Irritability", "Visual Disturbances"],
    recommendations: {
      english: ["🌑 Rest in a dark, quiet room immediately", "💊 Take pain relief medication at first sign", "💧 Stay hydrated", "❄️ Apply cold compress on forehead", "📝 Track migraine triggers (food, stress, sleep)"],
      roman: ["🌑 Foran andheri aur khamosh kamre mein aaraam karein", "💊 Pehli nishani par dard ki dawa lein", "💧 Paani zyada piyein", "❄️ Maathe par thandak lagayein", "📝 Migraine triggers track karein (khaana, stress, neend)"],
      urdu: ["🌑 فوراً اندھیری اور خاموش کمرے میں آرام کریں", "💊 پہلی نشانی پر درد کی دوا لیں", "💧 پانی زیادہ پئیں", "❄️ ماتھے پر ٹھنڈک لگائیں", "📝 Migraine کے محرکات ٹریک کریں (کھانا، stress، نیند)"],
    },
  },

  "Pneumonia": {
    symptoms: ["Chills", "Fatigue", "Cough", "High Fever", "Breathlessness", "Sweating", "Malaise", "Phlegm", "Chest Pain", "Fast Heart Rate", "Rusty Sputum"],
    recommendations: {
      english: ["💊 Complete the full antibiotic course prescribed", "💧 Drink warm fluids frequently", "🛏️ Rest in a propped-up position (not flat)", "🌡️ Monitor body temperature every 4 hours"],
      roman: ["💊 Doctor ka bataya hua antibiotic course mukammal karein", "💧 Baar baar garam pani ya supp piyein", "🛏️ Seedha lete ki jagah thoda utha ke letein", "🌡️ Har 4 ghante mein body temperature check karein"],
      urdu: ["💊 ڈاکٹر کا بتایا ہوا antibiotic کورس مکمل کریں", "💧 بار بار گرم پانی یا سوپ پئیں", "🛏️ سیدھا لیٹنے کی بجاے تھوڑا اٹھ کر لیٹیں", "🌡️ ہر 4 گھنٹے میں جسمانی درجہ حرارت چیک کریں"],
    },
  },

  "Psoriasis": {
    symptoms: ["Skin Rash", "Joint Pain", "Skin Peeling", "Silver Like Dusting", "Small Dents In Nails", "Inflammatory Nails"],
    recommendations: {
      english: ["🧴 Moisturize skin daily", "🔍 Identify and avoid triggers", "☀️ Get moderate sun exposure", "🚫 Avoid skin injuries and stress"],
      roman: ["🧴 Roz jild ko moisturize karein", "🔍 Triggers pehchanen aur bachein", "☀️ Moderate dhoop lein", "🚫 Jild ki takleef aur tension se bachein"],
      urdu: ["🧴 روزانہ جلد کو moisturize کریں", "🔍 محرکات پہچانیں اور بچیں", "☀️ اعتدال میں دھوپ لیں", "🚫 جلد کی تکلیف اور ذہنی تناؤ سے بچیں"],
    },
  },

  "Typhoid": {
    symptoms: ["Chills", "Vomiting", "Fatigue", "High Fever", "Headache", "Nausea", "Constipation", "Abdominal Pain", "Diarrhoea", "Toxic Look (Typhos)", "Belly Pain"],
    recommendations: {
      english: ["💧 Drink only boiled or bottled water", "🥣 Eat soft, easily digestible food (khichri, dal)", "🛏️ Complete rest for at least 2 weeks", "🧼 Wash hands before every meal"],
      roman: ["💧 Sirf ubla ya bottled paani piyein", "🥣 Naram aur asani se hazam hone wala khaana khaein (khichdi, daal)", "🛏️ Kam az kam 2 hafte mukammal aaraam karein", "🧼 Har khaane se pehle haath dhoyein"],
      urdu: ["💧 صرف ابلا یا بوتل کا پانی پئیں", "🥣 نرم اور آسانی سے ہضم ہونے والا کھانا کھائیں (کھچڑی، دال)", "🛏️ کم از کم 2 ہفتے مکمل آرام کریں", "🧼 ہر کھانے سے پہلے ہاتھ دھوئیں"],
    },
  },

  "Urinary Tract Infection": {
    symptoms: ["Burning Micturition", "Bladder Discomfort", "Foul Smell Of Urine", "Continuous Feel Of Urine"],
    recommendations: {
      english: ["💧 Drink 8–10 glasses of water daily", "💊 Complete the full antibiotic course", "🚫 Avoid holding urine for long periods", "🧼 Maintain personal hygiene"],
      roman: ["💧 Roz 8–10 gilas paani piyein", "💊 Antibiotic course mukammal karein", "🚫 Peshab zyada der tak mat rokein", "🧼 Zaati safai ka khayal rakhein"],
      urdu: ["💧 روزانہ 8–10 گلاس پانی پئیں", "💊 Antibiotic کورس مکمل کریں", "🚫 پیشاب زیادہ دیر تک نہ روکیں", "🧼 ذاتی صفائی کا خیال رکھیں"],
    },
  },

  "Varicose Veins": {
    symptoms: ["Fatigue", "Cramps", "Bruising", "Obesity", "Swollen Legs", "Swollen Blood Vessels", "Prominent Veins On Calf"],
    recommendations: {
      english: ["🦵 Elevate your legs when sitting", "🧦 Wear compression stockings", "🚶 Exercise regularly", "🚫 Avoid standing for long periods"],
      roman: ["🦵 Baithte waqt tangein utha kar rakhein", "🧦 Compression stockings pahnen", "🚶 Regular exercise karein", "🚫 Lambe waqt tak khari na rahein"],
      urdu: ["🦵 بیٹھتے وقت ٹانگیں اٹھا کر رکھیں", "🧦 Compression stockings پہنیں", "🚶 باقاعدہ ورزش کریں", "🚫 لمبے وقت تک کھڑی نہ رہیں"],
    },
  },
};

// ─── Icons per disease ─────────────────────────────────────────────────────────────
const DISEASE_ICONS: Record<string, string> = {
  "Acne": "🧴",
  "Allergy": "🤧",
  "Arthritis": "🦴",
  "Bronchial Asthma": "🌬️",
  "Cervical Spondylosis": "🦴",
  "Chicken Pox": "💊",
  "Common Cold": "🤒",
  "Dengue": "🦟",
  "Diabetes": "📊",
  "Drug Reaction": "⚠️",
  "Fungal Infection": "🍄",
  "Hypertension": "❤️",
  "Impetigo": "🩹",
  "Jaundice": "🟡",
  "Malaria": "🦟",
  "Migraine": "🧠",
  "Pneumonia": "🫁",
  "Psoriasis": "🔴",
  "Typhoid": "🌡️",
  "Urinary Tract Infection": "💧",
  "Varicose Veins": "🦵",
};

interface DiseasesPageProps {
  theme: 'dark' | 'light';
  onBack: () => void;
}

export default function DiseasesPage({ theme, onBack }: DiseasesPageProps) {
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const isDark = theme === 'dark';
  const diseaseList = Object.keys(SUPPORTED_DISEASES);

  // ── Read language from localStorage (synced with ChatInterface) ──────────────────────
  const [uiLang, setUiLang] = useState<UILang>(() => {
    const saved = localStorage.getItem('sehat_ui_language');
    return (saved as UILang) || 'roman';
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem('sehat_ui_language');
      if (saved) setUiLang(saved as UILang);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const t = PAGE_TEXT[uiLang];
  const isUrdu = uiLang === 'urdu';

  const switchLang = (lang: UILang) => {
    setUiLang(lang);
    localStorage.setItem('sehat_ui_language', lang);
  };

  const langOptions: { key: UILang; label: string }[] = [
    { key: 'english', label: 'English' },
    { key: 'roman',   label: 'Roman Urdu' },
    { key: 'urdu',    label: 'اردو' },
  ];

  return (
    <section
      id="diseases"
      className={`min-h-screen py-24 px-4 transition-colors duration-300 ${
        isDark ? 'bg-[#0a140f]' : 'bg-[#f0fdf9]'
      }`}
    >
      <div className="max-w-5xl mx-auto">

        {/* ── Top bar: Back Button + Language Switcher ── */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <button
            onClick={onBack}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-all duration-200 group ${
              isDark
                ? 'text-[#74c69d]/70 hover:text-[#74c69d] hover:bg-[#74c69d]/10'
                : 'text-[#10a37f]/70 hover:text-[#10a37f] hover:bg-[#10a37f]/10'
            }`}
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            {t.backToChat}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-2">
            <Languages className={`w-4 h-4 ${isDark ? 'text-[#74c69d]/60' : 'text-[#10a37f]/60'}`} />
            <div className="flex gap-1.5">
              {langOptions.map(opt => (
                <button
                  key={opt.key}
                  onClick={() => switchLang(opt.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 min-h-[32px] ${
                    uiLang === opt.key
                      ? isDark
                        ? 'bg-[#74c69d] text-[#0a140f] shadow-md'
                        : 'bg-[#10a37f] text-white shadow-md'
                      : isDark
                        ? 'bg-[#74c69d]/10 text-[#74c69d]/70 hover:bg-[#74c69d]/20 hover:text-[#74c69d]'
                        : 'bg-[#10a37f]/10 text-[#10a37f]/70 hover:bg-[#10a37f]/20 hover:text-[#10a37f]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Page Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-2.5 rounded-xl ${
              isDark
                ? 'bg-[#74c69d]/15 border border-[#74c69d]/20'
                : 'bg-[#10a37f]/10 border border-[#10a37f]/20'
            }`}>
              <Activity className={`w-6 h-6 ${isDark ? 'text-[#74c69d]' : 'text-[#10a37f]'}`} />
            </div>
            <div>
              <p className={`text-xs font-semibold uppercase tracking-widest ${
                isDark ? 'text-[#74c69d]' : 'text-[#10a37f]'
              }`}>
                {t.modelVerification}
              </p>
              <h1 className={`text-3xl md:text-4xl font-heading font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              } ${isUrdu ? 'font-urdu' : ''}`}>
                {t.supportedDiseases}
              </h1>
            </div>
          </div>

          <p className={`text-sm md:text-base leading-relaxed max-w-2xl mt-3 ${
            isDark ? 'text-[#74c69d]/60' : 'text-[#10a37f]/70'
          } ${isUrdu ? 'font-urdu rtl-layout' : ''}`}>
            {t.descriptionPre}{' '}
            <span className={`font-bold ${isDark ? 'text-[#74c69d]' : 'text-[#10a37f]'}`}>
              {diseaseList.length} {t.descriptionMid}
            </span>{' '}
            {t.descriptionPost}
          </p>

          {/* Model badges */}
          <div className="flex flex-wrap gap-2 mt-4">
            {['🌲 Random Forest', '⚡ XGBoost', '🤖 DistilBERT'].map(m => (
              <span
                key={m}
                className={`text-xs px-3 py-1 rounded-full font-medium border ${
                  isDark
                    ? 'bg-[#74c69d]/10 border-[#74c69d]/25 text-[#74c69d]'
                    : 'bg-[#10a37f]/08 border-[#10a37f]/25 text-[#10a37f]'
                }`}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* ── Disease Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {diseaseList.map((disease, idx) => (
            <button
              key={disease}
              onClick={() => setSelectedDisease(disease)}
              style={{ animationDelay: `${idx * 30}ms` }}
              className={`group relative text-left rounded-2xl p-4 border transition-all duration-200
                hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]
                ${isDark
                  ? 'bg-[#0d1f17] border-[#74c69d]/12 hover:border-[#74c69d]/40 hover:bg-[#1a3a2e]/60'
                  : 'bg-white border-[#10a37f]/12 hover:border-[#10a37f]/40 hover:bg-[#f0fdf9] shadow-sm'
                }`}
            >
              {/* Icon */}
              <div className="text-2xl mb-2.5 leading-none">
                {DISEASE_ICONS[disease] || '🏥'}
              </div>

              {/* Disease Name */}
              <p className={`font-heading font-semibold text-sm leading-tight mb-1 transition-colors ${
                isDark
                  ? 'text-white group-hover:text-[#74c69d]'
                  : 'text-gray-800 group-hover:text-[#10a37f]'
              }`}>
                {disease}
              </p>

              {/* Symptom count */}
              <p className={`text-xs ${isDark ? 'text-[#74c69d]/40' : 'text-[#10a37f]/50'}`}>
                {t.symptomsCount(SUPPORTED_DISEASES[disease].symptoms.length)}
              </p>

              {/* Hover arrow */}
              <div className={`absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-200
                -translate-x-1 group-hover:translate-x-0
                ${isDark ? 'text-[#74c69d]' : 'text-[#10a37f]'}`}
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* ── Footer note ── */}
        <div className={`mt-10 text-center text-xs ${isDark ? 'text-[#74c69d]/25' : 'text-[#10a37f]/35'}`}>
          {t.footerNote}
        </div>
      </div>

      {/* ======================================================================
          Disease Detail Modal — blur backdrop
      ====================================================================== */}
      {selectedDisease && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: 'blur(12px)', backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={() => setSelectedDisease(null)}
        >
          <div
            className={`relative w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-3xl border shadow-2xl
              ${isDark
                ? 'bg-[#0d1f17] border-[#74c69d]/20 shadow-[#74c69d]/08'
                : 'bg-white border-[#10a37f]/20 shadow-[#10a37f]/08'
              }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Top glow line */}
            <div className={`absolute top-0 left-0 right-0 h-px rounded-t-3xl ${
              isDark
                ? 'bg-gradient-to-r from-transparent via-[#74c69d]/50 to-transparent'
                : 'bg-gradient-to-r from-transparent via-[#10a37f]/40 to-transparent'
            }`} />

            <div className="p-6">

              {/* ── Modal Header ── */}
              <div
                className="flex items-start justify-between mb-5 pb-4 border-b"
                style={{ borderColor: isDark ? 'rgba(116,198,157,0.12)' : 'rgba(16,163,127,0.12)' }}
              >
                <div className="flex-1 pr-4">
                  {/* Verified badge */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? 'text-[#74c69d]' : 'text-[#10a37f]'}`} />
                    <span className={`text-xs font-semibold uppercase tracking-wider ${
                      isDark ? 'text-[#74c69d]' : 'text-[#10a37f]'
                    }`}>
                      {t.verifiedBadge}
                    </span>
                  </div>
                  {/* Disease name */}
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{DISEASE_ICONS[selectedDisease] || '🏥'}</span>
                    <h2 className={`text-xl font-heading font-bold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {selectedDisease}
                    </h2>
                  </div>
                </div>

                {/* Close X */}
                <button
                  onClick={() => setSelectedDisease(null)}
                  className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 ${
                    isDark
                      ? 'text-[#74c69d]/60 hover:text-[#74c69d] hover:bg-[#74c69d]/15'
                      : 'text-[#10a37f]/60 hover:text-[#10a37f] hover:bg-[#10a37f]/10'
                  }`}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* ── Symptoms ── */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Stethoscope className={`w-4 h-4 ${isDark ? 'text-[#74c69d]' : 'text-[#10a37f]'}`} />
                  <h3 className={`text-sm font-semibold uppercase tracking-wider ${
                    isDark ? 'text-[#74c69d]/80' : 'text-[#10a37f]/80'
                  }`}>
                    {t.datasetSymptoms}
                  </h3>
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                    isDark ? 'bg-[#74c69d]/15 text-[#74c69d]/70' : 'bg-[#10a37f]/10 text-[#10a37f]/60'
                  }`}>
                    {SUPPORTED_DISEASES[selectedDisease].symptoms.length} {t.total}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {SUPPORTED_DISEASES[selectedDisease].symptoms.map((symptom, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 text-sm px-3 py-1.5 rounded-full border ${
                        isDark
                          ? 'bg-[#74c69d]/10 border-[#74c69d]/25 text-[#74c69d]'
                          : 'bg-[#10a37f]/08 border-[#10a37f]/25 text-[#059669]'
                      }`}
                    >
                      <span className="text-[10px] opacity-70">✓</span>
                      {symptom}
                    </span>
                  ))}
                </div>
              </div>

              {/* ── Recommendations ── */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-[#74c69d]' : 'text-[#10a37f]'}`} />
                  <h3 className={`text-sm font-semibold uppercase tracking-wider ${
                    isDark ? 'text-[#74c69d]/80' : 'text-[#10a37f]/80'
                  }`}>
                    {t.precautionary}
                  </h3>
                </div>

                <ul className="space-y-2.5">
                  {/* ── FIRST: Doctor Consultation ── */}
                  <li className={`flex items-start gap-2.5 text-sm leading-relaxed font-semibold ${
                    isDark ? 'text-[#74c69d]' : 'text-[#10a37f]'
                  }`}>
                    <span className={`mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center
                      rounded-full text-[10px] font-bold ${
                      isDark
                        ? 'bg-[#74c69d]/25 text-[#74c69d]'
                        : 'bg-[#10a37f]/15 text-[#10a37f]'
                    }`}>
                      1
                    </span>
                    <span className={isUrdu ? 'font-urdu' : ''}>{t.doctorFirst}</span>
                  </li>

                  {/* ── Rest of recommendations in selected language ── */}
                  {SUPPORTED_DISEASES[selectedDisease].recommendations[uiLang].map((rec, i) => (
                    <li
                      key={i}
                      className={`flex items-start gap-2.5 text-sm leading-relaxed ${
                        isDark ? 'text-white/75' : 'text-gray-700'
                      } ${isUrdu ? 'font-urdu rtl-layout' : ''}`}
                    >
                      <span className={`mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center
                        rounded-full text-[10px] font-bold ${
                        isDark
                          ? 'bg-[#74c69d]/15 text-[#74c69d]'
                          : 'bg-[#10a37f]/10 text-[#10a37f]'
                      }`}>
                        {i + 2}
                      </span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ── Close Button ── */}
              <div
                className="pt-4 border-t"
                style={{ borderColor: isDark ? 'rgba(116,198,157,0.12)' : 'rgba(16,163,127,0.12)' }}
              >
                <button
                  onClick={() => setSelectedDisease(null)}
                  className={`w-full py-3 rounded-xl font-heading font-semibold text-sm transition-all duration-200
                    hover:scale-[1.01] active:scale-[0.99] ${
                    isDark
                      ? 'bg-[#74c69d] text-[#0a140f] hover:bg-[#a7e3bf] shadow-[0_4px_14px_rgba(116,198,157,0.25)]'
                      : 'bg-[#10a37f] text-white hover:bg-[#059669] shadow-[0_4px_14px_rgba(16,163,127,0.25)]'
                  }`}
                >
                  {t.close}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </section>
  );
}

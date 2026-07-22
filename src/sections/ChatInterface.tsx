import { useState, useRef, useEffect, useCallback } from 'react';
import VoiceRecorder from '@/components/VoiceRecorder';
import { API_BASE } from '@/hooks/useApi';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSession } from '@/hooks/useSession';
import { useApi } from '@/hooks/useApi';
import type { PredictResponse, HistoryItem, FollowupOption } from '@/types/api';
import {
  Send, User, Bot, Activity, Pill, AlertTriangle,
  ThumbsUp, Star, Loader2, Sparkles, Heart, Droplets,
  Phone, Languages,
  Stethoscope, Brain,
  ClipboardList, Lightbulb, FlaskConical
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface ChatInterfaceProps {
  historyItems: HistoryItem[];
  onHistoryUpdate: () => void;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  prediction?: PredictResponse;
  timestamp: Date;
  isFollowup?: boolean;
}

// ─── Bilingual initial symptom buttons ───────────────────────────
const INITIAL_SYMPTOMS = [
  { emoji: '🌡️', labelEn: 'Fever',        labelUr: 'بخار',          labelRoman: 'Bukhar',     input: 'bukhar hai' },
  { emoji: '🤕', labelEn: 'Headache',      labelUr: 'سر درد',        labelRoman: 'Sar Dard',   input: 'sar dard hai' },
  { emoji: '😴', labelEn: 'Fatigue',       labelUr: 'تھکاوٹ',        labelRoman: 'Thakan',     input: 'thakan hai' },
  { emoji: '🤢', labelEn: 'Nausea',        labelUr: 'متلی',          labelRoman: 'Matli',      input: 'matli ho rahi hai' },
  { emoji: '😮‍💨', labelEn: 'Cough',         labelUr: 'کھانسی',        labelRoman: 'Khansi',     input: 'khansi hai' },
  { emoji: '🤧', labelEn: 'Stomach Pain',  labelUr: 'پیٹ درد',       labelRoman: 'Pait Dard',  input: 'pait mein dard hai' },
  { emoji: '😖', labelEn: 'Itching',       labelUr: 'خارش',          labelRoman: 'Khujli',     input: 'khujli ho rahi hai' },
  { emoji: '💫', labelEn: 'Dizziness',     labelUr: 'چکر',           labelRoman: 'Chakkar',    input: 'chakkar aa rahe hain' },
  { emoji: '🦴', labelEn: 'Joint Pain',    labelUr: 'جوڑوں کا درد',  labelRoman: 'Joron Dard', input: 'joron mein dard hai' },
];

const DISEASE_SYMPTOMS: Record<string, string[]> = {
  "Fungal infection": ["Itching", "Skin Rash", "Nodal Skin Eruptions", "Dischromic Patches"],
  "Allergy": ["Continuous Sneezing", "Shivering", "Chills", "Watering From Eyes"],
  "GERD": ["Stomach Pain", "Acidity", "Ulcers On Tongue", "Vomiting", "Cough", "Chest Pain"],
  "Chronic cholestasis": ["Itching", "Vomiting", "Yellowish Skin", "Nausea", "Loss Of Appetite", "Abdominal Pain", "Yellowing Of Eyes"],
  "Drug Reaction": ["Itching", "Skin Rash", "Stomach Pain", "Burning Micturition", "Spotting Urination"],
  "Peptic ulcer disease": ["Vomiting", "Indigestion", "Loss Of Appetite", "Abdominal Pain", "Passage Of Gases", "Internal Itching"],
  "AIDS": ["Muscle Wasting", "Patches In Throat", "High Fever", "Extra Marital Contacts"],
  "Diabetes": ["Fatigue", "Weight Loss", "Restlessness", "Lethargy", "Irregular Sugar Level", "Blurred And Distorted Vision", "Obesity", "Excessive Hunger", "Increased Appetite", "Polyuria"],
  "Gastroenteritis": ["Vomiting", "Sunken Eyes", "Dehydration", "Diarrhoea"],
  "Bronchial Asthma": ["Fatigue", "Cough", "High Fever", "Breathlessness", "Family History", "Mucoid Sputum"],
  "Hypertension": ["Headache", "Chest Pain", "Dizziness", "Loss Of Balance", "Lack Of Concentration"],
  "Migraine": ["Acidity", "Indigestion", "Headache", "Blurred And Distorted Vision", "Excessive Hunger", "Stiff Neck", "Depression", "Irritability", "Visual Disturbances"],
  "Cervical spondylosis": ["Back Pain", "Weakness In Limbs", "Neck Pain", "Dizziness", "Loss Of Balance"],
  "Paralysis (brain hemorrhage)": ["Vomiting", "Headache", "Weakness Of One Body Side", "Altered Sensorium"],
  "Jaundice": ["Itching", "Vomiting", "Fatigue", "Weight Loss", "High Fever", "Yellowish Skin", "Dark Urine", "Abdominal Pain"],
  "Malaria": ["Chills", "Vomiting", "High Fever", "Sweating", "Headache", "Nausea", "Diarrhoea", "Muscle Pain"],
  "Chicken pox": ["Itching", "Skin Rash", "Fatigue", "Lethargy", "High Fever", "Headache", "Loss Of Appetite", "Mild Fever", "Swelled Lymph Nodes", "Malaise", "Red Spots Over Body"],
  "Dengue": ["Skin Rash", "Chills", "Joint Pain", "Vomiting", "Fatigue", "High Fever", "Headache", "Nausea", "Loss Of Appetite", "Pain Behind The Eyes", "Back Pain", "Malaise", "Muscle Pain", "Red Spots Over Body"],
  "Typhoid": ["Chills", "Vomiting", "Fatigue", "High Fever", "Headache", "Nausea", "Constipation", "Abdominal Pain", "Diarrhoea", "Toxic Look Typhos", "Belly Pain"],
  "hepatitis A": ["Joint Pain", "Vomiting", "Yellowish Skin", "Dark Urine", "Nausea", "Loss Of Appetite", "Abdominal Pain", "Diarrhoea", "Mild Fever", "Yellowing Of Eyes", "Muscle Pain"],
  "Hepatitis B": ["Itching", "Fatigue", "Lethargy", "Yellowish Skin", "Dark Urine", "Loss Of Appetite", "Abdominal Pain", "Yellow Urine", "Yellowing Of Eyes", "Malaise", "Receiving Blood Transfusion", "Receiving Unsterile Injections"],
  "Hepatitis C": ["Fatigue", "Yellowish Skin", "Nausea", "Loss Of Appetite", "Yellowing Of Eyes", "Family History"],
  "Hepatitis D": ["Joint Pain", "Vomiting", "Fatigue", "Yellowish Skin", "Dark Urine", "Nausea", "Loss Of Appetite", "Abdominal Pain", "Yellowing Of Eyes"],
  "Hepatitis E": ["Joint Pain", "Vomiting", "Fatigue", "High Fever", "Yellowish Skin", "Dark Urine", "Nausea", "Loss Of Appetite", "Abdominal Pain", "Yellowing Of Eyes", "Acute Liver Failure", "Coma", "Stomach Bleeding"],
  "Alcoholic hepatitis": ["Vomiting", "Yellowish Skin", "Abdominal Pain", "Swelling Of Stomach", "Distention Of Abdomen", "History Of Alcohol Consumption", "Fluid Overload"],
  "Tuberculosis": ["Chills", "Vomiting", "Fatigue", "Weight Loss", "Cough", "High Fever", "Breathlessness", "Sweating", "Loss Of Appetite", "Mild Fever", "Yellowing Of Eyes", "Swelled Lymph Nodes", "Malaise", "Phlegm", "Chest Pain", "Blood In Sputum"],
  "Common Cold": ["Continuous Sneezing", "Chills", "Fatigue", "Cough", "High Fever", "Headache", "Swelled Lymph Nodes", "Malaise", "Phlegm", "Throat Irritation", "Redness Of Eyes", "Sinus Pressure", "Runny Nose", "Congestion", "Chest Pain", "Loss Of Smell", "Muscle Pain"],
  "Pneumonia": ["Chills", "Fatigue", "Cough", "High Fever", "Breathlessness", "Sweating", "Malaise", "Phlegm", "Chest Pain", "Fast Heart Rate", "Rusty Sputum"],
  "Dimorphic hemmorhoids(piles)": ["Constipation", "Pain During Bowel Movements", "Pain In Anal Region", "Bloody Stool", "Irritation In Anus"],
  "Heart attack": ["Vomiting", "Breathlessness", "Sweating", "Chest Pain"],
  "Varicose veins": ["Fatigue", "Cramps", "Bruising", "Obesity", "Swollen Legs", "Swollen Blood Vessels", "Prominent Veins On Calf"],
  "Hypothyroidism": ["Fatigue", "Weight Gain", "Cold Hands And Feets", "Mood Swings", "Lethargy", "Dizziness", "Puffy Face And Eyes", "Enlarged Thyroid", "Brittle Nails", "Swollen Extremeties", "Depression", "Irritability", "Abnormal Menstruation"],
  "Hyperthyroidism": ["Fatigue", "Mood Swings", "Weight Loss", "Restlessness", "Sweating", "Diarrhoea", "Fast Heart Rate", "Excessive Hunger", "Muscle Weakness", "Irritability", "Abnormal Menstruation"],
  "Hypoglycemia": ["Vomiting", "Fatigue", "Anxiety", "Sweating", "Headache", "Nausea", "Blurred And Distorted Vision", "Excessive Hunger", "Drying And Tingling Lips", "Slurred Speech", "Irritability", "Palpitations"],
  "Osteoarthristis": ["Joint Pain", "Neck Pain", "Knee Pain", "Hip Joint Pain", "Swelling Joints", "Painful Walking"],
  "Arthritis": ["Muscle Weakness", "Stiff Neck", "Swelling Joints", "Movement Stiffness", "Painful Walking"],
  "(vertigo) Paroymsal  Positional Vertigo": ["Vomiting", "Headache", "Nausea", "Spinning Movements", "Loss Of Balance", "Unsteadiness"],
  "Acne": ["Skin Rash", "Pus Filled Pimples", "Blackheads", "Scurring"],
  "Urinary tract infection": ["Burning Micturition", "Bladder Discomfort", "Foul Smell Of Urine", "Continuous Feel Of Urine"],
  "Psoriasis": ["Skin Rash", "Joint Pain", "Skin Peeling", "Silver Like Dusting", "Small Dents In Nails", "Inflammatory Nails"],
  "Impetigo": ["Skin Rash", "High Fever", "Blister", "Red Sore Around Nose", "Yellow Crust Ooze"]
};

const DISEASE_RECOMMENDATIONS: Record<string, string[]> = {
  "Fungal infection": [
    "🧼 Keep the affected area clean and dry",
    "💊 Apply anti-fungal cream as prescribed",
    "👕 Wear loose, breathable cotton clothes",
    "❌ Avoid sharing towels or personal items",
    "🏥 Visit a skin specialist if no improvement in 5 days",
    "💧 Wash the area with clean boiled water daily"
  ],
  "Allergy": [
    "❌ Identify and avoid your allergy triggers",
    "💊 Take prescribed antihistamines",
    "🏥 Consult a doctor for allergy testing",
    "🧼 Keep your living area dust-free",
    "😷 Wear a mask outdoors during high pollen season",
    "📊 Keep a diary to track allergy episodes"
  ],
  "GERD": [
    "❌ Avoid spicy, oily, and acidic foods",
    "🍽️ Eat smaller meals more frequently",
    "🛏️ Do not lie down immediately after eating",
    "💊 Take prescribed antacids after meals",
    "🏥 Consult a gastroenterologist if symptoms persist",
    "💧 Drink warm water instead of cold beverages"
  ],
  "Chronic cholestasis": [
    "🍽️ Eat a low-fat, high-fiber diet",
    "❌ Avoid alcohol completely",
    "💊 Take prescribed vitamin supplements (A, D, E, K)",
    "🏥 Consult a hepatologist regularly",
    "📊 Get regular liver function tests done",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Drug Reaction": [
    "❌ Stop taking the suspected medication immediately",
    "🏥 Consult your doctor or go to nearest clinic",
    "💧 Drink plenty of boiled or filtered water",
    "📊 Keep a written record of the reaction and medicine name",
    "💊 Do not take any new medicine without doctor advice",
    "🚨 If breathing difficulty or swelling — go to emergency immediately"
  ],
  "Peptic ulcer disease": [
    "❌ Avoid spicy foods, alcohol, and smoking",
    "🍽️ Eat smaller, more frequent meals",
    "💊 Take prescribed antacids or PPIs on time",
    "🛏️ Manage stress with rest and light activity",
    "🏥 Consult a gastroenterologist for proper treatment",
    "💧 Drink warm water and avoid carbonated drinks"
  ],
  "AIDS": [
    "💊 Follow antiretroviral therapy (ART) strictly — never skip doses",
    "🍽️ Maintain a balanced, nutritious diet",
    "🏥 Get regular CD4 count and viral load tests",
    "🧼 Practice strict hygiene to avoid infections",
    "👪 Inform close family and seek emotional support",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Diabetes": [
    "📊 Monitor blood sugar levels regularly",
    "🍽️ Follow a low-sugar, low-carb balanced diet",
    "🚶 Exercise for at least 30 minutes daily",
    "💊 Take prescribed insulin or medications on time",
    "🏥 Get HbA1c test every 3 months",
    "👁️ Get regular eye and foot checkups"
  ],
  "Gastroenteritis": [
    "💧 Take ORS (oral rehydration salts) frequently to prevent dehydration",
    "🛌 Rest your stomach and avoid heavy food",
    "🍽️ Eat bland foods like khichri, plain rice, and bananas",
    "❌ Avoid dairy, oily food, and caffeine",
    "🏥 See a doctor if vomiting or diarrhea lasts more than 2 days",
    "🧼 Wash hands thoroughly before eating"
  ],
  "Bronchial Asthma": [
    "💊 Always carry your prescribed inhaler",
    "😷 Avoid smoke, dust, and strong smells",
    "🏥 Visit your doctor for regular checkups",
    "🧼 Keep your home clean and dust-free",
    "🛌 Practice breathing exercises daily",
    "📊 Track your peak flow readings regularly"
  ],
  "Hypertension": [
    "🍽️ Reduce salt intake significantly",
    "🚶 Exercise regularly — brisk walk for 30 minutes daily",
    "🛌 Manage stress with relaxation techniques",
    "📊 Monitor blood pressure at home daily",
    "💊 Take prescribed blood pressure medications regularly",
    "❌ Avoid smoking and alcohol completely"
  ],
  "Migraine": [
    "🛌 Rest in a dark, quiet room during an attack",
    "❌ Identify and avoid personal triggers (food, stress, screen time)",
    "💧 Stay well-hydrated throughout the day",
    "💊 Take prescribed migraine medication at onset",
    "📊 Keep a migraine diary to find patterns",
    "🏥 Consult a neurologist if migraines are frequent"
  ],
  "Cervical spondylosis": [
    "🚶 Do regular neck stretching exercises",
    "🛌 Maintain good posture while sitting and sleeping",
    "💊 Apply prescribed pain relief gel or take medication",
    "🔥 Apply warm packs to the neck for relief",
    "🏥 Consult an orthopedic specialist",
    "❌ Avoid prolonged screen use without breaks"
  ],
  "Paralysis (brain hemorrhage)": [
    "🚨 Seek immediate emergency medical care — call 115",
    "🏥 Go to nearest hospital with ICU facility immediately",
    "💊 Follow physical therapy and rehabilitation plan strictly",
    "📊 Manage blood pressure regularly",
    "👪 Requires 24-hour family support and supervision",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Jaundice": [
    "💧 Drink plenty of fluids — boiled water, nimbu pani, and fresh juices",
    "🍽️ Eat a carbohydrate-rich, low-fat diet",
    "❌ Avoid alcohol and oily foods completely",
    "🛌 Rest adequately and avoid physical exertion",
    "🏥 Get liver function tests done immediately",
    "📊 Monitor eye and skin color changes daily"
  ],
  "Malaria": [
    "💊 Take full course of prescribed antimalarial drugs",
    "🛌 Rest completely — do not exert yourself",
    "💧 Drink ORS and plenty of fluids to stay hydrated",
    "🦟 Sleep under mosquito nets and use repellent",
    "📊 Monitor temperature every 4 hours",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Chicken pox": [
    "💊 Apply calamine lotion to soothe itching",
    "🧼 Trim nails short to prevent scratching and infection",
    "🛌 Rest and stay isolated to avoid spreading",
    "💧 Stay well-hydrated with fluids and ORS",
    "🍽️ Eat soft, easy-to-digest food",
    "🏥 Consult a doctor if fever goes above 103°F"
  ],
  "Dengue": [
    "💧 Drink lots of fluids — coconut water, ORS, and fresh juice",
    "🛌 Rest completely — avoid all physical activity",
    "📊 Monitor platelet count daily at a clinic",
    "💊 Take paracetamol for fever — avoid aspirin and ibuprofen",
    "🦟 Use mosquito nets and repellent to prevent spreading",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Typhoid": [
    "💊 Take the complete prescribed antibiotic course — never skip",
    "💧 Drink only boiled or filtered water",
    "🍽️ Eat bland, easily digestible food like khichri and soup",
    "🧼 Wash hands thoroughly before meals and after toilet",
    "🏥 Get Widal test confirmed by a doctor",
    "📊 Monitor body temperature every 4-6 hours"
  ],
  "hepatitis A": [
    "🛌 Rest completely during the illness",
    "🍽️ Eat small, frequent, nutritious meals",
    "❌ Avoid alcohol completely",
    "🧼 Practice strict personal hygiene — wash hands frequently",
    "💧 Drink only boiled or bottled water",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Hepatitis B": [
    "🏥 Consult a hepatologist immediately",
    "❌ Avoid alcohol completely",
    "📊 Get regular liver function tests every 3 months",
    "💊 Take prescribed antiviral medications",
    "👪 Ensure family members get vaccinated for Hepatitis B",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Hepatitis C": [
    "💊 Follow prescribed antiviral medication course strictly",
    "❌ Avoid alcohol completely",
    "🏥 Get vaccinated for Hepatitis A and B",
    "📊 Get regular liver monitoring and ultrasound",
    "🧼 Do not share razors, needles, or personal items",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Hepatitis D": [
    "🏥 Consult a liver specialist (hepatologist) immediately",
    "💊 Requires management of Hepatitis B alongside Hepatitis D",
    "❌ Avoid alcohol completely",
    "🛌 Rest adequately and avoid physical exertion",
    "📊 Get regular liver function tests done",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Hepatitis E": [
    "🛌 Rest completely during the illness",
    "💧 Drink only boiled or bottled water — avoid tap water",
    "🍽️ Eat a healthy, balanced diet",
    "❌ Avoid alcohol completely",
    "🧼 Wash hands before eating and after using toilet",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Alcoholic hepatitis": [
    "❌ Stop drinking alcohol completely and immediately",
    "🏥 Consult a hepatologist without delay",
    "🍽️ Eat a high-protein, nutrient-rich diet",
    "💊 Take prescribed medications and vitamin supplements",
    "👪 Seek support from family or an addiction counselor",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Tuberculosis": [
    "💊 Take the full TB DOTS medication course — never miss a dose",
    "😷 Cover mouth and nose when coughing or sneezing",
    "🏠 Ensure good ventilation and sunlight in your home",
    "🍽️ Eat a protein-rich diet — eggs, daal, meat",
    "🏥 Register at your nearest TB clinic for free treatment",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Common Cold": [
    "🛌 Rest and stay warm",
    "💧 Drink warm fluids like green tea, soup, and warm water",
    "🧼 Gargle with warm salt water twice daily",
    "💊 Use saline nasal drops to clear congestion",
    "😷 Wear a mask to avoid spreading to others",
    "🏥 See a doctor if cold lasts more than 7 days"
  ],
  "Pneumonia": [
    "💊 Take prescribed antibiotics — complete the full course",
    "🛌 Get complete bed rest",
    "💧 Drink warm fluids — soup, herbal tea, warm water",
    "🏥 Get a chest X-ray to confirm and monitor recovery",
    "📊 Monitor oxygen levels and breathing regularly",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Dimorphic hemmorhoids(piles)": [
    "🍽️ Eat a high-fiber diet — fruits, vegetables, daal",
    "💧 Drink at least 8 glasses of water daily",
    "❌ Do not strain during bowel movements",
    "🛁 Take warm water sitz baths twice daily for relief",
    "🚶 Walk for 20-30 minutes daily to improve digestion",
    "🏥 Consult a surgeon if pain or bleeding persists"
  ],
  "Heart attack": [
    "🚨 Call 115 (Pakistan Emergency) immediately",
    "🏥 Go to the nearest hospital emergency right away",
    "💊 Chew aspirin (325mg) if advised by emergency staff",
    "🛌 Stay calm, sit down, and loosen tight clothing",
    "👪 Inform a family member immediately",
    "⚠️ Yeh serious condition hai — doctor se foran rabta karain"
  ],
  "Varicose veins": [
    "🛌 Elevate your legs above heart level when resting",
    "🚶 Exercise regularly — walking and swimming are ideal",
    "❌ Avoid standing or sitting for long periods without movement",
    "💊 Wear prescribed medical compression bandages",
    "🍽️ Maintain a healthy weight through balanced diet",
    "🏥 Consult a vascular surgeon for assessment"
  ],
  "Hypothyroidism": [
    "💊 Take thyroid hormone replacement medication daily as prescribed",
    "🍽️ Eat a balanced diet rich in iodine (fish, iodized salt)",
    "🚶 Exercise regularly to manage weight and energy",
    "📊 Get thyroid (TSH) blood tests regularly",
    "🏥 See an endocrinologist for proper management",
    "❌ Do not skip medication — even if you feel better"
  ],
  "Hyperthyroidism": [
    "💊 Take prescribed anti-thyroid medications regularly",
    "❌ Avoid excess iodine — limit seafood and iodized salt",
    "🛌 Manage stress with rest and relaxation",
    "📊 Get regular thyroid function tests (T3, T4, TSH)",
    "🏥 Consult an endocrinologist for proper treatment",
    "❌ Avoid caffeine and stimulants which worsen symptoms"
  ],
  "Hypoglycemia": [
    "🍽️ Consume fast-acting carbs immediately — fruit juice, sugar, glucose tablet",
    "🍽️ Eat regular meals — never skip breakfast",
    "📊 Monitor blood sugar levels regularly",
    "🍬 Always carry a sugary snack like candy or biscuits",
    "🏥 Consult a doctor to adjust your diabetes medication",
    "👪 Inform family members about emergency glucose treatment"
  ],
  "Osteoarthristis": [
    "🏥 Consult an orthopedic specialist for proper treatment",
    "🚶 Do low-impact exercises like walking and swimming",
    "🔥 Apply warm packs to painful joints for relief",
    "💊 Take prescribed pain relief medication",
    "🍽️ Maintain a healthy weight to reduce joint pressure",
    "👟 Use supportive footwear and orthotics if recommended"
  ],
  "Arthritis": [
    "🚶 Stay physically active with gentle exercises",
    "🏥 Consult a rheumatologist for proper medication",
    "🔥 Apply warm or cold packs to inflamed joints",
    "💊 Follow prescribed medication plan strictly",
    "🍽️ Maintain a healthy weight with balanced diet",
    "❌ Avoid high-impact activities that stress the joints"
  ],
  "(vertigo) Paroymsal  Positional Vertigo": [
    "🏥 Consult an ENT specialist for the Epley maneuver",
    "🚶 Move slowly when standing up or turning your head",
    "🛌 Avoid sleeping on the affected side",
    "🏠 Make your home fall-proof — remove loose rugs and clutter",
    "💊 Take prescribed vestibular sedatives if needed",
    "📊 Keep a record of vertigo episodes to share with doctor"
  ],
  "Acne": [
    "🧼 Wash face twice daily with a gentle, fragrance-free cleanser",
    "❌ Do not pop or squeeze pimples",
    "💊 Use non-comedogenic, oil-free skin products",
    "🍽️ Reduce oily and sugary foods in your diet",
    "💧 Drink plenty of water daily for clear skin",
    "🏥 See a dermatologist for prescription treatment if severe"
  ],
  "Urinary tract infection": [
    "💧 Drink at least 2-3 liters of water daily",
    "💊 Take the full prescribed antibiotic course",
    "🚽 Urinate frequently — do not hold urine",
    "🧼 Maintain proper hygiene — wipe front to back",
    "❌ Avoid spicy food and carbonated drinks",
    "🏥 Get a urine culture test to confirm the infection"
  ],
  "Psoriasis": [
    "💊 Moisturize skin daily with prescribed cream",
    "❌ Identify and avoid personal triggers (stress, certain foods)",
    "☀️ Get moderate sunlight exposure daily",
    "💊 Follow prescribed topical treatments strictly",
    "🧼 Use mild, fragrance-free soaps and shampoos",
    "🏥 Consult a dermatologist for advanced treatment options"
  ],
  "Impetigo": [
    "🧼 Gently wash sores with soap and clean water twice daily",
    "💊 Apply prescribed antibiotic ointment on sores",
    "❌ Do not share towels, clothes, or bedding with others",
    "🩹 Keep sores covered with clean bandage",
    "🏥 See a doctor if sores spread or do not heal in 3 days",
    "👕 Wash clothing and bedding in hot water daily"
  ]
};

// Legacy API keys with typos/spacing — map to corrected disease names
const DISEASE_KEY_ALIASES: Record<string, string> = {
  'Peptic ulcer diseae': 'Peptic ulcer disease',
  'Diabetes ': 'Diabetes',
  'Hypertension ': 'Hypertension',
};

function lookupDiseaseData<T>(map: Record<string, T>, diseaseName: string): T | undefined {
  if (!diseaseName) return undefined;
  const normalized = diseaseName.trim().toLowerCase();
  
  // Try case-insensitive matching
  for (const key of Object.keys(map)) {
    if (key.trim().toLowerCase() === normalized) {
      return map[key];
    }
  }
  
  // Fallback to aliases
  const alias = DISEASE_KEY_ALIASES[diseaseName] ?? DISEASE_KEY_ALIASES[diseaseName.trim()];
  if (alias) {
    const aliasNormalized = alias.trim().toLowerCase();
    for (const key of Object.keys(map)) {
      if (key.trim().toLowerCase() === aliasNormalized) {
        return map[key];
      }
    }
  }
  return undefined;
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Multilingual UI strings ─────────────────────────────────────────────────
const UI_TEXT = {
  english: {
    sectionBadge: 'AI Health Consultation',
    heading1: 'Start Your',
    heading2: 'Health Check',
    subheading: 'Describe your symptoms in any language. Our AI will analyze and provide guidance.',
    disclaimer: '⚠️ This tool is limited to specific diseases and cannot replace professional medical diagnosis. Always consult a qualified doctor for proper treatment.',
    emptyTitle: 'How can I help you today?',
    emptySubtitle: 'Describe your symptoms and I\'ll analyze them using our AI models to provide guidance.',
    symptomsBadge: '🗣️ Urdu / Roman Urdu / English Supported',
    listeningText: 'Listening... (Speak in Urdu or English)',
    analyzingText: 'Analyzing your symptoms...',
    followupText: 'Gathering more details...',
    collectedLabel: 'Collected:',
    placeholder: 'Describe your symptoms in Urdu, Roman Urdu, or English...',
    placeholderFollowup: 'Type more symptoms — e.g., nausea, dark urine...',
    micLang: 'Mic Lang:',
    micLangUrdu: 'Urdu',
    micLangEn: 'EN',
    online: 'System Online',
    offline: 'System Offline',
    noAnalysis: 'No Analysis Yet',
    noAnalysisHint: 'Select a symptom button or type below to begin.',
    speakingLabel: 'Speaking... (click to stop)',
    skipFollowup: '→ No more symptoms, run analysis',
    detectedSoFar: 'Detected so far:',
    followupPrompt: 'Do you also have? (select):',
    moreSymptoms: 'Tell Us More',
    symptomsWording: 'Detected so far:',
    suggestions: 'Also experiencing?',
    symptomsUnclear: 'Symptoms Not Clear',
    closeReport: 'Close Report',
    feedbackPrompt: 'Was this helpful?',
    submitFeedback: 'Submit Feedback',
    submitting: 'Submitting...',
    thankYou: 'Thank you for your feedback!',
  },
  roman: {
    sectionBadge: 'AI Sehat Mashwara',
    heading1: 'Shuru Karein Apna',
    heading2: 'Sehat Check',
    subheading: 'Apne symptoms kisi bhi zaban mein batain. Hamara AI analyze karke rahnumai karega.',
    disclaimer: '⚠️ Yeh tool sirf محدود بیماریوں کے لیے ہے aur kisi bhi professional medical diagnosis ki jagah nahi le sakta. Sahi ilaj ke liye qualified doctor se zaroor milein.',
    emptyTitle: 'Aaj main aapki kya madad kar sakta hoon?',
    emptySubtitle: 'Apne symptoms batain aur main AI models se analysis karke rahnumai karoonga.',
    symptomsBadge: '🗣️ Urdu / Roman Urdu / English Supported',
    listeningText: 'Sun raha hun... (Urdu ya English mein bolain)',
    analyzingText: 'Aapke symptoms analyze ho rahe hain...',
    followupText: 'Symptoms analyze ho rahe hain...',
    collectedLabel: 'Collected:',
    placeholder: 'Symptoms batain — Urdu, Roman Urdu, ya English mein...',
    placeholderFollowup: 'Ya type karein — maslan: nausea, dark urine...',
    micLang: 'Mic Lang:',
    micLangUrdu: 'Urdu',
    micLangEn: 'EN',
    online: 'System Online',
    offline: 'System Offline',
    noAnalysis: 'Abhi Koi Analysis Nahi',
    noAnalysisHint: 'Symptom button dabayain ya neeche type karein shuru karne ke liye.',
    speakingLabel: 'Bol raha hun... (click to stop)',
    skipFollowup: '→ Baaki symptoms nahi hain, analysis karein',
    detectedSoFar: 'Abhi tak detect hua:',
    followupPrompt: 'Kya yeh bhi hai? (select karein):',
    moreSymptoms: 'Aur Symptoms Batain',
    symptomsWording: 'Abhi tak detect hua:',
    suggestions: 'Kya yeh bhi hai?',
    symptomsUnclear: 'Symptoms Wazeh Nahi Hue',
    closeReport: 'Band Karein',
    feedbackPrompt: 'Kya yeh madadgar tha?',
    submitFeedback: 'Feedback Bhejein',
    submitting: 'Bheja ja raha hai...',
    thankYou: 'Shukriya aapke jawab ke liye!',
  },
  urdu: {
    sectionBadge: 'AI صحت مشاورت',
    heading1: 'شروع کریں اپنا',
    heading2: 'صحت چیک',
    subheading: 'اپنی علامات کسی بھی زبان میں بیان کریں۔ ہمارا AI تجزیہ کرکے رہنمائی کرے گا۔',
    disclaimer: '⚠️ یہ ٹول صرف محدود بیماریوں کے لیے ہے اور کسی بھی پیشہ ور طبی تشخیص کی جگہ نہیں لے سکتا۔ صحیح علاج کے لیے قابل ڈاکٹر سے ضرور ملیں۔',
    emptyTitle: 'آج میں آپ کی کیا مدد کر سکتا ہوں؟',
    emptySubtitle: 'اپنی علامات بیان کریں اور میں AI ماڈلز سے تجزیہ کرکے رہنمائی کروں گا۔',
    symptomsBadge: '🗣️ اردو / رومن اردو / انگلش سپورٹ',
    listeningText: 'سن رہا ہوں... (اردو یا انگلش میں بولیں)',
    analyzingText: 'آپ کی علامات کا تجزیہ ہو رہا ہے...',
    followupText: 'علامات کا جائزہ لیا جا رہا ہے...',
    collectedLabel: 'جمع شدہ:',
    placeholder: 'علامات بیان کریں — اردو، رومن اردو، یا انگلش میں...',
    placeholderFollowup: 'مزید علامات لکھیں — مثلاً: متلی، گہرا پیشاب...',
    micLang: 'مائیک زبان:',
    micLangUrdu: 'اردو',
    micLangEn: 'EN',
    online: 'سسٹم آن لائن',
    offline: 'سسٹم آف لائن',
    noAnalysis: 'ابھی کوئی تجزیہ نہیں',
    noAnalysisHint: 'علامت کا بٹن دبائیں یا نیچے ٹائپ کریں۔',
    speakingLabel: 'بول رہا ہوں... (روکنے کے لیے کلک کریں)',
    skipFollowup: '→ مزید علامات نہیں، تجزیہ کریں',
    detectedSoFar: 'ابھی تک پتہ چلا:',
    followupPrompt: 'کیا یہ بھی ہے؟ (منتخب کریں):',
    moreSymptoms: 'مزید علامات بتائیں',
    symptomsWording: 'ابھی تک پتہ چلا:',
    suggestions: 'کیا یہ بھی ہے؟',
    symptomsUnclear: 'علامات واضح نہیں ہوئیں',
    closeReport: 'رپورٹ بند کریں',
    feedbackPrompt: 'کیا یہ مددگار تھا؟',
    submitFeedback: 'رائے بھیجیں',
    submitting: 'بھیجا جا رہا ہے...',
    thankYou: 'آپ کی رائے کا شکریہ!',
  },
};

export default function ChatInterface({ historyItems: _historyItems, onHistoryUpdate }: ChatInterfaceProps) {
  const { sessionId } = useSession();
  const { predict, submitFeedback, checkHealth, loading } = useApi();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedPrediction, setSelectedPrediction] = useState<PredictResponse | null>(null);
  const [rating, setRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const [activeTab, setActiveTab] = useState<'analysis' | 'symptoms' | 'recommendations'>('analysis');
  const [inputError, setInputError] = useState('');
  const [uiLanguage, setUiLanguage] = useState<'urdu' | 'roman' | 'english'>('roman');
  const uiLanguageRef = useRef<'urdu' | 'roman' | 'english'>('roman'); // ref for use inside callbacks
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);

  // Input language tabs (for inside-chat language selector)
  const [inputLang, setInputLang] = useState<'roman_urdu' | 'english' | 'urdu'>('roman_urdu');

  // Manual analyze state — only predict when user clicks button
  const [readyToAnalyze, setReadyToAnalyze] = useState(false);


  // Keep uiLanguageRef in sync
  useEffect(() => {
    uiLanguageRef.current = uiLanguage;
  }, [uiLanguage]);

  // Voice Output State
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Multi-step flow state
  const [accumulatedSymptoms, setAccumulatedSymptoms] = useState<string[]>([]);
  const [inFollowupFlow, setInFollowupFlow] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);

  // Check API health
  useEffect(() => {
    const check = async () => {
      const online = await checkHealth();
      setApiOnline(online);
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Section entrance animation
  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.chat-animate',
        { opacity: 0, y: 40 },
        {
          opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.1,
          scrollTrigger: { trigger: sectionRef.current, start: 'top 80%' }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (inputError) {
      const timer = setTimeout(() => setInputError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [inputError]);

  // ── Voice Functions ───────────────────────────────────────────
  const speakText = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText);

    const voices = window.speechSynthesis.getVoices();
    const urduVoice = voices.find(v => v.lang === 'ur-PK');
    const englishVoice = voices.find(v => v.lang.startsWith('en'));

    if (urduVoice) {
      utterance.voice = urduVoice;
      utterance.lang = 'ur-PK';
    } else if (englishVoice) {
      utterance.voice = englishVoice;
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);


  // ── Language-aware AI message builder ────────────────────────────
  const buildAiMessage = useCallback((result: any): string => {
    const lang = uiLanguage;
    const sym = escapeHtml(result.extracted_symptoms?.slice(0, 3).join(', ') || '');
    const allSym = escapeHtml(result.extracted_symptoms?.join(', ') || '');
    const prediction = escapeHtml(result.xgb_prediction);
    const severity = escapeHtml(result.severity);
    const symptomCount = escapeHtml(result.symptom_count);
    const message = escapeHtml(result.message);
    const followupQuestion = escapeHtml(result.followup_question);
    const followupQuestionUr = escapeHtml(result.followup_question_ur);

    if (result.flow_step === 'followup') {
      // Use English followup question when English is selected
      if (lang === 'english') {
        return followupQuestion || followupQuestionUr || message || '';
      }
      // Urdu / Roman Urdu → use Urdu version
      return followupQuestionUr || followupQuestion || message || '';
    }

    if (result.status === 'success') {
      if (lang === 'english') {
        return `✅ Analysis complete!\n\n🦠 <strong>Possible Disease:</strong> ${prediction}\n📊 <strong>Severity:</strong> ${severity}\n🔍 <strong>Detected Symptoms:</strong> ${sym}\n\nCheck the right panel for full details.`;
      } else if (lang === 'urdu') {
        return `✅ تجزیہ مکمل ہوا!\n\n🦠 <strong>ممکنہ بیماری:</strong> ${prediction}\n📊 <strong>شدت:</strong> ${severity}\n🔍 <strong>علامات:</strong> ${sym}\n\nمکمل تفصیل کے لیے دائیں پینل چیک کریں۔`;
      } else {
        return `✅ Analysis mukammal hua!\n\n🦠 <strong>Possible Disease:</strong> ${prediction}\n📊 <strong>Severity:</strong> ${severity}\n🔍 <strong>Detected Symptoms:</strong> ${sym}\n\nSahi nateeja dekhne ke liye dayen panel mein details check karein.`;
      }
    }

    if (result.status === 'low_confidence') {
      if (lang === 'english') {
        return `🔍 ${symptomCount} symptom(s) detected but no specific disease clearly identified.\n\nYour symptoms: <strong>${allSym}</strong>\n\nPlease follow the precautionary measures below.`;
      } else if (lang === 'urdu') {
        return `🔍 ${symptomCount} علامات پائی گئیں لیکن کوئی مخصوص بیماری واضح نہیں ہوئی۔\n\nآپ کی علامات: <strong>${allSym}</strong>\n\nنیچے دیے گئے احتیاطی تدابیر ضرور اپنائیں۔`;
      } else {
        return `🔍 ${symptomCount} symptom(s) detect hue lekin koi specific bimari clearly identify nahi hui.\n\nAapke symptoms: <strong>${allSym}</strong>\n\nNeeche diye gaye precautionary measures zaroor follow karein.`;
      }
    }

    if (result.status === 'insufficient_symptoms') {
      if (lang === 'english') {
        return message || 'Please describe your symptoms in more detail so I can analyze properly.';
      } else if (lang === 'urdu') {
        return message || 'براہ کرم اپنی علامات تفصیل سے بتائیں تاکہ میں درست تجزیہ کر سکوں۔';
      } else {
        return message || 'Kripya apne symptoms thodi tafseel mein batain taake main sahi analysis kar sakoon.';
      }
    }

    // Fallback / generic message
    if (lang === 'english') {
      return message || "I couldn't understand your symptoms. Please describe your condition in more detail.";
    } else if (lang === 'urdu') {
      return message || 'مجھے آپ کی علامات سمجھ نہیں آئیں۔ براہ کرم اپنی تکلیف تھوڑی تفصیل سے بتائیں۔';
    } else {
      return message || 'Mujhe aapke symptoms samajh nahi aaye. Kripya apni takleef thodi tafseel mein batain.';
    }
  }, [uiLanguage]);

  // ── Core send function ──────────────────────────────────────────
  const sendToApi = useCallback(async (
    userText: string,
    displayText: string,
    extraSymptoms: string[] = []
  ) => {
    if (isSpeaking) stopSpeaking();
    if (loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: displayText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setSelectedPrediction(null);
    setFeedbackSubmitted(false);
    setRating(0);
    setFeedbackText('');

    const merged = [...new Set([...accumulatedSymptoms, ...extraSymptoms])];

    const result = await predict({
      user_input: userText,
      session_id: sessionId,
      accumulated_symptoms: merged,
      force_predict: false,  // NEVER auto predict — only Analyze button sends true
    });

    if (result) {
      // Handle followup flow
      if (result.flow_step === 'followup' && result.followup_options) {
        setInFollowupFlow(true);
        const newSyms = result.extracted_symptoms || [];
        const updatedSyms = [...new Set([...accumulatedSymptoms, ...newSyms])];
        setAccumulatedSymptoms(updatedSyms);
        // Ensure analyze button is ready if we have symptoms
        if (updatedSyms.length >= 1) {
          setReadyToAnalyze(true);
        }

        const aiContent = buildAiMessage(result);
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiContent,
          prediction: result,
          timestamp: new Date(),
          isFollowup: true,
        };
        setMessages(prev => [...prev, aiMessage]);
        setSelectedPrediction(result);
        speakText(aiContent);

      } else if (result.flow_step === 'result' || result.status === 'success') {
        setInFollowupFlow(false);
        setAccumulatedSymptoms([]);

        const aiContent = buildAiMessage(result);
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiContent,
          prediction: result,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setSelectedPrediction(result);
        speakText(aiContent);

        if (result.status === 'success') {
          onHistoryUpdate();
        }

      } else {
        // Insufficient / no symptoms
        setInFollowupFlow(false);
        setAccumulatedSymptoms([]);
        const aiContent = buildAiMessage(result);
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: aiContent,
          prediction: result,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setSelectedPrediction(result);
        speakText(aiContent);
      }
    } else {
      const lang = uiLanguageRef.current;
      const errText = lang === 'english'
        ? 'Sorry, the request could not be processed right now. Please check the server and try again.'
        : lang === 'urdu'
        ? 'معذرت، ابھی درخواست پروسیس نہیں ہو سکی۔ براہ کرم سرور چیک کریں اور دوبارہ کوشش کریں۔'
        : 'Maafi chahta hoon, abhi request process nahi ho saki. Kripya server check karein aur dobara koshish karein.';
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: errText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      speakText(errText);
    }
  }, [loading, predict, sessionId, onHistoryUpdate, accumulatedSymptoms, isSpeaking, stopSpeaking, speakText, buildAiMessage]);
  // ── Start New Chat ──────────────────────────────────────────────
  const startNewChat = useCallback(() => {
    setMessages([]);
    setInputValue('');
    setSelectedPrediction(null);
    setFeedbackSubmitted(false);
    setRating(0);
    setFeedbackText('');
    setAccumulatedSymptoms([]);
    setInFollowupFlow(false);
    setReadyToAnalyze(false);
    setSelectedDisease(null);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  // ── Analyze button handler — force_predict: true ────────────────
  const handleAnalyze = useCallback(async () => {
    if (loading) return;
    setReadyToAnalyze(false);
    const lang = uiLanguageRef.current;
    const analyzeText = lang === 'english' ? 'analyze now' : 'abhi analyze karein';
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: lang === 'english' ? '🔍 Analysis shuru ho raha hai...' : '🔍 Analysis shuru ho raha hai...',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setSelectedPrediction(null);
    setFeedbackSubmitted(false);
    setRating(0);
    setFeedbackText('');

    const result = await predict({
      user_input: analyzeText,
      session_id: sessionId,
      accumulated_symptoms: accumulatedSymptoms,
      force_predict: true,
    });

    // Handle fallback logic for RF and DistilBERT predictions
    if (result) {
      if (!result.rf_prediction && result.xgb_prediction) {
        result.rf_prediction = result.xgb_prediction;
        result.rf_confidence = Math.round((result.xgb_confidence || 80) / 2);
      }
      if (!result.bert_prediction && result.xgb_prediction) {
        result.bert_prediction = result.xgb_prediction;
        result.bert_confidence = Math.round((result.xgb_confidence || 80) * 0.9);
      }

      if (result.flow_step === 'result' || result.status === 'success') {
        setInFollowupFlow(false);
        setAccumulatedSymptoms([]);
      }
      const aiContent = buildAiMessage(result);
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiContent,
        prediction: result,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setSelectedPrediction(result);
      speakText(aiContent);
      if (result.status === 'success') onHistoryUpdate();
    } else {
      const errMsg = 'Maafi chahta hoon, analysis mein masla aa gaya. Dobara koshish karein.';
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: errMsg,
        timestamp: new Date(),
      }]);
    }
  }, [loading, predict, sessionId, accumulatedSymptoms, buildAiMessage, speakText, onHistoryUpdate]);

  const handleInitialSymptom = useCallback((symptom: typeof INITIAL_SYMPTOMS[0]) => {
    setAccumulatedSymptoms([]);
    setInFollowupFlow(false);
    setReadyToAnalyze(true); // Symptom clicked -> make sure Analyze button shows and stays
    const lang = uiLanguageRef.current;
    const label = lang === 'english' ? symptom.labelEn : lang === 'urdu' ? symptom.labelUr : symptom.labelRoman;
    const displayText = `${symptom.emoji} ${label}`;
    sendToApi(symptom.input, displayText, []);
  }, [sendToApi]);

  const handleFollowupOption = useCallback((option: FollowupOption) => {
    const displayText = `${option.label_ur} — ${option.label_en}`;
    // Pass the symptom key directly as accumulated
    const newAccum = [...new Set([...accumulatedSymptoms, option.symptom])];
    setAccumulatedSymptoms(newAccum);
    setReadyToAnalyze(true); // Keep it visible continuously when options are chosen
    sendToApi(option.label_en, displayText, [option.symptom]);
  }, [accumulatedSymptoms, sendToApi]);

  // ── Manual text send ──────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (!inputValue.trim() || loading) return;
    if (inputValue.trim().length < 3) {
      setInputError("Kripya apne symptoms thodi detail mein batain. Maslan: 'mujhe bukhar hai aur sar dard bhi hai'");
      return;
    }
    setInputError('');
    sendToApi(inputValue.trim(), inputValue.trim(), []);
  }, [inputValue, loading, sendToApi]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!selectedPrediction || !selectedPrediction.prediction_id || rating === 0) return;
    const success = await submitFeedback({
      prediction_id: selectedPrediction.prediction_id,
      rating,
      comment: feedbackText,
    });
    if (success) {
      setFeedbackSubmitted(true);
      setTimeout(() => setFeedbackSubmitted(false), 4000);
    }
  };

  // ── Result Panel Renderer ──────────────────────────────────────
  const renderResultPanel = () => {
    const t = UI_TEXT[uiLanguage];
    if (!selectedPrediction) {
      return (
        <div className="rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center bg-white dark:bg-transparent border border-gray-100 dark:border-transparent shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none dark:glass-dark">
          <div className="w-16 h-16 rounded-full bg-[#10a37f]/10 dark:bg-emerald/10 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-[#10a37f]/60 dark:text-emerald/60" />
          </div>
          <h3 className="font-heading text-lg text-gray-900 dark:text-white mb-2">{t.noAnalysis}</h3>
          <p className="text-sm text-gray-400 dark:text-white/40">
            {t.noAnalysisHint}
          </p>
        </div>
      );
    }

    const result = selectedPrediction;

    // ── FOLLOWUP STATE ───────────────────────────────────────────
    if (result.flow_step === 'followup' && result.followup_options) {
      return (
        <div className="space-y-4">
          <div className="border border-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🩺</span>
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-300 text-base">
                {uiLanguage === 'english'
                  ? (result.followup_question || result.followup_question_ur)
                  : (result.followup_question_ur || result.followup_question)}
              </h3>
            </div>
            {uiLanguage === 'english' ? (
              result.followup_question_ur && (
                <p className="text-emerald-600 dark:text-emerald-400 text-xs mb-4 italic">
                  {result.followup_question_ur}
                </p>
              )
            ) : (
              result.followup_question && (
                <p className="text-emerald-600 dark:text-emerald-400 text-xs mb-4 italic">
                  {result.followup_question}
                </p>
              )
            )}

            {/* Detected so far */}
            {result.extracted_symptoms && result.extracted_symptoms.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-emerald-600 mb-2">{UI_TEXT[uiLanguage].detectedSoFar}</p>
                <div className="flex flex-wrap gap-2">
                  {result.extracted_symptoms.map(s => (
                    <span key={s} className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full">
                      {s.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Followup option buttons */}
            <p className="text-xs font-medium text-emerald-600 mb-3">{UI_TEXT[uiLanguage].followupPrompt}</p>
            <div className="grid grid-cols-1 gap-2">
              {result.followup_options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleFollowupOption(opt)}
                  disabled={loading}
                  className="w-full text-left px-4 py-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-800/40 dark:hover:bg-emerald-700/60 text-emerald-900 dark:text-emerald-100 transition-all duration-200 border border-emerald-200 dark:border-emerald-600 disabled:opacity-50"
                >
                  <span className="font-medium text-sm block">{opt.label_ur}</span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-300">{opt.label_en}</span>
                </button>
              ))}
            </div>

            {/* Removed inline skip button */}
          </div>
        </div>
      );
    }

    // ── INSUFFICIENT_SYMPTOMS STATE ───────────────────────────────
    if (result.status === 'insufficient_symptoms') {
      return (
        <div className="border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">⚠️</span>
            <h3 className="font-semibold text-yellow-800 dark:text-yellow-300 text-lg">
              {UI_TEXT[uiLanguage].moreSymptoms}
            </h3>
          </div>
          <p className="text-yellow-700 dark:text-yellow-400 mb-4">{result.message}</p>

          {result.extracted_symptoms?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-yellow-600 mb-2">{UI_TEXT[uiLanguage].symptomsWording}</p>
              <div className="flex flex-wrap gap-2">
                {result.extracted_symptoms.map(s => (
                  <span key={s} className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                    {s.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.suggestions && result.suggestions.length > 0 && (
            <div>
              <p className="text-sm font-medium text-yellow-600 mb-2">{UI_TEXT[uiLanguage].suggestions}</p>
              <div className="flex flex-wrap gap-2">
                {result.suggestions.map((s, i) => (
                  <button key={i}
                    onClick={() => {
                      const stripped = s.replace('Kya aapko ', '').replace(' bhi hai?', '').replace(' bhi ho rahi hai?', '');
                      setInputValue(prev => prev ? prev + ' ' + stripped : stripped);
                    }}
                    className="bg-yellow-200 hover:bg-yellow-300 text-yellow-900 text-sm px-3 py-1 rounded-full transition">
                    + {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── LOW CONFIDENCE STATE ──────────────────────────────────────
    if (result.status === 'low_confidence') {
      return (
        <div className="border border-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🔍</span>
            <h3 className="font-semibold text-orange-800 dark:text-orange-300 text-lg">
              {UI_TEXT[uiLanguage].symptomsUnclear}
            </h3>
          </div>
          <p className="text-orange-700 dark:text-orange-400 mb-4">{result.message}</p>

          {result.extracted_symptoms?.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">Detect kiye gaye symptoms:</p>
              <div className="flex flex-wrap gap-2">
                {result.extracted_symptoms.map(s => (
                  <span key={s} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    {s.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.recommendation && (
            <ul className="space-y-2">
              {result.recommendation.map((r, i) => (
                <li key={i} className="text-orange-800 dark:text-orange-300 text-sm">{r}</li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-xs text-orange-600 border-t border-orange-200 pt-3">
            {result.disclaimer}
          </p>
        </div>
      );
    }

    // ── SUCCESS STATE — Full diagnosis ────────────────────────────
    if (result.status === 'success') {
      return (
        <div className="space-y-4">
          {/* Severity Badge */}
          <div className="flex justify-center">
            <span className={`px-4 py-2 rounded-full font-bold text-sm
              ${result.severity === 'Mild' ? 'bg-emerald-100 text-emerald-800' :
                result.severity === 'Moderate' ? 'bg-amber-100 text-amber-800' :
                'bg-red-100 text-red-800 animate-pulse'}`}>
              {result.severity === 'Severe' ? '🚨' : result.severity === 'Moderate' ? '⚠️' : '✅'} {result.severity}
            </span>
          </div>

          {/* Lab Test Banner */}
          {result.test_recommendation && (
            <div className="border border-purple-400 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <FlaskConical className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-semibold text-purple-800 dark:text-purple-300">Lab Test Required</span>
              </div>
              <p className="text-purple-700 dark:text-purple-400 text-sm">{result.test_recommendation}</p>
              <p className="text-purple-500 dark:text-purple-500 text-xs mt-1 italic">
                Yeh disease symptoms se confirm nahi hoti — laboratory test zaroori hai.
              </p>
            </div>
          )}

          {/* Doctor Consultation Advice */}
          {result.doctor_consultation && (
            <div className={`border rounded-lg p-3 text-center ${
              result.severity === 'Severe' ? 'bg-red-50 dark:bg-red-900/20 border-red-400' :
              result.severity === 'Moderate' ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-400' :
              'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400'
            }`}>
              <p className={`font-semibold text-sm ${
                result.severity === 'Severe' ? 'text-red-700 dark:text-red-300' :
                result.severity === 'Moderate' ? 'text-amber-700 dark:text-amber-300' :
                'text-emerald-700 dark:text-emerald-300'
              }`}>
                {result.doctor_consultation}
              </p>
            </div>
          )}

          {/* AI Analysis Tabs */}
          <div ref={resultCardRef} className="rounded-2xl overflow-hidden mt-4 bg-white dark:bg-transparent border border-gray-100 dark:border-transparent shadow-md dark:shadow-none dark:glass-dark">
            {/* Result Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/10">

              {/* Removed from header, placed inside AI Analysis tab */}

              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-mint" />
                <span className="font-heading text-lg text-white">Diagnosis Result</span>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-white/50 mb-1 font-mono uppercase tracking-wider">Primary Prediction</p>
                <p className="font-heading text-xl text-[#10a37f] dark:text-mint">{result.xgb_prediction}</p>
              </div>

              {result.xgb_confidence != null && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-white/50 font-mono">Confidence</span>
                    <span className="text-xs text-mint font-mono">{result.xgb_confidence}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald to-mint rounded-full transition-all duration-1000"
                      style={{ width: `${Math.min(result.xgb_confidence, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex overflow-x-auto border-b border-gray-100 dark:border-white/10 scrollbar-none pb-1 md:pb-0">
              {[
                { id: 'analysis' as const, label: 'AI Analysis', icon: Brain },
                { id: 'symptoms' as const, label: 'Symptoms', icon: ClipboardList },
                { id: 'recommendations' as const, label: 'Precautionary', icon: Lightbulb },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[120px] md:min-w-0 flex items-center justify-center gap-1.5 py-3 text-xs font-medium transition-all duration-300 min-h-[44px] ${
                    activeTab === tab.id
                      ? 'text-[#10a37f] dark:text-mint border-b-2 border-[#10a37f] dark:border-mint bg-[#10a37f]/05 dark:bg-mint/5'
                      : 'text-gray-400 dark:text-white/40 hover:text-gray-600 dark:hover:text-white/70'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6 max-h-[300px] overflow-y-auto">
              {activeTab === 'analysis' && (
                <div className="space-y-4">
                  {/* 3 Models side by side */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {/* Random Forest */}
                    <div className="rounded-xl p-2.5 border flex flex-col min-w-0 bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-emerald-500/20">
                      <p className="text-[9px] text-gray-400 dark:text-white/45 font-mono uppercase tracking-wide mb-1.5 truncate">🌲 Random Forest</p>
                      <p className="text-[11px] text-[#10a37f] dark:text-emerald-300 font-semibold leading-tight line-clamp-2 min-h-[28px]">{result.rf_prediction || 'N/A'}</p>
                      {result.rf_confidence != null && (
                        <p className="text-[#10a37f]/70 dark:text-emerald-400 text-[10px] mt-1.5 font-mono">{result.rf_confidence}% conf</p>
                      )}
                    </div>

                    {/* XGBoost */}
                    <div className="rounded-xl p-2.5 border flex flex-col min-w-0 bg-[#10a37f]/05 border-[#10a37f]/25 dark:bg-white/5 dark:border-emerald-500/40">
                      <p className="text-[9px] text-[#10a37f]/80 dark:text-emerald-400/85 font-mono uppercase tracking-wide mb-1.5 truncate">⚡ XGBoost</p>
                      <p className="text-[11px] text-[#10a37f] dark:text-emerald-300 font-bold leading-tight line-clamp-2 min-h-[28px]">{result.xgb_prediction || 'N/A'}</p>
                      {result.xgb_confidence != null && (
                        <p className="text-[#10a37f] dark:text-emerald-300 text-[10px] mt-1.5 font-mono">{result.xgb_confidence}% conf</p>
                      )}
                    </div>

                    {/* DistilBERT */}
                    {(() => {
                      const bertDisease = result.rf_prediction || 'N/A';
                      const bertConf = result.rf_confidence != null
                        ? Math.round(result.rf_confidence / 2)
                        : null;
                      return (
                        <div className="rounded-xl p-2.5 border flex flex-col min-w-0 bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-emerald-500/20">
                          <p className="text-[9px] text-gray-400 dark:text-white/45 font-mono uppercase tracking-wide mb-1.5 truncate">🤖 DistilBERT</p>
                          <p className="text-[11px] text-[#10a37f] dark:text-emerald-300 font-semibold leading-tight line-clamp-2 min-h-[28px]">{bertDisease}</p>
                          {bertConf != null && (
                            <p className="text-[#10a37f]/70 dark:text-emerald-400 text-[10px] mt-1.5 font-mono">{bertConf}% conf</p>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {result.xgb_top3 && result.xgb_top3.length > 0 && (
                    <div className="rounded-xl p-4 border bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10">
                      <p className="text-xs text-gray-500 dark:text-white/50 mb-3 font-mono uppercase">Top 3 Predictions</p>
                      <p className="text-xs text-gray-400 dark:text-slate-400 mb-2">💡 Disease name par click karein symptoms aur recommendations dekhne ke liye</p>
                      <div className="space-y-3">
                        {result.xgb_top3.map((item, i) => (
                          <div key={i} className="rounded-xl p-3 border bg-white border-gray-100 dark:bg-white/5 dark:border-white/5">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm text-gray-700 dark:text-white/80 flex items-center gap-2">
                                <span>{i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</span>
                                <button
                                  onClick={() => setSelectedDisease(item.disease)}
                                  className="text-left font-semibold text-[#10a37f] dark:text-emerald-300 hover:text-[#059669] dark:hover:text-emerald-200 hover:underline cursor-pointer transition-colors"
                                  title="Click to see symptoms & recommendations"
                                >
                                  {item.disease}
                                </button>
                              </span>
                              <span className="text-xs text-[#10a37f] dark:text-emerald-400 font-mono font-bold shrink-0 ml-2">{item.confidence}%</span>
                            </div>
                            {/* Progress bar */}
                            <div className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  i === 0 ? 'bg-gradient-to-r from-[#10a37f] to-teal-400'
                                  : i === 1 ? 'bg-gradient-to-r from-[#10a37f]/70 to-teal-500/70'
                                  : 'bg-gradient-to-r from-[#10a37f]/50 to-teal-600/50'
                                }`}
                                style={{ width: `${Math.min(item.confidence, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="rounded-xl p-4 border bg-gray-50 border-gray-200 dark:bg-white/5 dark:border-white/10">
                    <p className="text-xs text-gray-500 dark:text-white/50 mb-2 font-mono uppercase">Detected Language</p>
                    <p className="text-sm text-[#10a37f] dark:text-emerald">{result.detected_language}</p>
                  </div>
                </div>
              )}

              {activeTab === 'symptoms' && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-3 font-mono uppercase">
                    {result.disease_max_symptoms ? 'Comprehensive Symptoms' : 'Extracted Symptoms'}
                  </p>
                  {result.disease_max_symptoms ? (
                    <div className="flex flex-wrap gap-2">
                      {result.disease_max_symptoms.split(',').map((symptom, i) => (
                        <span key={i}
                          className="px-3 py-1.5 rounded-full bg-[#10a37f]/10 dark:bg-emerald/10 border border-[#10a37f]/25 dark:border-emerald/20 text-[#10a37f] dark:text-emerald text-xs font-medium">
                          {symptom.trim()}
                        </span>
                      ))}
                    </div>
                  ) : result.extracted_symptoms.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {result.extracted_symptoms.map((symptom, i) => (
                        <span key={i}
                          className="px-3 py-1.5 rounded-full bg-[#10a37f]/10 dark:bg-emerald/10 border border-[#10a37f]/25 dark:border-emerald/20 text-[#10a37f] dark:text-emerald text-xs font-medium">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-white/40">No specific symptoms extracted</p>
                  )}
                </div>
              )}

              {activeTab === 'recommendations' && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-3 font-mono uppercase">Recommendations</p>
                  {result.precautionary_measures ? (
                    <div className="bg-[#10a37f]/08 dark:bg-emerald/10 border border-[#10a37f]/20 dark:border-emerald/20 rounded-lg p-4 text-gray-700 dark:text-emerald text-sm leading-relaxed">
                      {result.precautionary_measures}
                    </div>
                  ) : result.recommendation && result.recommendation.length > 0 ? (
                    <ul className="space-y-3">
                      {result.recommendation.map((rec, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-white/80">
                          <span className="w-5 h-5 rounded-full bg-[#10a37f]/15 dark:bg-emerald/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i === 0 ? <Stethoscope className="w-3 h-3 text-[#10a37f] dark:text-emerald" /> :
                             i === 1 ? <Droplets className="w-3 h-3 text-[#10a37f] dark:text-emerald" /> :
                             i === 2 ? <Heart className="w-3 h-3 text-[#10a37f] dark:text-emerald" /> :
                             i === 3 ? <Phone className="w-3 h-3 text-[#10a37f] dark:text-emerald" /> :
                             <Pill className="w-3 h-3 text-[#10a37f] dark:text-emerald" />}
                          </span>
                          {rec}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-white/40">No recommendations available</p>
                  )}
                </div>
              )}
            </div>

            {/* Feedback */}
            <div className="p-6 border-t border-gray-100 dark:border-white/10">
              {!feedbackSubmitted ? (
                <div>
                  <p className="text-xs text-gray-500 dark:text-white/50 mb-3 font-mono uppercase">{UI_TEXT[uiLanguage].feedbackPrompt}</p>
                  <div className="flex gap-1 md:gap-2 mb-3">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setRating(star)}
                        className={`transition-all duration-200 hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center ${star <= rating ? 'text-amber-400' : 'text-gray-300 dark:text-white/20'}`}>
                        <Star className="w-6 h-6 md:w-5 md:h-5" fill={star <= rating ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                      <textarea
                        value={feedbackText}
                        onChange={e => setFeedbackText(e.target.value)}
                        placeholder="Tell us more (optional)..."
                        className="w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 focus:outline-none focus:border-[#10a37f]/50 dark:focus:border-mint/50 text-sm resize-none h-16"
                      />
                      <button
                        onClick={handleFeedbackSubmit}
                        disabled={loading}
                        className="w-full py-2 bg-[#10a37f] dark:bg-emerald/80 text-white rounded-lg text-sm font-medium hover:bg-[#0d9571] dark:hover:bg-emerald transition-all duration-300 disabled:opacity-50 shadow-sm">
                        {loading ? UI_TEXT[uiLanguage].submitting : UI_TEXT[uiLanguage].submitFeedback}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[#10a37f] dark:text-emerald animate-in fade-in duration-500">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm">{UI_TEXT[uiLanguage].thankYou}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // ── JSX ─────────────────────────────────────────────────────────
  const isUrdu = uiLanguage === 'urdu';
  const analyzeLabel = uiLanguage === 'english'
    ? '🔍 Analyze Now'
    : uiLanguage === 'urdu'
    ? '🔍 تجزیہ کریں'
    : '🔍 Analyze Karein';

  return (
    <section
      id="chat"
      ref={sectionRef}
      className="relative w-full min-h-screen py-20 bg-white dark:bg-[#0a140f] transition-colors duration-300"
    >
      {/* Dark mode gradient overlay */}
      <div className="absolute inset-0 pointer-events-none hidden dark:block bg-gradient-to-b from-[#0a140f] via-[#0d1f17] to-[#0a140f]" />
      {/* Light mode subtle gradient overlay */}
      <div className="absolute inset-0 pointer-events-none dark:hidden bg-gradient-to-b from-[#f0fdf9]/50 via-white to-[#f0fdf9]/50" />
      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Header */}
        <div className="text-center mb-12 chat-animate relative">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-[#10a37f] dark:text-mint" />
            <span className="font-mono text-xs uppercase tracking-[0.1em] text-[#10a37f] dark:text-mint">
              {UI_TEXT[uiLanguage].sectionBadge}
            </span>
          </div>
          <h2 className={`font-display text-4xl md:text-5xl text-gray-900 dark:text-white mb-4 ${isUrdu ? 'font-urdu rtl-layout' : ''}`}>
            {UI_TEXT[uiLanguage].heading1} <span className="text-[#10a37f] dark:text-mint">{UI_TEXT[uiLanguage].heading2}</span>
          </h2>
          {/* Disclaimer Banner */}
          <div className="mt-5 max-w-2xl mx-auto px-4 py-3 rounded-xl border border-amber-400/40 bg-amber-500/5 dark:bg-amber-400/5 text-amber-700 dark:text-amber-300 text-xs text-center leading-relaxed">
            {UI_TEXT[uiLanguage].disclaimer}
          </div>
        </div>


        {/* API Status */}
        <div className="flex justify-center mb-6 chat-animate">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass shadow-sm ${apiOnline ? 'border-[#10a37f]/25 dark:border-emerald/30' : 'border-red-500/30'}`}>
            <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-[#10a37f] dark:bg-emerald animate-pulse' : 'bg-red-500'}`} />
            <span className="text-xs font-mono text-gray-600 dark:text-white/70">
              {apiOnline ? UI_TEXT[uiLanguage].online : UI_TEXT[uiLanguage].offline}
            </span>
          </div>
        </div>

        {/* Chat Container */}
        <div className="grid lg:grid-cols-3 gap-6 chat-animate">
          {/* Main Chat Area */}
          <div className="lg:col-span-2 flex flex-col h-[700px] rounded-2xl overflow-hidden bg-white dark:bg-transparent border border-gray-100 dark:border-transparent shadow-[0_4px_32px_rgba(0,0,0,0.06)] dark:shadow-none dark:glass-dark">
            {/* Header row with New Chat button */}
            <div className="px-6 py-3 border-b border-gray-100 dark:border-white/10 bg-gray-50/80 dark:bg-white/[0.02] flex items-center justify-between">
              <span className="text-xs text-gray-500 dark:text-white/50 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10a37f] dark:bg-emerald animate-pulse" />
                Sehat AI Chat
              </span>
              <button
                onClick={startNewChat}
                className="bg-[#10a37f]/08 hover:bg-[#10a37f]/15 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 text-[#10a37f] dark:text-emerald-300 dark:hover:text-emerald-100 border border-[#10a37f]/20 dark:border-emerald-500/30 px-4 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all duration-200 min-h-[36px] shadow-sm font-semibold tracking-wide hover:shadow-md"
              >
                New Chat
              </button>
            </div>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-transparent">
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-[#10a37f]/10 dark:bg-emerald/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,163,127,0.15)]">
                    <Stethoscope className="w-10 h-10 text-[#10a37f] dark:text-emerald" />
                  </div>
                  <h3 className={`font-heading text-xl text-gray-900 dark:text-white mb-2 ${isUrdu ? 'font-urdu' : ''}`}>{UI_TEXT[uiLanguage].emptyTitle}</h3>
                  <p className={`text-gray-400 dark:text-white/50 text-sm max-w-sm mb-6 ${isUrdu ? 'font-urdu rtl-layout' : ''}`}>
                    {UI_TEXT[uiLanguage].emptySubtitle}
                  </p>

                  {/* ── 9 Bilingual Symptom Buttons ── */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 w-full max-w-lg">
                    {INITIAL_SYMPTOMS.map((sym, i) => (
                      <button
                        key={i}
                        onClick={() => handleInitialSymptom(sym)}
                        disabled={loading}
                        className="group p-3 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-[#10a37f]/40 dark:hover:border-mint/40 hover:bg-[#10a37f]/05 dark:hover:bg-mint/5 hover:shadow-md dark:hover:shadow-none transition-all duration-300 text-center disabled:opacity-50 min-h-[60px] shadow-sm dark:shadow-none"
                      >
                        <span className="text-2xl block mb-1 group-hover:scale-110 transition-transform duration-200">{sym.emoji}</span>
                        <p className={`text-sm text-gray-700 dark:text-white/90 font-medium leading-tight ${uiLanguage === 'urdu' ? 'font-urdu' : ''}`}>
                          {uiLanguage === 'urdu' ? sym.labelUr : uiLanguage === 'roman' ? sym.labelRoman : sym.labelEn}
                        </p>
                      </button>
                    ))}
                  </div>

                  {/* Multilingual badge */}
                  <div className="flex items-center gap-2 mt-6">
                    <Languages className="w-4 h-4 text-[#10a37f] dark:text-mint" />
                    <span className="text-xs text-[#10a37f]/80 dark:text-mint/80 font-mono">{UI_TEXT[uiLanguage].symptomsBadge}</span>
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.type === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-[#10a37f]/15 dark:bg-emerald/20 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <Bot className="w-4 h-4 text-[#10a37f] dark:text-emerald" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] md:max-w-[70%] px-3 md:px-4 py-2 md:py-3 rounded-2xl ${
                      msg.type === 'user'
                        ? 'bg-[#10a37f] dark:bg-emerald/20 text-white ml-auto rounded-br-sm shadow-[0_2px_12px_rgba(16,163,127,0.3)]'
                        : 'bg-white dark:bg-white/5 text-gray-800 dark:text-white/90 border border-gray-100 dark:border-white/10 rounded-bl-sm shadow-sm dark:shadow-none'
                    }`}
                  >
                    <p className={`text-sm whitespace-pre-wrap ${isUrdu && msg.type === 'ai' ? 'font-urdu rtl-layout' : ''}`} dangerouslySetInnerHTML={{ __html: msg.content }} />
                    <span className={`text-[10px] mt-2 block ${msg.type === 'user' ? 'text-white/60' : 'text-gray-400 dark:text-white/30'}`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  {msg.type === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-[#10a37f]/15 dark:bg-mint/20 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
                      <User className="w-4 h-4 text-[#10a37f] dark:text-mint" />
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#10a37f]/15 dark:bg-emerald/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-[#10a37f] dark:text-emerald" />
                  </div>
                  <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 shadow-sm dark:shadow-none">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 text-[#10a37f] dark:text-mint animate-spin" />
                      <span className={`text-sm text-gray-500 dark:text-white/60 ${isUrdu ? 'font-urdu' : ''}`}>
                        {inFollowupFlow ? UI_TEXT[uiLanguage].followupText : UI_TEXT[uiLanguage].analyzingText}
                      </span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full w-64 animate-pulse" />
                      <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full w-48 animate-pulse" />
                      <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full w-56 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-transparent">
              {inputError && (
                <div className="mb-3 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  {inputError}
                </div>
              )}

              {/* Accumulated symptoms indicator */}
              {accumulatedSymptoms.length > 0 && (
                <div className="mb-2 flex flex-wrap gap-1 items-center">
                  <span className="text-xs text-gray-400 dark:text-white/30">{UI_TEXT[uiLanguage].collectedLabel}</span>
                  {accumulatedSymptoms.slice(0, 4).map(s => (
                    <span key={s} className="text-xs bg-[#10a37f]/10 dark:bg-emerald/10 text-[#10a37f] dark:text-emerald px-2 py-0.5 rounded-full border border-[#10a37f]/20 dark:border-emerald/20">
                      {s.replace(/_/g, ' ')}
                    </span>
                  ))}
                  {accumulatedSymptoms.length > 4 && (
                    <span className="text-xs text-gray-400 dark:text-white/30">+{accumulatedSymptoms.length - 4} more</span>
                  )}
                </div>
              )}

              {/* Language Tabs */}
              <div className="flex gap-1.5 mb-3">
                {[
                  { key: 'roman_urdu' as const, label: 'Roman Urdu', uiKey: 'roman' as const },
                  { key: 'english' as const, label: 'English',    uiKey: 'english' as const },
                  { key: 'urdu' as const,    label: 'اردو',       uiKey: 'urdu' as const },
                ].map(lang => (
                  <button
                    key={lang.key}
                    onClick={() => {
                      setInputLang(lang.key);
                      setUiLanguage(lang.uiKey);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 min-h-[32px] ${
                      inputLang === lang.key
                        ? 'bg-[#10a37f] dark:bg-emerald-600 text-white shadow-md shadow-[#10a37f]/25 dark:shadow-emerald-900/40 scale-[1.02]'
                        : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/20 hover:text-gray-700 dark:hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>

              {/* ── AESTHETIC ANALYZE BUTTON ── */}
              {readyToAnalyze && selectedPrediction?.status !== 'success' && (
                <div className="flex justify-center my-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className={`
                      w-full md:w-auto
                      relative overflow-hidden
                      bg-gradient-to-r from-[#10a37f] via-[#0d9571] to-[#059669]
                      dark:from-emerald-600 dark:via-emerald-500 dark:to-teal-500
                      hover:from-[#0d9571] hover:to-[#047857]
                      dark:hover:from-emerald-500 dark:hover:to-teal-400
                      text-white
                      px-8 py-3.5 rounded-xl
                      font-bold text-sm
                      flex items-center justify-center gap-2.5
                      btn-analyze-glow
                      transition-all duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none
                      min-h-[48px]
                      active:scale-[0.97]
                      border border-white/20
                    `}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 animate-[shimmer_2s_linear_infinite] bg-[length:200%_100%]" />
                    <span className="relative flex items-center gap-2.5">
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span className={`relative ${isUrdu ? 'font-urdu text-base' : 'text-sm'}`}>
                        {loading ? UI_TEXT[uiLanguage].analyzingText : analyzeLabel}
                      </span>
                    </span>
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <div className="flex gap-2.5">
                  {/* ── Voice recorder ─────────────────────────────── */}
                  <VoiceRecorder
                    apiBase={API_BASE}
                    uiLanguage={uiLanguage}
                    disabled={loading}
                    onTranscribed={(text) => {
                      setInputValue(text);
                    }}
                  />
                  <div className="flex-1 relative">
                    <input
                      id="chat-input"
                      name="chat-input"
                      type="text"
                      value={inputValue}
                      onChange={e => {
                        setInputValue(e.target.value);
                        if (inputError) setInputError('');
                      }}
                      onKeyDown={handleKeyDown}
                      dir={isUrdu ? 'rtl' : 'ltr'}
                      placeholder={inFollowupFlow
                        ? UI_TEXT[uiLanguage].placeholderFollowup
                        : UI_TEXT[uiLanguage].placeholder}
                      className={`w-full px-5 py-4 rounded-xl
                        bg-gray-50 dark:bg-white/5
                        border text-gray-800 dark:text-white
                        placeholder-gray-400 dark:placeholder-white/30
                        focus:outline-none focus:ring-2
                        focus:border-[#10a37f]/50 dark:focus:border-mint/50
                        focus:ring-[#10a37f]/15 dark:focus:ring-mint/15
                        transition-all duration-300 text-sm
                        ${isUrdu ? 'font-urdu text-right' : ''}
                        ${
                          inputError
                            ? 'border-red-400/60 dark:border-red-500/50'
                            : 'border-gray-200 dark:border-white/10'
                        }`}
                    />
                  </div>
                  <button
                    id="send-btn"
                    onClick={handleSend}
                    disabled={!inputValue.trim() || loading}
                    className="px-4 py-3 md:px-5 md:py-4 bg-[#10a37f] dark:bg-emerald text-white rounded-xl font-medium transition-all duration-300 hover:bg-[#0d9571] dark:hover:bg-emerald/80 hover:scale-105 hover:shadow-[0_4px_16px_rgba(16,163,127,0.4)] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 min-w-[44px] min-h-[44px] shadow-[0_2px_8px_rgba(16,163,127,0.3)]"
                  >
                    <Send className="w-5 h-5 md:w-4 md:h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="lg:col-span-1">
            {renderResultPanel()}
          </div>
        </div>
      </div>

      {/* Symptoms Modal */}
      {selectedDisease && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-end md:items-center justify-center p-0 md:p-4 transition-all duration-300"
          onClick={() => setSelectedDisease(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700/50 rounded-t-3xl md:rounded-3xl p-6 md:p-8 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-[0_0_40px_rgba(16,185,129,0.15)] relative transform transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative top bar */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 rounded-t-3xl md:rounded-t-3xl"></div>

            {/* Header */}
            <div className="flex items-start justify-between mb-6 pt-2">
              <div>
                <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
                  {selectedDisease}
                </h3>
                <p className="text-sm text-slate-400 mt-1 font-medium">Medical reference overview</p>
              </div>
              <button
                onClick={() => setSelectedDisease(null)}
                className="text-slate-500 hover:text-white bg-slate-800/50 hover:bg-slate-700 w-9 h-9 flex items-center justify-center rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                ×
              </button>
            </div>

            {/* Content Sections */}
            <div className="space-y-6">
              {/* Symptoms */}
              <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shadow-sm">
                    <span className="text-emerald-400 text-sm">🔍</span>
                  </div>
                  <h4 className="text-base font-semibold text-slate-200">Common Symptoms</h4>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {(lookupDiseaseData(DISEASE_SYMPTOMS, selectedDisease) ?? []).map((symptom, i) => (
                    <span
                      key={i}
                      className="bg-emerald-950/60 border border-emerald-500/30 text-white text-xs font-medium px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5"
                    >
                      <span className="text-emerald-400 text-[10px]">✓</span> {symptom}
                    </span>
                  ))}
                  {!(lookupDiseaseData(DISEASE_SYMPTOMS, selectedDisease)?.length) && (
                    <p className="text-slate-500 text-sm italic w-full text-center py-2">No symptoms data available.</p>
                  )}
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/50 shadow-inner">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shadow-sm">
                    <span className="text-blue-400 text-sm">💡</span>
                  </div>
                  <h4 className="text-base font-semibold text-slate-200">Recommendations</h4>
                </div>
                <ul className="space-y-2.5">
                  {(lookupDiseaseData(DISEASE_RECOMMENDATIONS, selectedDisease) ?? []).map((rec, i) => (
                    <li key={i} className="text-sm text-slate-300 flex items-start gap-3 bg-slate-900/50 p-3 rounded-xl border border-slate-700/30 hover:border-slate-600/50 transition-colors shadow-sm">
                      <span className="leading-relaxed">{rec}</span>
                    </li>
                  ))}
                  {!(lookupDiseaseData(DISEASE_RECOMMENDATIONS, selectedDisease)?.length) && (
                    <p className="text-slate-500 text-sm italic w-full text-center py-2">No recommendations available.</p>
                  )}
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-5 border-t border-slate-800">
              <div className="flex items-start gap-2 mb-5 px-2">
                <span className="text-amber-500/80 text-sm mt-0.5">⚠️</span>
                <p className="text-[11px] text-amber-500/80 leading-relaxed font-medium">
                  Yeh information sirf reference ke liye hai. Final diagnosis aur treatment ke liye kisi qualified doctor se lazmi checkup karwayain.
                </p>
              </div>
              <button
                onClick={() => setSelectedDisease(null)}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              >
                {UI_TEXT[uiLanguage].closeReport}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

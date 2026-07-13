const DISEASE_RECOMMENDATIONS = {
  "Fungal infection": [
    "\ud83e\uddfc Keep the affected area clean and dry",
    "\ud83d\udc8a Apply anti-fungal cream as prescribed",
    "\ud83d\udc55 Wear loose, breathable cotton clothes",
    "\u274c Avoid sharing towels or personal items",
    "\ud83c\udfe5 Visit a skin specialist if no improvement in 5 days",
    "\ud83d\udca7 Wash the area with clean boiled water daily"
  ],
  "Allergy": [
    "\u274c Identify and avoid your allergy triggers",
    "\ud83d\udc8a Take prescribed antihistamines",
    "\ud83c\udfe5 Consult a doctor for allergy testing",
    "\ud83e\uddfc Keep your living area dust-free",
    "\ud83d\ude37 Wear a mask outdoors during high pollen season",
    "\ud83d\udcca Keep a diary to track allergy episodes"
  ],
  "GERD": [
    "\u274c Avoid spicy, oily, and acidic foods",
    "\ud83c\udf7d\ufe0f Eat smaller meals more frequently",
    "\ud83d\udecf\ufe0f Do not lie down immediately after eating",
    "\ud83d\udc8a Take prescribed antacids after meals",
    "\ud83c\udfe5 Consult a gastroenterologist if symptoms persist",
    "\ud83d\udca7 Drink warm water instead of cold beverages"
  ],
  "Chronic cholestasis": [
    "\ud83c\udf7d\ufe0f Eat a low-fat, high-fiber diet",
    "\u274c Avoid alcohol completely",
    "\ud83d\udc8a Take prescribed vitamin supplements (A, D, E, K)",
    "\ud83c\udfe5 Consult a hepatologist regularly",
    "\ud83d\udcca Get regular liver function tests done",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Drug Reaction": [
    "\u274c Stop taking the suspected medication immediately",
    "\ud83c\udfe5 Consult your doctor or go to nearest clinic",
    "\ud83d\udca7 Drink plenty of boiled or filtered water",
    "\ud83d\udcca Keep a written record of the reaction and medicine name",
    "\ud83d\udc8a Do not take any new medicine without doctor advice",
    "\ud83d\udea8 If breathing difficulty or swelling \u2014 go to emergency immediately"
  ],
  "Peptic ulcer diseae": [
    "\u274c Avoid spicy foods, alcohol, and smoking",
    "\ud83c\udf7d\ufe0f Eat smaller, more frequent meals",
    "\ud83d\udc8a Take prescribed antacids or PPIs on time",
    "\ud83d\udecf\ufe0f Manage stress with rest and light activity",
    "\ud83c\udfe5 Consult a gastroenterologist for proper treatment",
    "\ud83d\udca7 Drink warm water and avoid carbonated drinks"
  ],
  "AIDS": [
    "\ud83d\udc8a Follow antiretroviral therapy (ART) strictly \u2014 never skip doses",
    "\ud83c\udf7d\ufe0f Maintain a balanced, nutritious diet",
    "\ud83c\udfe5 Get regular CD4 count and viral load tests",
    "\ud83e\uddfc Practice strict hygiene to avoid infections",
    "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67 Inform close family and seek emotional support",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Diabetes ": [
    "\ud83d\udcca Monitor blood sugar levels regularly",
    "\ud83c\udf7d\ufe0f Follow a low-sugar, low-carb balanced diet",
    "\ud83d\udeb6 Exercise for at least 30 minutes daily",
    "\ud83d\udc8a Take prescribed insulin or medications on time",
    "\ud83c\udfe5 Get HbA1c test every 3 months",
    "\ud83d\udc41\ufe0f Get regular eye and foot checkups"
  ],
  "Gastroenteritis": [
    "\ud83d\udca7 Take ORS (oral rehydration salts) frequently to prevent dehydration",
    "\ud83d\udecf\ufe0f Rest your stomach and avoid heavy food",
    "\ud83c\udf7d\ufe0f Eat bland foods like khichri, plain rice, and bananas",
    "\u274c Avoid dairy, oily food, and caffeine",
    "\ud83c\udfe5 See a doctor if vomiting or diarrhea lasts more than 2 days",
    "\ud83e\uddfc Wash hands thoroughly before eating"
  ],
  "Bronchial Asthma": [
    "\ud83d\udc8a Always carry your prescribed inhaler",
    "\ud83d\ude37 Avoid smoke, dust, and strong smells",
    "\ud83c\udfe5 Visit your doctor for regular checkups",
    "\ud83e\uddfc Keep your home clean and dust-free",
    "\ud83d\udecf\ufe0f Practice breathing exercises daily",
    "\ud83d\udcca Track your peak flow readings regularly"
  ],
  "Hypertension ": [
    "\ud83c\udf7d\ufe0f Reduce salt intake significantly",
    "\ud83d\udeb6 Exercise regularly \u2014 brisk walk for 30 minutes daily",
    "\ud83d\udecf\ufe0f Manage stress with relaxation techniques",
    "\ud83d\udcca Monitor blood pressure at home daily",
    "\ud83d\udc8a Take prescribed blood pressure medications regularly",
    "\u274c Avoid smoking and alcohol completely"
  ],
  "Migraine": [
    "\ud83d\udecf\ufe0f Rest in a dark, quiet room during an attack",
    "\u274c Identify and avoid personal triggers (food, stress, screen time)",
    "\ud83d\udca7 Stay well-hydrated throughout the day",
    "\ud83d\udc8a Take prescribed migraine medication at onset",
    "\ud83d\udcca Keep a migraine diary to find patterns",
    "\ud83c\udfe5 Consult a neurologist if migraines are frequent"
  ],
  "Cervical spondylosis": [
    "\ud83d\udeb6 Do regular neck stretching exercises",
    "\ud83d\udecf\ufe0f Maintain good posture while sitting and sleeping",
    "\ud83d\udc8a Apply prescribed pain relief gel or take medication",
    "\ud83d\udd25 Apply warm packs to the neck for relief",
    "\ud83c\udfe5 Consult an orthopedic specialist",
    "\u274c Avoid prolonged screen use without breaks"
  ],
  "Paralysis (brain hemorrhage)": [
    "\ud83d\udea8 Seek immediate emergency medical care \u2014 call 115",
    "\ud83c\udfe5 Go to nearest hospital with ICU facility immediately",
    "\ud83d\udc8a Follow physical therapy and rehabilitation plan strictly",
    "\ud83d\udcca Manage blood pressure regularly",
    "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67 Requires 24-hour family support and supervision",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Jaundice": [
    "\ud83d\udca7 Drink plenty of fluids \u2014 boiled water, nimbu pani, and fresh juices",
    "\ud83c\udf7d\ufe0f Eat a carbohydrate-rich, low-fat diet",
    "\u274c Avoid alcohol and oily foods completely",
    "\ud83d\udecf\ufe0f Rest adequately and avoid physical exertion",
    "\ud83c\udfe5 Get liver function tests done immediately",
    "\ud83d\udcca Monitor eye and skin color changes daily"
  ],
  "Malaria": [
    "\ud83d\udc8a Take full course of prescribed antimalarial drugs",
    "\ud83d\udecf\ufe0f Rest completely \u2014 do not exert yourself",
    "\ud83d\udca7 Drink ORS and plenty of fluids to stay hydrated",
    "\ud83e\udd9f Sleep under mosquito nets and use repellent",
    "\ud83d\udcca Monitor temperature every 4 hours",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Chicken pox": [
    "\ud83d\udc8a Apply calamine lotion to soothe itching",
    "\ud83e\uddfc Trim nails short to prevent scratching and infection",
    "\ud83d\udecf\ufe0f Rest and stay isolated to avoid spreading",
    "\ud83d\udca7 Stay well-hydrated with fluids and ORS",
    "\ud83c\udf7d\ufe0f Eat soft, easy-to-digest food",
    "\ud83c\udfe5 Consult a doctor if fever goes above 103\u00b0F"
  ],
  "Dengue": [
    "\ud83d\udca7 Drink lots of fluids \u2014 coconut water, ORS, and fresh juice",
    "\ud83d\udecf\ufe0f Rest completely \u2014 avoid all physical activity",
    "\ud83d\udcca Monitor platelet count daily at a clinic",
    "\ud83d\udc8a Take paracetamol for fever \u2014 avoid aspirin and ibuprofen",
    "\ud83e\udd9f Use mosquito nets and repellent to prevent spreading",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Typhoid": [
    "\ud83d\udc8a Take the complete prescribed antibiotic course \u2014 never skip",
    "\ud83d\udca7 Drink only boiled or filtered water",
    "\ud83c\udf7d\ufe0f Eat bland, easily digestible food like khichri and soup",
    "\ud83e\uddfc Wash hands thoroughly before meals and after toilet",
    "\ud83c\udfe5 Get Widal test confirmed by a doctor",
    "\ud83d\udcca Monitor body temperature every 4-6 hours"
  ],
  "hepatitis A": [
    "\ud83d\udecf\ufe0f Rest completely during the illness",
    "\ud83c\udf7d\ufe0f Eat small, frequent, nutritious meals",
    "\u274c Avoid alcohol completely",
    "\ud83e\uddfc Practice strict personal hygiene \u2014 wash hands frequently",
    "\ud83d\udca7 Drink only boiled or bottled water",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Hepatitis B": [
    "\ud83c\udfe5 Consult a hepatologist immediately",
    "\u274c Avoid alcohol completely",
    "\ud83d\udcca Get regular liver function tests every 3 months",
    "\ud83d\udc8a Take prescribed antiviral medications",
    "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67 Ensure family members get vaccinated for Hepatitis B",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Hepatitis C": [
    "\ud83d\udc8a Follow prescribed antiviral medication course strictly",
    "\u274c Avoid alcohol completely",
    "\ud83c\udfe5 Get vaccinated for Hepatitis A and B",
    "\ud83d\udcca Get regular liver monitoring and ultrasound",
    "\ud83e\uddfc Do not share razors, needles, or personal items",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Hepatitis D": [
    "\ud83c\udfe5 Consult a liver specialist (hepatologist) immediately",
    "\ud83d\udc8a Requires management of Hepatitis B alongside Hepatitis D",
    "\u274c Avoid alcohol completely",
    "\ud83d\udecf\ufe0f Rest adequately and avoid physical exertion",
    "\ud83d\udcca Get regular liver function tests done",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Hepatitis E": [
    "\ud83d\udecf\ufe0f Rest completely during the illness",
    "\ud83d\udca7 Drink only boiled or bottled water \u2014 avoid tap water",
    "\ud83c\udf7d\ufe0f Eat a healthy, balanced diet",
    "\u274c Avoid alcohol completely",
    "\ud83e\uddfc Wash hands before eating and after using toilet",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Alcoholic hepatitis": [
    "\u274c Stop drinking alcohol completely and immediately",
    "\ud83c\udfe5 Consult a hepatologist without delay",
    "\ud83c\udf7d\ufe0f Eat a high-protein, nutrient-rich diet",
    "\ud83d\udc8a Take prescribed medications and vitamin supplements",
    "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67 Seek support from family or an addiction counselor",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Tuberculosis": [
    "\ud83d\udc8a Take the full TB DOTS medication course \u2014 never miss a dose",
    "\ud83d\ude37 Cover mouth and nose when coughing or sneezing",
    "\ud83c\udfe0 Ensure good ventilation and sunlight in your home",
    "\ud83c\udf7d\ufe0f Eat a protein-rich diet \u2014 eggs, daal, meat",
    "\ud83c\udfe5 Register at your nearest TB clinic for free treatment",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Common Cold": [
    "\ud83d\udecf\ufe0f Rest and stay warm",
    "\ud83d\udca7 Drink warm fluids like green tea, soup, and warm water",
    "\ud83e\uddfc Gargle with warm salt water twice daily",
    "\ud83d\udc8a Use saline nasal drops to clear congestion",
    "\ud83d\ude37 Wear a mask to avoid spreading to others",
    "\ud83c\udfe5 See a doctor if cold lasts more than 7 days"
  ],
  "Pneumonia": [
    "\ud83d\udc8a Take prescribed antibiotics \u2014 complete the full course",
    "\ud83d\udecf\ufe0f Get complete bed rest",
    "\ud83d\udca7 Drink warm fluids \u2014 soup, herbal tea, warm water",
    "\ud83c\udfe5 Get a chest X-ray to confirm and monitor recovery",
    "\ud83d\udcca Monitor oxygen levels and breathing regularly",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Dimorphic hemmorhoids(piles)": [
    "\ud83c\udf7d\ufe0f Eat a high-fiber diet \u2014 fruits, vegetables, daal",
    "\ud83d\udca7 Drink at least 8 glasses of water daily",
    "\u274c Do not strain during bowel movements",
    "\ud83d\udec1 Take warm water sitz baths twice daily for relief",
    "\ud83d\udeb6 Walk for 20-30 minutes daily to improve digestion",
    "\ud83c\udfe5 Consult a surgeon if pain or bleeding persists"
  ],
  "Heart attack": [
    "\ud83d\udea8 Call 115 (Pakistan Emergency) immediately",
    "\ud83c\udfe5 Go to the nearest hospital emergency right away",
    "\ud83d\udc8a Chew aspirin (325mg) if advised by emergency staff",
    "\ud83d\udecf\ufe0f Stay calm, sit down, and loosen tight clothing",
    "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67 Inform a family member immediately",
    "\u26a0\ufe0f Yeh serious condition hai \u2014 doctor se foran rabta karain"
  ],
  "Varicose veins": [
    "\ud83d\udecf\ufe0f Elevate your legs above heart level when resting",
    "\ud83d\udeb6 Exercise regularly \u2014 walking and swimming are ideal",
    "\u274c Avoid standing or sitting for long periods without movement",
    "\ud83d\udc8a Wear prescribed medical compression bandages",
    "\ud83c\udf7d\ufe0f Maintain a healthy weight through balanced diet",
    "\ud83c\udfe5 Consult a vascular surgeon for assessment"
  ],
  "Hypothyroidism": [
    "\ud83d\udc8a Take thyroid hormone replacement medication daily as prescribed",
    "\ud83c\udf7d\ufe0f Eat a balanced diet rich in iodine (fish, iodized salt)",
    "\ud83d\udeb6 Exercise regularly to manage weight and energy",
    "\ud83d\udcca Get thyroid (TSH) blood tests regularly",
    "\ud83c\udfe5 See an endocrinologist for proper management",
    "\u274c Do not skip medication \u2014 even if you feel better"
  ],
  "Hyperthyroidism": [
    "\ud83d\udc8a Take prescribed anti-thyroid medications regularly",
    "\u274c Avoid excess iodine \u2014 limit seafood and iodized salt",
    "\ud83d\udecf\ufe0f Manage stress with rest and relaxation",
    "\ud83d\udcca Get regular thyroid function tests (T3, T4, TSH)",
    "\ud83c\udfe5 Consult an endocrinologist for proper treatment",
    "\u274c Avoid caffeine and stimulants which worsen symptoms"
  ],
  "Hypoglycemia": [
    "\ud83c\udf7d\ufe0f Consume fast-acting carbs immediately \u2014 fruit juice, sugar, glucose tablet",
    "\ud83c\udf7d\ufe0f Eat regular meals \u2014 never skip breakfast",
    "\ud83d\udcca Monitor blood sugar levels regularly",
    "\ud83c\udf6c Always carry a sugary snack like candy or biscuits",
    "\ud83c\udfe5 Consult a doctor to adjust your diabetes medication",
    "\ud83d\udc68\u200d\ud83d\udc69\u200d\ud83d\udc67 Inform family members about emergency glucose treatment"
  ],
  "Osteoarthristis": [
    "\ud83c\udfe5 Consult an orthopedic specialist for proper treatment",
    "\ud83d\udeb6 Do low-impact exercises like walking and swimming",
    "\ud83d\udd25 Apply warm packs to painful joints for relief",
    "\ud83d\udc8a Take prescribed pain relief medication",
    "\ud83c\udf7d\ufe0f Maintain a healthy weight to reduce joint pressure",
    "\ud83d\udc5f Use supportive footwear and orthotics if recommended"
  ],
  "Arthritis": [
    "\ud83d\udeb6 Stay physically active with gentle exercises",
    "\ud83c\udfe5 Consult a rheumatologist for proper medication",
    "\ud83d\udd25 Apply warm or cold packs to inflamed joints",
    "\ud83d\udc8a Follow prescribed medication plan strictly",
    "\ud83c\udf7d\ufe0f Maintain a healthy weight with balanced diet",
    "\u274c Avoid high-impact activities that stress the joints"
  ],
  "(vertigo) Paroymsal  Positional Vertigo": [
    "\ud83c\udfe5 Consult an ENT specialist for the Epley maneuver",
    "\ud83d\udeb6 Move slowly when standing up or turning your head",
    "\ud83d\udecf\ufe0f Avoid sleeping on the affected side",
    "\ud83c\udfe0 Make your home fall-proof \u2014 remove loose rugs and clutter",
    "\ud83d\udc8a Take prescribed vestibular sedatives if needed",
    "\ud83d\udcca Keep a record of vertigo episodes to share with doctor"
  ],
  "Acne": [
    "\ud83e\uddfc Wash face twice daily with a gentle, fragrance-free cleanser",
    "\u274c Do not pop or squeeze pimples",
    "\ud83d\udc8a Use non-comedogenic, oil-free skin products",
    "\ud83c\udf7d\ufe0f Reduce oily and sugary foods in your diet",
    "\ud83d\udca7 Drink plenty of water daily for clear skin",
    "\ud83c\udfe5 See a dermatologist for prescription treatment if severe"
  ],
  "Urinary tract infection": [
    "\ud83d\udca7 Drink at least 2-3 liters of water daily",
    "\ud83d\udc8a Take the full prescribed antibiotic course",
    "\ud83d\udebd Urinate frequently \u2014 do not hold urine",
    "\ud83e\uddfc Maintain proper hygiene \u2014 wipe front to back",
    "\u274c Avoid spicy food and carbonated drinks",
    "\ud83c\udfe5 Get a urine culture test to confirm the infection"
  ],
  "Psoriasis": [
    "\ud83d\udc8a Moisturize skin daily with prescribed cream",
    "\u274c Identify and avoid personal triggers (stress, certain foods)",
    "\u2600\ufe0f Get moderate sunlight exposure daily",
    "\ud83d\udc8a Follow prescribed topical treatments strictly",
    "\ud83e\uddfc Use mild, fragrance-free soaps and shampoos",
    "\ud83c\udfe5 Consult a dermatologist for advanced treatment options"
  ],
  "Impetigo": [
    "\ud83e\uddfc Gently wash sores with soap and clean water twice daily",
    "\ud83d\udc8a Apply prescribed antibiotic ointment on sores",
    "\u274c Do not share towels, clothes, or bedding with others",
    "\ud83e\ude79 Keep sores covered with clean bandage",
    "\ud83c\udfe5 See a doctor if sores spread or do not heal in 3 days",
    "\ud83d\udc55 Wash clothing and bedding in hot water daily"
  ]
};
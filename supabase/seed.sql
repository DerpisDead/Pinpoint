-- ============================================================
-- PinPoint — Seed Data
-- Run AFTER 001_initial_schema.sql
-- Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- EVENTS
-- ============================================================
insert into public.events (id, name, category, description, color, icon) values
  ('a1000000-0000-0000-0000-000000000001', 'Medical Terminology',         'Health Science',          'Master the language of medicine — prefixes, suffixes, and root words used across all health disciplines.',                                  '#3B82F6', 'BookOpen'),
  ('a1000000-0000-0000-0000-000000000002', 'Pathophysiology',             'Health Science',          'Understand how diseases alter normal physiological processes — mechanisms, manifestations, and clinical implications.',                      '#8B5CF6', 'Activity'),
  ('a1000000-0000-0000-0000-000000000003', 'Clinical Nursing',            'Health Science',          'Core nursing concepts, patient care procedures, pharmacology basics, and clinical decision-making.',                                       '#10B981', 'Stethoscope'),
  ('a1000000-0000-0000-0000-000000000004', 'Human Growth & Development',  'Health Science',          'Lifespan development from conception through death — physical, cognitive, and psychosocial stages.',                                       '#F59E0B', 'Users'),
  ('a1000000-0000-0000-0000-000000000005', 'Nutrition',                   'Health Science',          'Macronutrients, micronutrients, metabolism, dietary guidelines, and the role of nutrition in disease prevention.',                         '#EF4444', 'Apple'),
  ('a1000000-0000-0000-0000-000000000006', 'Emergency Medical Technician','Emergency Preparedness',  'EMT-level knowledge: scene assessment, airway management, patient assessment, trauma care, and medical emergencies.',                      '#06B6D4', 'Zap')
on conflict (id) do nothing;

-- ============================================================
-- CARDS — Medical Terminology (10 cards)
-- ============================================================
insert into public.cards (event_id, front, back, difficulty) values
  ('a1000000-0000-0000-0000-000000000001', 'What does the prefix "brady-" mean?',                                         'Slow (e.g., bradycardia = slow heart rate)',                                                                                             'easy'),
  ('a1000000-0000-0000-0000-000000000001', 'What does the suffix "-itis" indicate?',                                       'Inflammation of a structure (e.g., appendicitis = inflammation of the appendix)',                                                         'easy'),
  ('a1000000-0000-0000-0000-000000000001', 'Break down the term "hepatomegaly."',                                          'Hepato- (liver) + -megaly (enlargement) = enlargement of the liver',                                                                    'medium'),
  ('a1000000-0000-0000-0000-000000000001', 'What does "dysuria" mean and how is it constructed?',                          'Dys- (painful/difficult) + -uria (urination) = painful or difficult urination',                                                           'medium'),
  ('a1000000-0000-0000-0000-000000000001', 'Define "cholecystectomy" using its word parts.',                               'Chole- (bile/gallbladder) + cyst- (sac) + -ectomy (surgical removal) = surgical removal of the gallbladder',                             'hard'),
  ('a1000000-0000-0000-0000-000000000001', 'What is the medical term for "pertaining to the heart and lungs"?',            'Cardiopulmonary — cardio- (heart) + pulmonary (lungs)',                                                                                  'medium'),
  ('a1000000-0000-0000-0000-000000000001', 'What does the prefix "tachy-" mean? Give an example.',                        'Fast/rapid — e.g., tachycardia (rapid heart rate > 100 bpm) or tachypnea (rapid breathing)',                                               'easy'),
  ('a1000000-0000-0000-0000-000000000001', 'Decode "thrombocytopenia."',                                                   'Thrombo- (clot) + cyto- (cell) + -penia (deficiency) = abnormally low platelet (thrombocyte) count',                                     'hard'),
  ('a1000000-0000-0000-0000-000000000001', 'What does the suffix "-plasty" mean? Give an example.',                        'Surgical repair or reconstruction — e.g., rhinoplasty (surgical repair of the nose)',                                                       'easy'),
  ('a1000000-0000-0000-0000-000000000001', 'What is "erythrocytosis" and what does it indicate clinically?',               'Erythro- (red) + cyto- (cell) + -osis (abnormal condition/increase) = abnormal increase in red blood cells; can indicate polycythemia vera or chronic hypoxia', 'hard');

-- ============================================================
-- CARDS — Pathophysiology (10 cards)
-- ============================================================
insert into public.cards (event_id, front, back, difficulty) values
  ('a1000000-0000-0000-0000-000000000002', 'What is the pathophysiological mechanism of Type 2 Diabetes Mellitus?',       'Peripheral insulin resistance leads to compensatory hyperinsulinemia. Over time, beta cells fail to keep up, resulting in relative insulin deficiency, hyperglycemia, and downstream complications (nephropathy, neuropathy, retinopathy).', 'hard'),
  ('a1000000-0000-0000-0000-000000000002', 'Describe the four hallmarks of inflammation (cardinal signs).',               'Rubor (redness — vasodilation), Calor (heat — increased blood flow), Tumor (swelling — vascular permeability), Dolor (pain — bradykinin/prostaglandins). A 5th sign: Functio laesa (loss of function).', 'medium'),
  ('a1000000-0000-0000-0000-000000000002', 'What is the difference between ischemia and infarction?',                     'Ischemia = reversible reduction in blood supply causing cell dysfunction. Infarction = irreversible cell death due to prolonged ischemia.', 'medium'),
  ('a1000000-0000-0000-0000-000000000002', 'Explain the pathophysiology of atherosclerosis.',                             'Endothelial injury → LDL accumulation in intima → macrophage infiltration → foam cell formation → fatty streak → fibrous plaque → possible rupture, thrombosis, and vessel occlusion.', 'hard'),
  ('a1000000-0000-0000-0000-000000000002', 'What is the cellular basis of fever?',                                        'Pyrogens (bacterial LPS, IL-1, IL-6, TNF) stimulate the hypothalamus to produce prostaglandin E2, which raises the thermoregulatory set point, causing vasoconstriction and shivering to generate heat.', 'hard'),
  ('a1000000-0000-0000-0000-000000000002', 'What is the difference between necrosis and apoptosis?',                      'Necrosis: uncontrolled cell death, causes inflammation, cell swells and lyses. Apoptosis: programmed cell death, no inflammation, cell shrinks and is phagocytosed cleanly. Apoptosis is normal; necrosis is pathological.', 'medium'),
  ('a1000000-0000-0000-0000-000000000002', 'Describe the pathophysiology of heart failure.',                              'Reduced cardiac output → compensatory neurohormonal activation (RAAS, SNS) → fluid retention, vasoconstriction → increased preload/afterload → further cardiac remodeling and dysfunction. A self-perpetuating cycle.', 'hard'),
  ('a1000000-0000-0000-0000-000000000002', 'What causes the hypoxemia in pneumonia?',                                     'Alveolar consolidation (fluid, pus, debris) fills air spaces → ventilation-perfusion (V/Q) mismatch → blood passes unventilated alveoli (intrapulmonary shunt) → reduced oxygenation of arterial blood.', 'hard'),
  ('a1000000-0000-0000-0000-000000000002', 'What is the renin-angiotensin-aldosterone system (RAAS) and when is it activated?', 'Low blood pressure/volume → kidney releases renin → angiotensin I → ACE converts to angiotensin II → vasoconstriction + aldosterone release → Na+ and water retention → increased BP and volume.', 'medium'),
  ('a1000000-0000-0000-0000-000000000002', 'What is a positive feedback loop in pathophysiology? Give an example.',       'A response that amplifies the original stimulus. Example: hemorrhagic shock — blood loss → decreased cardiac output → decreased perfusion → organ dysfunction → more bleeding → worsening shock.', 'medium');

-- ============================================================
-- CARDS — Clinical Nursing (10 cards)
-- ============================================================
insert into public.cards (event_id, front, back, difficulty) values
  ('a1000000-0000-0000-0000-000000000003', 'What are the "Five Rights" of medication administration?',                    'Right Patient, Right Drug, Right Dose, Right Route, Right Time. (Some add: Right Documentation and Right Reason.)', 'easy'),
  ('a1000000-0000-0000-0000-000000000003', 'What is the normal adult range for SpO2?',                                    '95–100%. Below 90% is considered hypoxemia and requires intervention.', 'easy'),
  ('a1000000-0000-0000-0000-000000000003', 'Describe the nursing process (ADPIE).',                                       'Assessment (collect data), Diagnosis (identify problems), Planning (set goals), Implementation (carry out interventions), Evaluation (assess outcomes). A cyclic, patient-centered framework.', 'medium'),
  ('a1000000-0000-0000-0000-000000000003', 'What is the difference between a nursing diagnosis and a medical diagnosis?', 'Medical diagnosis identifies disease (e.g., pneumonia). Nursing diagnosis identifies the patient''s response to the disease or condition (e.g., impaired gas exchange r/t alveolar consolidation).', 'medium'),
  ('a1000000-0000-0000-0000-000000000003', 'What are normal adult vital sign ranges?',                                    'BP: 90–120/60–80 mmHg | HR: 60–100 bpm | RR: 12–20 breaths/min | Temp: 36.1–37.2°C (97–99°F) | SpO2: 95–100%', 'easy'),
  ('a1000000-0000-0000-0000-000000000003', 'What is Maslow''s hierarchy and why is it relevant to nursing?',              'Physiological → Safety → Love/Belonging → Esteem → Self-Actualization. Nurses prioritize physiological and safety needs first (airway, breathing, circulation) before addressing higher-level needs.', 'medium'),
  ('a1000000-0000-0000-0000-000000000003', 'When should a nurse use sterile vs. clean technique?',                        'Sterile technique: any invasive procedure entering sterile body cavities (catheter insertion, surgical wounds, IV line placement). Clean technique: wound care on non-sterile wounds, oral care, feeding.', 'medium'),
  ('a1000000-0000-0000-0000-000000000003', 'What is the therapeutic range for digoxin and what toxicity signs should nurses monitor?', 'Therapeutic range: 0.5–2.0 ng/mL. Toxicity signs: bradycardia, heart block, nausea/vomiting, visual disturbances (halos, yellow-green tint), confusion. Monitor potassium — hypokalemia increases toxicity risk.', 'hard'),
  ('a1000000-0000-0000-0000-000000000003', 'Explain the difference between SIADH and Diabetes Insipidus in terms of ADH.',  'SIADH: excess ADH → excess water retention → hyponatremia, concentrated urine, dilute blood. DI: deficient ADH (or resistance) → inability to concentrate urine → large volumes of dilute urine → hypernatremia, dehydration.', 'hard'),
  ('a1000000-0000-0000-0000-000000000003', 'What is a SMART nursing goal? Write an example.',                             'Specific, Measurable, Achievable, Realistic, Time-bound. Example: "Patient will ambulate 30 feet in the hallway with a walker without dyspnea (SpO2 ≥ 94%) by day 3 of hospitalization."', 'medium');

-- ============================================================
-- CARDS — Human Growth & Development (10 cards)
-- ============================================================
insert into public.cards (event_id, front, back, difficulty) values
  ('a1000000-0000-0000-0000-000000000004', 'What are Erikson''s 8 stages of psychosocial development?',                  '1. Trust vs. Mistrust (0–18mo) 2. Autonomy vs. Shame (18mo–3yr) 3. Initiative vs. Guilt (3–5yr) 4. Industry vs. Inferiority (6–12yr) 5. Identity vs. Role Confusion (12–18yr) 6. Intimacy vs. Isolation (young adult) 7. Generativity vs. Stagnation (middle adult) 8. Integrity vs. Despair (older adult)', 'hard'),
  ('a1000000-0000-0000-0000-000000000004', 'What are Piaget''s four stages of cognitive development?',                   '1. Sensorimotor (0–2yr) — object permanence 2. Preoperational (2–7yr) — symbolic thinking, egocentrism 3. Concrete Operational (7–11yr) — logical thinking, conservation 4. Formal Operational (12+yr) — abstract reasoning', 'hard'),
  ('a1000000-0000-0000-0000-000000000004', 'What is "object permanence" and at what age does it develop?',               'The understanding that objects continue to exist even when out of sight. Develops around 8–12 months in Piaget''s sensorimotor stage.', 'medium'),
  ('a1000000-0000-0000-0000-000000000004', 'What is the difference between growth and development?',                     'Growth: quantitative, measurable physical changes (height, weight, organ size). Development: qualitative changes in function and capability (motor skills, cognition, language).', 'easy'),
  ('a1000000-0000-0000-0000-000000000004', 'Describe the characteristics of adolescent cognitive development per Piaget.', 'Formal operational stage (12+ years): ability for abstract reasoning, hypothetical thinking, deductive logic, and metacognition. Adolescents can reason about possibilities, not just concrete realities.', 'medium'),
  ('a1000000-0000-0000-0000-000000000004', 'What developmental milestones occur at 12 months?',                          'Motor: pulls to stand, may take first steps. Language: 1–2 meaningful words ("mama," "dada"). Social: stranger anxiety, separation anxiety, waves bye-bye. Cognitive: object permanence established.', 'medium'),
  ('a1000000-0000-0000-0000-000000000004', 'What is Vygotsky''s Zone of Proximal Development (ZPD)?',                    'The gap between what a learner can do independently and what they can do with guidance. The ZPD represents the optimal space for learning — challenging but achievable with scaffolding from a more capable peer/teacher.', 'hard'),
  ('a1000000-0000-0000-0000-000000000004', 'Describe Kübler-Ross''s five stages of grief.',                              'Denial → Anger → Bargaining → Depression → Acceptance. These stages are not linear; individuals may move between them. Applies to grief, dying, and significant loss.', 'medium'),
  ('a1000000-0000-0000-0000-000000000004', 'What are the hallmarks of Kohlberg''s levels of moral development?',        'Pre-conventional (self-interest, avoiding punishment) → Conventional (social norms, rules, authority) → Post-conventional (universal ethical principles, social contract). Most adults operate at the conventional level.', 'hard'),
  ('a1000000-0000-0000-0000-000000000004', 'What physical changes characterize early adulthood (20s–30s)?',             'Peak physical fitness, bone density, muscle mass, and reproductive capacity. Sensory acuity is at maximum. Chronic disease risk is low but lifestyle factors (diet, exercise, stress) begin shaping long-term health.', 'easy');

-- ============================================================
-- CARDS — Nutrition (10 cards)
-- ============================================================
insert into public.cards (event_id, front, back, difficulty) values
  ('a1000000-0000-0000-0000-000000000005', 'What are the three macronutrients and their caloric values?',                 'Carbohydrates: 4 kcal/g | Protein: 4 kcal/g | Fat: 9 kcal/g. (Alcohol: 7 kcal/g — not a macronutrient but calorically significant)', 'easy'),
  ('a1000000-0000-0000-0000-000000000005', 'What is the difference between fat-soluble and water-soluble vitamins?',     'Fat-soluble (A, D, E, K): stored in adipose and liver, can accumulate to toxic levels. Water-soluble (B vitamins, C): not stored, excess excreted in urine, must be replenished regularly.', 'medium'),
  ('a1000000-0000-0000-0000-000000000005', 'What is the role of vitamin D in the body?',                                 'Regulates calcium and phosphorus absorption in the gut; essential for bone mineralization, immune function, and muscle function. Synthesized in skin via UV-B exposure; also obtained from fortified foods and supplements.', 'medium'),
  ('a1000000-0000-0000-0000-000000000005', 'Explain the difference between complete and incomplete proteins.',           'Complete proteins contain all 9 essential amino acids in adequate amounts (animal proteins, quinoa, soy). Incomplete proteins are deficient in one or more essential amino acids (most plant proteins). Complementary pairing (beans + rice) can supply all EAAs.', 'medium'),
  ('a1000000-0000-0000-0000-000000000005', 'What is BMI and what are the standard classification ranges?',               'Body Mass Index = weight(kg) / height(m)². Underweight: <18.5 | Normal: 18.5–24.9 | Overweight: 25–29.9 | Obese Class I: 30–34.9 | Obese Class II: 35–39.9 | Obese Class III (morbid): ≥40', 'easy'),
  ('a1000000-0000-0000-0000-000000000005', 'What is the glycemic index (GI) and how does it relate to diabetes management?', 'GI measures how quickly a carbohydrate food raises blood glucose compared to pure glucose (GI 100). Low GI (<55) foods cause slower, smaller rises. High GI foods (>70) cause rapid spikes. Low-GI diets help with glycemic control in T2DM.', 'hard'),
  ('a1000000-0000-0000-0000-000000000005', 'What are the functions of dietary fiber?',                                   'Soluble fiber: lowers LDL cholesterol, slows glucose absorption (oats, beans). Insoluble fiber: promotes bowel regularity, prevents constipation (whole grains, vegetables). Both support gut microbiome health.', 'medium'),
  ('a1000000-0000-0000-0000-000000000005', 'What nutritional deficiency causes scurvy, and what are its symptoms?',      'Vitamin C (ascorbic acid) deficiency. Symptoms: impaired collagen synthesis → perifollicular hemorrhages, bleeding gums, poor wound healing, corkscrew hairs, fatigue, joint pain.', 'medium'),
  ('a1000000-0000-0000-0000-000000000005', 'What is the role of iron in the body and what are signs of deficiency?',     'Iron is essential for hemoglobin synthesis and oxygen transport. Deficiency → iron-deficiency anemia: fatigue, pallor, dyspnea, pica (craving non-food items), koilonychia (spoon-shaped nails).', 'medium'),
  ('a1000000-0000-0000-0000-000000000005', 'What does the USDA MyPlate model recommend?',                                'Half the plate: fruits and vegetables. A quarter: lean protein. A quarter: whole grains. Side of low-fat dairy. Emphasizes variety, balance, limiting added sugars, saturated fat, and sodium.', 'easy');

-- ============================================================
-- CARDS — Emergency Medical Technician (10 cards)
-- ============================================================
insert into public.cards (event_id, front, back, difficulty) values
  ('a1000000-0000-0000-0000-000000000006', 'What is the EMT primary assessment sequence?',                               'Form general impression → Assess responsiveness (AVPU) → Airway (open/maintain) → Breathing (rate, quality) → Circulation (pulse, bleeding control) → Disability (neuro status) → Expose (identify life threats). Identify priority transport.', 'medium'),
  ('a1000000-0000-0000-0000-000000000006', 'What does AVPU stand for and how is it used?',                               'Alert (responds normally), Verbal (responds only to voice), Pain (responds only to painful stimulus), Unresponsive (no response). A rapid tool to assess level of consciousness.', 'easy'),
  ('a1000000-0000-0000-0000-000000000006', 'What is the "Golden Hour" in trauma care?',                                  'The concept that critically injured patients have the best chance of survival if they receive definitive surgical care within 60 minutes of injury. Emphasizes rapid assessment, stabilization, and transport.', 'medium'),
  ('a1000000-0000-0000-0000-000000000006', 'What are the signs and symptoms of tension pneumothorax?',                   'Absent breath sounds on affected side, tracheal deviation (away from injury), JVD, hypotension, tachycardia, severe respiratory distress. Life-threatening — requires needle decompression at 2nd intercostal space, midclavicular line.', 'hard'),
  ('a1000000-0000-0000-0000-000000000006', 'Describe the rule of nines for estimating burn surface area in adults.',     'Head & neck: 9% | Each arm: 9% | Anterior trunk: 18% | Posterior trunk: 18% | Each leg: 18% | Perineum: 1% = 100% TBSA. Used to estimate fluid resuscitation needs (Parkland formula).', 'medium'),
  ('a1000000-0000-0000-0000-000000000006', 'What is the correct sequence for adult CPR (AHA guidelines)?',               'C-A-B: Compressions first (30 compressions) → Airway (head-tilt chin-lift) → Breathing (2 rescue breaths). Rate: 100–120/min. Depth: at least 2 inches (5 cm). Allow full recoil. Minimize interruptions.', 'easy'),
  ('a1000000-0000-0000-0000-000000000006', 'What are the three classes of hemorrhage and their characteristics?',        'Class I (<15% blood loss): minimal symptoms. Class II (15–30%): tachycardia, anxiety. Class III (30–40%): tachycardia, hypotension, altered mental status. Class IV (>40%): life-threatening, profound shock.', 'hard'),
  ('a1000000-0000-0000-0000-000000000006', 'What is SAMPLE history and when is it used?',                                'Signs/Symptoms, Allergies, Medications, Pertinent past history, Last oral intake, Events leading to emergency. Used during secondary assessment to gather a focused patient history rapidly.', 'easy'),
  ('a1000000-0000-0000-0000-000000000006', 'What are the signs of respiratory distress in a pediatric patient?',         'Increased RR (tachypnea), nasal flaring, retractions (intercostal, subcostal, suprasternal), grunting, stridor, cyanosis, altered mental status. Children compensate well until sudden decompensation — treat aggressively early.', 'hard'),
  ('a1000000-0000-0000-0000-000000000006', 'What is the difference between anaphylaxis and a mild allergic reaction?',   'Mild: localized urticaria, itching, no systemic involvement. Anaphylaxis: systemic, life-threatening — involves ≥2 organ systems: urticaria + bronchospasm + hypotension. Treatment: epinephrine 0.3mg IM (anterolateral thigh) + BLS support.', 'hard');

-- ============================================================
-- BADGES
-- ============================================================
insert into public.badges (name, description, icon, requirement_type, requirement_value) values
  ('First Steps',    'Review your very first flashcard.',                                 'Footprints',  'cards',   1),
  ('Week Warrior',   'Maintain a 7-day study streak.',                                   'Flame',       'streak',  7),
  ('Century Club',   'Review 100 flashcards total.',                                     'Hash',        'cards',   100),
  ('Perfect Score',  'Score 100% on a practice test.',                                   'Star',        'tests',   100),
  ('Event Master',   'Achieve 90%+ mastery in a single HOSA event.',                    'Trophy',      'mastery', 90),
  ('Grinder',        'Review 500 flashcards total. Dedication personified.',             'Zap',         'cards',   500),
  ('On Fire',        'Maintain a 30-day study streak. Unstoppable.',                     'Flame',       'streak',  30),
  ('Triple Threat',  'Achieve 90%+ mastery in three different HOSA events.',            'Award',       'mastery', 3)
on conflict do nothing;

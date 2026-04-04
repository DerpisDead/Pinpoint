-- ============================================================
-- PinPoint — Migration 005: Expanded HOSA Event Library
-- Updates existing 6 events (correct colors/categories/icons)
-- and adds 52 new events across all 5 categories.
-- ============================================================

-- ── Update existing 6 events ──────────────────────────────────

update public.events set
  category = 'Health Science', color = '#3B82F6', icon = 'FileText'
where id = 'a1000000-0000-0000-0000-000000000001'; -- Medical Terminology

update public.events set
  category = 'Health Science', color = '#3B82F6', icon = 'Activity'
where id = 'a1000000-0000-0000-0000-000000000002'; -- Pathophysiology

update public.events set
  category = 'Health Professions', color = '#8B5CF6', icon = 'HeartPulse'
where id = 'a1000000-0000-0000-0000-000000000003'; -- Clinical Nursing

update public.events set
  category = 'Health Science', color = '#3B82F6', icon = 'Users'
where id = 'a1000000-0000-0000-0000-000000000004'; -- Human Growth & Development

update public.events set
  category = 'Health Science', color = '#3B82F6', icon = 'Apple'
where id = 'a1000000-0000-0000-0000-000000000005'; -- Nutrition

update public.events set
  category = 'Emergency Preparedness', color = '#F59E0B', icon = 'Zap'
where id = 'a1000000-0000-0000-0000-000000000006'; -- Emergency Medical Technician

-- ── New Health Science events ─────────────────────────────────

insert into public.events (id, name, category, description, color, icon) values
  ('b1000000-0000-0000-0000-000000000001', 'Dental Terminology',
   'Health Science',
   'Knowledge of dental terminology, physiology, and pathophysiology used across oral health disciplines.',
   '#3B82F6', 'Stethoscope'),

  ('b1000000-0000-0000-0000-000000000002', 'Health Informatics',
   'Health Science',
   'Management of health information and assimilation of technology in healthcare settings.',
   '#3B82F6', 'Database'),

  ('b1000000-0000-0000-0000-000000000003', 'Medical Law & Ethics',
   'Health Science',
   'Legal and ethical responsibilities of healthcare workers, including HIPAA, informed consent, and professional standards.',
   '#3B82F6', 'Scale'),

  ('b1000000-0000-0000-0000-000000000004', 'Medical Math',
   'Health Science',
   'Mathematical computations common to healthcare — dosage calculations, metric conversions, and vital statistics.',
   '#3B82F6', 'Calculator'),

  ('b1000000-0000-0000-0000-000000000005', 'Medical Reading',
   'Health Science',
   'Comprehension and analysis of health-related literature, research articles, and clinical documentation.',
   '#3B82F6', 'BookOpen'),

  ('b1000000-0000-0000-0000-000000000006', 'Medical Spelling',
   'Health Science',
   'Correct spelling of medical terms used across all health professions and clinical documentation.',
   '#3B82F6', 'SpellCheck'),

  ('b1000000-0000-0000-0000-000000000007', 'Pharmacology',
   'Health Science',
   'Drug classifications, mechanisms of action, side effects, interactions, and patient education principles.',
   '#3B82F6', 'Pill'),

  ('b1000000-0000-0000-0000-000000000008', 'World Health & Disparities',
   'Health Science',
   'Global health issues, social determinants of health, and strategies for overcoming health disparities.',
   '#3B82F6', 'Globe')

on conflict (id) do nothing;

-- ── New Health Professions events ─────────────────────────────

insert into public.events (id, name, category, description, color, icon) values
  ('b2000000-0000-0000-0000-000000000001', 'Biotechnology',
   'Health Professions',
   'Laboratory skills and knowledge of biotechnology techniques used in healthcare and research.',
   '#8B5CF6', 'FlaskConical'),

  ('b2000000-0000-0000-0000-000000000002', 'Clinical Laboratory Science',
   'Health Professions',
   'Laboratory procedures, specimen collection, and analysis used to support clinical diagnosis.',
   '#8B5CF6', 'Microscope'),

  ('b2000000-0000-0000-0000-000000000003', 'Clinical Specialty',
   'Health Professions',
   'In-depth career portfolio and skill demonstration for a chosen health career pathway.',
   '#8B5CF6', 'Award'),

  ('b2000000-0000-0000-0000-000000000004', 'Dental Science',
   'Health Professions',
   'Dental procedures, patient care techniques, and dental materials used in clinical practice.',
   '#8B5CF6', 'Smile'),

  ('b2000000-0000-0000-0000-000000000005', 'Family Medicine Physician',
   'Health Professions',
   'Career exploration through physician interviews, research, and peer presentation of findings.',
   '#8B5CF6', 'UserCheck'),

  ('b2000000-0000-0000-0000-000000000006', 'Home Health Aide',
   'Health Professions',
   'Patient care skills and procedures performed in a home health setting.',
   '#8B5CF6', 'Home'),

  ('b2000000-0000-0000-0000-000000000007', 'Medical Assisting',
   'Health Professions',
   'Administrative and clinical tasks performed in medical offices and outpatient settings.',
   '#8B5CF6', 'ClipboardList'),

  ('b2000000-0000-0000-0000-000000000008', 'Nursing Assisting',
   'Health Professions',
   'Patient care skills and procedures performed under the supervision of registered nurses.',
   '#8B5CF6', 'Bed'),

  ('b2000000-0000-0000-0000-000000000009', 'Occupational Therapy',
   'Health Professions',
   'Knowledge and skills for occupational therapy careers, including therapeutic activities and patient rehabilitation.',
   '#8B5CF6', 'Hand'),

  ('b2000000-0000-0000-0000-000000000010', 'Patient Care Technician',
   'Health Professions',
   'Advanced patient care skills combining nursing assistant and phlebotomy competencies.',
   '#8B5CF6', 'Monitor'),

  ('b2000000-0000-0000-0000-000000000011', 'Personal Care',
   'Health Professions',
   'Patient care skills and procedures for IDEA-classified members in healthcare settings.',
   '#8B5CF6', 'Heart'),

  ('b2000000-0000-0000-0000-000000000012', 'Pharmacy Science',
   'Health Professions',
   'Pharmacy-related knowledge, medication safety, and compounding skills in a simulated pharmacy setting.',
   '#8B5CF6', 'FlaskConical'),

  ('b2000000-0000-0000-0000-000000000013', 'Phlebotomy',
   'Health Professions',
   'Venipuncture techniques, blood collection procedures, and specimen handling protocols.',
   '#8B5CF6', 'Syringe'),

  ('b2000000-0000-0000-0000-000000000014', 'Physical Therapy',
   'Health Professions',
   'Patient care procedures and rehabilitation techniques in a physical therapy setting.',
   '#8B5CF6', 'Dumbbell'),

  ('b2000000-0000-0000-0000-000000000015', 'Respiratory Therapy',
   'Health Professions',
   'Respiratory care procedures, patient assessment, and airway management techniques.',
   '#8B5CF6', 'Wind'),

  ('b2000000-0000-0000-0000-000000000016', 'Sports Medicine',
   'Health Professions',
   'Injury prevention, therapeutic intervention, and emergency care in athletic settings.',
   '#8B5CF6', 'Trophy'),

  ('b2000000-0000-0000-0000-000000000017', 'Surgical Technologist',
   'Health Professions',
   'Surgical procedures, instrumentation selection, and sterile technique in the operating room.',
   '#8B5CF6', 'Scissors'),

  ('b2000000-0000-0000-0000-000000000018', 'Veterinary Science',
   'Health Professions',
   'Animal care, diagnosis, and treatment techniques across species in clinical settings.',
   '#8B5CF6', 'Dog')

on conflict (id) do nothing;

-- ── New Emergency Preparedness events ─────────────────────────

insert into public.events (id, name, category, description, color, icon) values
  ('b3000000-0000-0000-0000-000000000001', 'CERT Skills',
   'Emergency Preparedness',
   'Community Emergency Response Team training and skills for effective disaster response.',
   '#F59E0B', 'Shield'),

  ('b3000000-0000-0000-0000-000000000002', 'CPR/First Aid',
   'Emergency Preparedness',
   'Cardiopulmonary resuscitation and first aid procedures for emergency situations.',
   '#F59E0B', 'Heart'),

  ('b3000000-0000-0000-0000-000000000003', 'Epidemiology',
   'Emergency Preparedness',
   'Disease investigation, data analysis, and public health surveillance methods.',
   '#F59E0B', 'BarChart'),

  ('b3000000-0000-0000-0000-000000000004', 'Life Support Skills',
   'Emergency Preparedness',
   'Basic life support procedures for IDEA-classified members in emergency scenarios.',
   '#F59E0B', 'HeartPulse'),

  ('b3000000-0000-0000-0000-000000000005', 'MRC Partnership',
   'Emergency Preparedness',
   'Medical Reserve Corps volunteer coordination and community emergency preparedness.',
   '#F59E0B', 'Users'),

  ('b3000000-0000-0000-0000-000000000006', 'Public Health',
   'Emergency Preparedness',
   'Community health assessment and health promotion strategies for public wellness.',
   '#F59E0B', 'ShieldCheck'),

  ('b3000000-0000-0000-0000-000000000007', 'Mental Health Promotion',
   'Emergency Preparedness',
   'Mental health awareness, prevention strategies, and social media campaign development.',
   '#F59E0B', 'Brain')

on conflict (id) do nothing;

-- ── New Leadership events ──────────────────────────────────────

insert into public.events (id, name, category, description, color, icon) values
  ('b4000000-0000-0000-0000-000000000001', 'Extemporaneous Writing — Health Policy',
   'Leadership',
   'Writing a persuasive letter to a policymaker on a current health topic within a time limit.',
   '#10B981', 'PenTool'),

  ('b4000000-0000-0000-0000-000000000002', 'Health Career Photography',
   'Leadership',
   'Photography project showcasing health careers with original images and written narrative.',
   '#10B981', 'Camera'),

  ('b4000000-0000-0000-0000-000000000003', 'Healthy Living',
   'Leadership',
   'Personal health lifestyle change documentation and reflection over a period of time.',
   '#10B981', 'Leaf'),

  ('b4000000-0000-0000-0000-000000000004', 'Interviewing Skills',
   'Leadership',
   'Job-seeking interview skills and professional communication for IDEA-classified members.',
   '#10B981', 'MessageSquare'),

  ('b4000000-0000-0000-0000-000000000005', 'Job Seeking Skills',
   'Leadership',
   'Resume writing, job application, and interview skills for entering the health professions workforce.',
   '#10B981', 'Briefcase'),

  ('b4000000-0000-0000-0000-000000000006', 'Prepared Speaking',
   'Leadership',
   'Prepared speech delivery on a health-related topic with original research and presentation.',
   '#10B981', 'Mic'),

  ('b4000000-0000-0000-0000-000000000007', 'Research Poster',
   'Leadership',
   'Scientific research poster design and presentation on a health science topic.',
   '#10B981', 'LayoutGrid'),

  ('b4000000-0000-0000-0000-000000000008', 'Researched Persuasive Writing & Speaking',
   'Leadership',
   'Researched persuasive argument and oral presentation on a health issue.',
   '#10B981', 'Edit'),

  ('b4000000-0000-0000-0000-000000000009', 'Health Career Preparation',
   'Leadership',
   'Resume, personal statement, and interview preparation for health career readiness.',
   '#10B981', 'GraduationCap')

on conflict (id) do nothing;

-- ── New Teamwork events ────────────────────────────────────────

insert into public.events (id, name, category, description, color, icon) values
  ('b5000000-0000-0000-0000-000000000001', 'Biomedical Debate',
   'Teamwork',
   'Team debate on a current biomedical topic with research, argumentation, and rebuttal.',
   '#EC4899', 'MessageCircle'),

  ('b5000000-0000-0000-0000-000000000002', 'Community Awareness',
   'Teamwork',
   'Team-developed community health awareness project with educational materials.',
   '#EC4899', 'Volume2'),

  ('b5000000-0000-0000-0000-000000000003', 'Creative Problem Solving',
   'Teamwork',
   'Team problem-solving challenge addressing a real-world health issue with an innovative solution.',
   '#EC4899', 'Lightbulb'),

  ('b5000000-0000-0000-0000-000000000004', 'Forensic Science',
   'Teamwork',
   'Crime scene analysis, evidence processing, and forensic investigation techniques.',
   '#EC4899', 'Search'),

  ('b5000000-0000-0000-0000-000000000005', 'Health Career Display',
   'Teamwork',
   'Team-created display board exploring and presenting a health career in depth.',
   '#EC4899', 'Layout'),

  ('b5000000-0000-0000-0000-000000000006', 'Health Education',
   'Teamwork',
   'Teaching a health concept with a developed lesson plan and age-appropriate instruction.',
   '#EC4899', 'Book'),

  ('b5000000-0000-0000-0000-000000000007', 'HOSA Bowl',
   'Teamwork',
   'Team quiz bowl competition covering health science topics across all HOSA categories.',
   '#EC4899', 'Zap'),

  ('b5000000-0000-0000-0000-000000000008', 'Medical Innovation',
   'Teamwork',
   'Original invention or prototype designed to solve a healthcare problem.',
   '#EC4899', 'Rocket'),

  ('b5000000-0000-0000-0000-000000000009', 'Public Service Announcement',
   'Teamwork',
   'Team-produced PSA video on a health topic for a target audience.',
   '#EC4899', 'Video'),

  ('b5000000-0000-0000-0000-000000000010', 'Public Health (Teamwork)',
   'Teamwork',
   'Team-based community health project addressing a public health need.',
   '#EC4899', 'Globe')

on conflict (id) do nothing;

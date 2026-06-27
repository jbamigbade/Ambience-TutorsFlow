-- Ambience TutorsFlow™ Production Seeding Script
-- Designed for Supabase Local PostgreSQL or Live Schema Setup
-- Seeding essential testing profiles, role-specific accounts, availability, bookings, 
-- assignments, chats, invoices, IEP goals, and Character Education milestones.
-- Soli Deo Gloria — Constructed with precision and academic integrity.

-- =========================================================================
-- 1. CLEAN UP PREVIOUS SEEDS (DANGER: Idempotent operations preferred)
-- =========================================================================
-- The schema uses CASCADE delete constraints, so deleting profiles cascaded into tutors, students, etc.
-- But we can use INSERT ... ON CONFLICT DO NOTHING or conditional updates instead to keep seeding safe.

-- =========================================================================
-- 2. CREATE ORGANIZATIONS
-- =========================================================================
INSERT INTO public.organizations (id, name, domain, stripe_account_id)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Ambience Academy Core',
    'ambience-academy.org',
    'acct_1Mzh36Fj3m6G82e9'
) ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 3. CREATE AUTH USERS (auth.users is managed by Supabase auth engine)
-- =========================================================================
-- Since public.profiles has a foreign key to auth.users, we seed auth.users first.
-- In local or hosted Supabase database, inserting into auth.users is standard for testing.

-- 1 Platform Admin User
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES (
    '10000000-1000-1000-1000-100000000001',
    '00000000-0000-0000-0000-000000000000',
    'admin@ambience.com',
    '$2a$10$r88u7XW2bV07K7rYgEqKtePZ8A5fX4z3N79m4lSleV80.f6n7oY9q', -- hashed 'password123'
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Admin Director", "role": "Admin", "avatar_url": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"}'::jsonb,
    FALSE,
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 2 Tutors
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES 
(
    '20000000-2000-2000-2000-200000000001',
    '00000000-0000-0000-0000-000000000000',
    'tutor.catherine@ambience.com',
    '$2a$10$r88u7XW2bV07K7rYgEqKtePZ8A5fX4z3N79m4lSleV80.f6n7oY9q', -- hashed 'password123'
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Dr. Catherine Sterling", "role": "Tutor", "avatar_url": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200"}'::jsonb,
    FALSE,
    'authenticated',
    'authenticated'
),
(
    '20000000-2000-2000-2000-200000000002',
    '00000000-0000-0000-0000-000000000000',
    'tutor.marcus@ambience.com',
    '$2a$10$r88u7XW2bV07K7rYgEqKtePZ8A5fX4z3N79m4lSleV80.f6n7oY9q', -- hashed 'password123'
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Marcus Aurelius Vance", "role": "Tutor", "avatar_url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200"}'::jsonb,
    FALSE,
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 2 Parents
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES 
(
    '30000000-3000-3000-3000-300000000001',
    '00000000-0000-0000-0000-000000000000',
    'parent.jonathan@ambience.com',
    '$2a$10$r88u7XW2bV07K7rYgEqKtePZ8A5fX4z3N79m4lSleV80.f6n7oY9q',
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Jonathan Edwards Sterling", "role": "Parent", "avatar_url": "https://images.unsplash.com/photo-1542909168-82c3e7fdca5c?auto=format&fit=crop&q=80&w=200"}'::jsonb,
    FALSE,
    'authenticated',
    'authenticated'
),
(
    '30000000-3000-3000-3000-300000000002',
    '00000000-0000-0000-0000-000000000000',
    'parent.elizabeth@ambience.com',
    '$2a$10$r88u7XW2bV07K7rYgEqKtePZ8A5fX4z3N79m4lSleV80.f6n7oY9q',
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Elizabeth Edwards Vance", "role": "Parent", "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}'::jsonb,
    FALSE,
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- 4 Students
INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, role, aud)
VALUES 
(
    '40000000-4000-4000-4000-400000000001',
    '00000000-0000-0000-0000-000000000000',
    'student.caleb@ambience.com',
    '$2a$10$r88u7XW2bV07K7rYgEqKtePZ8A5fX4z3N79m4lSleV80.f6n7oY9q',
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Caleb Sterling", "role": "Student", "avatar_url": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200"}'::jsonb,
    FALSE,
    'authenticated',
    'authenticated'
),
(
    '40000000-4000-4000-4000-400000000002',
    '00000000-0000-0000-0000-000000000000',
    'student.abigail@ambience.com',
    '$2a$10$r88u7XW2bV07K7rYgEqKtePZ8A5fX4z3N79m4lSleV80.f6n7oY9q',
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Abigail Sterling", "role": "Student", "avatar_url": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200"}'::jsonb,
    FALSE,
    'authenticated',
    'authenticated'
),
(
    '40000000-4000-4000-4000-400000000003',
    '00000000-0000-0000-0000-000000000000',
    'student.samuel@ambience.com',
    '$2a$10$r88u7XW2bV07K7rYgEqKtePZ8A5fX4z3N79m4lSleV80.f6n7oY9q',
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Samuel Vance", "role": "Student", "avatar_url": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"}'::jsonb,
    FALSE,
    'authenticated',
    'authenticated'
),
(
    '40000000-4000-4000-4000-400000000004',
    '00000000-0000-0000-0000-000000000000',
    'student.sophia@ambience.com',
    '$2a$10$r88u7XW2bV07K7rYgEqKtePZ8A5fX4z3N79m4lSleV80.f6n7oY9q',
    NOW(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    '{"name": "Sophia Vance", "role": "Student", "avatar_url": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"}'::jsonb,
    FALSE,
    'authenticated',
    'authenticated'
) ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 4. LINK SIGNED-UP USERS TO ORGANIZATION & ASSIGN PROFILES
-- =========================================================================
-- The triggers (on_auth_user_created) create public.profiles, public.tutors, and public.students.
-- Let's update details now to make them complete and associate them with the Organization.

UPDATE public.profiles 
SET organization_id = '00000000-0000-0000-0000-000000000001';

-- Update Tutors specialties and details
UPDATE public.tutors
SET specialty_role = 'Senior STEM & Physics Mentor',
    bio = 'PhD in Applied Physics. Over 10 years of mentoring high school scholars with interactive learning programs, preparing them for premium collegiate platforms.',
    languages = '{"English", "Spanish"}'::TEXT[],
    grade_levels = '{"Middle School", "High School"}'::TEXT[],
    specialties = '{"Physics", "Calculus", "Chemistry"}'::TEXT[],
    subjects = '{"Physics", "Calculus", "Chemistry"}'::TEXT[],
    zoom_status = 'Connected'
WHERE id = '20000000-2000-2000-2000-200000000001';

UPDATE public.tutors
SET specialty_role = 'Classical Humanities & Logic Specialist',
    bio = 'Classical Educator. Committed to nurturing noble mindsets through rigorous study of logic, philosophy, classical literature, and ancient civilizations.',
    languages = '{"English", "Latin"}'::TEXT[],
    grade_levels = '{"High School", "College Prep"}'::TEXT[],
    specialties = '{"Logic & Rhetoric", "Classical Civilizations", "Literature Analysis"}'::TEXT[],
    subjects = '{"Logic", "History", "Literature"}'::TEXT[],
    zoom_status = 'Connected'
WHERE id = '20000000-2000-2000-2000-200000000002';

-- Update Student associations (Parent linking, goals, progress states)
UPDATE public.students
SET grade = '11th Grade',
    parent_id = '30000000-3000-3000-3000-300000000001',
    level = 'Scholar',
    points = 120,
    streak = 5,
    completed_sessions = 14,
    overall_progress = 75,
    weekly_character_theme = 'Responsibility & Devotion',
    leadership_goals = 'Mastering college-prep Physics and dedicating 2 hours weekly to service.',
    character_integrity = 5,
    character_responsibility = 4,
    character_kindness = 5,
    character_perseverance = 4,
    character_leadership = 5,
    unlocked_badges = '{"🌱", "🎯", "⭐"}'::TEXT[],
    iep_intervention_plan = 'IEP Accommodation Plan: Student benefits from visual physics simulations, structured math formula guides, and frequent comprehension checkpoints.'
WHERE id = '40000000-4000-4000-4000-400000000001';

UPDATE public.students
SET grade = '8th Grade',
    parent_id = '30000000-3000-3000-3000-300000000001',
    level = 'Rising Star',
    points = 45,
    streak = 2,
    completed_sessions = 6,
    overall_progress = 40,
    weekly_character_theme = 'Kindness & Community',
    leadership_goals = 'Overcoming math anxieties and supporting church youth tutoring programs.',
    character_integrity = 4,
    character_responsibility = 3,
    character_kindness = 5,
    character_perseverance = 4,
    character_leadership = 3,
    unlocked_badges = '{"🌱"}'::TEXT[],
    iep_intervention_plan = 'IEP Accommodation Plan: Break complex geometric logic into smaller sequential steps. Enable additional review time for assessments.'
WHERE id = '40000000-4000-4000-4000-400000000002';

UPDATE public.students
SET grade = '12th Grade',
    parent_id = '30000000-3000-3000-3000-300000000002',
    level = 'Ambassador',
    points = 210,
    streak = 12,
    completed_sessions = 28,
    overall_progress = 90,
    weekly_character_theme = 'Integrity & Intellectual Humility',
    leadership_goals = 'Leading the debate club with honor and organizing logic symposiums.',
    character_integrity = 5,
    character_responsibility = 5,
    character_kindness = 4,
    character_perseverance = 5,
    character_leadership = 5,
    unlocked_badges = '{"🌱", "🎯", "⭐", "👑", "🔥"}'::TEXT[],
    iep_intervention_plan = NULL
WHERE id = '40000000-4000-4000-4000-400000000003';

UPDATE public.students
SET grade = '9th Grade',
    parent_id = '30000000-3000-3000-3000-300000000002',
    level = 'Builder',
    points = 80,
    streak = 4,
    completed_sessions = 9,
    overall_progress = 55,
    weekly_character_theme = 'Perseverance & Grit',
    leadership_goals = 'Steadily improving essay structures and finishing classical literature challenges.',
    character_integrity = 4,
    character_responsibility = 4,
    character_kindness = 4,
    character_perseverance = 5,
    character_leadership = 3,
    unlocked_badges = '{"🌱", "🎯"}'::TEXT[],
    iep_intervention_plan = NULL
WHERE id = '40000000-4000-4000-4000-400000000004';

-- =========================================================================
-- 5. RECURRING TUTOR WEEKLY AVAILABILITY
-- =========================================================================
INSERT INTO public.tutor_availability (tutor_id, day_week, start_time, end_time)
VALUES 
-- Dr. Catherine Sterling availability
('20000000-2000-2000-2000-200000000001', 'Monday', '16:00:00', '17:00:00'),
('20000000-2000-2000-2000-200000000001', 'Monday', '17:15:00', '18:15:00'),
('20000000-2000-2000-2000-200000000001', 'Wednesday', '15:30:00', '16:30:00'),
('20000000-2000-2000-2000-200000000001', 'Wednesday', '17:15:00', '18:15:00'),
('20000000-2000-2000-2000-200000000001', 'Friday', '16:00:00', '17:00:00'),
-- Marcus Vance availability
('20000000-2000-2000-2000-200000000002', 'Tuesday', '15:30:00', '16:30:00'),
('20000000-2000-2000-2000-200000000002', 'Tuesday', '16:00:00', '17:00:00'),
('20000000-2000-2000-2000-200000000002', 'Thursday', '17:15:00', '18:15:00'),
('20000000-2000-2000-2000-200000000002', 'Thursday', '18:30:00', '19:30:00')
ON CONFLICT DO NOTHING;

-- =========================================================================
-- 6. SAMPLE BOOKINGS & ZOOM MEETING CONFIGURATIONS
-- =========================================================================
-- Future dates so they show on active schedules
INSERT INTO public.bookings (id, student_id, tutor_id, subject, date, time_slot, status, zoom_meeting_id, zoom_join_url, zoom_start_url, is_paid)
VALUES 
-- Active/Confirmed Session today/tomorrow
(
    '50000000-5000-5000-5000-500000000001',
    '40000000-4000-4000-4000-400000000001', -- Caleb
    '20000000-2000-2000-2000-200000000001', -- Dr. Catherine
    'AP Physics',
    CURRENT_DATE + INTERVAL '1 day',
    '4:00 PM - 5:00 PM',
    'Confirmed',
    '87941253654',
    'https://zoom.us/j/87941253654?pwd=simulatedJoinCaleb',
    'https://zoom.us/s/87941253654?role=host&tutor=20000000-2000-2000-2000-200000000001',
    TRUE
),
-- Completed past session
(
    '50000000-5000-5000-5000-500000000002',
    '40000000-4000-4000-4000-400000000001', -- Caleb
    '20000000-2000-2000-2000-200000000001', -- Dr. Catherine
    'Calculus BC',
    CURRENT_DATE - INTERVAL '2 days',
    '5:15 PM - 6:15 PM',
    'Completed',
    '87941253655',
    'https://zoom.us/j/87941253655?pwd=simulatedCompleted',
    'https://zoom.us/s/87941253655?role=host&tutor=20000000-2000-2000-2000-200000000001',
    TRUE
),
-- Confirmed Session for Samuel with Marcus Vance
(
    '50000000-5000-5000-5000-500000000003',
    '40000000-4000-4000-4000-400000000003', -- Samuel
    '20000000-2000-2000-2000-200000000002', -- Marcus Vance
    'Formal Logic',
    CURRENT_DATE + INTERVAL '2 days',
    '5:15 PM - 6:15 PM',
    'Confirmed',
    '87941253656',
    'https://zoom.us/j/87941253656?pwd=simulatedJoinSamuel',
    'https://zoom.us/s/87941253656?role=host&tutor=20000000-2000-2000-2000-200000000002',
    TRUE
) ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 7. ASSIGNMENTS / HOMEWORK ITEMS
-- =========================================================================
INSERT INTO public.assignments (id, student_id, title, subject, description, due_date, points_award, status)
VALUES 
(
    '60000000-6000-6000-6000-600000000001',
    '40000000-4000-4000-4000-400000000001', -- Caleb
    'Electromagnetic Induction Problems',
    'AP Physics',
    'Solve exercises 1-15 on Lenz''s Law and Faraday''s Induction equations. Show clean step-by-step vector mechanics.',
    CURRENT_DATE + INTERVAL '3 days',
    40,
    'Pending'
),
(
    '60000000-6000-6000-6000-600000000002',
    '40000000-4000-4000-4000-400000000001', -- Caleb
    'Optimization & Related Rates',
    'Calculus BC',
    'Complete the review packet on cylindrical optimization constraints. Bring questions to our next review block.',
    CURRENT_DATE - INTERVAL '1 day',
    30,
    'Completed'
),
(
    '60000000-6000-6000-6000-600000000003',
    '40000000-4000-4000-4000-400000000003', -- Samuel
    'Analysis of Syllogistic Fallacies',
    'Formal Logic',
    'Write a 2-page essay breaking down formal fallacies in classic editorial literature. Ground assertions on Aristotelian logic rules.',
    CURRENT_DATE + INTERVAL '5 days',
    50,
    'Pending'
) ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 8. SECURE CHAT MESSAGES
-- =========================================================================
INSERT INTO public.messages (id, sender_id, receiver_id, message_text, is_unread)
VALUES 
(
    '70000000-7000-7000-7000-700000000001',
    '30000000-3000-3000-3000-300000000001', -- Jonathan (Parent)
    '20000000-2000-2000-2000-200000000001', -- Dr. Catherine (Tutor)
    'Hello Dr. Catherine, Caleb has been working hard on his physics simulations! We are very grateful for your visual guidance method.',
    FALSE
),
(
    '70000000-7000-7000-7000-700000000002',
    '20000000-2000-2000-2000-200000000001', -- Dr. Catherine
    '30000000-3000-3000-3000-300000000001', -- Jonathan (Parent)
    'Thank you Jonathan! Caleb possesses wonderful mathematical instincts. He is making premium progress in mechanics and demonstrates high integrity.',
    TRUE
),
(
    '70000000-7000-7000-7000-700000000003',
    '10000000-1000-1000-1000-100000000001', -- Admin
    '20000000-2000-2000-2000-200000000002', -- Marcus Vance
    'Hi Marcus, please ensure you complete Samuel''s weekly Character Education notes by Friday evening.',
    FALSE
) ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 9. IEP SUPPORT RECORDS
-- =========================================================================
-- Seeding specific IEP records for Abigail and Caleb
INSERT INTO public.iep_goals (student_id, goal_text, progress_percentage)
VALUES 
('40000000-4000-4000-4000-400000000001', 'Formulate AP-level mechanical equations independently with 85% accuracy.', 80),
('40000000-4000-4000-4000-400000000002', 'Solve multi-step geometric theorems with formula outlines and zero tutor prompting.', 50)
ON CONFLICT DO NOTHING;

INSERT INTO public.iep_accommodations (student_id, accommodation_text)
VALUES 
('40000000-4000-4000-4000-400000000001', 'Utilize interactive physics vector software and sandbox coordinate boards.'),
('40000000-4000-4000-4000-400000000002', 'Provide visual scaffolding cards for geometric proof structures.')
ON CONFLICT DO NOTHING;

INSERT INTO public.iep_observations (student_id, tutor_id, observation_text)
VALUES 
(
    '40000000-4000-4000-4000-400000000001', 
    '20000000-2000-2000-2000-200000000001', 
    'Caleb worked on induction fields today. Using the interactive software, he mapped the magnetic field vectors flawlessly without structural aids.'
) ON CONFLICT DO NOTHING;

-- =========================================================================
-- 10. CHARACTER EDUCATION MILESTONES
-- =========================================================================
-- Seeding Character Notes by Tutors
INSERT INTO public.character_notes (student_id, tutor_id, theme, student_response, strength_observed, area_for_growth, recommendation)
VALUES 
(
    '40000000-4000-4000-4000-400000000001', -- Caleb
    '20000000-2000-2000-2000-200000000001', -- Dr. Catherine
    'Responsibility',
    'Caleb arrived 5 minutes early, had all his previous vectors pre-loaded, and answered questions with humble confidence.',
    'Highly accountable and demonstrates supreme intellectual honesty when challenged by hard concepts.',
    'Sometimes rushes equations to finish early.',
    'Encourage Caleb to systematically proofread vector directions before finalizing calculations.'
) ON CONFLICT DO NOTHING;

-- Seeding Student Character Reflections
INSERT INTO public.character_reflections (student_id, theme, reflection_text)
VALUES 
(
    '40000000-4000-4000-4000-400000000001', -- Caleb
    'Responsibility',
    'I realized that taking charge of my homework pre-planning helps my parents and shows respect for Dr. Catherine''s dedication. Doing hard work is a service to others.'
) ON CONFLICT DO NOTHING;

-- Seeding Parent Encouragements
INSERT INTO public.parent_encouragements (student_id, parent_id, encouragement_text)
VALUES 
(
    '40000000-4000-4000-4000-400000000001', -- Caleb
    '30000000-3000-3000-3000-300000000001', -- Jonathan (Parent)
    'Caleb, we are extremely proud of your diligence in AP Physics. Your dedication to understanding the beauty of creation through physical mechanics is an encouragement to our entire family!'
) ON CONFLICT DO NOTHING;

-- =========================================================================
-- 11. FINANCIAL INVOICES
-- =========================================================================
INSERT INTO public.invoices (id, parent_id, student_name, amount, due_date, status, billing_period, service_description)
VALUES 
(
    '80000000-8000-8000-8000-800000000001',
    '30000000-3000-3000-3000-300000000001', -- Parent Jonathan
    'Caleb Sterling',
    150.00,
    CURRENT_DATE + INTERVAL '7 days',
    'Unpaid',
    'June 2026 Academic Cycle',
    '2 Confirmed Academic Sessions - AP Physics Prep with Dr. Catherine Sterling'
),
(
    '80000000-8000-8000-8000-800000000002',
    '30000000-3000-3000-3000-300000000001', -- Parent Jonathan
    'Caleb Sterling',
    75.00,
    CURRENT_DATE - INTERVAL '10 days',
    'Paid',
    'May 2026 Academic Cycle',
    '1 Completed Academic Session - Calculus BC Review with Dr. Catherine Sterling'
) ON CONFLICT (id) DO NOTHING;

-- Seeding Completed. Soli Deo Gloria.

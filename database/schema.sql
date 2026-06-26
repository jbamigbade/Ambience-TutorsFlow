-- Ambience TutorsFlow™ Production PostgreSQL Database Schema
-- Designed for Supabase with Row Level Security (RLS), custom functions, and triggers
-- Soli Deo Gloria — Built for scalability, security, and noble academic excellence.

-- ==========================================
-- 1. EXTENSIONS & TYPES
-- ==========================================

-- Enable UUID generation extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums for Roles, Statuses, etc.
CREATE TYPE user_role AS ENUM ('Admin', 'Tutor', 'Parent', 'Student');
CREATE TYPE session_status AS ENUM ('Pending', 'Confirmed', 'Completed', 'Cancelled');
CREATE TYPE assignment_status AS ENUM ('Pending', 'Completed');
CREATE TYPE invoice_status AS ENUM ('Paid', 'Unpaid', 'Overdue');
CREATE TYPE student_level AS ENUM ('Explorer', 'Rising Star', 'Builder', 'Scholar', 'Achiever', 'Ambassador');

-- ==========================================
-- 2. PUBLIC PROFILES & USER ROLES
-- ==========================================

-- Profiles table (extends auth.users from Supabase)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'Student',
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 3. ROLE-SPECIFIC PROFILES
-- ==========================================

-- Tutor Profiles Table
CREATE TABLE public.tutors (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    specialty_role TEXT NOT NULL DEFAULT 'Academic Tutor',
    bio TEXT DEFAULT 'Dedicated educator committed to cultivating student potentials.',
    rating NUMERIC(3, 2) DEFAULT 5.0 NOT NULL,
    reviews_count INT DEFAULT 0 NOT NULL,
    subjects TEXT[] DEFAULT '{}'::TEXT[],
    zoom_status TEXT DEFAULT 'Not Connected' NOT NULL, -- Connected, Not Connected, Reconnect Required
    zoom_manual_link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Student Profiles Table
CREATE TABLE public.students (
    id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
    grade TEXT NOT NULL DEFAULT '11th Grade',
    parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Self-referencing link to Parent Profile
    level student_level NOT NULL DEFAULT 'Explorer',
    points INT DEFAULT 0 NOT NULL,
    streak INT DEFAULT 1 NOT NULL,
    completed_sessions INT DEFAULT 0 NOT NULL,
    overall_progress INT DEFAULT 0 NOT NULL, -- percentage integer 0-100
    weekly_character_theme TEXT DEFAULT 'Responsibility & Integrity',
    leadership_goals TEXT DEFAULT 'Honoring my schedule and supporting classmates.',
    character_integrity INT DEFAULT 3 NOT NULL, -- scale of 1-5
    character_responsibility INT DEFAULT 3 NOT NULL,
    character_kindness INT DEFAULT 3 NOT NULL,
    character_perseverance INT DEFAULT 3 NOT NULL,
    character_leadership INT DEFAULT 3 NOT NULL,
    unlocked_badges TEXT[] DEFAULT '{🌱}'::TEXT[],
    iep_intervention_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on specific profiles
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 4. INDIVIDUALIZED EDUCATION PROGRAM (IEP)
-- ==========================================

-- IEP Goals Table
CREATE TABLE public.iep_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    goal_text TEXT NOT NULL,
    progress_percentage INT DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- IEP Accommodations Table
CREATE TABLE public.iep_accommodations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    accommodation_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- IEP Observations Log
CREATE TABLE public.iep_observations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL NOT NULL,
    observation_text TEXT NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.iep_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iep_accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iep_observations ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 5. ACADEMIC BOOKINGS & ZOOM MEETINGS
-- ==========================================

-- Academic Bookings Table
CREATE TABLE public.bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    date DATE NOT NULL,
    time_slot TEXT NOT NULL, -- e.g., '4:00 PM - 5:00 PM'
    status session_status NOT NULL DEFAULT 'Confirmed',
    zoom_meeting_id TEXT,
    zoom_join_url TEXT,
    zoom_start_url TEXT, -- GATED (Only visible to host tutor)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 6. ASSIGNMENTS
-- ==========================================

-- Assignments Table
CREATE TABLE public.assignments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    points_award INT DEFAULT 30 NOT NULL,
    status assignment_status NOT NULL DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 7. SESSION LOGS & REFLECTIONS
-- ==========================================

-- Academic Session Notes
CREATE TABLE public.session_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL NOT NULL,
    subject TEXT NOT NULL,
    summary TEXT NOT NULL,
    next_steps TEXT,
    logged_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Character Notes by Tutors
CREATE TABLE public.character_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL NOT NULL,
    theme TEXT NOT NULL, -- e.g. "Responsibility", "Integrity"
    student_response TEXT NOT NULL,
    strength_observed TEXT,
    area_for_growth TEXT,
    recommendation TEXT,
    logged_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Student Character Reflections
CREATE TABLE public.character_reflections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    theme TEXT NOT NULL,
    reflection_text TEXT NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Parent Encouragement Notes
CREATE TABLE public.parent_encouragements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    encouragement_text TEXT NOT NULL,
    logged_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.session_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_encouragements ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 8. SECURE CHAT MESSAGING
-- ==========================================

-- Messages Table
CREATE TABLE public.messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message_text TEXT NOT NULL,
    is_unread BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 9. FINANCIAL BILLING & INVOICES
-- ==========================================

-- Invoices Table
CREATE TABLE public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- Invoice belongs to the parent
    student_name TEXT NOT NULL, -- convenient display
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status NOT NULL DEFAULT 'Unpaid',
    billing_period TEXT NOT NULL, -- e.g. "June 1 - June 14, 2026"
    service_description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- 10. SYSTEM HELPER FUNCTIONS & TRIGGERS
-- ==========================================

-- Helper: Retrieve current user's role from public.profiles
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER;

-- Trigger Handler: Automatically create a profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER AS $$
DECLARE
  default_name TEXT;
  user_meta_role TEXT;
  assigned_role user_role;
BEGIN
  -- Extract display name or default to email prefix
  default_name := COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  user_meta_role := COALESCE(new.raw_user_meta_data->>'role', 'Student');
  
  -- Match input role against valid user_role enums
  IF user_meta_role = 'Admin' THEN
    assigned_role := 'Admin';
  ELSIF user_meta_role = 'Tutor' THEN
    assigned_role := 'Tutor';
  ELSIF user_meta_role = 'Parent' THEN
    assigned_role := 'Parent';
  ELSE
    assigned_role := 'Student';
  END IF;

  -- Create default profile in public profiles
  INSERT INTO public.profiles (id, name, email, role, avatar_url)
  VALUES (
    new.id,
    default_name,
    new.email,
    assigned_role,
    COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200')
  );

  -- Create role-specific record
  IF assigned_role = 'Tutor' THEN
    INSERT INTO public.tutors (id, specialty_role, subjects)
    VALUES (new.id, 'Senior Academic Specialist', '{}');
  ELSIF assigned_role = 'Student' THEN
    INSERT INTO public.students (id, level, points, streak, overall_progress)
    VALUES (new.id, 'Explorer', 0, 1, 0);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create Signup Trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();

-- ==========================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- --- Profiles Policies ---
CREATE POLICY "Public profiles are visible to authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile details"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- --- Tutor Policies ---
CREATE POLICY "Tutors details are readable by all authenticated users"
  ON public.tutors FOR SELECT TO authenticated USING (true);

CREATE POLICY "Tutors can update their own specialty profiles"
  ON public.tutors FOR UPDATE TO authenticated USING (auth.uid() = id);

-- --- Student Policies ---
CREATE POLICY "Student profiles are visible to linked parent"
  ON public.students FOR SELECT TO authenticated USING (
    auth.uid() = id OR auth.uid() = parent_id OR public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors or Parents can update student details"
  ON public.students FOR UPDATE TO authenticated USING (
    auth.uid() = id OR auth.uid() = parent_id OR public.get_current_user_role() IN ('Tutor', 'Admin')
  );

-- --- IEP Policies ---
CREATE POLICY "IEP items are visible to linked parents, students, tutors, and admins"
  ON public.iep_goals FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR 
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors or Admins can insert/update IEP goals"
  ON public.iep_goals FOR ALL TO authenticated USING (
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

-- (Apply same logic to Accommodations and Observations logs)
CREATE POLICY "IEP accommodations visible to student, parent, tutor, admin"
  ON public.iep_accommodations FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR 
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors/Admins can write accommodations"
  ON public.iep_accommodations FOR ALL TO authenticated USING (
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "IEP observations visible to parent, tutor, admin"
  ON public.iep_observations FOR SELECT TO authenticated USING (
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors can record observations"
  ON public.iep_observations FOR ALL TO authenticated USING (
    tutor_id = auth.uid() OR public.get_current_user_role() = 'Admin'
  );

-- --- Bookings Policies ---
CREATE POLICY "Users can view bookings they are party to"
  ON public.bookings FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR
    tutor_id = auth.uid() OR
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() = 'Admin'
  );

CREATE POLICY "Tutors, Parents, and Admins can create bookings"
  ON public.bookings FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() IN ('Tutor', 'Parent', 'Admin')
  );

CREATE POLICY "Booking updates allowed for tutors, parents, and admins"
  ON public.bookings FOR UPDATE TO authenticated USING (
    student_id = auth.uid() OR
    tutor_id = auth.uid() OR
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() = 'Admin'
  );

-- --- Assignments Policies ---
CREATE POLICY "Users can read relevant assignments"
  ON public.assignments FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors and Admins can manage assignments"
  ON public.assignments FOR ALL TO authenticated USING (
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Students can update assignment completion status"
  ON public.assignments FOR UPDATE TO authenticated USING (
    student_id = auth.uid()
  );

-- --- Invoices Policies ---
CREATE POLICY "Parents can read their own billing invoices"
  ON public.invoices FOR SELECT TO authenticated USING (
    parent_id = auth.uid() OR public.get_current_user_role() = 'Admin'
  );

CREATE POLICY "Admins can manage invoices"
  ON public.invoices FOR ALL TO authenticated USING (
    public.get_current_user_role() = 'Admin'
  );

-- --- Message Policies ---
CREATE POLICY "Users can view their private conversations"
  ON public.messages FOR SELECT TO authenticated USING (
    sender_id = auth.uid() OR receiver_id = auth.uid()
  );

CREATE POLICY "Users can dispatch messages"
  ON public.messages FOR INSERT TO authenticated WITH CHECK (
    sender_id = auth.uid()
  );

-- --- Session Notes & Character Education Policies ---
CREATE POLICY "Session notes visible to parents, tutors, and admins"
  ON public.session_notes FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR 
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors can manage session notes"
  ON public.session_notes FOR ALL TO authenticated USING (
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Character notes readable by parents, tutors, admins"
  ON public.character_notes FOR SELECT TO authenticated USING (
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors can log character observations"
  ON public.character_notes FOR ALL TO authenticated USING (
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Character reflections visible to parent, student, tutor, admin"
  ON public.character_reflections FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Students can post their own character reflections"
  ON public.character_reflections FOR INSERT TO authenticated WITH CHECK (
    student_id = auth.uid()
  );

CREATE POLICY "Parent encouragements readable by student, parent, tutor, admin"
  ON public.parent_encouragements FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR
    parent_id = auth.uid() OR
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Parents can insert encouragements"
  ON public.parent_encouragements FOR INSERT TO authenticated WITH CHECK (
    parent_id = auth.uid()
  );

-- Phase 6 Migration: AI Lesson Planner & AI IEP Assistant Database Schema
-- Soli Deo Gloria — Prepared for academic excellence, character monitoring, and multi-tenant isolation.

-- 1. Create Lesson Plans Table
CREATE TABLE IF NOT EXISTS public.lesson_plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- can be null for general plans
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    duration TEXT NOT NULL, -- e.g. "45 minutes" or "60 minutes"
    learning_objective TEXT,
    difficulty TEXT NOT NULL,
    config JSONB DEFAULT '{}'::JSONB NOT NULL, -- e.g. { include_homework, include_assessment, include_character_education }
    content JSONB DEFAULT '{}'::JSONB NOT NULL, -- full JSON block containing title, warm_up, direct_instruction, exit_ticket, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Lesson Plans
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

-- Lesson Plans Policies
CREATE POLICY "Lesson plans are visible to assigned student, tutor, parent, or admin"
  ON public.lesson_plans FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR
    tutor_id = auth.uid() OR
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors or Admins can insert lesson plans"
  ON public.lesson_plans FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors or Admins can update/delete their own lesson plans"
  ON public.lesson_plans FOR ALL TO authenticated USING (
    tutor_id = auth.uid() OR public.get_current_user_role() = 'Admin'
  );


-- 2. Create IEP Notes / Reports Table
CREATE TABLE IF NOT EXISTS public.iep_notes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL NOT NULL,
    strengths TEXT NOT NULL,
    challenges TEXT NOT NULL,
    accommodations TEXT NOT NULL, -- suggested accommodations
    goals TEXT NOT NULL, -- drafted goals
    progress_notes TEXT NOT NULL,
    parent_summary TEXT NOT NULL,
    tutor_steps TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for IEP Notes
ALTER TABLE public.iep_notes ENABLE ROW LEVEL SECURITY;

-- IEP Notes Policies
CREATE POLICY "IEP notes are visible to assigned student, tutor, linked parent, or admin"
  ON public.iep_notes FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR
    tutor_id = auth.uid() OR
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors or Admins can insert IEP notes"
  ON public.iep_notes FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors or Admins can update/delete their own IEP notes"
  ON public.iep_notes FOR ALL TO authenticated USING (
    tutor_id = auth.uid() OR public.get_current_user_role() = 'Admin'
  );

-- Phase 7 Migration: AI Tutor Copilot Database Schema
-- Soli Deo Gloria — Prepared for academic excellence, real-time live copilot coaching, and multi-tenant isolation.

-- 1. Create Tutor Copilot Records Table
CREATE TABLE IF NOT EXISTS public.copilot_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- can be null for general copilot help
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    session_context TEXT,
    student_challenge TEXT,
    support_type TEXT,
    content JSONB DEFAULT '{}'::JSONB NOT NULL, -- full JSON block containing explanations, teaching guide, example problem, practice, hints, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Copilot Records
ALTER TABLE public.copilot_records ENABLE ROW LEVEL SECURITY;

-- Copilot Records Policies
CREATE POLICY "Copilot records are visible to assigned student, tutor, parent, or admin"
  ON public.copilot_records FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR
    tutor_id = auth.uid() OR
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors or Admins can insert copilot records"
  ON public.copilot_records FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors or Admins can update/delete their own copilot records"
  ON public.copilot_records FOR ALL TO authenticated USING (
    tutor_id = auth.uid() OR public.get_current_user_role() = 'Admin'
  );

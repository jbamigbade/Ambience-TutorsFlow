-- Phase 4 Migration: AI Test Q&A Generator™ Database Schema
-- Soli Deo Gloria — Built for scalability, security, and noble academic excellence.

CREATE TABLE IF NOT EXISTS public.practice_tests (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- nullable if not assigned to a specific student
    tutor_id UUID REFERENCES public.tutors(id) ON DELETE SET NULL, -- nullable if system-generated or tutor deleted
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    grade_level TEXT NOT NULL,
    difficulty TEXT NOT NULL,
    config JSONB DEFAULT '{}'::JSONB NOT NULL, -- e.g. { question_count, question_type, include_solutions, include_answer_key }
    content JSONB DEFAULT '[]'::JSONB NOT NULL, -- list of questions with answers, solutions, hints, common mistakes, teacher notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.practice_tests ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Practice tests are visible to assigned student, tutor, linked parent, or admin"
  ON public.practice_tests FOR SELECT TO authenticated USING (
    student_id = auth.uid() OR
    tutor_id = auth.uid() OR
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors or Admins can insert practice tests"
  ON public.practice_tests FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Tutors or Admins can update/delete their own practice tests"
  ON public.practice_tests FOR ALL TO authenticated USING (
    tutor_id = auth.uid() OR public.get_current_user_role() = 'Admin'
  );

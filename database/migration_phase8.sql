-- Phase 8 Migration: AI Parent Copilot Database Schema
-- Soli Deo Gloria — Prepared for parent empowerment, homework coaching guidance, and multi-tenant at-home support.

-- 1. Create Parent Copilot Records Table
CREATE TABLE IF NOT EXISTS public.parent_copilot_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE, -- can be null for general student support
    parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- references profiles/auth.uid()
    subject TEXT NOT NULL,
    topic TEXT NOT NULL,
    current_assignment TEXT,
    parent_concern TEXT,
    support_type TEXT,
    content JSONB DEFAULT '{}'::JSONB NOT NULL, -- full JSON block containing explanations, guides, drill plan, question lists, reflections, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Parent Copilot Records
ALTER TABLE public.parent_copilot_records ENABLE ROW LEVEL SECURITY;

-- Parent Copilot Records Policies
CREATE POLICY "Parent copilot records are visible to parent, assigned student, tutor, or admin"
  ON public.parent_copilot_records FOR SELECT TO authenticated USING (
    parent_id = auth.uid() OR
    student_id = auth.uid() OR
    student_id IN (SELECT id FROM public.students WHERE parent_id = auth.uid()) OR
    public.get_current_user_role() IN ('Tutor', 'Admin')
  );

CREATE POLICY "Parents or Admins can insert parent copilot records"
  ON public.parent_copilot_records FOR INSERT TO authenticated WITH CHECK (
    parent_id = auth.uid() OR public.get_current_user_role() = 'Admin'
  );

CREATE POLICY "Parents or Admins can update/delete their own parent copilot records"
  ON public.parent_copilot_records FOR ALL TO authenticated USING (
    parent_id = auth.uid() OR public.get_current_user_role() = 'Admin'
  );

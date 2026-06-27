-- Phase 9 Migration: Administrator Intelligence Center Database Schema
-- Soli Deo Gloria — Prepared for platform-level analytics, tutor insights, student progress trends, financial summaries, and AI-powered administrative interventions.

-- 1. Create Admin Insights Table
CREATE TABLE IF NOT EXISTS public.admin_insights (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    filter_state JSONB DEFAULT '{}'::JSONB NOT NULL, -- stores filters applied (date_range, tutor, student, subject, grade_level, payment_status, etc.)
    content JSONB DEFAULT '{}'::JSONB NOT NULL, -- full JSON block containing metrics and AI recommendations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for Admin Insights
ALTER TABLE public.admin_insights ENABLE ROW LEVEL SECURITY;

-- Admin Insights Policies: ONLY Admins can select, insert, update, or delete
CREATE POLICY "Admin insights are visible solely to administrators"
  ON public.admin_insights FOR SELECT TO authenticated USING (
    public.get_current_user_role() = 'Admin'
  );

CREATE POLICY "Admin insights can be inserted solely by administrators"
  ON public.admin_insights FOR INSERT TO authenticated WITH CHECK (
    public.get_current_user_role() = 'Admin'
  );

CREATE POLICY "Admin insights can be updated or deleted solely by administrators"
  ON public.admin_insights FOR ALL TO authenticated USING (
    public.get_current_user_role() = 'Admin'
  );

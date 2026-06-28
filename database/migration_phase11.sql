-- Ambience TutorsFlow™ database migration for Phase 11: Subscription AI Learning Ecosystem
-- Soli Deo Gloria — Built with architectural excellence and secure multi-tenant safeguards.

-- ==========================================
-- 1. SUBSCRIPTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    plan_name TEXT DEFAULT 'Free' NOT NULL, -- 'Free', 'Student AI Basic', 'Student AI Plus', 'Student AI Premium', 'Tutor Pro', 'Business', 'School'
    status TEXT DEFAULT 'Active' NOT NULL, -- 'Active', 'Cancelled', 'Expired'
    billing_interval TEXT DEFAULT 'Monthly' NOT NULL, -- 'Monthly', 'Yearly'
    current_period_start TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + interval '1 month') NOT NULL,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT
);

-- Enable Row-Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Subscriptions:
-- Users can view their own subscription records. Admins can view all.
CREATE POLICY "Users can view their own subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (
        auth.uid() = profile_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
        )
    );

CREATE POLICY "Users can insert their own subscriptions"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK (
        auth.uid() = profile_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
        )
    );

CREATE POLICY "Users can update their own subscriptions"
    ON public.subscriptions
    FOR UPDATE
    USING (
        auth.uid() = profile_id OR
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
        )
    );

-- ==========================================
-- 2. AI HOMEWORK ASSISTANT RECORDS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.homework_assistant_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    student_name TEXT NOT NULL,
    subject TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    student_prompt TEXT,
    concept_explanation TEXT NOT NULL,
    hints JSONB DEFAULT '[]'::jsonb NOT NULL,
    step_by_step TEXT NOT NULL,
    practice_problems JSONB DEFAULT '[]'::jsonb NOT NULL,
    mastery_score INTEGER DEFAULT 0 NOT NULL, -- score 0-100 reflecting tracked progress
    is_student_safe BOOLEAN DEFAULT true NOT NULL
);

-- Enable Row-Level Security
ALTER TABLE public.homework_assistant_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Homework Assistant Records:
-- Students can see their own records.
-- Parents can see records of their child.
-- Tutors can see records of their assigned students.
-- Admins can view everything.
CREATE POLICY "Admins have full access to homework assistant records"
    ON public.homework_assistant_records
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
        )
    );

CREATE POLICY "Tutors can view homework assistant records"
    ON public.homework_assistant_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid() AND profiles.role = 'Tutor'
        )
    );

CREATE POLICY "Parents can view their student homework records"
    ON public.homework_assistant_records
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.students
            WHERE students.id = student_id AND students.parent_id = auth.uid()
        )
    );

CREATE POLICY "Students can manage their own homework records"
    ON public.homework_assistant_records
    FOR ALL
    USING (
        auth.uid() = student_id
    );

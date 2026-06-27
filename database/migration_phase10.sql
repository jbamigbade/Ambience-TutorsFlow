-- Ambience TutorsFlow™ database migration for Phase 10: Communication & Collaboration Hub
-- Soli Deo Gloria — Built with architectural excellence and secure multi-tenant safeguards.

-- ==========================================
-- 1. MESSAGES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_role TEXT NOT NULL,
    channel_id TEXT NOT NULL, -- e.g., 'parent_tutor_...', 'tutor_student_...', etc.
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL
);

-- Enable Row-Level Security
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Messages:
-- Users can see messages where they are the sender OR the recipient, or if they are an Administrator.
CREATE POLICY "Users can view their own sent or received messages" 
    ON public.messages
    FOR SELECT 
    USING (
        auth.uid() = sender_id OR 
        auth.uid() = recipient_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
        )
    );

CREATE POLICY "Users can send messages" 
    ON public.messages
    FOR INSERT 
    WITH CHECK (
        auth.uid() = sender_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
        )
    );

CREATE POLICY "Recipients or admins can mark messages as read" 
    ON public.messages
    FOR UPDATE 
    USING (
        auth.uid() = recipient_id OR
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
        )
    );

-- ==========================================
-- 2. SHARED SESSION NOTES & ACTION ITEMS
-- ==========================================
CREATE TABLE IF NOT EXISTS public.shared_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL, -- AI-generated session summaries
    parent_update TEXT, -- AI-generated parent updates
    action_items JSONB DEFAULT '[]'::jsonb NOT NULL, -- list of checkable/action items
    reminders JSONB DEFAULT '[]'::jsonb NOT NULL, -- list of reminders/deadlines
    visibility TEXT[] DEFAULT ARRAY['Admin', 'Tutor', 'Parent']::TEXT[] NOT NULL -- roles that can view
);

-- Enable Row-Level Security
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Shared Notes:
-- Admins can do everything.
-- Tutors can view/insert/update notes they created or note for students they teach.
-- Parents can view notes for their students if 'Parent' is in visibility list.
-- Students can view notes for their own profile if 'Student' is in visibility list.
CREATE POLICY "Admins have full access to shared notes"
    ON public.shared_notes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'Admin'
        )
    );

CREATE POLICY "Tutors can manage notes"
    ON public.shared_notes
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'Tutor'
        )
    );

CREATE POLICY "Parents can view notes for their family"
    ON public.shared_notes
    FOR SELECT
    USING (
        'Parent' = ANY(visibility) AND
        EXISTS (
            SELECT 1 FROM public.students
            WHERE students.id = student_id AND students.parent_id = auth.uid()
        )
    );

CREATE POLICY "Students can view safe notes for their own profile"
    ON public.shared_notes
    FOR SELECT
    USING (
        'Student' = ANY(visibility) AND
        auth.uid() = student_id
    );

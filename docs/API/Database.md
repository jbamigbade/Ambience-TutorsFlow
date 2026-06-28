# 🗄️ Database Architecture & Schema Specification — Ambience TutorsFlow™
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This document describes the multi-tenant relational database schema, database tables, primary constraints, and Row-Level Security (RLS) configurations backing **Ambience TutorsFlow™**.

---

## 1. Relational Entity Relationship Diagram (ERD)

The database schema is structured around a centralized multi-tenant profile hierarchy in PostgreSQL, linking profiles, role-specific attributes, bookings, invoices, and AI analytical outputs:

```
                      ┌──────────────────┐
                      │     profiles     │
                      └────────┬─────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │ (1:1)               │ (1:1)               │ (1:1)
         ▼                     ▼                     ▼
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│     tutors     │    │    students    │    │    parents     │
└────────┬───────┘    └────────┬───────┘    └────────┬───────┘
         │                     │                     │
         └──────────┬──────────┘                     │
                    │ (1:N)                          │ (1:N)
                    ▼                                ▼
         ┌────────────────┐                 ┌────────────────┐
         │    bookings    │                 │  subscriptions │
         └────────┬───────┘                 └────────────────┘
                  │ (1:1)
                  ▼
         ┌────────────────┐
         │    payments    │
         └────────────────┘
```

---

## 2. Core Database Schema Tables

### A. Profiles Table (`public.profiles`)
Represents the fundamental system identity. Extends the native `auth.users` authentication schema.
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'tutor', 'student', 'parent', 'org_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### B. Subscriptions Table (`public.subscriptions`)
Tracks active tenant software tiers, limits, and billing states.
```sql
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier VARCHAR(30) NOT NULL CHECK (tier IN ('Free', 'Student AI Basic', 'Student AI Plus', 'Student AI Premium', 'Tutor Starter', 'Tutor Flex', 'Tutor Professional', 'Tutor Elite', 'Business', 'School')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'past_due', 'canceled', 'trialing')),
  current_period_end TIMESTAMPTZ NOT NULL,
  quota_used_ai_requests INT DEFAULT 0,
  quota_limit_ai_requests INT NOT NULL,
  quota_used_worksheets INT DEFAULT 0,
  quota_limit_worksheets INT NOT NULL,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100)
);
```

### C. Bookings Table (`public.bookings`)
Manages calendar arrangements and video meeting room credentials.
```sql
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  subject VARCHAR(50) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'canceled', 'completed')),
  zoom_meeting_id VARCHAR(100),
  zoom_start_url TEXT,
  zoom_join_url TEXT,
  CONSTRAINT booking_time_chk CHECK (start_time < end_time)
);
```

### D. Payments Table (`public.payments`)
Saves transactional outcomes linked to dynamic scheduling receipts.
```sql
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'paid', 'refunded')),
  provider VARCHAR(20) NOT NULL CHECK (provider IN ('stripe', 'paypal', 'zelle')),
  transaction_reference VARCHAR(150) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### E. AI Pedagogy & Homework Tables
* **`public.lesson_plans`**: Holds AI lesson builder logs.
* **`public.iep_goals`**: Stores IEP Measurable Accommodations.
* **`public.homework_records`**: Stores worksheets, student solutions, and Socratic hints.

---

## 3. Row-Level Security (RLS) Policies

To protect tenant isolations and student confidentiality, strict Postgres RLS rules are applied to all custom tables using the security session credentials (`auth.uid()`):

### Profiles RLS Policies
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own profiles
CREATE POLICY "Allow users to view own profiles" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

-- Allow Admins to view all profiles
CREATE POLICY "Allow admins to view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### Subscriptions RLS Policies
```sql
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow users to view their active subscription tier
CREATE POLICY "Allow users to view own subscriptions" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = profile_id);
```

### Bookings RLS Policies
```sql
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow Tutors and Students associated with the booking to read it
CREATE POLICY "Allow participants to view bookings" ON public.bookings
  FOR SELECT TO authenticated USING (auth.uid() = tutor_id OR auth.uid() = student_id);
```

---

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

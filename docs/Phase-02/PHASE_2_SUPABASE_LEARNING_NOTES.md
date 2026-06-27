# Phase 2 Supabase Learning Notes

Supabase is the live backend for Ambience TutorsFlow.

React is the frontend. It shows the pages, dashboards, buttons, and forms.

Supabase stores the real data permanently, including users, tutors, students, parents, bookings, invoices, messages, IEP support, character education, and future AI-generated test questions.

Why Supabase is needed:
- Stores real data
- Handles authentication
- Provides PostgreSQL database
- Provides security through Row Level Security
- Allows the app to move from demo data to real SaaS data

Files used:
- schema.sql creates the database structure
- migration_phase2.sql updates the database for Phase 2
- seed.sql inserts sample data

Phase 2 completed:
- Supabase project created
- Schema ran successfully
- Migration ran successfully
- Seed data ran successfully
- Database verified successfully

Seed data verified:
- 1 organization
- 2 tutors
- 4 students
- 3 bookings
- 2 invoices

Next phase:
Phase 3 will connect the React frontend to Supabase using:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

Future AI feature:
Ambience TutorsFlow will include an AI Test Q&A Generator that creates practice questions, answer keys, and step-by-step solutions for math, SAT, ACT, EOG, Iowa Assessments, and college mathematics.

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

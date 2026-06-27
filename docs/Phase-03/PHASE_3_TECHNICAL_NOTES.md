# Phase 3 Technical Notes

## Environment Variables

The frontend uses:

- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Data Sync

The application loads live records for:

- profiles
- tutors
- students
- bookings
- assignments
- messages
- invoices
- character notes

## Fallback Mode

If Supabase credentials are missing, the application can fall back to demo data for development.

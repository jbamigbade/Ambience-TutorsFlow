# 🗄️ Supabase Production Migration & Security Guide
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This guide outlines the production database schema configuration, RLS policies, triggers, and idempotent testing seed setups inside your live **Supabase PostgreSQL** instance.

---

## 🗃️ 1. Database Schema Execution

The complete database structure resides in `database/schema.sql`.

To initialize or migrate your database schema:
1. Log in to your **Supabase Dashboard**.
2. Select your live project, and navigate to the **SQL Editor** tab from the left sidebar.
3. Open `database/schema.sql` from the repository, copy all contents, paste them into the SQL Editor, and click **Run**.

---

## 🔒 2. Row-Level Security (RLS) Policies

Every single table in the schema is hardened using PostgreSQL Row-Level Security. RLS acts as a security firewall, ensuring that a logged-in user can only read, write, or delete rows associated with their specific Organization, Profile, or designated Role.

### Main Tables Protected:
- `profiles`: Users can view their own profile; only Admins or Organizations can update them.
- `tutors`: Viewable by all profiles (for marketplace selection); editable only by the tutor or admin.
- `students`: Read/write by associated parent or tutor, or platform admin.
- `bookings`: Read/write access restricted to the assigned tutor, student, parent, or organization admin.
- `payments`: Secure checkout tracking. Read-only for parents and tutors; admin-writeable.
- `iep_goals`: Protected by IEP regulations. Only accessible by the assigned tutor, student's parent, or administrator.
- `character_metrics`: Interactive student character progression scores (integrity, grit, diligence). Editable by tutors; read-only for students and parents.

---

## ⚡ 3. Idempotent Data Seeding

For testing, verification, and staging runs, a comprehensive testing suite is provided in `database/seed.sql`.

This seed file sets up:
- **1 Platform Admin** (Superuser)
- **1 Organization** (Ambience Learning Center)
- **2 Professional Tutors**
- **2 Parents** (Managing student accounts)
- **4 Students**
- Complete sets of active Bookings, Subjects, IEP Goals, Character logs, and Payments.

To apply testing seed data:
1. Open the **SQL Editor** in Supabase.
2. Open `database/seed.sql` from your repository, paste its contents, and click **Run**.
3. All operations utilize the `ON CONFLICT DO NOTHING` parameter, preventing duplication of core rows if rerun.

---

## 🧪 4. Client-Side Integration Checks

Once migrated and seeded:
- Ensure that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are placed in the Vercel frontend.
- Log in using one of the seeded credentials to test direct client-side synchronization and dashboard hydration.
- If real credentials are valid, the local dashboard will display the green **"Supabase Connected"** dynamic banner, and local mock storage will automatically be bypassed.

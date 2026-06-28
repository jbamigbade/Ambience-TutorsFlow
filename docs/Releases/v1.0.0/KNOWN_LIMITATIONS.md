# ⚠️ Known Limitations & Engineering Trade-offs — Ambience TutorsFlow™
### Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

This document describes technical boundaries, design trade-offs, and scalability limitations of **Ambience TutorsFlow™ v1.0.0-RC1**, along with their mitigation strategies.

---

## 1. Clientside Federated Search Scaling
* **The Limit**: The global database search executes federated queries on client-side arrays inside `AppContext.jsx`.
* **The Trade-off**: This approach avoids heavy SQL query loads on Supabase and prevents database connection pool exhaustion. However, if a tenant has thousands of messages, bookings, or homework records, downloading and parsing these arrays client-side can increase browser memory usage.
* **Mitigation**: In v2.0, the search query will be migrated to a backend-driven API with pagination (`LIMIT` and `OFFSET`) and PostgreSQL text-search indices (`tsvector`).

---

## 2. In-Memory Memory Rate Limiting
* **The Limit**: The custom sliding-window rate limiter is stored in Node.js server memory (`Map` registry).
* **The Trade-off**: Eliminates external database dependencies (like Redis) for small and medium learning centers. However, if the server is scaled horizontally across multiple servers or serverless tasks (e.g., behind Vercel or Render auto-scalers), rate limits are not shared across instances. This can allow users to bypass IP request caps if requests hit different servers.
* **Mitigation**: Projects scaling beyond a single server task should replace our memory rate limiter with a Redis-backed store (e.g., `rate-limit-redis`).

---

## 3. Local Simulation Sandbox Integrity
* **The Limit**: Simulation Mode runs on static mock datasets stored in browser memory.
* **The Trade-off**: Enables quick visual evaluations without cloud database configurations. However, any mock edits (e.g., adding a booking or completing a worksheet hint) are lost on page refresh.
* **Mitigation**: In v2.0, we will integrate `localStorage` or IndexedDB caching to persist local simulation edits across browser sessions.

---

## 4. Zoom Meeting Scheduling Sync
* **The Limit**: Meetings are allocated directly on tutor bookings.
* **The Trade-off**: Simplifies scheduling but relies entirely on Zoom's API uptime and our cached token refresh cycle. If Zoom's API goes offline, the booking is saved in PostgreSQL, but the meeting URL is left blank.
* **Mitigation**: We implemented inline error handling. If a meeting creation fails, the booking status is saved as `pending`, and an automated notification is dispatched prompting the tutor to retry or manually add a meeting link.

---

Soli Deo Gloria — Glory to God the Father, God the Son, and God the Holy Spirit.

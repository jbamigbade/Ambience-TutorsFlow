# 🕊️ Phase 10 Technical Notes: Communication & Collaboration Hub
### Soli Deo Gloria — Dedicated to systemic integrity, architectural precision, and security.

---

## 📘 Overview

The **Communication & Collaboration Hub** integrates chat channels, session care notes, checklist tracking, and AI compile pipelines into a unified coordination workspace. This document details the database schemas, API specs, role-based filters, state synchronization paths, and the future WebSocket/Realtime integration blueprint implemented in Phase 10.

---

## 🗄️ 1. Database Schema Definitions

The platform utilizes two primary PostgreSQL tables under Supabase, secured with native Row-Level Security (RLS) policies.

### Table A: `public.messages`
Stores direct role-gated private conversations.
```sql
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    recipient_name TEXT NOT NULL,
    recipient_role TEXT NOT NULL,
    channel_id TEXT NOT NULL, -- Format: role1_role2_uuid_uuid
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false NOT NULL
);
```

### Table B: `public.shared_notes`
Stores educational session summaries, parent updates, checkboxes, and milestones.
```sql
CREATE TABLE public.shared_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL, -- AI generated
    parent_update TEXT, -- AI generated
    action_items JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array: [{ task: string, completed: boolean }]
    reminders JSONB DEFAULT '[]'::jsonb NOT NULL, -- Array: [{ event: string, deadline: string }]
    visibility TEXT[] DEFAULT ARRAY['Admin', 'Tutor', 'Parent']::TEXT[] NOT NULL
);
```

---

## 📡 2. Backend Express API Endpoints (`backend/server.js`)

The Communication Hub utilizes secure API routing to orchestrate messaging, shared logs, and AI compilation.

### Endpoint A: POST `/api/collaboration/messages`
- **Purpose**: Posts a secure chat message to a room.
- **Payload**:
  ```json
  {
    "sender_id": "UUID",
    "sender_name": "Sarah Jenkins",
    "sender_role": "Tutor",
    "recipient_id": "UUID",
    "recipient_name": "John Sterling",
    "recipient_role": "Parent",
    "channel_id": "tutor_parent_uuid_uuid",
    "content": "Hi John, Caleb did outstanding on his algebra lesson today!"
  }
  ```

### Endpoint B: POST `/api/collaboration/shared-notes`
- **Purpose**: Saves or updates collaborative care notes, action items, and follow-up milestones.
- **Payload**:
  ```json
  {
    "student_id": "UUID",
    "title": "Algebra Focus - June 27",
    "summary": "AI Session Summary content...",
    "parent_update": "AI Parent Update content...",
    "action_items": [{"task": "Complete worksheet", "completed": false}],
    "reminders": [{"event": "Next Quiz", "deadline": "2026-07-02"}],
    "visibility": ["Admin", "Tutor", "Parent"]
  }
  ```

### Endpoint C: POST `/api/ai/compile-session`
- **Purpose**: Compiles tutor's bullet notes into a professional care packet.
- **Payload**:
  ```json
  {
    "bulletNotes": "Caleb finished algebra section. Struggled with signs but caught on quickly. Practiced diligence.",
    "student_name": "Caleb",
    "subject": "Mathematics",
    "character_theme": "Diligence"
  }
  ```
- **Dual Execution Engine**:
  1. **Gemini 2.5 Flash API**: Invokes the `gemini-2.5-flash` model using a highly structured prompt to parse inputs and generate cohesive, structured JSON containing:
     - `session_summary`: Professional, instructional breakdown of progress.
     - `parent_update`: Warm, encouraging review outlining focus items.
     - `student_checklist`: List of tactical homework or practice guidelines.
  2. **Dynamic Rule-Based Fallback**: If the key is disconnected or rate-limited, compiles custom templates incorporating Christian Character traits (Diligence, Perseverance, Integrity, Grit) and structural task mappings, assuring seamless offline performance.

---

## 🔄 3. State Management & Dashboard Mounts

State synchronization is handled at the root context level via `AppContext.jsx` and connected globally:
- **Automatic Gating**: Messaging directories filter based on `profile?.role` to ensure proper visibility bounds before hitting PostgreSQL.
- **Dashboard Injection**:
  - `AdminDashboard.jsx`: Accessible under the "Collaboration Hub" sub-tab, leveraging full database querying.
  - `TutorDashboard.jsx`: Mounted under "Collaboration Hub", filtering contacts and logs to assigned students.
  - `ParentDashboard.jsx`: Accessible via "Collaboration Hub", showing family chats and student session progress.
  - `StudentDashboard.jsx`: Short-cut navigation under sidebar links, showing safe messaging channels and action items.

---

## 📡 4. Future Supabase Realtime / WebSocket Integration Blueprint

The Communication Hub has been built with an active, future-ready layout to transition from HTTP Polling to instant Bidirectional Realtime Broadcasts.

To implement instant socket sync, replace the default React state refetcher inside `AiCollaborationHub.jsx` with the following pre-configured listener:

```javascript
import { useEffect } from 'react';
import { supabase } from '../supabaseClient';

function useRealtimeMessaging(channelId, onNewMessage) {
  useEffect(() => {
    if (!supabase || !channelId) return;

    // Initialize instant channel listener
    const messageChannel = supabase
      .channel(`chat:${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`
        },
        (payload) => {
          // Trigger instant UI state append
          onNewMessage(payload.new);
        }
      )
      .subscribe((status) => {
        console.log(`Supabase Realtime Connection Status: ${status}`);
      });

    // Cleanup subscription on component unmount
    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [channelId, onNewMessage]);
}
```

This pre-wired construct allows immediate scaling to real-time chat with minimal refactoring.

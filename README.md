# Operation Shadow — Workshop Portal

A static frontend for the two-round AI and cybersecurity workshop. Supabase provides authentication, shared submissions, server-side answer matching, judge evaluations, and the leaderboard.

## Current backend
- Supabase project: `operation-shadow` (`cqoaukpkvxgyqfjsbxgi`, Mumbai)
- Ten seeded teams and two inactive rounds
- RLS is enabled on all public tables
- No questions or answer keys have been inserted yet
- The app uses the public publishable key only. Never put a Supabase secret/service-role key in browser code or GitHub.

## Before using with participants
1. **Review and fix the critical security warning first.** `private.question_keys` currently has RLS disabled. Proposed statement (not applied): `ALTER TABLE private.question_keys ENABLE ROW LEVEL SECURITY;` Do not add participant SELECT policies to this table. Test the SECURITY DEFINER scoring function after enabling RLS, and do not force RLS without testing.
2. Review grants and input validation on `public.submit_answer` and `public.get_leaderboard`; they are SECURITY DEFINER functions currently executable by authenticated users.
3. Review access policy for `public.questions`: any authenticated account can currently read published questions, including accounts without an assigned team. Decide how workshop enrollment will be restricted before publishing challenges.
4. Create participant accounts, then assign each account to a team via a trusted organizer/admin process. New users must not be able to self-assign teams or elevate their role.
5. Add questions and matching keys, test scoring with dummy accounts, then activate rounds.
6. Configure judge/admin accounts only through a trusted organizer path. Do not expose answer keys in frontend code or public docs.

## Local preview
Serve this folder with any static HTTP server (ES modules require HTTP, not `file://`). Example:
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

## GitHub Pages
The repository being private does **not** automatically make a GitHub Pages site private. Pages visibility and access restrictions depend on GitHub plan and repository settings. Do not deploy real challenge content until Supabase policies and enrollment restrictions are verified. For a workshop requiring a non-public portal, choose a host/access-control setup that explicitly supports authenticated access.

## Current functionality
- Email/password sign-in and account creation
- Team assignment status
- Active-round published questions and RPC-based answer submission
- Demo summary and optional URL submission
- Team leaderboard
- Judge scoring and feedback panel

The app is an initial portal implementation; test it against real Supabase policies before the event. The frontend intentionally does not expose answer keys or privileged credentials.
# Operation Shadow — Workshop Portal

A static frontend for the two-round AI and cybersecurity workshop. Supabase provides email/password authentication, team assignment, server-side answer matching, demo submissions, judge evaluations, and the leaderboard.

## Current backend
- Supabase project: `operation-shadow` (`cqoaukpkvxgyqfjsbxgi`, Mumbai)
- Ten seeded teams and two inactive rounds
- New signups automatically get a `public.profiles` record with participant role and no team assignment
- Admin console: registered accounts, team assignment, all quiz answers and automatic scores, demo submissions, judge scores/feedback, team filter, and CSV export
- The app uses the public publishable key only. Never put a Supabase secret/service-role key in browser code or GitHub.

## Sign-in and registration
1. At the portal, choose **Create account**, enter display name, email, and password, then submit.
2. If email confirmation is enabled in Supabase, confirm the email before signing in.
3. A trusted organizer/admin assigns the participant to one of the ten teams from **Workshop results console**. Participants cannot self-assign.
4. Once assigned, the participant can answer published questions and submit demos for active rounds.

## Admin access
The existing profile in this project is currently marked `admin`. Sign in with that account's email/password using the portal. Do not share credentials in the repository or chat. The admin-only console is shown based on the database profile role, not on a user-editable signup field.

If you need to promote another trusted organizer, first create their Auth account in Supabase Dashboard → Authentication → Users, then set that exact user's profile role to `admin` from the SQL Editor. Never expose privileged keys in frontend code.

## Before using with participants — important security checklist
1. **Critical: `private.question_keys` currently has Row Level Security disabled.** The proposed statement is `ALTER TABLE private.question_keys ENABLE ROW LEVEL SECURITY;` but it has deliberately not been applied. Review and approve the policy plan first; do not add participant SELECT policies to the answer-key table. Test the SECURITY DEFINER scoring function after enabling RLS, and do not force RLS without testing.
2. Review grants and input validation on `public.submit_answer` and `public.get_leaderboard`; they are SECURITY DEFINER functions. Ensure the leaderboard exposure is intended for all signed-in participants.
3. Review access policy for `public.questions`: published questions are visible to authenticated users, including users without an assigned team. Decide how enrollment should be restricted before publishing challenges.
4. Add questions and matching keys, test scoring with dummy accounts, then activate rounds. The database currently has no questions, answers, demos, or judge evaluations.
5. Confirm judge/admin access policies and test with separate participant, judge, and admin accounts before event day.

## Local preview
Serve this folder with any static HTTP server (ES modules require HTTP, not `file://`). Example:
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

## Hosting
The GitHub repository is public. Do not commit real challenge answer keys, participant data, passwords, or privileged credentials. The portal requires an appropriate static hosting setup; committing the code to GitHub does not by itself prove that a website is deployed or that deployment access is restricted.

## Features
- Email/password sign-in and event-time account registration
- Automatic participant profile creation through a database trigger
- Admin-only roster and team assignment controls
- Active-round questions with RPC-based answer submission
- Demo summary and optional URL submission
- Team leaderboard
- Judge scoring and feedback
- Admin results tables and CSV export

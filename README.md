# Operation Shadow — Workshop Portal

A static frontend for the two-round AI and cybersecurity workshop. Supabase provides email/password authentication, team assignment, server-side answer matching, demo submissions, judge evaluations, and the leaderboard.

## Current backend
- Supabase project: `operation-shadow` (`cqoaukpkvxgyqfjsbxgi`, Mumbai)
- Ten seeded teams and two inactive rounds (rounds stay closed until an admin activates one)
- Two prepared simulated incident scenarios with five multiple-choice questions each; questions and keys are in Supabase, and keys are not shipped to the frontend
- Admin-only round activation validates that every question has a key, publishes only the selected round, and closes the previous round
- New signups automatically get a `public.profiles` record with participant role and no team assignment
- Admin console: registered accounts, team assignment, participant/judge/admin role management, all quiz answers and automatic scores, demo submissions, judge scores/feedback, team filter, CSV export, and printable participant-kit download
- The app uses the public publishable key only. Never put a Supabase secret/service-role key in browser code or GitHub.

## Sign-in and registration
1. At the portal, choose **Create account**, enter display name, email, and password, then submit.
2. If email confirmation is enabled in Supabase, confirm the email before signing in.
3. Enter the team join code shared by the organizer during registration. The backend validates the code and assigns the team; participants cannot set `team_id` directly.
4. If email confirmation is enabled, the code is remembered in that browser and applied after sign-in. If automatic joining fails, sign in and use **Join your team** on the dashboard to retry.
5. Once assigned, the participant can answer published questions and submit demos for active rounds.

## Team join codes (organizer)
- In the admin console, use **Team join codes → Generate / rotate code** for each team.
- Each code is shown once and copied to the clipboard where the browser permits it. Share each code privately with only the intended team.
- Generating a replacement invalidates the previous code for that team. The database stores only a SHA-256 hash; the original code cannot be retrieved from the table.
- Do not post team codes publicly. The current codes can be rotated from the admin console before the event.

## Admin access
The existing profile in this project is currently marked `admin`. Sign in with that account's email/password using the portal. Do not share credentials in the repository or chat. The admin-only console is shown based on the database profile role, not on a user-editable signup field.

If you need to promote another trusted organizer, first create their Auth account in Supabase Dashboard → Authentication → Users, then set that exact user's profile role to `admin` from the SQL Editor. Never expose privileged keys in frontend code.

## Security review status
- `private.question_keys`: Row Level Security is enabled, and direct table privileges are revoked from `public`, `anon`, and `authenticated`. There are no client-facing policies for this table. The scoring function accesses keys server-side.
- Ten objective questions and ten corresponding keys have been seeded. The answer keys must remain confidential and must never be placed in frontend code or published in GitHub.
- The `public.admin_set_active_round(uuid)` SECURITY DEFINER RPC is admin-gated. It verifies that the selected round has questions and every question has an answer key, publishes only that round's questions, closes any previous active round, and activates the selected round.
- Review grants and input validation on `public.submit_answer` and `public.get_leaderboard`, which are SECURITY DEFINER functions. Confirm that showing every team's score to all authenticated participants is intended.
- Run full end-to-end checks with separate participant and admin accounts; judge-role access and judging workflows still need testing before event day.

## Round operations
1. Sign in with the existing admin account.
2. In **Workshop results console → Round controls**, select a round and activate it when ready. This publishes the selected round's questions and closes any previously active round.
3. Each activated round runs for 30 minutes. Participants can submit answers and demos only before its deadline; the backend enforces this even if a browser remains open. Admins can close a round early.
4. Participants can resubmit their team's demo for the same round before time expires; the latest submission replaces the earlier one.
5. To switch rounds, activate the next round from the admin console. Do not activate a round during preparation/testing unless you intend participants to see it.

## Local preview
Serve this folder with any static HTTP server (ES modules require HTTP, not `file://`). Example:
```bash
python -m http.server 8000
```
Open `http://localhost:8000`.

## Hosting with GitHub Pages
A GitHub Actions deployment workflow is included at `.github/workflows/deploy-pages.yml`.

1. Open the repository on GitHub → **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the source.
3. Open **Actions** and run **Deploy Operation Shadow portal to GitHub Pages**, or push a new commit to `main`.
4. After the workflow succeeds, GitHub will show the published URL. For this repository, the expected Pages URL is `https://jd-arise.github.io/operation-shadow-portal/`, but do not share it as live until the deployment succeeds.
5. In Supabase → **Authentication → URL Configuration**, add the actual published URL (and `http://localhost:8000/**` for local testing) to **Redirect URLs**. Set the Site URL to the production URL only after Pages is published; keep local and production redirect entries.

The GitHub repository is public. Do not commit real challenge answer keys, participant data, passwords, or privileged credentials. The frontend contains only the public publishable key; keep all service-role keys and answer keys server-side.

## Features
- Email/password sign-in and event-time account registration
- Automatic participant profile creation through a database trigger
- Admin-only roster and team assignment controls
- Active-round questions with RPC-based answer submission
- Participant dashboards automatically sync round activation, switching, and closure every 5 seconds (and when a tab becomes visible), so participants do not need to refresh manually
- Demo summary and optional URL submission
- Team leaderboard
- Judge scoring and feedback
- Admin results tables and CSV export

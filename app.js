import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://cqoaukpkvxgyqfjsbxgi.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_lRP6BDUTTWkiNiPfXWIbxA_jkf9Yekc";
const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const $ = (id) => document.getElementById(id);
const state = { user: null, profile: null, teams: [], rounds: [], questions: [] };
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (ch) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[ch]));
const message = (id, text, error = false) => { const el = $(id); el.textContent = text || ""; el.classList.toggle("error", error); };
const setConnection = (text, online = false) => { $("connection-status").textContent = text; $("connection-status").classList.toggle("online", online); };

function showSignedIn(signedIn) {
  $("auth-panel").classList.toggle("hidden", signedIn);
  $("dashboard").classList.toggle("hidden", !signedIn);
  $("signout-btn").classList.toggle("hidden", !signedIn);
}

async function boot() {
  setConnection("Checking service");
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) setConnection("Service issue");
  else setConnection("Service ready", true);
  if (session) await loadDashboard(session.user);
}
$("auth-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  message("auth-message", "Signing in…");
  const { data, error } = await supabase.auth.signInWithPassword({ email: $("auth-email").value.trim(), password: $("auth-password").value });
  if (error) { message("auth-message", error.message, true); return; }
  await loadDashboard(data.user);
});
$("signup-btn").addEventListener("click", async () => {
  message("auth-message", "Creating account…");
  const { data, error } = await supabase.auth.signUp({ email: $("auth-email").value.trim(), password: $("auth-password").value });
  if (error) { message("auth-message", error.message, true); return; }
  if (data.session) {
    await supabase.from("profiles").upsert({ id: data.user.id, display_name: $("auth-email").value.trim().split("@")[0], role: "participant", team_id: null }, { onConflict: "id" });
    message("auth-message", "Account created. An organizer must assign your team before access unlocks.");
    await loadDashboard(data.user);
  } else {
    message("auth-message", "Check your email to confirm the account, then sign in. An organizer must assign your team.");
  }
});
$("signout-btn").addEventListener("click", async () => { await supabase.auth.signOut(); state.user = null; state.profile = null; showSignedIn(false); message("auth-message", "Signed out."); });
supabase.auth.onAuthStateChange((_event, session) => { if (!session) { showSignedIn(false); } });

async function loadDashboard(user) {
  state.user = user;
  showSignedIn(true);
  $("welcome-title").textContent = "Welcome, operator.";
  $("profile-subtitle").textContent = user.email || "";
  const [{ data: profile, error: profileError }, { data: teams }, { data: rounds }] = await Promise.all([
    supabase.from("profiles").select("id,display_name,role,team_id").eq("id", user.id).maybeSingle(),
    supabase.from("teams").select("id,name").order("name"),
    supabase.from("rounds").select("id,round_number,name,instructions,is_active,starts_at,ends_at").order("round_number")
  ]);
  state.profile = profile;
  state.teams = teams || [];
  state.rounds = rounds || [];
  if (profileError) message("auth-message", profileError.message, true);
  $("welcome-title").textContent = profile?.display_name ? `Welcome, ${profile.display_name}.` : "Welcome, operator.";
  $("role-pill").textContent = (profile?.role || "participant").toUpperCase();
  const team = state.teams.find((t) => t.id === profile?.team_id);
  $("team-name").textContent = team?.name || "Unassigned";
  const active = state.rounds.find((r) => r.is_active);
  $("active-round").textContent = active ? `ROUND ${active.round_number}` : "—";
  $("round-status").textContent = active?.name || "Awaiting organizer";
  const notice = $("assignment-notice");
  notice.classList.toggle("hidden", !!team || profile?.role === "admin" || profile?.role === "judge");
  notice.textContent = "Your account is signed in, but it is not assigned to a team yet. Ask an organizer to assign your team before answering challenges.";
  $("demo-round").innerHTML = state.rounds.map((r) => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join("");
  $("judge-round").innerHTML = state.rounds.map((r) => `<option value="${esc(r.id)}">${esc(r.name)}</option>`).join("");
  $("judge-team").innerHTML = state.teams.map((t) => `<option value="${esc(t.id)}">${esc(t.name)}</option>`).join("");
  $("judge-panel").classList.toggle("hidden", !["judge", "admin"].includes(profile?.role));
  await Promise.all([loadQuestions(), loadSubmissions(), loadLeaderboard()]);
}

async function loadQuestions() {
  const { data, error } = await supabase.from("questions").select("id,round_id,prompt,question_type,options,points,position").eq("is_published", true).order("position");
  const list = $("questions-list");
  if (error) { list.innerHTML = `<p class="muted">${esc(error.message)}</p>`; return; }
  state.questions = data || [];
  const active = state.rounds.find((r) => r.is_active);
  const qs = state.questions.filter((q) => !active || q.round_id === active.id);
  if (!qs.length) { list.innerHTML = '<p class="muted">No published questions for the active round yet. An organizer must add questions and activate a round.</p>'; return; }
  list.innerHTML = qs.map((q, i) => {
    const options = Array.isArray(q.options) ? q.options : [];
    const input = q.question_type === "multiple_choice"
      ? `<div class="option-list">${options.map((opt, j) => { const value = typeof opt === "object" ? opt.value : opt; const label = typeof opt === "object" ? (opt.label ?? opt.value) : opt; return `<label class="option"><input type="radio" name="answer-${esc(q.id)}" value="${esc(value)}" required><span>${esc(label)}</span></label>`; }).join("")}</div>`
      : `<input name="answer-${esc(q.id)}" type="text" maxlength="2000" placeholder="Type your answer" required>`;
    return `<article class="question-card"><div class="question-meta">QUESTION ${String(i+1).padStart(2,"0")} · ${esc(q.points)} POINTS</div><p>${esc(q.prompt)}</p><form data-question-id="${esc(q.id)}">${input}<button class="btn btn-outline btn-small" type="submit">Submit answer ↗</button><p class="message" role="status"></p></form></article>`;
  }).join("");
  list.querySelectorAll("form[data-question-id]").forEach((form) => form.addEventListener("submit", submitAnswer));
}
async function submitAnswer(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const id = form.dataset.questionId;
  const chosen = form.querySelector('input[type="radio"]:checked') || form.querySelector('input[type="text"]');
  const result = form.querySelector(".message");
  if (!chosen) { result.textContent = "Choose or enter an answer first."; result.classList.add("error"); return; }
  const question = state.questions.find((q) => q.id === id);
  const active = state.rounds.find((r) => r.is_active);
  if (!state.profile?.team_id || !active || question?.round_id !== active.id) { result.textContent = "You need an assigned team and an active matching round."; result.classList.add("error"); return; }
  result.textContent = "Submitting…";
  result.classList.remove("error");
  const answer = chosen.value;
  const { error } = await supabase.rpc("submit_answer", { p_question_id: id, p_answer: answer });
  if (error) { result.textContent = error.message; result.classList.add("error"); return; }
  result.textContent = "Answer saved. Score updated.";
  await loadLeaderboard();
}

$("demo-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!state.profile?.team_id) { message("demo-message", "Ask an organizer to assign your team first.", true); return; }
  const roundId = $("demo-round").value;
  if (!roundId) { message("demo-message", "No rounds are configured.", true); return; }
  message("demo-message", "Submitting…");
  const payload = { team_id: state.profile.team_id, round_id: roundId, submitted_by: state.user.id, solution_text: $("demo-solution").value.trim(), demo_url: $("demo-url").value.trim() || null };
  const { error } = await supabase.from("demo_submissions").insert(payload);
  if (error) { message("demo-message", error.message, true); return; }
  $("demo-solution").value = ""; $("demo-url").value = "";
  message("demo-message", "Demo submitted.");
  await loadSubmissions();
});
async function loadSubmissions() {
  const el = $("submissions-list");
  if (!state.profile?.team_id && !["judge","admin"].includes(state.profile?.role)) { el.innerHTML = '<p class="muted">Team assignment required.</p>'; return; }
  let query = supabase.from("demo_submissions").select("id,team_id,round_id,solution_text,demo_url,submitted_at,teams(name),rounds(name)").order("submitted_at", { ascending: false }).limit(10);
  if (state.profile?.role === "participant") query = query.eq("team_id", state.profile.team_id);
  const { data, error } = await query;
  if (error) { el.innerHTML = `<p class="muted">${esc(error.message)}</p>`; return; }
  if (!data?.length) { el.innerHTML = '<p class="muted">No demo submissions yet.</p>'; return; }
  el.innerHTML = data.map((s) => `<article class="submission-card"><div class="question-meta">${esc(s.teams?.name || "Team")} · ${esc(s.rounds?.name || "Round")}</div><p>${esc(s.solution_text)}</p>${s.demo_url ? `<a href="${esc(s.demo_url)}" target="_blank" rel="noopener noreferrer">Open demo ↗</a>` : ""}</article>`).join("");
}
async function loadLeaderboard() {
  const el = $("leaderboard");
  const { data, error } = await supabase.rpc("get_leaderboard");
  if (error) { el.innerHTML = `<p class="muted">${esc(error.message)}</p>`; return; }
  const rows = data || [];
  if (!rows.length) { el.innerHTML = '<p class="muted">No scores yet.</p>'; return; }
  el.innerHTML = `<div class="leaderboard-row header"><span>#</span><span>TEAM</span><span class="score">AUTO</span><span class="score">JUDGE</span><span class="score">TOTAL</span></div>` + rows.map((r,i) => `<div class="leaderboard-row"><span class="rank">${String(i+1).padStart(2,"0")}</span><span class="team-label">${esc(r.team_name)}</span><span class="score">${Number(r.auto_score||0).toFixed(1)}</span><span class="score">${Number(r.judge_score||0).toFixed(1)}</span><span class="score">${Number(r.total_score||0).toFixed(1)}</span></div>`).join("");
  const mine = rows.find((r) => r.team_id === state.profile?.team_id);
  $("your-score").textContent = mine ? Number(mine.total_score||0).toFixed(1) : "—";
}
$("refresh-leaderboard").addEventListener("click", loadLeaderboard);
$("judge-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!["judge","admin"].includes(state.profile?.role)) { message("judge-message", "Judge access required.", true); return; }
  message("judge-message", "Saving…");
  const teamId = $("judge-team").value, roundId = $("judge-round").value;
  const { data: existing, error: findError } = await supabase.from("judge_evaluations").select("id").eq("team_id",teamId).eq("round_id",roundId).eq("judge_id",state.user.id).maybeSingle();
  if (findError) { message("judge-message", findError.message, true); return; }
  const payload = { team_id: teamId, round_id: roundId, judge_id: state.user.id, score: Number($("judge-score").value), feedback: $("judge-feedback").value.trim(), updated_at: new Date().toISOString() };
  const result = existing?.id
    ? await supabase.from("judge_evaluations").update(payload).eq("id",existing.id)
    : await supabase.from("judge_evaluations").insert(payload);
  if (result.error) { message("judge-message", result.error.message, true); return; }
  message("judge-message", "Evaluation saved.");
  await loadLeaderboard();
});
boot();
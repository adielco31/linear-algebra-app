# Supabase Database Schema

This document defines the full PostgreSQL schema for the Linear Algebra learning app.
Run these statements in order in the Supabase SQL Editor.

> **Status:** not yet wired to the app. The app currently uses localStorage exclusively.
> When migration begins, replace each `progressStorage.js` call with a Supabase equivalent,
> keeping the same public API so callsites don't change.

---

## Design Decisions

- **Static content** (modules, lessons, questions) lives in the DB so it can be
  updated without a code deploy, and eventually personalised per user.
- **`attempts`** is append-only — one row per answered question per session.
  Never update, only insert. Aggregate stats are derived from it.
- **`review_queue`** is upserted — one row per (user, question). Replaces `la_mistakes`.
- **`user_progress`** is upserted — one row per (user, lesson). Replaces `la_progress`.
- All tables have RLS enabled. Users can only read/write their own rows.

---

## Tables

### `profiles`

Extends `auth.users`. Created automatically on sign-up via a trigger.

```sql
create table public.profiles (
  id               uuid primary key references auth.users on delete cascade,
  display_name     text,
  avatar_url       text,
  streak_current   integer      not null default 0,
  streak_last_date date,                          -- date of most recent session
  created_at       timestamptz  not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row when a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

---

### `modules`

Static content — one row per learning module.

```sql
create table public.modules (
  id          text primary key,          -- e.g. 'row-reduction'
  title       text not null,
  description text,
  order_index integer not null default 0,
  created_at  timestamptz not null default now()
);

alter table public.modules enable row level security;

create policy "Authenticated users can read modules"
  on public.modules for select
  to authenticated
  using (true);

-- Seed
insert into public.modules (id, title, description, order_index) values
  ('row-reduction',
   'דירוג מטריצות ופתרון מערכות משוואות',
   'פרק זה מלמד כיצד לייצג מערכת משוואות ליניאריות כמטריצה, לדרג אותה בשיטת גאוס, ולקרוא ממנה את מספר הפתרונות ואת הפתרון עצמו.',
   1);
```

---

### `lessons`

Static content — one row per lesson, linked to a module.

```sql
create table public.lessons (
  id                text primary key,    -- e.g. 'matrix-intro'
  module_id         text not null references public.modules on delete cascade,
  title             text not null,
  order_index       integer not null default 0,
  short_explanation text,
  created_at        timestamptz not null default now()
);

create index lessons_module_id_idx on public.lessons (module_id);

alter table public.lessons enable row level security;

create policy "Authenticated users can read lessons"
  on public.lessons for select
  to authenticated
  using (true);

-- Seed (lesson IDs match the JS data/modules.js)
insert into public.lessons (id, module_id, title, order_index) values
  ('matrix-intro',     'row-reduction', 'מטריצות ומערכות משוואות — מה הקשר?',               1),
  ('row-operations',   'row-reduction', 'פעולות שורה אלמנטריות',                              2),
  ('ref-rref',         'row-reduction', 'צורה מדורגת ומדורגת מצומצמת',                       3),
  ('solutions-count',  'row-reduction', 'כמה פתרונות יש למערכת?',                            4),
  ('free-variables',   'row-reduction', 'משתנים חופשיים וסט הפתרונות הכללי',                5);
```

---

### `questions`

Static content — one row per question. The `content` JSONB column holds the full
question payload (options, correctAnswer, explanation, questionMatrix, etc.) so the
schema stays stable as question types evolve.

```sql
create type public.question_type as enum (
  'multiple-choice',
  'conceptual',
  'find-the-mistake',
  'numeric-answer',
  'matrix-answer'
);

create table public.questions (
  id          text primary key,          -- e.g. 'q01'
  lesson_id   text not null references public.lessons on delete cascade,
  type        public.question_type not null,
  topic       text,
  difficulty  integer not null check (difficulty between 1 and 4),
  content     jsonb not null,            -- full question data
  created_at  timestamptz not null default now()
);

create index questions_lesson_id_idx on public.questions (lesson_id);

alter table public.questions enable row level security;

create policy "Authenticated users can read questions"
  on public.questions for select
  to authenticated
  using (true);
```

`content` JSONB shape (mirrors `src/data/questions.js`):

```jsonc
{
  "question": "string",
  "options": ["string", ...],            // multiple-choice / find-the-mistake
  "correctAnswer": 2,                    // option index OR number
  "explanation": "string",
  "commonMistakeTag": "string",
  "wrongAnswerFeedback": { "0": "...", "1": "..." },
  "questionMatrix": {                    // optional
    "rows": [[1, 2, 3], [0, 1, -1]],
    "augmented": 2
  },
  "matrixAnswer": {                      // matrix-answer only
    "rows": 2, "cols": 3, "augmented": 2,
    "correctAnswer": [["1","2","3"],["0","3","5"]]
  }
}
```

---

### `attempts`

Append-only record of every answered question in every session.
Replaces the session array inside `la_sessions`.

```sql
create table public.attempts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users on delete cascade,
  session_id   text not null,            -- groups answers from one practice run
  question_id  text not null references public.questions,
  lesson_id    text not null,
  is_correct   boolean not null,
  answer_given jsonb,                    -- {selectedIndex, numericInput, matrixValue}
  answered_at  timestamptz not null default now()
);

create index attempts_user_id_idx        on public.attempts (user_id);
create index attempts_session_id_idx     on public.attempts (user_id, session_id);
create index attempts_lesson_user_idx    on public.attempts (user_id, lesson_id);

alter table public.attempts enable row level security;

create policy "Users can insert own attempts"
  on public.attempts for insert
  with check (auth.uid() = user_id);

create policy "Users can read own attempts"
  on public.attempts for select
  using (auth.uid() = user_id);
```

---

### `review_queue`

One row per (user, question). Replaces `la_mistakes` in localStorage.
Upserted on every answer; drives the SRS review schedule.

```sql
create table public.review_queue (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users on delete cascade,
  question_id      text not null references public.questions,
  lesson_id        text not null,
  topic            text,
  explanation      text,
  mistake_tag      text,
  wrong_count      integer     not null default 0,
  correct_streak   integer     not null default 0,
  last_answered_at timestamptz,
  next_review_at   timestamptz,
  first_wrong_at   timestamptz not null default now(),

  unique (user_id, question_id)
);

create index review_queue_user_due_idx
  on public.review_queue (user_id, next_review_at);

alter table public.review_queue enable row level security;

create policy "Users can read own review queue"
  on public.review_queue for select
  using (auth.uid() = user_id);

create policy "Users can insert into own review queue"
  on public.review_queue for insert
  with check (auth.uid() = user_id);

create policy "Users can update own review queue"
  on public.review_queue for update
  using (auth.uid() = user_id);

create policy "Users can delete from own review queue"
  on public.review_queue for delete
  using (auth.uid() = user_id);
```

**Upsert pattern** (from `saveMistake` / `updateSRS`):

```sql
insert into public.review_queue
  (user_id, question_id, lesson_id, topic, explanation, mistake_tag,
   wrong_count, correct_streak, last_answered_at, next_review_at)
values (...)
on conflict (user_id, question_id) do update set
  wrong_count      = case when excluded.correct_streak = 0
                          then review_queue.wrong_count + 1
                          else review_queue.wrong_count end,
  correct_streak   = excluded.correct_streak,
  last_answered_at = excluded.last_answered_at,
  next_review_at   = excluded.next_review_at;
```

---

### `user_progress`

One row per (user, lesson). Replaces `la_progress` in localStorage.

```sql
create table public.user_progress (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users on delete cascade,
  lesson_id           text not null references public.lessons,
  completed_at        timestamptz,           -- null = started but not finished
  questions_answered  integer not null default 0,
  questions_correct   integer not null default 0,
  last_practiced_at   timestamptz,

  unique (user_id, lesson_id)
);

create index user_progress_user_id_idx on public.user_progress (user_id);

alter table public.user_progress enable row level security;

create policy "Users can read own progress"
  on public.user_progress for select
  using (auth.uid() = user_id);

create policy "Users can insert own progress"
  on public.user_progress for insert
  with check (auth.uid() = user_id);

create policy "Users can update own progress"
  on public.user_progress for update
  using (auth.uid() = user_id);
```

**Upsert pattern** (from `recordSession`):

```sql
insert into public.user_progress
  (user_id, lesson_id, completed_at, questions_answered, questions_correct, last_practiced_at)
values (...)
on conflict (user_id, lesson_id) do update set
  completed_at       = coalesce(user_progress.completed_at, excluded.completed_at),
  questions_answered = user_progress.questions_answered + excluded.questions_answered,
  questions_correct  = user_progress.questions_correct  + excluded.questions_correct,
  last_practiced_at  = excluded.last_practiced_at;
```

---

## Migration Plan (localStorage → Supabase)

When ready to migrate, follow this order to avoid breaking changes:

1. **Auth** — add Supabase Auth (email/password or magic link). Gate the app behind login.
2. **`user_progress`** — migrate `la_progress` → upsert into `user_progress` on first login.
3. **`review_queue`** — migrate `la_mistakes` → upsert into `review_queue` on first login.
4. **`attempts`** — start writing new sessions to `attempts`; old `la_sessions` can be discarded.
5. **Static content** — seed `modules`, `lessons`, `questions` from the JS data files; switch
   `src/data/modules.js` and `src/data/questions.js` to fetch from Supabase with a local fallback.
6. **Remove localStorage** — after a burn-in period, stop writing to `la_*` keys.

Each step can be deployed independently. The `isSupabaseEnabled` flag in
`src/lib/supabaseClient.js` lets callsites choose the backend at runtime.

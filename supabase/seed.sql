-- Seed the portfolio with the content from the HTML design export.
--
-- Replace v_owner below with the UUID of your Supabase Auth user (the same
-- UUID that goes in ADMIN_USER_IDS), then run this once. Re-running is safe:
-- every insert upserts on the owner-scoped unique key.
--
-- Entries the design export marks as placeholders are seeded as drafts, so
-- they stay invisible to the public until you replace the copy and publish.

do $$
declare
  v_owner uuid := '00000000-0000-0000-0000-000000000000';
begin
  if not exists (select 1 from auth.users where id = v_owner) then
    raise exception
      'Set v_owner to an existing auth.users id before running this seed.';
  end if;

  -- profile -------------------------------------------------------------------

  insert into public.profile (
    owner_id, full_name, alias, role_title, availability_badge,
    hero_headline, hero_intro, bio, certifications, education,
    contact_heading, contact_body, contact_email, footer_note, status
  )
  values (
    v_owner,
    'Rahmad Arifin Susilo',
    'Kumar',
    'Web Developer',
    'Looking for an internship · 2027',
    'Hey, I''m Rahmad — a UI tinkerer, full-stack builder, and someone who never stops learning.',
    'Day to day I switch between two stacks: Next.js/Supabase for more modern products, and Laravel/Inertia.js for more classic systems. UI/UX detail is always a priority, never an afterthought. Also open to freelance work alongside the internship.',
    'I build web applications using two stack approaches: Next.js + Supabase for modern products, and Laravel + Inertia.js for more traditional systems. I emphasize visual consistency through a token-based design system, not ad-hoc styling.',
    null, -- certifications: placeholder in the design export
    null, -- education: placeholder in the design export
    'Let''s Connect',
    'Open to internship opportunities starting 2027, and available for freelance web development projects alongside it.',
    'rahmadarifinsusilo17@gmail.com',
    '© 2026 Rahmad Arifin Susilo. Built with Next.js & Tailwind CSS.',
    'published'
  )
  on conflict (owner_id) do update set
    full_name = excluded.full_name,
    alias = excluded.alias,
    role_title = excluded.role_title,
    availability_badge = excluded.availability_badge,
    hero_headline = excluded.hero_headline,
    hero_intro = excluded.hero_intro,
    bio = excluded.bio,
    contact_heading = excluded.contact_heading,
    contact_body = excluded.contact_body,
    contact_email = excluded.contact_email,
    footer_note = excluded.footer_note,
    status = excluded.status;

  -- projects ------------------------------------------------------------------

  insert into public.projects (
    owner_id, slug, title, summary, description, detail_heading, features,
    note_label, note_body, tech_tags, repo_url, live_url, is_featured,
    sort_order, status
  )
  values
  (
    v_owner,
    'arus',
    'Arus',
    'A personal finance tracking app built as a public product. Real-time-feel dashboards, category analytics with an emoji-based icon system, PDF export, and a responsive sidebar / mobile bottom navigation. Consistent loading and confirmation patterns throughout, using toast notifications instead of native browser alerts.',
    'A personal finance tracking app built as a public product, not a portfolio one-off. Went through a full UI improvement pass across the entire app, with attention to consistent interaction patterns rather than one-off polish.',
    'Key Features',
    array[
      'Dashboards and charts with a real-time-feel presentation of income and spending.',
      'Category system built on emoji icons for quick visual recognition, with lucide-react handling the rest of the UI chrome.',
      'PDF export for transaction reports.',
      'Responsive navigation — a sidebar on desktop, a bottom nav bar on mobile.',
      'Toast notifications for loading and confirmation states instead of native browser alerts.',
      'Auth pages and a dedicated Coming Soon page, part of the same design pass.'
    ],
    'Design System',
    'Zinc / emerald / red palette — emerald marks income, red marks expenses.',
    array['Next.js', 'Supabase', 'PostgreSQL', 'TypeScript', 'Tailwind CSS'],
    null, null, true, 10, 'published'
  ),
  (
    v_owner,
    'jokigame',
    'JokiGame',
    'A monitoring platform for a game-boosting service. Welcome and login pages styled with a purple-cyan glassmorphism theme. Traced and resolved a tricky layout override bug through Inertia''s layout resolution chain by converting the auth card layout into a passthrough component.',
    'A monitoring platform for a game-boosting service. UI work focused on the Welcome and Login pages, built around a purple-cyan glassmorphism theme.',
    'The Problem I Solved',
    array[
      'A layout override bug appeared on the auth pages — styling from one layout was leaking into another.',
      'Traced the issue through Inertia''s layout resolution chain rather than patching the symptom.',
      'Resolved it by converting the auth card layout into a passthrough component, fixing the root cause instead of one page at a time.'
    ],
    'Design',
    'Purple-cyan glassmorphism theme on the Welcome and Login screens.',
    array['Laravel', 'Inertia.js', 'React', 'TypeScript'],
    null, null, true, 20, 'published'
  ),
  (
    v_owner,
    'notes-app',
    'Notes App',
    'A UI redesign of an existing notes app, with every existing function preserved untouched. Reimagined with a warm paper / editorial aesthetic — serif typography, warm cream backgrounds — plus full dark mode support.',
    'A UI redesign of an existing notes application. The brief was specific: improve the interface while preserving every existing function untouched.',
    'Design Direction',
    array[
      'A "warm paper / editorial" aesthetic — serif typography and warm cream backgrounds, a deliberate departure from generic SaaS UI.',
      'Full dark mode support added on top of the new visual direction.',
      'Every existing feature kept working exactly as before — this was a visual pass, not a rebuild.'
    ],
    'Constraint',
    'UI-only redesign — no functional changes to the existing app.',
    array['Laravel', 'Inertia.js', 'React', 'TypeScript'],
    null, null, false, 30, 'published'
  ),
  (
    v_owner,
    'e-commerce-flutter',
    'E-commerce Flutter',
    'A full UI/UX rebuild of an e-commerce app in Flutter, done from scratch for coding practice and UI/UX exploration. Covers authentication, browsing (categories, flash sales, promo banners), product detail & ratings, wishlist, cart, order history, live chat with sellers, account settings, dark mode, and language selection.',
    'A full UI/UX rebuild of an e-commerce app, done from scratch for coding practice and UI/UX exploration. The previous version followed a template closely — this version is a custom rebuild, not a re-skin.',
    'Feature Scope',
    array[
      'Authentication',
      'Home — browsing, categories, flash sale, promo banners',
      'Product detail & ratings',
      'Wishlist',
      'Shopping cart',
      'Order history',
      'Live chat with seller',
      'Account — profile, change password, privacy',
      'Dark mode toggle',
      'Language selection',
      'Help & about'
    ],
    'Repository',
    'Rahmadarf/e-commerce-flutter',
    array['Flutter', 'Dart'],
    'https://github.com/Rahmadarf/e-commerce-flutter',
    null, true, 40, 'published'
  )
  on conflict (owner_id, slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    description = excluded.description,
    detail_heading = excluded.detail_heading,
    features = excluded.features,
    note_label = excluded.note_label,
    note_body = excluded.note_body,
    tech_tags = excluded.tech_tags,
    repo_url = excluded.repo_url,
    live_url = excluded.live_url,
    is_featured = excluded.is_featured,
    sort_order = excluded.sort_order,
    status = excluded.status;

  -- skills --------------------------------------------------------------------
  -- is_core drives the "Main" tab, which overlaps the category tabs.

  insert into public.skills (
    owner_id, name, category, is_core, sort_order, status
  )
  values
    (v_owner, 'Next.js',      'frontend', true,  10, 'published'),
    (v_owner, 'React',        'frontend', true,  20, 'published'),
    (v_owner, 'TypeScript',   'frontend', true,  30, 'published'),
    (v_owner, 'Tailwind CSS', 'frontend', false, 40, 'published'),
    (v_owner, 'shadcn/ui',    'frontend', false, 50, 'published'),
    (v_owner, 'HTML',         'frontend', false, 60, 'published'),
    (v_owner, 'CSS',          'frontend', false, 70, 'published'),
    (v_owner, 'JavaScript',   'frontend', false, 80, 'published'),
    (v_owner, 'Laravel',      'backend',  true,  90, 'published'),
    (v_owner, 'Inertia.js',   'backend',  false, 100, 'published'),
    (v_owner, 'Flutter',      'mobile',   false, 110, 'published'),
    (v_owner, 'Dart',         'mobile',   false, 120, 'published'),
    (v_owner, 'Supabase',     'database', true,  130, 'published'),
    (v_owner, 'PostgreSQL',   'database', false, 140, 'published'),
    (v_owner, 'Figma',        'tools',    false, 150, 'published'),
    (v_owner, 'Git',          'tools',    false, 160, 'published')
  on conflict (owner_id, name) do update set
    category = excluded.category,
    is_core = excluded.is_core,
    sort_order = excluded.sort_order,
    status = excluded.status;

  -- social_links --------------------------------------------------------------

  insert into public.social_links (
    owner_id, platform, label, url, sort_order, status
  )
  values
    (
      v_owner, 'email', 'rahmadarifinsusilo17@gmail.com',
      'mailto:rahmadarifinsusilo17@gmail.com', 10, 'published'
    ),
    (
      v_owner, 'github', 'github.com/Rahmadarf',
      'https://github.com/Rahmadarf', 20, 'published'
    ),
    (
      v_owner, 'linkedin', 'linkedin.com/in/rahmad-arifin-55460b37b',
      'https://linkedin.com/in/rahmad-arifin-55460b37b', 30, 'published'
    ),
    (
      v_owner, 'instagram', 'instagram.com/rahmad4rifin',
      'https://instagram.com/rahmad4rifin', 40, 'published'
    )
  on conflict (owner_id, platform) do update set
    label = excluded.label,
    url = excluded.url,
    sort_order = excluded.sort_order,
    status = excluded.status;

  -- timeline_entries ----------------------------------------------------------
  -- Seeded as drafts: the design export marks all three as placeholder copy.

  if not exists (
    select 1 from public.timeline_entries where owner_id = v_owner
  ) then
    insert into public.timeline_entries (
      owner_id, period_label, title, role, note, sort_order, status
    )
    values
      (
        v_owner, '[ month year ]', '[ Event / seminar / competition name ]',
        '[ participant / committee / speaker / team member ]',
        '[ One-line note about this entry ]', 10, 'draft'
      ),
      (
        v_owner, '[ month year ]', '[ Event / seminar / competition name ]',
        '[ participant / committee / speaker / team member ]',
        '[ One-line note about this entry ]', 20, 'draft'
      ),
      (
        v_owner, '[ month year ]', '[ Event / seminar / competition name ]',
        '[ participant / committee / speaker / team member ]',
        '[ One-line note about this entry ]', 30, 'draft'
      );
  end if;
end $$;

import { loadEnvConfig } from '@next/env';
loadEnvConfig(process.cwd());

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL in .env.local');
  process.exit(1);
}
if (!SERVICE_KEY) {
  console.error(
    'Missing SUPABASE_SERVICE_ROLE_KEY in .env.local\n' +
      'Grab it at: Supabase Dashboard → Project Settings → API → service_role (reveal)\n' +
      'Add line: SUPABASE_SERVICE_ROLE_KEY=eyJ...\n'
  );
  process.exit(1);
}

const OWNER_GITHUB_ID = 19766543;
const OWNER_USERNAME = 'blainercosta';
const OWNER_AVATAR = `https://avatars.githubusercontent.com/u/${OWNER_GITHUB_ID}?v=4`;

type Frontmatter = {
  name: string;
  slug: string;
  category: string;
  version?: string;
  description: string;
  tags?: string[];
  created?: string;
  updated?: string;
};

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function findOwnerUserId(): Promise<string> {
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (error) throw error;
    if (!data || data.users.length === 0) break;

    for (const u of data.users) {
      const meta = u.user_metadata ?? {};
      const provider = meta.provider_id ? Number(meta.provider_id) : null;
      const username = meta.user_name ?? meta.preferred_username;
      if (provider === OWNER_GITHUB_ID || username === OWNER_USERNAME) {
        return u.id;
      }
    }

    if (data.users.length < 100) break;
    page += 1;
  }
  throw new Error(
    `Owner @${OWNER_USERNAME} (id ${OWNER_GITHUB_ID}) not found in auth.users.\n` +
      'Sign in to the app at least once with that GitHub account before running this script.'
  );
}

function isoOrNow(value: string | undefined): string {
  if (!value) return new Date().toISOString();
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

async function main() {
  const ownerId = await findOwnerUserId();
  console.log(`Owner user_id: ${ownerId}\n`);

  const agentsDir = path.join(process.cwd(), 'agents');
  if (!fs.existsSync(agentsDir)) {
    console.error(`No agents/ directory at ${agentsDir}`);
    process.exit(1);
  }

  const categories = fs
    .readdirSync(agentsDir)
    .filter((name) => fs.statSync(path.join(agentsDir, name)).isDirectory());

  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (const category of categories) {
    const categoryPath = path.join(agentsDir, category);
    const files = fs
      .readdirSync(categoryPath)
      .filter((file) => file.endsWith('.md'));

    for (const file of files) {
      const fullPath = path.join(categoryPath, file);
      const raw = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(raw);
      const fm = data as Frontmatter;

      if (!fm.slug || !fm.name || !fm.description || !fm.category) {
        console.warn(`✗ ${file}: missing required frontmatter (slug/name/description/category)`);
        failed += 1;
        continue;
      }

      const { data: existing } = await supabase
        .from('community_agents')
        .select('id')
        .eq('slug', fm.slug)
        .maybeSingle();

      const payload = {
        slug: fm.slug,
        name: fm.name,
        description: fm.description,
        category: fm.category,
        tags: fm.tags ?? [],
        content: content.trim(),
        version: fm.version ?? '1.0',
        status: 'approved' as const,
        rejection_reason: null,
        deleted_at: null,
        user_id: ownerId,
        author_github_id: OWNER_GITHUB_ID,
        author_username: OWNER_USERNAME,
        author_avatar_url: OWNER_AVATAR,
        created_at: isoOrNow(fm.created),
        updated_at: isoOrNow(fm.updated),
      };

      const { error } = existing
        ? await supabase
            .from('community_agents')
            .update(payload)
            .eq('id', existing.id)
        : await supabase.from('community_agents').insert(payload);

      if (error) {
        console.error(`✗ ${fm.slug}: ${error.message}`);
        failed += 1;
      } else if (existing) {
        console.log(`↻ ${fm.slug} (updated)`);
        updated += 1;
      } else {
        console.log(`+ ${fm.slug} (inserted)`);
        inserted += 1;
      }
    }
  }

  console.log(
    `\nDone. Inserted: ${inserted}. Updated: ${updated}. Failed: ${failed}.`
  );
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('\nUnexpected error:', err);
  process.exit(1);
});

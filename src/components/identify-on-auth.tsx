'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';
import { createClient } from '@/lib/supabase/client';

export function IdentifyOnAuth() {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const username =
        (user.user_metadata?.user_name as string | undefined) ??
        (user.user_metadata?.preferred_username as string | undefined);
      if (!username) return;
      posthog.identify(username, { is_curator: false });
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const username =
          (session.user.user_metadata?.user_name as string | undefined) ??
          (session.user.user_metadata?.preferred_username as string | undefined);
        if (username) posthog.identify(username);
      } else if (event === 'SIGNED_OUT') {
        posthog.reset();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return null;
}

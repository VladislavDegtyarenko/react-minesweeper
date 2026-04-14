import { NextResponse } from 'next/server';
import { SUPABASE_AVATAR_BUCKET } from '@/utils/supabase';
import { createSupabaseAdminClient } from '@/utils/supabase/admin';
import { createSupabaseServerClient } from '@/utils/supabase/server';

export async function POST() {
  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();

  if (!supabase || !adminClient) {
    return NextResponse.json(
      { error: 'Supabase server configuration is incomplete.' },
      { status: 500 },
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: 'You must be signed in to delete this account.' },
      { status: 401 },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('avatar_path')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json(
      { error: profileError.message },
      { status: 500 },
    );
  }

  if (profile?.avatar_path) {
    const { error: avatarError } = await adminClient.storage
      .from(SUPABASE_AVATAR_BUCKET)
      .remove([profile.avatar_path]);

    if (avatarError) {
      return NextResponse.json(
        { error: avatarError.message },
        { status: 500 },
      );
    }
  }

  const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(
    user.id,
  );

  if (deleteUserError) {
    return NextResponse.json(
      { error: deleteUserError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}

import 'server-only';

import sharp from 'sharp';
import { NextResponse } from 'next/server';
import { SUPABASE_AVATAR_BUCKET } from '@/utils/supabase';
import { createSupabaseAdminClient } from '@/utils/supabase/admin';
import { createSupabaseServerClient } from '@/utils/supabase/server';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  AVATAR_COMPRESSION_QUALITY,
  AVATAR_MAX_DIMENSION_PX,
  AVATAR_OUTPUT_EXTENSION,
  AVATAR_OUTPUT_MIME_TYPE,
  MAX_IMAGE_FILE_SIZE_BYTES,
} from '@/utils/image';

export const runtime = 'nodejs';

export async function POST(request: Request) {
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
      { error: 'You must be signed in to upload an avatar.' },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.has(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' },
      { status: 422 },
    );
  }

  if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'File is too large. Maximum allowed size is 4 MB.' },
      { status: 422 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const compressed = await sharp(buffer)
    .rotate()
    .resize(AVATAR_MAX_DIMENSION_PX, AVATAR_MAX_DIMENSION_PX, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: AVATAR_COMPRESSION_QUALITY })
    .toBuffer();

  const avatarPath = `${user.id}/avatar-${Date.now()}.${AVATAR_OUTPUT_EXTENSION}`;

  const { error: uploadError } = await adminClient.storage
    .from(SUPABASE_AVATAR_BUCKET)
    .upload(avatarPath, compressed, {
      contentType: AVATAR_OUTPUT_MIME_TYPE,
      cacheControl: '3600',
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  return NextResponse.json({ avatarPath });
}

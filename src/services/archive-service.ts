import { File } from 'expo-file-system';
import { Platform } from 'react-native';

import { supabase } from '@/services/supabase';
import type { CulturalEntry, CulturalEntryRecord, EntryCategory, MediaType } from '@/lib/types';

export type ContributionInput = Pick<
  CulturalEntry,
  'title' | 'description' | 'category' | 'province' | 'community' | 'language' | 'lyrics'
>;

export type UploadMediaInput = {
  uri: string;
  name: string;
  mimeType: string;
  type: Exclude<MediaType, 'link'>;
};

const mediaBucket = 'cultural-media';

function requireSupabaseClient() {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
}

function storageError(error: { message: string }) {
  if (/bucket not found/i.test(error.message)) {
    return new Error(
      'The private cultural-media bucket is missing from the Supabase project configured in this app. In the matching Supabase project, open SQL Editor and run supabase/schema.sql; it creates the bucket and its security policies. Then retry your upload. Do not make the bucket public or put a service-role key in the app.',
    );
  }
  return error;
}

async function addSignedMediaUrls(records: CulturalEntryRecord[]) {
  const client = requireSupabaseClient();
  return Promise.all(
    records.map(async (record) => {
      const { media_path: mediaPath, ...entry } = record;
      if (!mediaPath) return { ...entry, media_path: null, media_url: null };
      const { data, error } = await client.storage
        .from('cultural-media')
        .createSignedUrl(mediaPath, 60 * 60);
      if (error) throw storageError(error);
      return { ...entry, media_path: mediaPath, media_url: data.signedUrl };
    }),
  );
}

export async function listPublishedEntries(category?: EntryCategory, province?: string) {
  const client = requireSupabaseClient();

  let query = client
    .from('cultural_entries')
    .select('*')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (category) query = query.eq('category', category);
  if (province) query = query.ilike('province', province);

  const { data, error } = await query;
  if (error) throw error;
  return addSignedMediaUrls(data);
}

export async function listMyEntries(userId: string) {
  const client = requireSupabaseClient();

  const { data, error } = await client
    .from('cultural_entries')
    .select('*')
    .eq('created_by', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return addSignedMediaUrls(data);
}

export async function getEntry(id: string): Promise<CulturalEntry | null> {
  const client = requireSupabaseClient();

  const { data, error } = await client
    .from('cultural_entries')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const [entry] = await addSignedMediaUrls([data]);
  return entry;
}

export async function createEntry(
  input: ContributionInput,
  ownerId: string,
  media?: UploadMediaInput,
) {
  const client = requireSupabaseClient();

  let uploadedPath: string | null = null;
  let uploadCompleted = false;

  try {
    let mediaPath: string | null = null;
    let mediaType: MediaType | null = null;

    if (media) {
      const safeName = media.name.replace(/[^a-zA-Z0-9._-]/g, '-').slice(-90) || 'community-media';
      uploadedPath = `${ownerId}/${Date.now()}-${safeName}`;
      const body =
        Platform.OS === 'web'
          ? await fetch(media.uri).then((response) => {
              if (!response.ok) throw new Error('The selected file could not be read.');
              return response.blob();
            })
          : new File(media.uri);
      const { error: uploadError } = await client.storage
        .from(mediaBucket)
        .upload(uploadedPath, body, { contentType: media.mimeType, upsert: false });
      if (uploadError) throw storageError(uploadError);
      uploadCompleted = true;
      mediaPath = uploadedPath;
      mediaType = media.type;
    }

    const { error: insertError } = await client.from('cultural_entries').insert({
      ...input,
      media_path: mediaPath,
      media_type: mediaType,
      created_by: ownerId,
      status: 'pending',
    });
    if (insertError) throw insertError;
  } catch (error) {
    if (uploadedPath && uploadCompleted) {
      const { error: cleanupError } = await client.storage.from(mediaBucket).remove([uploadedPath]);
      if (cleanupError) {
        throw new Error(
          `${error instanceof Error ? error.message : 'The contribution could not be saved.'} The uploaded media also could not be removed: ${cleanupError.message}`,
        );
      }
    }
    throw error;
  }
}

export async function updateEntry(
  id: string,
  changes: Pick<
    CulturalEntry,
    'title' | 'description' | 'category' | 'province' | 'community' | 'language' | 'lyrics'
  >,
) {
  const client = requireSupabaseClient();

  const { data, error } = await client
    .from('cultural_entries')
    .update({ ...changes, status: 'pending' })
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('This entry is unavailable or you do not have permission to edit it.');
}

export async function deleteEntry(id: string) {
  const client = requireSupabaseClient();

  const { data, error } = await client
    .from('cultural_entries')
    .delete()
    .eq('id', id)
    .select('id')
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('This entry is unavailable or you do not have permission to delete it.');
}

export async function deleteEntryMedia(mediaPath: string) {
  const client = requireSupabaseClient();

  const { error } = await client.storage.from(mediaBucket).remove([mediaPath]);
  if (error) throw storageError(error);
}

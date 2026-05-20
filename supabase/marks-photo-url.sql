-- Spot photos on marks (public URL in mark-photos bucket).

alter table public.marks
  add column if not exists photo_url text;

comment on column public.marks.photo_url is
  'Public URL for a photo of this fishing spot (mark-photos storage bucket).';

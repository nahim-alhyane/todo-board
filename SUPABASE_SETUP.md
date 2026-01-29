# Supabase Setup Instructions

## Database Schema

Run the SQL in `supabase-schema.sql` in your Supabase SQL Editor to create all tables.

## Storage Setup

1. Go to Storage in your Supabase dashboard
2. Create a new bucket named `todo-attachments`
3. Configure the bucket:
   - Public bucket: NO (keep private)
   - File size limit: 50MB (or your preference)
   - Allowed MIME types: Leave empty to allow all types

4. Set up Storage policies:

```sql
-- Allow authenticated users to upload files
CREATE POLICY "Allow upload to todo-attachments"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'todo-attachments');

-- Allow authenticated users to read files
CREATE POLICY "Allow read from todo-attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'todo-attachments');

-- Allow authenticated users to delete files
CREATE POLICY "Allow delete from todo-attachments"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'todo-attachments');
```

## Migration from Old Schema

If you have existing data with the old schema:

1. Rename `assignee` to `assigned_to`:
```sql
ALTER TABLE todos RENAME COLUMN assignee TO assigned_to;
```

2. Create a view for backward compatibility with subtasks (optional):
```sql
CREATE VIEW subtasks AS SELECT * FROM tasks;
```

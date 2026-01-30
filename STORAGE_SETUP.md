# Supabase Storage Setup for Attachments

This document describes how to set up the Supabase Storage bucket for file attachments in the Todo Board application.

## Prerequisites

- A Supabase project
- Database schema already applied (see `supabase-schema.sql`)
- Supabase credentials configured in `.env.local`

## Storage Bucket Setup

### 1. Create the Storage Bucket

1. Log in to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **New bucket**
4. Configure the bucket:
   - **Name**: `attachments`
   - **Public bucket**: `false` (recommended for security)
   - **File size limit**: Set according to your needs (default: 50MB)
   - **Allowed MIME types**: Leave empty to allow all types, or restrict to specific types

5. Click **Create bucket**

### 2. Configure Storage Policies

To allow authenticated users to upload, view, and delete attachments:

1. Go to **Storage** > **Policies** in your Supabase dashboard
2. Select the `attachments` bucket
3. Add the following policies:

#### Policy 1: Allow Upload
```sql
CREATE POLICY "Allow authenticated users to upload attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'attachments');
```

#### Policy 2: Allow Select/Download
```sql
CREATE POLICY "Allow authenticated users to view attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'attachments');
```

#### Policy 3: Allow Delete
```sql
CREATE POLICY "Allow authenticated users to delete attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'attachments');
```

### 3. Public Bucket (Alternative)

If you want to make the bucket public (files accessible via public URL without authentication):

1. Set **Public bucket** to `true` during bucket creation
2. Use the following policy for public access:

```sql
CREATE POLICY "Allow public access to attachments"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'attachments');
```

**Note**: For this application, we recommend keeping the bucket **private** and using signed URLs for downloads.

## File Storage Structure

Files are stored with the following path structure:
```
attachments/
  {todo_id}/
    {random_id}.{extension}
```

For example:
```
attachments/
  550e8400-e29b-41d4-a716-446655440000/
    0.8374652341234.pdf
    0.1234567890123.png
```

## API Routes

The application includes the following API routes for attachment management:

### Upload Attachment
- **Endpoint**: `POST /api/attachments/upload`
- **Body**: `FormData` with `file` and `todoId`
- **Returns**: Attachment metadata

### Get Attachment (with signed URL)
- **Endpoint**: `GET /api/attachments/[id]`
- **Returns**: Attachment metadata with a temporary download URL (valid for 60 seconds)

### Delete Attachment
- **Endpoint**: `DELETE /api/attachments/[id]`
- **Returns**: Success message

## Current Implementation

The `todo-form-sheet.tsx` component currently handles file uploads directly using the Supabase client. This works well for simple use cases.

If you prefer using the API routes instead:

1. Replace the direct Supabase calls in `handleFileUpload` with a fetch to `/api/attachments/upload`
2. Replace the direct Supabase calls in `deleteAttachment` with a fetch to `/api/attachments/[id]`
3. Use the GET endpoint to generate signed URLs for downloading files

## Testing

To test the attachments feature:

1. Ensure the database schema is applied
2. Create the storage bucket as described above
3. Create or edit a todo item
4. Upload a file using the "Upload" button in the Attachments section
5. Verify the file appears in the list
6. Test deletion using the trash icon
7. Check the Supabase Storage dashboard to verify files are properly stored

## Troubleshooting

### "Storage bucket not found" error
- Verify the bucket name is exactly `attachments` (case-sensitive)
- Check that the bucket exists in your Supabase dashboard

### "Permission denied" errors
- Verify storage policies are correctly configured
- Check that RLS is enabled on the `attachments` table
- Ensure the Supabase client is properly authenticated

### File upload fails
- Check file size limits in the bucket configuration
- Verify MIME type restrictions (if any)
- Check browser console for detailed error messages

## Security Considerations

1. **File Size Limits**: Configure appropriate file size limits in the bucket settings
2. **MIME Type Validation**: Consider restricting allowed file types
3. **Virus Scanning**: For production, consider integrating virus scanning
4. **Access Control**: Keep the bucket private and use signed URLs for temporary access
5. **Storage Costs**: Monitor storage usage and implement cleanup policies for old attachments

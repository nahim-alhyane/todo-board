import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attachmentId = params.id;

    // First, get the attachment details to know the storage path
    const { data: attachment, error: fetchError } = await supabase
      .from("attachments")
      .select("*")
      .eq("id", attachmentId)
      .single();

    if (fetchError || !attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("attachments")
      .remove([attachment.storage_path]);

    if (storageError) {
      console.error("Storage deletion error:", storageError);
      // Continue with DB deletion even if storage deletion fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("attachments")
      .delete()
      .eq("id", attachmentId);

    if (dbError) {
      console.error("Database deletion error:", dbError);
      throw dbError;
    }

    return NextResponse.json(
      { message: "Attachment deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const attachmentId = params.id;

    // Get attachment details
    const { data: attachment, error: fetchError } = await supabase
      .from("attachments")
      .select("*")
      .eq("id", attachmentId)
      .single();

    if (fetchError || !attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      );
    }

    // Get signed URL for download
    const { data: signedUrlData, error: signedUrlError } = await supabase.storage
      .from("attachments")
      .createSignedUrl(attachment.storage_path, 60); // URL valid for 60 seconds

    if (signedUrlError || !signedUrlData) {
      console.error("Error creating signed URL:", signedUrlError);
      throw signedUrlError;
    }

    return NextResponse.json({
      ...attachment,
      download_url: signedUrlData.signedUrl,
    });
  } catch (error) {
    console.error("Error fetching attachment:", error);
    return NextResponse.json(
      { error: "Failed to fetch attachment" },
      { status: 500 }
    );
  }
}

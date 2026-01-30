import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const todoId = formData.get("todoId") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (!todoId) {
      return NextResponse.json(
        { error: "Todo ID is required" },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${todoId}/${fileName}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("attachments")
      .upload(filePath, file);

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }

    // Save metadata to database
    const { data, error: dbError } = await supabase
      .from("attachments")
      .insert({
        todo_id: todoId,
        filename: file.name,
        content_type: file.type,
        size: file.size,
        storage_path: filePath,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database insert error:", dbError);
      // Cleanup: remove uploaded file if DB insert fails
      await supabase.storage.from("attachments").remove([filePath]);
      throw dbError;
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return NextResponse.json(
      { error: "Failed to upload attachment" },
      { status: 500 }
    );
  }
}

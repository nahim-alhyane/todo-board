import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { notify_by_email } = body;

    const { data, error } = await supabase
      .from("stakeholders")
      .update({
        notify_by_email,
      })
      .eq("id", params.id)
      .select(`
        *,
        person:persons(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating stakeholder:", error);
    return NextResponse.json(
      { error: "Failed to update stakeholder" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from("stakeholders")
      .delete()
      .eq("id", params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stakeholder:", error);
    return NextResponse.json(
      { error: "Failed to delete stakeholder" },
      { status: 500 }
    );
  }
}

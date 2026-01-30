import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const todoId = searchParams.get("todo_id");

    let query = supabase
      .from("stakeholders")
      .select(`
        *,
        person:persons(*)
      `);

    if (todoId) {
      query = query.eq("todo_id", todoId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching stakeholders:", error);
    return NextResponse.json(
      { error: "Failed to fetch stakeholders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { todo_id, person_id, notify_by_email } = body;

    if (!todo_id || !person_id) {
      return NextResponse.json(
        { error: "todo_id and person_id are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("stakeholders")
      .insert({
        todo_id,
        person_id,
        notify_by_email: notify_by_email || false,
      })
      .select(`
        *,
        person:persons(*)
      `)
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating stakeholder:", error);
    return NextResponse.json(
      { error: "Failed to create stakeholder" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("persons")
      .select("*")
      .order("firstname", { ascending: true });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching persons:", error);
    return NextResponse.json(
      { error: "Failed to fetch persons" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstname, lastname, email, language_code } = body;

    if (!firstname || !lastname) {
      return NextResponse.json(
        { error: "firstname and lastname are required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("persons")
      .insert({
        firstname,
        lastname,
        email: email || null,
        language_code: language_code || "en",
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error creating person:", error);
    return NextResponse.json(
      { error: "Failed to create person" },
      { status: 500 }
    );
  }
}

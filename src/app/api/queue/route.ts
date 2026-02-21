import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { BookmarkRow, rowToBookmark } from "@/lib/types";

export async function GET() {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("action_queue")
    .select("*");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const items = (data as BookmarkRow[]).map(rowToBookmark);

  return NextResponse.json({ items });
}

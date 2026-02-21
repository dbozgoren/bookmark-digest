import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { BookmarkRow, rowToBookmark } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit") || 20), 100);
  const offset = Number(searchParams.get("offset") || 0);
  const category = searchParams.get("category");

  const supabase = getSupabase();
  let query = supabase
    .from("feed_view")
    .select("*")
    .order("bookmarked_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookmarks = (data as BookmarkRow[]).map((row) => ({
    ...rowToBookmark(row),
    signalType: row.signal_type ?? undefined,
  }));

  // Fetch distinct categories
  const { data: catData } = await supabase
    .from("bookmarks")
    .select("category")
    .not("category", "is", null);

  const categories = [...new Set((catData || []).map((c) => c.category as string))].sort();

  return NextResponse.json({ bookmarks, categories });
}

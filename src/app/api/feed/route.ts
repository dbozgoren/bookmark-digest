import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { BookmarkRow, rowToBookmark } from "@/lib/types";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit") || 20), 100);
  const offset = Number(searchParams.get("offset") || 0);
  const category = searchParams.get("category");
  const search = searchParams.get("q")?.trim();

  const supabase = getSupabase();
  let query = supabase
    .from("feed_view")
    .select("*")
    .order("bookmarked_at", { ascending: false, nullsFirst: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq("category", category);
  }

  if (search) {
    // Search in text and author fields
    query = query.or(`text.ilike.%${search}%,author.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const bookmarks = (data as BookmarkRow[]).map((row) => ({
    ...rowToBookmark(row),
    signalType: row.signal_type ?? undefined,
  }));

  // Fetch distinct categories by paginating (Supabase caps at 1000 rows)
  const allCats: string[] = [];
  let catOffset = 0;
  const catBatchSize = 1000;
  while (true) {
    const { data: catBatch } = await supabase
      .from("bookmarks")
      .select("category")
      .not("category", "is", null)
      .range(catOffset, catOffset + catBatchSize - 1);
    
    if (!catBatch || catBatch.length === 0) break;
    allCats.push(...catBatch.map((c) => c.category as string));
    if (catBatch.length < catBatchSize) break;
    catOffset += catBatchSize;
  }
  const categories = [...new Set(allCats)].sort();

  return NextResponse.json({ bookmarks, categories });
}

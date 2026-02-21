import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  const supabase = getSupabase();
  const [totalRes, signalsRes] = await Promise.all([
    supabase.from("bookmarks").select("id", { count: "exact", head: true }),
    supabase.from("signals").select("signal_type"),
  ]);

  if (totalRes.error || signalsRes.error) {
    const msg = totalRes.error?.message || signalsRes.error?.message;
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  const signals = signalsRes.data || [];
  const counts = { derated: 0, liked: 0, actioned: 0 };

  for (const s of signals) {
    if (s.signal_type === "derate") counts.derated++;
    else if (s.signal_type === "like") counts.liked++;
    else if (s.signal_type === "action") counts.actioned++;
  }

  return NextResponse.json({
    total: totalRes.count ?? 0,
    ...counts,
  });
}

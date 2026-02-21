import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

const PRIMARY_SIGNALS = ["derate", "like", "action"];
const VALID_SIGNALS = [...PRIMARY_SIGNALS, "action_done"];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { bookmarkId, signalType, remove } = body as {
    bookmarkId: string;
    signalType: string;
    remove?: boolean;
  };

  if (!bookmarkId || !signalType || !VALID_SIGNALS.includes(signalType)) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const supabase = getSupabase();

  if (remove) {
    const { error } = await supabase
      .from("signals")
      .delete()
      .match({ bookmark_id: bookmarkId, signal_type: signalType });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  // For primary signals (derate/like/action), clear existing primary signals first
  if (PRIMARY_SIGNALS.includes(signalType)) {
    await supabase
      .from("signals")
      .delete()
      .eq("bookmark_id", bookmarkId)
      .in("signal_type", PRIMARY_SIGNALS);
  }

  const { error } = await supabase
    .from("signals")
    .upsert(
      { bookmark_id: bookmarkId, signal_type: signalType },
      { onConflict: "bookmark_id,signal_type" }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

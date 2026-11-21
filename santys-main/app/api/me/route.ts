
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { sha256 } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const token = new URL(req.url).searchParams.get("key") || "";

    if (token.length < 30 || token.length > 200) {
      return NextResponse.json(
        { error: "Недействительная личная ссылка." },
        { status: 400 }
      );
    }

    const { data: participant, error: participantError } =
      await supabaseAdmin
        .from("participants")
        .select("id, name")
        .eq("access_token_hash", sha256(token))
        .maybeSingle();

    if (participantError) throw participantError;

    if (!participant) {
      return NextResponse.json(
        {
          error:
            "Личная ссылка не найдена. Проверь, что скопировал её полностью.",
        },
        { status: 404 }
      );
    }

    const { data: settings, error: settingsError } =
      await supabaseAdmin
        .from("game_settings")
        .select("drawn")
        .eq("id", 1)
        .single();

    if (settingsError || !settings) {
      throw settingsError || new Error("Game settings row is missing");
    }

    if (!settings.drawn) {
      return NextResponse.json(
        {
          name: participant.name,
          drawn: false,
        },
        {
          headers: { "Cache-Control": "no-store" },
        }
      );
    }

    const { data: assignment, error: assignmentError } =
      await supabaseAdmin
        .from("assignments")
        .select("recipient_id")
        .eq("giver_id", participant.id)
        .maybeSingle();

    if (assignmentError) throw assignmentError;

    if (!assignment) {
      return NextResponse.json(
        { error: "Результат пока недоступен. Обратись к организатору." },
        { status: 404 }
      );
    }

    const { data: recipient, error: recipientError } =
      await supabaseAdmin
        .from("participants")
        .select("name, wishes, avoid, notes")
        .eq("id", assignment.recipient_id)
        .single();

    if (recipientError) throw recipientError;

    if (!recipient) {
      return NextResponse.json(
        { error: "Не удалось найти получателя. Обратись к организатору." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        name: participant.name,
        drawn: true,
        recipient: recipient.name,
        recipientWishes: recipient.wishes,
        recipientAvoid: recipient.avoid,
        recipientNotes: recipient.notes,
      },
      {
        headers: { "Cache-Control": "no-store" },
      }
    );
  } catch (error) {
    console.error("Personal page lookup failed:", error);

    return NextResponse.json(
      {
        error:
          "Не удалось загрузить страницу. Попробуй позже или обратись к организатору.",
      },
      { status: 500 }
    );
  }
}

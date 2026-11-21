

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdmin } from "@/lib/security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Нет доступа." }, { status: 401 });
  }

  try {
    const [{ data: participants, error }, { data: status, error: statusError }] =
      await Promise.all([
        supabaseAdmin
          .from("participants")
          .select("id,name,wishes,avoid,notes,created_at")
          .order("created_at"),
        supabaseAdmin
          .from("game_settings")
          .select("registration_open,drawn")
          .eq("id", 1)
          .single(),
      ]);

    if (error) throw error;
    if (statusError || !status) {
      throw statusError || new Error("Game settings row is missing");
    }

    let pairs: { giver: string; recipient: string }[] = [];

    if (status.drawn) {
      const { data: assignments, error: assignmentError } =
        await supabaseAdmin
          .from("assignments")
          .select("giver_id,recipient_id");

      if (assignmentError) throw assignmentError;

      const names = new Map(
        (participants ?? []).map((person) => [person.id, person.name])
      );

      pairs = (assignments ?? []).map((assignment) => ({
        giver: names.get(assignment.giver_id) || "Участник не найден",
        recipient: names.get(assignment.recipient_id) || "Участник не найден",
      }));
    }

    return NextResponse.json({
      participants: participants ?? [],
      status,
      count: participants?.length ?? 0,
      pairs,
    });
  } catch (error: any) {
    console.error("Admin participants query failed:", error);

    return NextResponse.json(
      {
        error: `Не удалось загрузить участников: ${
          error?.message || "ошибка базы данных"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  if (!isAdmin()) {
    return NextResponse.json({ error: "Нет доступа." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = String(body.id || "");

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      return NextResponse.json(
        { error: "Некорректный участник." },
        { status: 400 }
      );
    }

    const { data: status, error: statusError } = await supabaseAdmin
      .from("game_settings")
      .select("drawn")
      .eq("id", 1)
      .single();

    if (statusError || !status) {
      throw statusError || new Error("Game settings row is missing");
    }

    if (status.drawn) {
      return NextResponse.json(
        { error: "После жеребьёвки удалять участников нельзя." },
        { status: 403 }
      );
    }

    const { error: giverError } = await supabaseAdmin
      .from("assignments")
      .delete()
      .eq("giver_id", id);

    if (giverError) throw giverError;

    const { error: recipientError } = await supabaseAdmin
      .from("assignments")
      .delete()
      .eq("recipient_id", id);

    if (recipientError) throw recipientError;

    const { data: deleted, error: deleteError } = await supabaseAdmin
      .from("participants")
      .delete()
      .eq("id", id)
      .select("id");

    if (deleteError) throw deleteError;

    if (!deleted || deleted.length === 0) {
      return NextResponse.json(
        { error: "Участник не найден." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, message: "Участник удалён." });
  } catch (error: any) {
    console.error("Admin participant deletion failed:", error);

    return NextResponse.json(
      { error: "Не удалось удалить участника." },
      { status: 500 }
    );
  }
}

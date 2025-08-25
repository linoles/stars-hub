import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient(cookies());

  try {
    const userTag = (await request.json()).tgTag;

    if (!userTag) {
      return NextResponse.json(
        { error: "Поле tgTag обязательно" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .ilike("tgUsername", `%${userTag}%`)
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (e) {
    console.error("Server error:", e);
    return NextResponse.json({ error: "Некорректный запрос" }, { status: 400 });
  }
}

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient(cookies());

  try {
    const userData = await request.json();

    if (!userData?.tgId) {
      return NextResponse.json(
        { error: "Поле tgId обязательно" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("users")
      .update(userData)
      .match({ tgId: userData.tgId })
      .select()
      .single();

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

import { NextRequest, NextResponse } from "next/server";
import sql from "../../../lib/db";

export async function GET(_req: NextRequest) {
  try {
    const todos = await sql`SELECT id, content, completed, created_at FROM todos ORDER BY created_at DESC`;
    return NextResponse.json(todos);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const content = typeof body?.content === "string" ? body.content.trim() : "";
    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const inserted = await sql`
      INSERT INTO todos (content)
      VALUES (${content})
      RETURNING id, content, completed, created_at
    `;

    return NextResponse.json(inserted[0], { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const id = Number(body?.id);
    const completed = Boolean(body?.completed);

    if (!Number.isFinite(id) || id <= 0) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const updated = await sql`
      UPDATE todos
      SET completed = ${completed}
      WHERE id = ${id}
      RETURNING id, content, completed, created_at
    `;

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(updated[0]);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

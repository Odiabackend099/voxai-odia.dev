import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));

  const name        = body.name ?? `odia-key-${Date.now()}`;
  const role        = body.role ?? "live";
  const owner_email = process.env.OWNER_EMAIL!;
  const rate_limit  = body.rate_limit ?? 120;
  const total_quota = body.total_quota ?? null;

  const sb = supabaseAdmin();
  const { data, error } = await sb.rpc("admin_create_api_key", {
    p_name: name,
    p_role: role,
    p_owner_email: owner_email,
    p_rate_limit: rate_limit,
    p_total_quota: total_quota
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

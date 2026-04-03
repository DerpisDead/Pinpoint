"use server";

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function deleteAccount() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Sign out the session first
  await supabase.auth.signOut();

  // Use service role to hard-delete the auth user
  // (Requires SUPABASE_SERVICE_ROLE_KEY in .env.local)
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const admin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceKey
    );
    await admin.auth.admin.deleteUser(user.id);
  }

  redirect("/");
}

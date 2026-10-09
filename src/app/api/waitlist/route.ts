const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  let email: unknown;
  try {
    ({ email } = await request.json());
  } catch {
    return Response.json({ error: "Send the email as JSON." }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL.test(email.trim())) {
    return Response.json({ error: "That email doesn't look right. Check it and try again." }, { status: 400 });
  }
  // TODO: send the address to the mailing list provider (Klaviyo, Mailchimp or
  // Shopify customers) and return stored: true once it is saved there.
  return Response.json({ ok: true, stored: false });
}

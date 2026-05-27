// api/notify.js
// Vercel serverless function — receives Supabase webhook and sends notification email

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body;
    console.log("Webhook body:", JSON.stringify(body));

    const { type, table, record } = body;
    console.log("type:", type, "table:", table);
    console.log("record:", JSON.stringify(record));

    if (type !== "INSERT") {
      return res.status(200).json({ message: "Ignored" });
    }

    // Look up coach name
    let coachName = "A coach";
    const submittedBy = record?.submitted_by;
    console.log("submitted_by:", submittedBy);

    if (submittedBy) {
      const url = `${process.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${submittedBy}&select=name`;
      console.log("Fetching profile from:", url);

      const profileRes = await fetch(url, {
        headers: {
          "apikey": process.env.SUPABASE_SERVICE_KEY,
          "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
        }
      });

      console.log("Profile response status:", profileRes.status);
      const profileText = await profileRes.text();
      console.log("Profile response body:", profileText);

      try {
        const profiles = JSON.parse(profileText);
        if (profiles.length > 0) coachName = profiles[0].name;
      } catch(e) {
        console.error("Profile parse error:", e.message);
      }
    }

    console.log("Coach name resolved to:", coachName);

    let subject = "";
    let message = "";

    if (table === "registrations") {
      subject = "WPJFC — New Player Registration Submitted";
      message = `A new registration has been submitted by ${coachName}. Log in to review it at https://waldridge-park.vercel.app`;
    } else if (table === "kit_orders") {
      subject = "WPJFC — New Kit Order Submitted";
      message = `A new kit order has been submitted by ${coachName}. Log in to review it at https://waldridge-park.vercel.app`;
    } else {
      console.log("Unrecognised table:", table);
      return res.status(200).json({ message: "Ignored" });
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "WPJFC App <onboarding@resend.dev>",
        to: ["craigfisher2001@hotmail.com"],
        subject,
        text: message,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Resend error:", err);
      return res.status(500).json({ error: "Failed to send email" });
    }

    console.log("Email sent successfully");
    return res.status(200).json({ message: "Notification sent" });

  } catch (err) {
    console.error("Notify error:", err.message);
    return res.status(500).json({ error: err.message });
  }
}

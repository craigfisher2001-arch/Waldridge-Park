// api/notify.js
// Vercel serverless function — receives Supabase webhook and sends notification email

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { type, table, record } = req.body;

    // Only handle INSERT events
    if (type !== "INSERT") {
      return res.status(200).json({ message: "Ignored" });
    }

    // Look up coach name from profiles table using submitted_by UUID
    let coachName = "A coach";
    if (record.submitted_by) {
      const profileRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${record.submitted_by}&select=name`,
        {
          headers: {
            "apikey": process.env.SUPABASE_SERVICE_KEY,
            "Authorization": `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          }
        }
      );
      if (profileRes.ok) {
        const profiles = await profileRes.json();
        if (profiles.length > 0) coachName = profiles[0].name;
      }
    }

    let subject = "";
    let message = "";

    if (table === "registrations") {
      subject = "WPJFC — New Player Registration Submitted";
      message = `A new registration has been submitted by ${coachName}. Log in to review it at https://waldridge-park.vercel.app`;
    } else if (table === "kit_orders") {
      subject = "WPJFC — New Kit Order Submitted";
      message = `A new kit order has been submitted by ${coachName}. Log in to review it at https://waldridge-park.vercel.app`;
    } else {
      return res.status(200).json({ message: "Ignored" });
    }

    // Send email via Resend
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

    return res.status(200).json({ message: "Notification sent" });

  } catch (err) {
    console.error("Notify error:", err);
    return res.status(500).json({ error: err.message });
  }
}

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

    let subject = "";
    let message = "";

    if (table === "registrations") {
      const submittedBy = record.submitted_by_name || "A coach";
      subject = "WPJFC — New Player Registration Submitted";
      message = `A new registration has been submitted by ${submittedBy}. Log in to review it at https://waldridge-park.vercel.app`;
    } else if (table === "kit_orders") {
      const submittedBy = record.submitted_by_name || "A coach";
      subject = "WPJFC — New Kit Order Submitted";
      message = `A new kit order has been submitted by ${submittedBy}. Log in to review it at https://waldridge-park.vercel.app`;
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

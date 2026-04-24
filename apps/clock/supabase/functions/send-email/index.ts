import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, name, email, message, quoteData } = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    let subject: string;
    let htmlBody: string;

    if (type === "contact") {
      subject = `New Contact Form: ${name}`;
      htmlBody = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `;
    } else if (type === "quote") {
      subject = `New Quote Request: ${name}`;
      const q = quoteData;
      htmlBody = `
        <h2>New Project Quote Request</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${q.phone || "N/A"}</p>
        <p><strong>Company:</strong> ${q.company || "N/A"}</p>
        <hr/>
        <h3>Project Details</h3>
        <p><strong>Service:</strong> ${q.serviceType}</p>
        <p><strong>Cameras:</strong> ${q.cameras}</p>
        <p><strong>Format:</strong> ${q.recordingFormat}</p>
        <p><strong>Streaming:</strong> ${q.streaming ? (q.streamingPlatform || "Yes") : "No"}</p>
        <p><strong>Duration:</strong> ${q.duration}</p>
        <p><strong>Budget Range:</strong> ${q.budgetRange}</p>
        <p><strong>Extras:</strong> ${q.extras?.length ? q.extras.join(", ") : "None"}</p>
        <p><strong>Estimated Range:</strong> $${q.estimateLow?.toLocaleString()} – $${q.estimateHigh?.toLocaleString()}</p>
      `;
    } else {
      throw new Error("Invalid email type");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Disbrow Productions <onboarding@resend.dev>",
        to: ["andrew@disbrowproductions.com"],
        subject,
        html: htmlBody,
        reply_to: email,
      }),
    });

    const resData = await res.json();

    if (!res.ok) {
      console.error("Resend error:", resData);
      throw new Error(resData.message || "Failed to send email");
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

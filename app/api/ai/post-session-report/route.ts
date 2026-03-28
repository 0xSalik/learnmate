import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: Request) {
  const { childName = "Child", projectTitle = "Project", sessionNotes = "" } = await req.json().catch(() => ({}));

  const report = {
    what_we_covered: `Worked on ${projectTitle} using guided checkpoints and explanation loops.`,
    what_your_child_found_hard: "Transitioning from one step to the next without concrete examples.",
    what_to_reinforce_at_home: "Ask for a 60-second explanation after each mini step.",
    materials_to_buy_for_next_time: ["A4 sheets", "Color pens"],
    freelancer_observation: `${childName} responds strongly to practical examples and praise for effort.`,
    sessionNotes,
  };

  if (process.env.RESEND_API_KEY && process.env.REPORT_TO_EMAIL) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: "LearnMate <reports@learnmate.app>",
      to: process.env.REPORT_TO_EMAIL,
      subject: `Session report: ${childName}`,
      html: `<pre>${JSON.stringify(report, null, 2)}</pre>`,
    });
  }

  return NextResponse.json(report);
}

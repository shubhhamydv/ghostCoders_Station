import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, mode, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "You are a helpful AI interview coach.";

    if (mode === "mock-interview") {
      systemPrompt = `You are a professional interviewer conducting a realistic mock interview for ${context?.domain || 'engineering'} placements in India.
The student is ${context?.userName || 'a student'} preparing for ${context?.company || 'a top company'}.

Rules:
- Be professional and realistic like a real interviewer
- Mix HR and technical questions
- Ask one question at a time
- When asked to evaluate, provide CONFIDENCE and CLARITY scores and SUGGESTIONS
- Keep the interview flowing naturally
- Ask follow-up questions based on answers
- Be specific to Indian campus placement context`;
    } else if (mode === "interview-prep") {
      systemPrompt = `You are an expert interview coach for ${context?.domain || 'engineering'} placements in India. 
The student's name is ${context?.userName || 'Student'}, preparing for ${context?.company || 'a company'} at ${context?.level || 'Foundation'} level.
Their specialization is ${context?.specialization || 'general'} from ${context?.college || 'their college'}.

Rules:
- Ask one interview question at a time
- After the student answers, give specific, actionable feedback (2-3 sentences max)
- Rate their answer out of 10
- Then ask the next question
- Tailor questions to the company and level
- Use examples relevant to Indian placements
- Be encouraging but honest`;
    } else if (mode === "self-intro-feedback") {
      systemPrompt = `You are a speech coach. Analyze the student's self-introduction and provide:
1. Overall rating out of 10
2. What they did well (2 points)
3. What to improve (3 specific, actionable points)
4. A rewritten improved version of any weak lines
Be specific to their content, not generic.`;
    } else if (mode === "self-intro-generate") {
      systemPrompt = `You are an expert interview coach. Generate a natural, confident self-introduction script for an Indian student. 
Return ONLY the script lines, one per line, no numbering. Make it 6-8 lines, each line should be 1-2 sentences.
Make it natural and conversational, not robotic. Include greeting, education, skills, motivation, and closing.
Tailor it specifically to the details provided.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

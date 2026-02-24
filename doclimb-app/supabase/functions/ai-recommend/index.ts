// import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// serve(async (req) => {
//   if (req.method !== "POST") {
//     return new Response(
//       JSON.stringify({ error: "POST only" }),
//       { status: 405 }
//     );
//   }

//   let body;
//   try {
//     body = await req.json();
//   } catch {
//     return new Response(
//       JSON.stringify({ error: "Invalid JSON body" }),
//       { status: 400 }
//     );
//   }

//   const { recent_records } = body;

//   const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
//   if (!OPENAI_API_KEY) {
//     return new Response(
//       JSON.stringify({ error: "OPENAI_API_KEY not set" }),
//       { status: 500 }
//     );
//   }

//   const prompt = `
// 너는 클라이밍 코치 AI야.
// 최근 운동 기록을 보고 다음 운동을 추천해줘.

// ${JSON.stringify(recent_records, null, 2)}

// 조건:
// - 한국어
// - 짧게
// - 동기부여 한 문장 포함
// `;

//   const response = await fetch("https://api.openai.com/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${OPENAI_API_KEY}`,
//     },
//     body: JSON.stringify({
//       model: "gpt-4o-mini",
//       messages: [{ role: "user", content: prompt }],
//     }),
//   });

//   if (!response.ok) {
//     const err = await response.text();
//     return new Response(JSON.stringify({ error: err }), { status: 500 });
//   }

//   const data = await response.json();
//   const message = data.choices?.[0]?.message?.content ?? "";

//   return new Response(
//     JSON.stringify({ recommendation: message }),
//     { headers: { "Content-Type": "application/json" } }
//   );
// });

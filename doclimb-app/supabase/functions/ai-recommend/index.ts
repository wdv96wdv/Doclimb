import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { recent_records } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    // 확인된 목록 중 가장 성능이 좋은 2.5 Flash 모델 사용
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `너는 전문 클라이밍 코치야. 다음 클라이밍 기록을 분석해서 짧은 운동 추천과 응원 메시지를 한국어로 작성해줘. 
            기록 데이터: ${JSON.stringify(recent_records)}`
          }]
        }]
      }),
    });

    const data = await response.json();

    if (data.error) {
      return new Response(JSON.stringify({ 
        msg: "Gemini 서버 응답 에러", 
        reason: data.error.message 
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const message = data.candidates?.[0]?.content?.parts?.[0]?.text || "분석 내용을 가져오지 못했습니다.";

    return new Response(JSON.stringify({ recommendation: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal Server Error", details: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
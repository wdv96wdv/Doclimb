-- Update legacy V-scale difficulties to The Climb color grades in the records table
UPDATE public.records
SET difficulty = CASE difficulty
    WHEN 'V0' THEN '흰색'
    WHEN 'V1' THEN '주황'
    WHEN 'V2' THEN '노랑'
    WHEN 'V3' THEN '초록'
    WHEN 'V4' THEN '파랑'
    WHEN 'V5' THEN '빨강'
    WHEN 'V6' THEN '보라'
    WHEN 'V7' THEN '회색'
    WHEN 'V8' THEN '갈색'
    WHEN 'V9' THEN '검정색'
    WHEN 'V10' THEN '무지개색'
    ELSE difficulty
END
WHERE difficulty LIKE 'V%';

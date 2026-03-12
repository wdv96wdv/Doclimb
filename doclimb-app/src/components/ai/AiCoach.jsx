import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, BrainCircuit, RefreshCw } from 'lucide-react';
import styles from './AiCoach.module.css';

const fetchAiRecommendation = async (records) => {
  const API_URL = 'https://ufdqnkmefcaemqvietpf.supabase.co/functions/v1/ai-recommend';
  
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recent_records: records }),
  });

  if (!response.ok) throw new Error('네트워크 응답에 문제가 발생했습니다.');
  const data = await response.json();
  return data.recommendation;
};

export default function AiCoach() {
  const { userProfile, loading: authLoading } = useAuth();
  const [recommendation, setRecommendation] = useState('');
  const [loading, setLoading] = useState(false);
  const [realRecords, setRealRecords] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    const fetchMyRecords = async () => {
      if (authLoading) return;
      if (!userProfile) {
        setIsFetching(false);
        return;
      }

      try {
        setIsFetching(true);
        const { data, error } = await supabase
          .from('records')
          .select('date, climb_type, difficulty, success, location')
          .eq('user_id', userProfile.id)
          .order('date', { ascending: false })
          .limit(5);

        if (error) throw error;
        setRealRecords(data || []);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchMyRecords();
  }, [userProfile, authLoading]);

  const handleGetAdvice = async () => {
    if (realRecords.length === 0) {
      alert("분석할 등반 기록이 없습니다. 먼저 기록을 등록해주세요!");
      return;
    }

    setLoading(true);
    try {
      const result = await fetchAiRecommendation(realRecords);
      setRecommendation(result);
    } catch (error) {
      console.error("AI 요청 실패:", error);
      alert("코칭 리포트를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <div className={styles.headerSection}>
          <h2 className={styles.title}><Sparkles className="inline-block mr-2" size={32} color="#5271ff" /> AI 코칭 센터</h2>
          <div className={styles.subtitle}>
            {isFetching ? (
              <div className="flex items-center justify-center gap-2">
                <div className={styles.spinner} />
                <span>데이터 동기화 중...</span>
              </div>
            ) : realRecords.length > 0 ? (
              `최근 ${realRecords.length}개의 등반 데이터를 분석할 준비가 되었습니다.`
            ) : (
              "분석할 데이터가 없습니다. 먼저 기록을 추가해 주세요!"
            )}
          </div>
        </div>

        <button
          onClick={handleGetAdvice}
          disabled={loading || isFetching || realRecords.length === 0}
          className={styles.coachButton}
        >
          {loading ? (
            <>
              <RefreshCw className="animate-spin" size={20} />
              <span>AI 코칭 생성 중...</span>
            </>
          ) : (
            <>
              <BrainCircuit size={22} />
              <span>나만의 맞춤 코칭 받기</span>
            </>
          )}
        </button>

        {recommendation && (
          <div className={styles.reportCard}>
            <div className={styles.reportHeader}>
              <span className={styles.reportTag}>DOCLIMB AI ENGINE</span>
              <span className="text-white/30 text-xs font-mono">Status: Analysis Complete</span>
            </div>
            
            <div className={styles.reportContent}>
              <ReactMarkdown
                components={{
                  h1: ({...props}) => <h1 className="text-3xl font-black text-white mb-8" {...props} />,
                  h2: ({...props}) => <h2 className="text-xl font-bold text-blue-400 mt-12 mb-6 pb-2 border-b border-white/10" {...props} />,
                  p: ({...props}) => <p className="text-white/70 leading-relaxed mb-6 text-lg" {...props} />,
                  strong: ({...props}) => <strong className="text-white font-bold bg-blue-500/20 px-1.5 py-0.5 rounded" {...props} />,
                  li: ({...props}) => <li className="list-disc ml-5 mb-3 text-white/70" {...props} />,
                  ul: ({...props}) => <ul className="mb-6" {...props} />,
                }}
              >
                {recommendation}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";

import Home from "./pages/Home/Home";
import Records from "./pages/Records/Records";
import NewRecord from "./pages/Records/NewRecord";
import RecordDetail from "./pages/Records/RecordDetail";
import EditRecord from "./pages/Records/EditRecord";
import Login from "./pages/Login/Login";
import Join from "./pages/Join/Join";
import MyPage from "./pages/MyPage/MyPage";
import NotFound from "./pages/NotFound/NotFound";
import Community from "./pages/Community/Community";
import PostDetail from "./pages/Community/PostDetail";
import PostForm from "./pages/Community/PostForm";
import Admin from "./pages/Admin/Admin";
import GymList from "./pages/Gym/GymList";
import Guide from  "./pages/Guide/Guide"

function Navigation() {
  const { userProfile, loading } = useAuth();
  const isAdmin = userProfile?.role?.toUpperCase() === 'ADMIN';

  if (loading) return <div style={{display:'flex', justifyContent:'center', alignItems:'center', height:'100vh'}}>권한 확인 중...</div>;

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* 로그인/회원가입: 이미 로그인 된 유저는 각자의 홈으로 보냄 */}
          <Route
            path="/login"
            element={
              userProfile ? (isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />) : <Login />
            }
          />
          <Route path="/join" element={userProfile ? <Navigate to="/" replace /> : <Join />} />

          {/* 관리자 전용: 관리자가 아니면 무조건 홈으로 */}
          <Route
            path="/admin/*"
            element={isAdmin ? <Admin /> : <Navigate to="/" replace />}
          />

          {/* 일반 유저 전용: 관리자가 접근하면 관리자 페이지로, 비로그인은 로그인으로 */}
          <Route
            path="/"
            element={!userProfile ? <Navigate to="/login" replace /> : (isAdmin ? <Navigate to="/admin" replace /> : <Home />)}
          />

          {/* 나머지 보호된 경로들 */}
          <Route path="/records/*" element={!userProfile ? <Navigate to="/login" replace /> : (isAdmin ? <Navigate to="/admin" replace /> : <Records />)} />
          <Route path="/mypage" element={!userProfile ? <Navigate to="/login" replace /> : (isAdmin ? <Navigate to="/admin" replace /> : <MyPage />)} />
          <Route path="/community/*" element={!userProfile ? <Navigate to="/login" replace /> : (isAdmin ? <Navigate to="/admin" replace /> : <Community />)} />
          <Route path="/gymlist/*" element={!userProfile ? <Navigate to="/login" replace /> : (isAdmin ? <Navigate to="/admin" replace /> : <GymList />)} />          
          <Route path="/guide/*" element={!userProfile ? <Navigate to="/login" replace /> : (isAdmin ? <Navigate to="/admin" replace /> : <Guide />)} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}

export default App;
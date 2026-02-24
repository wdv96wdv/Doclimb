import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
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
import Guide from "./pages/Guide/Guide"
import CreateBeta from "./pages/Beta/CreateBeta";
import BetaList from "./pages/Beta/BetaList";

function Navigation() {
  const { userProfile, loading } = useAuth();
  const isAdmin = userProfile?.role?.toUpperCase() === 'ADMIN';

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>권한 확인 중...</div>;

  return (
    <BrowserRouter>
      <Layout>
      <Routes>
          {/* [공개 경로] */}
          <Route path="/" element={isAdmin ? <Navigate to="/admin" replace /> : <Home />} />
          <Route path="/guide/*" element={<Guide />} />
          <Route path="/gymlist/*" element={<GymList />} />
          <Route path="/beta" element={<BetaList />} />

          {/* 🌟 커뮤니티 (목록과 상세 페이지는 공개) */}
          <Route path="/community" element={<Outlet />}>
            <Route index element={<Community />} />
            <Route path=":id" element={<PostDetail />} />
            
            {/* 글쓰기와 수정은 로그인이 필요함 */}
            <Route 
              path="new" 
              element={!userProfile ? <Navigate to="/login" replace /> : <PostForm />} 
            />
            <Route 
              path=":id/edit" 
              element={!userProfile ? <Navigate to="/login" replace /> : <PostForm />} 
            />
          </Route>

          {/* [보호된 경로 - 베타 업로드] */}
          <Route
            path="/beta/new"
            element={!userProfile ? <Navigate to="/login" replace /> : (isAdmin ? <Navigate to="/admin" replace /> : <CreateBeta />)}
          />

          {/* [로그인/회원가입] */}
          <Route
            path="/login"
            element={userProfile ? (isAdmin ? <Navigate to="/admin" replace /> : <Navigate to="/" replace />) : <Login />}
          />
          <Route path="/join" element={userProfile ? <Navigate to="/" replace /> : <Join />} />

          {/* [관리자 전용] */}
          <Route
            path="/admin/*"
            element={isAdmin ? <Admin /> : <Navigate to="/" replace />}
          />

          {/* [보호된 경로 - 개인 기록 및 마이페이지] */}
          <Route
            path="/records"
            element={!userProfile ? <Navigate to="/login" replace /> : (isAdmin ? <Navigate to="/admin" replace /> : <Outlet />)}
          >
            <Route index element={<Records />} />
            <Route path="new" element={<NewRecord />} />
            <Route path=":id/edit" element={<EditRecord />} />
            <Route path=":id" element={<RecordDetail />} />
          </Route>

          <Route
            path="/mypage"
            element={!userProfile ? <Navigate to="/login" replace /> : (isAdmin ? <Navigate to="/admin" replace /> : <MyPage />)}
          />

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
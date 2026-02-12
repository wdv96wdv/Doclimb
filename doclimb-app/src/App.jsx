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

function Navigation() {
  const { userProfile, loading } = useAuth();
  const isAdmin = userProfile?.role?.toUpperCase() === 'ADMIN';

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>권한 확인 중...</div>;

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* [공개 경로] 로그인 여부와 상관없이 누구나 접근 가능 */}
          <Route path="/" element={isAdmin ? <Navigate to="/admin" replace /> : <Home />} />
          <Route path="/guide/*" element={<Guide />} />
          <Route path="/gymlist/*" element={<GymList />} />

          {/* [로그인/회원가입] 로그인 된 유저는 접근 시 홈으로 리다이렉트 */}
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

          {/* [보호된 경로] 로그인한 일반 유저만 접근 가능 */}
          {/* 1. 등반 기록 */}
          <Route
            path="/records"
            element={!userProfile ? <Navigate to="/login" replace /> : (isAdmin ? <Navigate to="/admin" replace /> : <Outlet />)}
          >
            <Route index element={<Records />} />
            <Route path="new" element={<NewRecord />} />
            <Route path=":id/edit" element={<EditRecord />} />
            <Route path=":id" element={<RecordDetail />} />
          </Route>

          {/* 2. 마이페이지 */}
          <Route
            path="/mypage"
            element={!userProfile ? <Navigate to="/login" replace /> : (isAdmin ? <Navigate to="/admin" replace /> : <MyPage />)}
          />

          {/* 3. 커뮤니티 (비로그인 유저는 읽기만 가능하게 할지 고민해 보세요. 여기서는 일단 보호로 둡니다.) */}
          <Route
            path="/community"
            element={!userProfile ? <Navigate to="/login" replace /> : (isAdmin ? <Navigate to="/admin" replace /> : <Outlet />)}
          >
            <Route index element={<Community />} />
            <Route path="new" element={<PostForm />} />
            <Route path=":id/edit" element={<PostForm />} />
            <Route path=":id" element={<PostDetail />} />
          </Route>

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
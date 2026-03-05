import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Layout from "./components/layout/Layout";
import Loading from "./components/common/Loading";
import { Analytics } from "@vercel/analytics/react"

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
import AiCoach from "./components/ai/AiCoach";
import UpdatePassword from "./pages/Auth/UpdatePassword";

function Navigation() {
  const { userProfile, loading } = useAuth();
  const isAdmin = userProfile?.role?.toUpperCase() === "ADMIN";

  if (loading) {
    return <Loading message="권한 정보를 확인하고 있습니다..." />;
  }

  const RequireUserNonAdmin = ({ children }) => {
    if (!userProfile) return <Navigate to="/login" replace />;
    if (isAdmin) return <Navigate to="/admin" replace />;
    return children;
  };

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* [공개 경로] */}
          <Route
            path="/"
            element={isAdmin ? <Navigate to="/admin" replace /> : <Home />}
          />
          <Route path="/guide/*" element={<Guide />} />
          <Route path="/gymlist/*" element={<GymList />} />
          <Route path="/beta" element={<BetaList />} />

          {/* 🌟 AI 코치: 관리자는 접근 불가 (Admin으로 이동) */}
          <Route
            path="/ai-coach"
            element={
              <RequireUserNonAdmin>
                <AiCoach />
              </RequireUserNonAdmin>
            }
          />

          {/* 🌟 커뮤니티 */}
          <Route path="/community" element={<Outlet />}>
            <Route index element={<Community />} />
            <Route path=":id" element={<PostDetail />} />

            {/* 글쓰기와 수정: 관리자는 접근 불가 (Admin으로 이동) */}
            <Route
              path="new"
              element={
                <RequireUserNonAdmin>
                  <PostForm />
                </RequireUserNonAdmin>
              }
            />
            <Route
              path=":id/edit"
              element={
                <RequireUserNonAdmin>
                  <PostForm />
                </RequireUserNonAdmin>
              }
            />
          </Route>

          {/* [보호된 경로 - 베타 업로드]: 이미 관리자 처리 완료됨 */}
          <Route
            path="/beta/new"
            element={
              <RequireUserNonAdmin>
                <CreateBeta />
              </RequireUserNonAdmin>
            }
          />

          {/* [로그인/회원가입] */}
          <Route
            path="/login"
            element={
              userProfile ? (
                isAdmin ? (
                  <Navigate to="/admin" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/join"
            element={
              userProfile ? <Navigate to="/" replace /> : <Join />
            }
          />
          <Route path="/update-password" element={<UpdatePassword />} />

          {/* [관리자 전용] */}
          <Route
            path="/admin/*"
            element={isAdmin ? <Admin /> : <Navigate to="/" replace />}
          />

          {/* [보호된 경로 - 개인 기록]: 이미 관리자 처리 완료됨 */}
          <Route
            path="/records"
            element={
              <RequireUserNonAdmin>
                <Outlet />
              </RequireUserNonAdmin>
            }
          >
            <Route index element={<Records />} />
            <Route path="new" element={<NewRecord />} />
            <Route path=":id/edit" element={<EditRecord />} />
            <Route path=":id" element={<RecordDetail />} />
          </Route>

          <Route
            path="/mypage"
            element={
              <RequireUserNonAdmin>
                <MyPage />
              </RequireUserNonAdmin>
            }
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
      <Analytics />
      <Navigation />
    </AuthProvider>
  );
}

export default App;
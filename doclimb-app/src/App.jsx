import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth, AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout/Layout";
import Loading from "./components/Common/Loading";
import RequireUserNonAdmin from "./routes/RequireUserNonAdmin";
import { Analytics } from "@vercel/analytics/react"

// Lazy Loading 적용
const Home = lazy(() => import("./pages/Home/Home"));
const Records = lazy(() => import("./pages/Records/Records"));
const NewRecord = lazy(() => import("./pages/Records/NewRecord"));
const RecordDetail = lazy(() => import("./pages/Records/RecordDetail"));
const EditRecord = lazy(() => import("./pages/Records/EditRecord"));
const Login = lazy(() => import("./pages/Login/Login"));
const Join = lazy(() => import("./pages/Join/Join"));
const MyPage = lazy(() => import("./pages/MyPage/MyPage"));
const NotFound = lazy(() => import("./pages/NotFound/NotFound"));
const Community = lazy(() => import("./pages/Community/Community"));
const PostDetail = lazy(() => import("./pages/Community/PostDetail"));
const PostForm = lazy(() => import("./pages/Community/PostForm"));
const Admin = lazy(() => import("./pages/Admin/Admin"));
const GymList = lazy(() => import("./pages/Gym/GymList"));
const Guide = lazy(() => import("./pages/Guide/Guide"));
const CreateBeta = lazy(() => import("./pages/Beta/CreateBeta"));
const BetaList = lazy(() => import("./pages/Beta/BetaList"));
const Ranking = lazy(() => import("./pages/Rankings/Ranking"));
const AiCoach = lazy(() => import("./components/Ai/AiCoach"));
const UpdatePassword = lazy(() => import("./pages/Auth/UpdatePassword"));

function Navigation() {
  const { userProfile, loading } = useAuth();
  const isAdmin = userProfile?.role?.toUpperCase() === "ADMIN";

  if (loading) {
    return <Loading message="권한 정보를 확인하고 있습니다..." />;
  }

  return (
    <BrowserRouter>
      <Layout>
        <Suspense fallback={<Loading message="페이지를 불러오고 있습니다..." />}>
          <Routes>
            {/* [공개 경로] */}
            <Route
              path="/"
              element={isAdmin ? <Navigate to="/admin" replace /> : <Home />}
            />
            <Route path="/guide/*" element={<Guide />} />
            <Route path="/gymlist/*" element={<GymList />} />
            <Route path="/beta" element={<BetaList />} />
            <Route path="/ranking" element={<Ranking />} />

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
        </Suspense>
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
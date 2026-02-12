import Header from "./Header";
import BottomNav from "./BottomNav";
import Footer from "./Footer"; // 추가

function Layout({ children }) {
  const hideLayout = false; 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideLayout && <Header />}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', paddingBottom: 'calc(56px + env(safe-area-inset-bottom, 0px))' }}>
        {children}
      </main>
      {!hideLayout && <Footer />}
      {!hideLayout && <BottomNav />}
    </div>
  );
}

export default Layout;
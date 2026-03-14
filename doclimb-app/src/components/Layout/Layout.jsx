import Header from "./Header";
import BottomNav from "./BottomNav";
import Footer from "./Footer";

function Layout({ children }) {
  const hideLayout = false; 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideLayout && <Header />}
      <main style={{ flex: '1 0 auto', display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
      {!hideLayout && <Footer />}
      {!hideLayout && <BottomNav />}
    </div>
  );
}

export default Layout;
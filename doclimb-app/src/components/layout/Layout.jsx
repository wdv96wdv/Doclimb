import Header from "./Header";
import BottomNav from "./BottomNav";

function Layout({ children }) {
  // Now, hideLayout is only true for specific cases if we want to hide it.
  // For login and join, we want the layout components to show.
  const hideLayout = false; 

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!hideLayout && <Header />}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {children}
      </main>
      {!hideLayout && <BottomNav />}
    </div>
  );
}

export default Layout;

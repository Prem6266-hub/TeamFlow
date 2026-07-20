import Navbar from '../components/Navbar';

function DashboardLayout({ children, theme, setTheme }) {
  return (
    <div className="app-shell">
      <div className="app-shell__content">
        <Navbar theme={theme} setTheme={setTheme} />
        <main className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
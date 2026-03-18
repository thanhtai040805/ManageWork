import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthWrapper } from './context/authContext.jsx'
import { ThemeProvider } from './context/themeContext.jsx'
import { ErrorBoundary } from './components/common'
import { SocketProvider } from "./context/socketContext";


createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <AuthWrapper>
      <ThemeProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </ThemeProvider>
    </AuthWrapper>
  </ErrorBoundary>,
);

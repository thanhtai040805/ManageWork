import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthWrapper } from './context/authContext.jsx'
import { ThemeProvider } from './context/themeContext.jsx'
import { ErrorBoundary } from './components/common'

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <AuthWrapper>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthWrapper>
  </ErrorBoundary>
);

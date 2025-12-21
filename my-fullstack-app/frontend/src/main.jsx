import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthWrapper } from './context/auth.context.jsx'
import { ThemeProvider } from './context/theme.context.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <AuthWrapper>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </AuthWrapper>
  </ErrorBoundary>
);

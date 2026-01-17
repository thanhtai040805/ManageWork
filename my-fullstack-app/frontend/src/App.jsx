import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import SignUp from "./pages/auth/Register";
import { Login } from "./pages/auth/Login";
import { Home } from "./pages/home/Home";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/authContext";
import { ThemeContext } from "./context/themeContext";
import apiClient from "./services/apiClient";
import { MyTasks } from "./pages/tasks/MyTasks";
import { Settings } from "./pages/settings/Settings";
import { Projects } from "./pages/projects/Projects";
import { ProjectDetail } from "./pages/projects/ProjectDetail";
import { ProjectSettings } from "./pages/projects/ProjectSettings";
import { Layout } from "./layouts/Layout";
import { Chat } from "./pages/chat/Chat";

function App() {
  const { auth, setAuth, appLoading, setAppLoading } = useContext(AuthContext);
  const { setPrimaryColor } = useContext(ThemeContext);

  useEffect(() => {
    const fetchAccount = async () => {
      setAppLoading(true);
      try {
        const res = await apiClient.get(`/v1/api/account`);
        if (res) {
          // Get theme color from response (middleware already fetches it)
          const userThemeColor = res.theme_color || "#f87171";

          setAuth({
            isAuthenticated: true,
            user: {
              uid: res.user_id,
              email: res.email,
              name: res.username,
              username: res.username,
              fullName: res.full_name,
              avatarUrl: res.avatar_url,
              role: res.role,
              themeColor: userThemeColor,
            },
          });

          // Theme color will be synced by the useEffect below
        }
      } catch (error) {
        console.error("Error fetching account:", error);
        // If fetch fails (e.g., no token, unauthorized), reset to default theme
        if (error.response?.status === 401 || error.response?.status === 403) {
          const defaultColor = "#f87171";
          setPrimaryColor(defaultColor);
          localStorage.removeItem("theme_color");
          localStorage.removeItem("access_token");
        }
      } finally {
        setAppLoading(false);
      }
    };

    // Only fetch if we have a token
    const token = localStorage.getItem("access_token");
    if (token) {
      fetchAccount();
    } else {
      setAppLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync theme color when auth.user.themeColor changes (from login or account fetch)
  useEffect(() => {
    if (auth.isAuthenticated && auth.user.themeColor) {
      setPrimaryColor(auth.user.themeColor);
      localStorage.setItem("theme_color", auth.user.themeColor);
    }
  }, [auth.user.themeColor, auth.isAuthenticated, setPrimaryColor]);

  return (
    <BrowserRouter>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route
              path="/projects/:projectId/settings"
              element={<ProjectSettings />}
            />
            <Route path="/my-task" element={<MyTasks />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/chat" element={<Chat />} />
          </Route>

          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
        </Routes>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </BrowserRouter>
  );
}

export default App;

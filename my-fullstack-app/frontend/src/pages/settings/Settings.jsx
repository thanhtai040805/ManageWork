import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";
import { ThemeContext } from "../../context/themeContext";
import apiClient from "../../services/apiClient";
import { User, Palette, Save } from "lucide-react";

export const Settings = () => {
  const navigate = useNavigate();
  const { auth, setAuth } = useContext(AuthContext);
  const { primaryColor, setPrimaryColor } = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [form, setForm] = useState({
    full_name: auth.user?.fullName || "",
    avatar_url: auth.user?.avatarUrl || "",
    theme_color: primaryColor,
  });

  const colorOptions = [
    { name: "Red", value: "#f87171" },
    { name: "Blue", value: "#60a5fa" },
    { name: "Green", value: "#34d399" },
    { name: "Purple", value: "#a78bfa" },
    { name: "Pink", value: "#f472b6" },
    { name: "Orange", value: "#fb923c" },
    { name: "Indigo", value: "#818cf8" },
    { name: "Teal", value: "#2dd4bf" },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await apiClient.get("/v1/api/account");
        if (userData) {
          setForm({
            full_name: userData.full_name || "",
            avatar_url: userData.avatar_url || "",
            theme_color: userData.theme_color || "#f87171",
          });
          
          setAuth((prev) => ({
            ...prev,
            user: {
              ...prev.user,
              uid: userData.user_id,
              email: userData.email,
              name: userData.username,
              username: userData.username,
              fullName: userData.full_name,
              avatarUrl: userData.avatar_url,
              role: userData.role,
              themeColor: userData.theme_color || "#f87171",
            },
          }));
          
          if (userData.theme_color) {
            setPrimaryColor(userData.theme_color);
          }
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (auth.isAuthenticated) {
      fetchUserData();
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "theme_color") {
      setPrimaryColor(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await apiClient.put("/v1/api/account/profile", {
        full_name: form.full_name,
        avatar_url: form.avatar_url,
        theme_color: form.theme_color,
      });

      if (response) {
        const userData = await apiClient.get("/v1/api/account");
        if (userData) {
          const updatedThemeColor = userData.theme_color || "#f87171";
          
          setAuth((prev) => ({
            ...prev,
            user: {
              ...prev.user,
              uid: userData.user_id,
              email: userData.email,
              name: userData.username,
              username: userData.username,
              fullName: userData.full_name,
              avatarUrl: userData.avatar_url,
              role: userData.role,
              themeColor: updatedThemeColor,
            },
          }));

          setForm({
            full_name: userData.full_name || "",
            avatar_url: userData.avatar_url || "",
            theme_color: updatedThemeColor,
          });

          setPrimaryColor(updatedThemeColor);
          localStorage.setItem("theme_color", updatedThemeColor);

          setMessage({ type: "success", text: "Saved successfully!" });
        } else {
          setMessage({ type: "success", text: "Saved successfully!" });
        }
        
        setTimeout(() => {
          setMessage({ type: "", text: "" });
        }, 3000);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({
        type: "error",
        text: error.response?.data?.error || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-100">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-600 mt-2">Manage your profile and preferences</p>
      </div>

      

      <div className="rounded-3xl bg-white p-6 shadow-lg shadow-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <User className="text-primary" size={24} />
          <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-2">
            <label htmlFor="username" className="text-sm font-medium text-slate-600">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={auth.user?.username || auth.user?.name || ""}
              disabled
              className="rounded-xl border border-slate-200 px-4 py-3 text-slate-400 bg-slate-50 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500">Cannot be changed</p>
          </div>

          <div className="grid gap-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-600">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={auth.user?.email || ""}
              disabled
              className="rounded-xl border border-slate-200 px-4 py-3 text-slate-400 bg-slate-50 cursor-not-allowed"
            />
            <p className="text-xs text-slate-500">Cannot be changed</p>
          </div>

          <div className="grid gap-2">
            <label htmlFor="full_name" className="text-sm font-medium text-slate-600">
              Full Name
            </label>
            <input
              id="full_name"
              type="text"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Enter your full name"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="avatar_url" className="text-sm font-medium text-slate-600">
              Avatar URL
            </label>
            <input
              id="avatar_url"
              type="url"
              name="avatar_url"
              value={form.avatar_url}
              onChange={handleChange}
              className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="https://example.com/avatar.jpg"
            />
            {form.avatar_url && (
              <div className="mt-2">
                <img
                  src={form.avatar_url}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center gap-3 mb-2">
              <Palette className="text-primary" size={20} />
              <label htmlFor="theme_color" className="text-sm font-medium text-slate-600">
                Theme Color
              </label>
            </div>
            
            <div className="flex items-center gap-4">
              <input
                id="theme_color"
                type="color"
                name="theme_color"
                value={form.theme_color}
                onChange={handleChange}
                className="w-16 h-16 rounded-lg border-2 border-slate-200 cursor-pointer"
              />
              <input
                type="text"
                value={form.theme_color}
                onChange={handleChange}
                name="theme_color"
                className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 font-mono"
                placeholder="#f87171"
              />
            </div>

            <div className="mt-4">
              <p className="text-xs text-slate-500 mb-2">Quick Select</p>
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, theme_color: color.value }));
                      setPrimaryColor(color.value);
                    }}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      form.theme_color === color.value
                        ? "border-slate-900 scale-110 shadow-md"
                        : "border-slate-200 hover:border-slate-400"
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div className="mt-4 p-4 rounded-lg border border-slate-200 bg-slate-50">
              <p className="text-xs text-slate-500 mb-2">Preview</p>
              <div
                className="h-12 rounded-lg flex items-center justify-center text-white font-medium shadow-sm"
                style={{ backgroundColor: form.theme_color }}
              >
                Navigation Bar Color
              </div>
            </div>
          </div>

          {message.text && (
            <div
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={16} />
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
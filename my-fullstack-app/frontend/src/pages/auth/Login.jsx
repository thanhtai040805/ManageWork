import { LockIcon, User } from "lucide-react";
import { React, useContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { notificationService } from "../../services/notification.service";
import { loginAPI } from "../../services/auth.service";
import { AuthContext } from "../../context/authContext";
import { ThemeContext } from "../../context/themeContext";
import socket from "../../socket/socket";

export const Login = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ mode: "onChange" });

  const { setAuth } = useContext(AuthContext);
  const { setPrimaryColor } = useContext(ThemeContext);

  const form = useRef();

  const onSubmit = async (data) => {
    const loadingToast = notificationService.loading("Đang đăng nhập...");
    try {
      const { username, password } = data;
      const response = await loginAPI(username, password);
      console.log("Response:", response);
      localStorage.setItem("access_token", response.access_token);

      const userThemeColor = response.data.themeColor || "#f87171";

      setAuth({
        isAuthenticated: true,
        user: {
          uid: response.data.uid,
          email: response.data.email,
          name: response.data.username,
          username: response.data.username,
          fullName: response.data.fullName,
          avatarUrl: response.data.avatarUrl,
          role: response.data.role,
          themeColor: userThemeColor,
        },
      });

      setPrimaryColor(userThemeColor);
      localStorage.setItem("theme_color", userThemeColor);

      notificationService.dismissAll();

      socket.auth.token = response.access_token;
      if (!socket.connected) socket.connect();

      navigate("/");
    } catch (error) {
      console.error("Login error:", error);
      reset();
      notificationService.updateLoading(
        loadingToast,
        error.response?.data?.message || "Có lỗi xảy ra khi đăng nhập",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Inter'] text-[#1b1b24] bg-[#fcf8ff] overflow-x-hidden relative">
      {/* Mesh Gradient Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(at 0% 0%, #e2dfff 0px, transparent 50%), radial-gradient(at 100% 0%, #dae2fd 0px, transparent 50%), radial-gradient(at 100% 100%, #f0ecf9 0px, transparent 50%), radial-gradient(at 0% 100%, #e9e5ff 0px, transparent 50%)",
          backgroundSize: "200% 200%",
        }}
      />

      {/* Background Illustration Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -left-[5%] opacity-40 scale-110">
          <img
            className="w-[600px] h-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/ADBb0uhOVh8xrRk6SRsSp4P3Mqyuid1bIpG8bFWrY0qXwcZ35mTTURwMewnPPMPYiZX7pjzPBxLciA7OK1qRlXmAieP-YAiTf3l9vEYPoPmwbQpR3OcOhJl1Jc_pMI2W2X4-uEGyx3tSIwQyFpLm9W54rLngBvIEHHxtoJswinWE7L-u-CteTBiE-tYVQ_sbsqOCL_n8MOIoY96ADGmCESpWOXejMvSdpUueZk-tekrDbkxy-N0QBIre7stNzCtcMZxwp436wY5fq_du"
            alt="Background"
          />
        </div>
        <div className="absolute -bottom-[20%] -right-[10%] opacity-30 scale-125 rotate-12">
          <img
            className="w-[700px] h-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/ADBb0uhy64L197XsRCHEPz8j7RGzYH1AaTGzMkMozaxkTqSiWvr2Z6-LrzCsFjko-u3_EkWNkvo__zgEH2ueDPCxSb6d537B_KFGxZUnOczYYWAZkVKRYGeNakF3VJGQxLBFri2dHIP5nwIWAZEb2GxBJj1BdG5lVz3u3ZEVWop2TZbx4e6JibmGVCJwk5hLiYOMhwhqPVT4O4bKl_iIP-t9Be5GLIdkiK2Vtbo4eu-qtZfgkdqupAwZCAcIsnTIlkkfvkAb7k9V_Qkh0w"
            alt="Background"
          />
        </div>
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50">
        <nav className="flex justify-between items-center px-8 py-6 w-full max-w-7xl mx-auto">
          <div className="text-xl font-bold tracking-tight text-slate-900">ManageWork</div>
          <div className="hidden md:flex items-center space-x-8">
            <Link
              className="text-indigo-600 font-semibold hover:opacity-80 transition-opacity duration-200"
              to="/login"
            >
              Sign In
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6 relative">
        <div className="w-full max-w-[440px] px-6 z-10">
          <div
            className="p-8 rounded-3xl border border-white/40 "
            style={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(32px)",
              boxShadow: "0 8px 32px 0 rgba(62, 50, 211, 0.05)",
            }}
          >
            <div className="mb-xl pt-12">
              <h1 className="text-3xl font-semibold text-[#1b1b24] mb-1">Sign In</h1>
              <p className="text-sm text-[#464555]">
                Welcome back. Enter your credentials to access your dashboard.
              </p>
            </div>

            <form ref={form} onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Username */}
              <div className="space-y-2 pt-12">
                <label
                  className="text-xs font-semibold text-[#464555] uppercase tracking-wider block"
                  htmlFor="username"
                >
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter your username"
                  className="w-full px-4 py-4 rounded-xl bg-white/50 border-[#c7c4d8] focus:border-[#3e32d3] focus:ring-4 focus:ring-[#3e32d3]/20 transition-all duration-200 placeholder:text-slate-400 text-base outline-none"
                  {...register("username", {
                    required: "Username is required",
                    minLength: {
                      value: 3,
                      message: "Username must be at least 3 characters",
                    },
                    pattern: {
                      value: /^[a-zA-Z0-9_]+$/,
                      message:
                        "Username can only contain letters, numbers, and underscores",
                    },
                  })}
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    className="text-xs font-semibold text-[#464555] uppercase tracking-wider block"
                    htmlFor="password"
                  >
                    Password
                  </label>
                  <a
                    className="text-xs text-[#3e32d3] hover:opacity-80 transition-opacity"
                    href="#"
                  >
                    Forgot Password?
                  </a>
                </div>
                <input
                  type="password"
                  id="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-4 rounded-xl bg-white/50 border-[#c7c4d8] focus:border-[#3e32d3] focus:ring-4 focus:ring-[#3e32d3]/20 transition-all duration-200 placeholder:text-slate-400 text-base outline-none"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                    pattern: {
                      value:
                        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message:
                        "Password must contain uppercase, lowercase, number, and special character",
                    },
                  })}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 rounded border-[#c7c4d8] text-[#3e32d3] focus:ring-[#3e32d3]/20 outline-none"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-[#464555]"
                >
                  Remember me
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#5850ec] text-white py-4 rounded-xl font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200 shadow-lg shadow-[#3e32d3]/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Login..." : "Login"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#c7c4d8]/30" />
              </div>
              <div className="relative flex justify-center text-xs font-semibold">
                <span className="bg-transparent px-2 text-[#464555]">
                  OR, LOGIN WITH
                </span>
              </div>
            </div>

            {/* Social Auth */}
            <div className="grid grid-cols-3 gap-4">
              <button className="flex items-center justify-center py-3 rounded-lg bg-white/40 border border-[#c7c4d8]/50 hover:bg-white/60 transition-colors duration-200 group">
                <span className="text-[#464555] group-hover:text-[#3e32d3] transition-colors">
                  G
                </span>
              </button>
              <button className="flex items-center justify-center py-3 rounded-lg bg-white/40 border border-[#c7c4d8]/50 hover:bg-white/60 transition-colors duration-200 group">
                <span className="text-[#464555] group-hover:text-[#3e32d3] transition-colors">
                  F
                </span>
              </button>
              <button className="flex items-center justify-center py-3 rounded-lg bg-white/40 border border-[#c7c4d8]/50 hover:bg-white/60 transition-colors duration-200 group">
                <span className="text-[#464555] group-hover:text-[#3e32d3] transition-colors">
                  T
                </span>
              </button>
            </div>

            {/* Create Account Link */}
            <div className="mt-8 text-center">
              <p className="text-sm text-[#464555]">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="text-[#3e32d3] font-semibold hover:underline"
                >
                  Create One
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full z-40">
        <div className="flex justify-center space-x-6 pb-8 text-sm text-slate-500">
          <span>© 2024 NexusSaaS Inc. All rights reserved.</span>
          <a className="text-slate-500 hover:text-indigo-500 transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="text-slate-500 hover:text-indigo-500 transition-colors" href="#">
            Terms of Service
          </a>
          <a className="text-slate-500 hover:text-indigo-500 transition-colors" href="#">
            Security
          </a>
        </div>
      </footer>
    </div>
  );
};
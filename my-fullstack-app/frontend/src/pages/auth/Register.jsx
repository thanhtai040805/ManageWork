import { LockIcon, LockKeyhole, MailIcon, User, User2 } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { createUserAPI } from "../../services/auth.service";
import { notificationService } from "../../services/notification.service";

const SignUp = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onChange",
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    const loadingToast = notificationService.loading("Đang tạo tài khoản...");

    try {
      console.log("Form submitted:", data);
      const { username, email, password, fullName } = data;

      const response = await createUserAPI(username, email, password, fullName);
      console.log("Response:", response);

      notificationService.updateLoading(
        loadingToast,
        "Tạo tài khoản thành công!",
        "success"
      );

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      reset();
      notificationService.updateLoading(
        loadingToast,
        error.response?.data?.message || "Có lỗi xảy ra khi tạo tài khoản",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-['Inter'] text-[#1b1b24] bg-[#fcf8ff]">
      {/* Mesh Gradient Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(at 0% 0%, rgba(62, 50, 211, 0.15) 0px, transparent 50%), radial-gradient(at 100% 0%, rgba(190, 198, 224, 0.2) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(62, 50, 211, 0.1) 0px, transparent 50%), radial-gradient(at 0% 100%, rgba(228, 225, 238, 0.3) 0px, transparent 50%)",
          backgroundColor: "#fcf8ff",
        }}
      />

      {/* Header */}
      <header className="fixed top-0 w-full z-50">
        <div className="flex justify-between items-center px-8 py-6 w-full max-w-7xl mx-auto">
          <div className="text-xl font-bold tracking-tight text-slate-900">
            ManageWork
          </div>
          <div className="flex items-center gap-6">
            <Link
              className="bg-[#3e32d3] text-white px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-transform active:scale-95 duration-200"
              to="/login"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center pt-24 pb-12 px-6 relative">
        <div className="flex w-full max-w-6xl items-stretch gap-12">
          {/* Illustration Section */}
          <div className="hidden lg:flex flex-1 items-center justify-center relative">
            <div className="relative w-full aspect-[1.41] rounded-3xl overflow-hidden shadow-2xl border border-white/50">
              <img
                className="object-cover w-full h-full"
                src="https://lh3.googleusercontent.com/aida/ADBb0uhy64L197XsRCHEPz8j7RGzYH1AaTGzMkMozaxkTqSiWvr2Z6-LrzCsFjko-u3_EkWNkvo__zgEH2ueDPCxSb6d537B_KFGxZUnOczYYWAZkVKRYGeNakF3VJGQxLBFri2dHIP5nwIWAZEb2GxBJj1BdG5lVz3u3ZEVWop2TZbx4e6JibmGVCJwk5hLiYOMhwhqPVT4O4bKl_iIP-t9Be5GLIdkiK2Vtbo4eu-qtZfgkdqupAwZCAcIsnTIlkkfvkAb7k9V_Qkh0w"
                alt="Illustration"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#fcf8ff]/40 to-transparent" />
            </div>
            {/* Floating Detail Card */}
            <div
              className="absolute -bottom-6 -right-6 p-6 rounded-2xl max-w-xs border border-white/40"
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(32px)",
                boxShadow: "0 8px 32px 0 rgba(62, 50, 211, 0.05)",
              }}
            >
              <p className="text-2xl font-semibold text-[#3e32d3] mb-2">99.9%</p>
              <p className="text-sm text-[#464555]">
                Uptime reliability for enterprise scale operations and developer
                workflows.
              </p>
            </div>
          </div>

          {/* Sign Up Form Section */}
          <div className="flex-1 flex justify-center lg:justify-start">
            <div
              className="w-full max-w-[440px] p-8 rounded-3xl border border-white/40"
              style={{
                background: "rgba(255, 255, 255, 0.7)",
                backdropFilter: "blur(32px)",
                boxShadow: "0 8px 32px 0 rgba(62, 50, 211, 0.05)",
              }}
            >
              <div className="mb-xl pt-12">
                <h1 className="text-3xl font-semibold text-[#1b1b24] mb-2">Sign Up</h1>
                <p className="text-base text-[#464555]">
                  Create your account to start building.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2 pt-8">
                  <label className="text-xs font-semibold text-[#464555] uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    className="w-full bg-white/50 border-[#c7c4d8] focus:border-[#3e32d3] focus:ring-4 focus:ring-[#3e32d3]/10 rounded-xl p-4 text-base transition-all duration-200 placeholder:text-slate-400 outline-none"
                    {...register("fullName", {
                      required: "Full name is required",
                      minLength: {
                        value: 2,
                        message: "Full name must be at least 2 characters",
                      },
                      pattern: {
                        value: /^[a-zA-Z\s]+$/,
                        message:
                          "Full name can only contain letters and spaces",
                      },
                    })}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#464555] uppercase tracking-wider">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="johndoe_dev"
                    className="w-full bg-white/50 border-[#c7c4d8] focus:border-[#3e32d3] focus:ring-4 focus:ring-[#3e32d3]/10 rounded-xl p-4 text-base transition-all duration-200 placeholder:text-slate-400 outline-none"
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

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#464555] uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    className="w-full bg-white/50 border-[#c7c4d8] focus:border-[#3e32d3] focus:ring-4 focus:ring-[#3e32d3]/10 rounded-xl p-4 text-base transition-all duration-200 placeholder:text-slate-400 outline-none"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Please enter a valid email address",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#464555] uppercase tracking-wider">
                      Password
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white/50 border-[#c7c4d8] focus:border-[#3e32d3] focus:ring-4 focus:ring-[#3e32d3]/10 rounded-xl p-4 text-base transition-all duration-200 placeholder:text-slate-400 outline-none"
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
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-[#464555] uppercase tracking-wider">
                      Confirm
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="w-full bg-white/50 border-[#c7c4d8] focus:border-[#3e32d3] focus:ring-4 focus:ring-[#3e32d3]/10 rounded-xl p-4 text-base transition-all duration-200 placeholder:text-slate-400 outline-none"
                      {...register("confirmPassword", {
                        required: "Please confirm your password",
                        validate: (value) =>
                          value === password || "Passwords do not match",
                      })}
                    />
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="w-5 h-5 rounded border-[#c7c4d8] text-[#3e32d3] focus:ring-[#3e32d3]/20 outline-none"
                    {...register("terms", {
                      required: "You must accept the terms and conditions",
                    })}
                  />
                  <label htmlFor="terms" className="text-sm text-[#464555]">
                    I agree to all{" "}
                    <a href="#" className="text-[#3e32d3] hover:underline">
                      terms
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-[#3e32d3] hover:underline">
                      privacy policy
                    </a>
                  </label>
                </div>
                {errors.terms && (
                  <p className="text-red-500 text-sm mt-1">{errors.terms.message}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#3e32d3] text-white py-4 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[#3e32d3]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Registering..." : "Register"}
                </button>
              </form>

              {/* Login Link */}
              <div className="mt-xl pt-6 border-t border-[#e4e1ee] flex flex-col items-center gap-4">
                <p className="text-sm text-[#464555]">
                  Already have an account?{" "}
                  <Link
                    to="/login"
                    className="text-[#3e32d3] font-semibold hover:underline"
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full pb-8">
        <div className="flex justify-center space-x-6 text-sm text-slate-500">
          <span>© 2024 NexusSaaS Inc. All rights reserved.</span>
          <div className="flex gap-4">
            <a className="hover:text-[#3e32d3] transition-colors" href="#">
              Privacy Policy
            </a>
            <a className="hover:text-[#3e32d3] transition-colors" href="#">
              Terms of Service
            </a>
            <a className="hover:text-[#3e32d3] transition-colors" href="#">
              Security
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SignUp;
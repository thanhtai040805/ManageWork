import {
  LockIcon,
  LockKeyhole,
  MailCheckIcon,
  MailIcon,
  User,
  User2,
} from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { createUserAPI } from "../../services/auth.service";
import { notificationService } from "../../services/notificationService";

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
    // Show loading notification
    const loadingToast = notificationService.loading("Đang tạo tài khoản...");

    try {
      console.log("Form submitted:", data);
      const { username, email, password, fullName } = data;

      const response = await createUserAPI(username, email, password, fullName);
      console.log("Response:", response);

      // Update loading to success
      notificationService.updateLoading(
        loadingToast,
        "Tạo tài khoản thành công!",
        "success"
      );

      // Reset form after successful registration
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      reset();
      // Update loading to error
      notificationService.updateLoading(
        loadingToast,
        error.response?.data?.message || "Có lỗi xảy ra khi tạo tài khoản",
        "error"
      );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center min-h-[90%] background-primary bg-cover bg-center relative"
      style={{ backgroundImage: `url(/BackgroundImage.png)` }}
    >
      {/* Overlay để làm tối nền cho dễ nhìn */}
      <div className="absolute inset-0 bg-primary bg-opacity-40"></div>

      {/* Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full flex overflow-hidden">
        {/* Left Image */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-white">
          <img
            src="/Register.png"
            alt="Illustration"
            className="w-3/4 h-auto"
          />
        </div>

        {/* Right Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Sign Up</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Full Name */}
            <div>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                <span className="text-gray-500 mr-2">
                  <User />
                </span>
                <input
                  type="text"
                  placeholder="Enter Full Name"
                  className="w-full bg-transparent outline-none"
                  {...register("fullName", {
                    required: "Full name is required",
                    minLength: {
                      value: 2,
                      message: "Full name must be at least 2 characters",
                    },
                    pattern: {
                      value: /^[a-zA-Z\s]+$/,
                      message: "Full name can only contain letters and spaces",
                    },
                  })}
                />
              </div>
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Username */}
            <div>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                <span className="text-gray-500 mr-2">
                  <User2 />
                </span>
                <input
                  type="text"
                  placeholder="Enter Username"
                  className="w-full bg-transparent outline-none"
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
              </div>
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                <span className="text-gray-500 mr-2">
                  <MailIcon />
                </span>
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="w-full bg-transparent outline-none"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Please enter a valid email address",
                    },
                  })}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                <span className="text-gray-500 mr-2">
                  <LockIcon />
                </span>
                <input
                  type="password"
                  placeholder="Enter Password"
                  className="w-full bg-transparent outline-none"
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
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                <span className="text-gray-500 mr-2">
                  <LockKeyhole />
                </span>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full bg-transparent outline-none"
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                className="mr-2"
                {...register("terms", {
                  required: "You must accept the terms and conditions",
                })}
              />
              <label htmlFor="terms" className="text-gray-600 text-sm">
                I agree to all terms
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-sm mt-1">
                {errors.terms.message}
              </p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-300 text-white py-2 rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? "Registering..." : "Register"}
            </button>

            {/* Login Link */}
            <p className="text-sm text-gray-600 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUp;


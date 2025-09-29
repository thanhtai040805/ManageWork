import { FacebookIcon, LockIcon, TwitchIcon, User, XIcon } from "lucide-react";
import { React , useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";




export const Login = () => {

      const {
        register,
        handleSubmit,
        formState: { errors , isSubmitting},
      } = useForm({mode: "onChange"});

    const form = useRef();





    const onSubmit = (e) => {
        e.preventDefault;
    }

    return (
      <div
        className="h-screen flex items-center justify-center background-primary bg-cover bg-center relative"
        style={{ backgroundImage: `url(/BackgroundImage.png)` }}
      >
        {/* Overlay để làm tối nền cho dễ nhìn */}
        <div className="absolute inset-0 bg-primary bg-opacity-40"></div>

        {/* Content */}
        <div className="relative bg-white rounded-2xl shadow-2xl h-[90%] max-w-4xl w-full flex overflow-hidden">
          {/* Left Form */}
          <div className="flex justify-center flex-col w-full md:w-1/2 p-8">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">Sign In</h2>

            <form
              ref={form}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
            >
              {/* Username */}
              <div>
                <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50">
                  <span className="text-gray-500 mr-2">
                    <User />
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
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-1/3 bg-red-300 text-white py-2 mb-20 rounded-lg shadow-md hover:bg-red-600 transition-transform transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isSubmitting ? "Login..." : "Login"}
              </button>
              {/* Login with social */}
              <p className="flex gap-2 text-sm text-gray-600 mt-4">
                Or, Login with <FacebookIcon className="h-6 w-6" />
                <XIcon className="h-6 w-6" />
                <TwitchIcon className="h-6 w-6" />
              </p>

              {/* Registor Link */}
              <p className="text-sm text-gray-600 mt-4">
                Don’t have an account?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Create One
                </Link>
              </p>
            </form>
          </div>
          {/* Right Image */}
          <div className="hidden md:flex w-1/2 items-end justify-center bg-white">
            <img src="/Login.png" alt="Illustration" className="w-full h-auto" />
          </div>
        </div>
      </div>
    );
    
}
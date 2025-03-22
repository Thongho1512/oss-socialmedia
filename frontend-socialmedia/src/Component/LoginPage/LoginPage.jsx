import React from "react";

const LoginPage = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[400px] text-center">
        <h2 className="text-2xl font-semibold">Get’s started.</h2>
        <p className="text-gray-500 text-sm mt-2">
          Don’t have an account?{" "}
          <a href="#" className="text-blue-500 font-medium">
            Sign up
          </a>
        </p>

        {/* Social Login */}
        <div className="flex justify-center gap-4 mt-6">
          <button className="border border-gray-300 px-4 py-2 rounded-lg">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4d/Google_%22G%22_logo.svg"
              alt="Google"
              className="w-5 h-5"
            />
          </button>
          <button className="border border-gray-300 px-4 py-2 rounded-lg">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
              alt="Facebook"
              className="w-5 h-5"
            />
          </button>
        </div>

        <p className="text-gray-400 text-sm mt-4">or login with email</p>

        {/* Email & Password */}
        <div className="mt-4 text-left">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            placeholder="Email Address"
            className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <label className="text-sm font-medium mt-3 block">Password</label>
          <div className="relative">
            <input
              type="password"
              placeholder="Password"
              className="w-full px-3 py-2 mt-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <span className="absolute right-3 top-3 cursor-pointer text-gray-400">👁</span>
          </div>

          <a href="#" className="text-blue-500 text-sm mt-2 inline-block">
            Forgot your password?
          </a>
        </div>

        {/* Sign In Button */}
        <button className="bg-blue-600 text-white w-full py-2 rounded-lg mt-4 font-medium hover:bg-blue-700">
          sign in
        </button>
      </div>
    </div>
  );
};

export default LoginPage;

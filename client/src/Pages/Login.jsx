import { useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  // =========================================================
  // EMAIL VALIDATION
  // =========================================================
  //
  // Numbers ARE allowed in emails.
  //
  // Valid:
  // john123@gmail.com          ✓
  // john@gmail2@example.com   ✓
  // john@university.edu       ✓
  // john@university.edu.gh    ✓
  // john@gmail.com.xyz         ✓
  //
  // Invalid:
  // john@gmail.com123          ✗
  // john@gmail.com.123        ✗
  // john@university.edu.gh123 ✗
  //
  // The final TLD must contain letters only.
  //

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

  const isEmailValid =
    email.length > 0 && emailRegex.test(email);

  // =========================================================
  // PASSWORD VALIDATION
  // =========================================================
  //
  // Login only checks that a password has been entered.
  //
  // We do NOT enforce the registration password requirements
  // here because an existing user may have registered before
  // the new password policy was introduced.
  //

  const isPasswordValid = password.length > 0;

  // =========================================================
  // FORM VALIDATION
  // =========================================================

  const isFormValid =
    isEmailValid && isPasswordValid;

  // =========================================================
  // EMAIL CHANGE
  // =========================================================

  const handleEmailChange = (e) => {
    // Automatically convert email to lowercase
    const value = e.target.value.toLowerCase();

    setEmail(value);

    // Clear previous error while typing
    if (error) {
      setError("");
    }
  };

  // =========================================================
  // PASSWORD CHANGE
  // =========================================================

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);

    // Clear previous error while typing
    if (error) {
      setError("");
    }
  };

  // =========================================================
  // FORM SUBMISSION
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Check email
    if (!isEmailValid) {
      setError("Please enter a valid email address.");
      return;
    }

    // Check password
    if (!isPasswordValid) {
      setError("Please enter your password.");
      return;
    }

    try {
      await login(email, password);

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Invalid email or password."
      );
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(28,156,77,0.12),_transparent_22%),linear-gradient(180deg,#f3f8fb_0%,#edf5f7_100%)] px-4 py-10">

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_70px_rgba(10,43,60,0.12)]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="bg-[linear-gradient(135deg,#0a2b3c_0%,#103f54_50%,#1c9c4d_100%)] px-6 py-8 text-white">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Welcome back
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Login
          </h2>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >

          {/* =================================================
              ERROR MESSAGE
          ================================================= */}

          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}

          {/* =================================================
              EMAIL
          ================================================= */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              className={`w-full rounded-xl border bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:bg-white ${
                email.length > 0
                  ? isEmailValid
                    ? "border-green-400 focus:border-green-500"
                    : "border-red-300 focus:border-red-400"
                  : "border-slate-200 focus:border-[#1c9c4d]"
              }`}
              value={email}
              onChange={handleEmailChange}
              required
              maxLength={254}
              autoComplete="email"
              inputMode="email"
            />

            {/* Invalid email */}
            {email.length > 0 &&
              !isEmailValid && (
                <p className="mt-1 text-xs text-red-600">
                  Please enter a valid email address.
                </p>
              )}

            {/* Valid email */}
            {isEmailValid && (
              <p className="mt-1 text-xs text-green-600">
                ✓ Valid email address
              </p>
            )}

            <p className="mt-1 text-xs text-slate-400">
              Example: john123@gmail.com
            </p>
          </div>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className={`w-full rounded-xl border bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:bg-white ${
                password.length > 0
                  ? "border-green-400 focus:border-green-500"
                  : "border-slate-200 focus:border-[#1c9c4d]"
              }`}
              value={password}
              onChange={handlePasswordChange}
              required
              autoComplete="current-password"
            />

            {password.length > 0 && (
              <p className="mt-1 text-xs text-green-600">
                ✓ Password entered
              </p>
            )}
          </div>

          {/* =================================================
              LOGIN BUTTON
          ================================================= */}

          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full rounded-xl px-4 py-3 font-bold text-white shadow-[0_12px_25px_rgba(28,156,77,0.28)] transition ${
              isFormValid
                ? "bg-gradient-to-r from-[#0a2b3c] to-[#1c9c4d] hover:brightness-110"
                : "cursor-not-allowed bg-slate-300 shadow-none"
            }`}
          >
            Login
          </button>

          {/* =================================================
              REGISTER LINK
          ================================================= */}

          <p className="text-center text-sm text-slate-600">
            Don’t have an account?{" "}

            <Link
              to="/register"
              className="font-bold text-[#0a2b3c] hover:text-[#1c9c4d]"
            >
              Register here
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}
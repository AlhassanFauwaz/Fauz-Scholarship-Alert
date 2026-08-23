import { useState, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const [error, setError] = useState("");

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  // =========================================================
  // VALIDATION REGEX
  // =========================================================

  // Email:
  // - Numbers are allowed
  // - Letters are allowed
  // - Multiple domain levels are allowed
  // - Final TLD must contain letters only
  // Examples:
  // john123@gmail.com          ✓
  // john@gmail.com             ✓
  // john@university.edu.gh     ✓
  // john@gmail.com.xyz         ✓
  // john@gmail.com123          ✗
  // john@gmail.com.123         ✗
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

  // Ghanaian phone numbers only.
  // No +233.
  // No spaces.
  // No hyphens.
  // Exactly 10 digits.
  const ghanaPhoneRegex =
    /^0(?:20|23|24|25|26|27|28|50|54|55|59)\d{7}$/;

  // =========================================================
  // PASSWORD REQUIREMENTS
  // =========================================================

  const passwordRequirements = {
    minLength: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[^A-Za-z0-9]/.test(formData.password),
  };

  const allPasswordRequirementsMet =
    passwordRequirements.minLength &&
    passwordRequirements.uppercase &&
    passwordRequirements.lowercase &&
    passwordRequirements.number &&
    passwordRequirements.special;

  // =========================================================
  // FIELD VALIDATION
  // =========================================================

  const isFullNameValid =
    formData.fullName.trim().length >= 2;

  const isEmailValid =
    formData.email.length > 0 &&
    emailRegex.test(formData.email);

  // Phone is optional.
  // Empty phone = valid.
  const isPhoneValid =
    formData.phone === "" ||
    ghanaPhoneRegex.test(formData.phone);

  // =========================================================
  // COMPLETE FORM VALIDATION
  // =========================================================

  const isFormValid =
    isFullNameValid &&
    isEmailValid &&
    isPhoneValid &&
    allPasswordRequirementsMet;

  // =========================================================
  // HANDLE INPUT CHANGES
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    // -------------------------------------------------------
    // EMAIL
    // -------------------------------------------------------
    // Automatically convert email to lowercase.
    //
    // Example:
    // JOHN123@GMAIL.COM
    //
    // becomes:
    // john123@gmail.com
    // -------------------------------------------------------

    if (name === "email") {
      const email = value.toLowerCase();

      setFormData({
        ...formData,
        email,
      });

      return;
    }

    // -------------------------------------------------------
    // PHONE
    // -------------------------------------------------------
    // Only numbers are allowed.
    //
    // This automatically removes:
    // +, -, spaces, letters, etc.
    //
    // Maximum = 10 digits.
    // -------------------------------------------------------

    if (name === "phone") {
      const numbersOnly = value
        .replace(/\D/g, "")
        .slice(0, 10);

      setFormData({
        ...formData,
        phone: numbersOnly,
      });

      return;
    }

    // -------------------------------------------------------
    // OTHER INPUTS
    // -------------------------------------------------------

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Prevent submission if validation fails
    if (!isFormValid) {
      setError(
        "Please correct the errors in the form before submitting."
      );
      return;
    }

    try {
      const result = await register(formData);
      navigate("/verify-email", {
        state: { verificationEmailSent: result.verificationEmailSent },
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed"
      );
    }
  };

  // =========================================================
  // PASSWORD REQUIREMENT COMPONENT
  // =========================================================

  const Requirement = ({ met, children }) => (
    <li
      className={`flex items-center gap-2 text-sm transition-colors ${
        met
          ? "text-green-600"
          : "text-slate-500"
      }`}
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
          met
            ? "bg-green-100 text-green-600"
            : "bg-slate-100 text-slate-400"
        }`}
      >
        {met ? "✓" : "•"}
      </span>

      {children}
    </li>
  );

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(28,156,77,0.12),_transparent_22%),linear-gradient(180deg,#f3f8fb_0%,#edf5f7_100%)] px-4 py-10">

      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_25px_70px_rgba(10,43,60,0.12)]">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="bg-[linear-gradient(135deg,#0a2b3c_0%,#103f54_50%,#1c9c4d_100%)] px-6 py-8 text-white">

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            Open account
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Create account
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
              FULL NAME
          ================================================= */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Full name
            </label>

            <input
              name="fullName"
              type="text"
              placeholder="John Doe"
              className={`w-full rounded-xl border bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:bg-white ${
                formData.fullName.length > 0
                  ? isFullNameValid
                    ? "border-green-400 focus:border-green-500"
                    : "border-red-300 focus:border-red-400"
                  : "border-slate-200 focus:border-[#1c9c4d]"
              }`}
              value={formData.fullName}
              onChange={handleChange}
              required
              minLength={2}
              maxLength={100}
              autoComplete="name"
            />

            {formData.fullName.length > 0 &&
              !isFullNameValid && (
                <p className="mt-1 text-xs text-red-600">
                  Full name must be at least 2 characters.
                </p>
              )}

            {isFullNameValid && (
              <p className="mt-1 text-xs text-green-600">
                ✓ Valid name
              </p>
            )}
          </div>

          {/* =================================================
              EMAIL
          ================================================= */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Email
            </label>

            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className={`w-full rounded-xl border bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:bg-white ${
                formData.email.length > 0
                  ? isEmailValid
                    ? "border-green-400 focus:border-green-500"
                    : "border-red-300 focus:border-red-400"
                  : "border-slate-200 focus:border-[#1c9c4d]"
              }`}
              value={formData.email}
              onChange={handleChange}
              required
              maxLength={254}
              autoComplete="email"
              inputMode="email"
            />

            {/* Invalid email */}
            {formData.email.length > 0 &&
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
              Example: john123@gmail.com or
              john@university.edu.gh
            </p>
          </div>

          {/* =================================================
              PHONE
          ================================================= */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Phone{" "}
              <span className="font-normal text-slate-400">
                (optional)
              </span>
            </label>

            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              placeholder="0241234567"
              className={`w-full rounded-xl border bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:bg-white ${
                formData.phone.length > 0
                  ? isPhoneValid
                    ? "border-green-400 focus:border-green-500"
                    : "border-red-300 focus:border-red-400"
                  : "border-slate-200 focus:border-[#1c9c4d]"
              }`}
              value={formData.phone}
              onChange={handleChange}
              maxLength={10}
              autoComplete="tel"
            />

            {/* Invalid phone */}
            {formData.phone.length > 0 &&
              !isPhoneValid && (
                <p className="mt-1 text-xs text-red-600">
                  Please enter a valid Ghanaian phone
                  number.
                </p>
              )}

            {/* Valid phone */}
            {isPhoneValid &&
              formData.phone.length === 10 && (
                <p className="mt-1 text-xs text-green-600">
                  ✓ Valid Ghanaian phone number
                </p>
              )}

            {/* Remaining digits */}
            {formData.phone.length > 0 &&
              formData.phone.length < 10 && (
                <p className="mt-1 text-xs text-slate-500">
                  {10 - formData.phone.length} digits
                  remaining
                </p>
              )}

            <p className="mt-1 text-xs text-slate-400">
              Example: 0241234567
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
              name="password"
              type="password"
              placeholder="Create a strong password"
              className={`w-full rounded-xl border bg-slate-50 px-3 py-3 text-slate-800 outline-none transition focus:bg-white ${
                formData.password.length > 0
                  ? allPasswordRequirementsMet
                    ? "border-green-400 focus:border-green-500"
                    : "border-slate-200 focus:border-[#1c9c4d]"
                  : "border-slate-200 focus:border-[#1c9c4d]"
              }`}
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
            />

            {/* PASSWORD REQUIREMENTS */}

            <div className="mt-3 rounded-xl bg-slate-50 p-4">

              <p className="mb-3 text-xs font-semibold text-slate-600">
                Password must contain:
              </p>

              <ul className="space-y-2">

                <Requirement
                  met={passwordRequirements.minLength}
                >
                  At least 8 characters
                </Requirement>

                <Requirement
                  met={passwordRequirements.uppercase}
                >
                  At least one uppercase letter
                </Requirement>

                <Requirement
                  met={passwordRequirements.lowercase}
                >
                  At least one lowercase letter
                </Requirement>

                <Requirement
                  met={passwordRequirements.number}
                >
                  At least one number
                </Requirement>

                <Requirement
                  met={passwordRequirements.special}
                >
                  At least one special character
                </Requirement>

              </ul>
            </div>

            {/* STRONG PASSWORD */}

            {allPasswordRequirementsMet && (
              <p className="mt-2 text-xs font-medium text-green-600">
                ✓ Strong password
              </p>
            )}
          </div>

          {/* =================================================
              REGISTER BUTTON
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
            Register
          </button>

          {/* =================================================
              LOGIN LINK
          ================================================= */}

          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}

            <Link
              to="/login"
              className="font-bold text-[#0a2b3c] hover:text-[#1c9c4d]"
            >
              Login here
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}

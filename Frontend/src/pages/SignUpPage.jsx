import React, { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import { User, MessageSquare, Mail, Lock, EyeOff, Eye } from "lucide-react";
import AuthImagePattern from "../components/AuthImagePattern.jsx";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const SignUpPage = () => {
  const [showPassword, setPassword] = useState(false);
  const { checkAuth, signup, authUser, isCheckingAuth } = useAuthStore();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const { signUp, isSigningUp } = useAuthStore();
  const validateForm = () => {
    if (!formData.fullName || !formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }

    if (!formData.email || !formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error("Invalid email");
      return false;
    }

    if (!formData.password) {
      toast.error("Password is required");
      return false;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true; // ✅ form is valid
  };

  const handleSumbit = (e) => {
    e.preventDefault();
    const sucess = validateForm();
    if (sucess === true) signup(formData);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* left side */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-12">
        <div className=" w-full max-w-md space-y-8">
          {/* LOGO */}
          <div className="text-center mb-8">
            <div className=" flex flex-col item center gap-2 group">
              <div className="size-12 rounded-xl bg-primary/10 flex  items-center justify-center group-hover:bg-primary/20 tracking-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get started with your free Account
              </p>
            </div>
          </div>
          <form onSubmit={handleSumbit} className="space-y-6">
            {/* full name */}
            <div className="from-control">
              <label className="lable">
                <span className="lable-text font-medium">Full Name</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="Jhon Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>
            </div>

            {/* email */}
            <div className="from-control">
              <label className="lable">
                <span className="lable-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="text"
                  className={`input input-bordered w-full pl-10`}
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* password */}
            <div className="from-control">
              <label className="lable">
                <span className="lable-text font-medium">password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className={`input input-bordered w-full pl-10`}
                  placeholder="Password123"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="size-5 text-base-content/40" />
                  ) : (
                    <Eye className="size-5 text-base-content/40" />
                  )}
                </button>
              </div>
            </div>

            {/* create Account */}
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isSigningUp}
            >
              {isSigningUp ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  loading..
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Already Have an Account */}
          <div className="text-center">
            <p className="text-base-content/60">
              Already have an account?{""}
              <Link to="/login" className="link link-primary">
                SignUp
              </Link>
            </p>
          </div>
        </div>
      </div>
      {/* right side */}
      <AuthImagePattern
        title="Join our community"
        subtitle="Connects with friends, share moments, and stay in touch with your loved ones"
      />
    </div>
  );
};

export default SignUpPage;

import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { Input } from "../components/ui/input.jsx";
import { Button } from "../components/ui/button.jsx";
import { Label } from "../components/ui/label.jsx";
import { toast } from "../components/ui/sonner.jsx";

import { useAuth } from "../hooks/useAuth.js";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login } = useAuth();

  const validate = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email address";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Please fix the errors");
      return;
    }

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    setIsLoading(true);
    try {
      setIsLoading(true);
      await login({ email, password });
      navigate("/");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="animate-fade-in w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-2xl font-semibold">
            Welcome back
          </h1>
          <p className="text-muted-foreground text-sm">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-foreground text-sm">
              Email
            </Label>
            <Input
              id="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              className={
                errors.email
                  ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />

            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="password" className="text-foreground text-sm">
              Password
            </Label>
            <Input
              id="password"
              placeholder="••••••••"
              value={password}
              type="password"
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: undefined }));
              }}
              className={
                errors.password
                  ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />

            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="h-11 w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-primary font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

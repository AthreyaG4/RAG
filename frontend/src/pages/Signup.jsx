import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Input } from "../components/ui/input.jsx";
import { Button } from "../components/ui/button.jsx";
import { Label } from "../components/ui/label.jsx";
import { toast } from "../components/ui/sonner.jsx";

import { useAuth } from "../hooks/useAuth.js";

export default function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [errors, setErrors] = useState({});

  const { signup } = useAuth();

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) newErrors.name = "Name is required";
    if (!username.trim()) newErrors.username = "Username is required";

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

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
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

    try {
      setIsLoading(true);
      await signup({ name, username, email, password });
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err) {
      console.log(err.message);
      if (err?.detail) {
        toast.error(Object.values(err.detail)[0]);
        setErrors(err.detail ?? {});
      } else {
        toast.error("Signup failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4">
      <div className="animate-fade-in w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-foreground text-2xl font-semibold">
            Create an account
          </h1>
          <p className="text-muted-foreground text-sm">
            Get started with your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name" className="text-foreground text-sm">
              Name
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              className={
                errors.name
                  ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="username" className="text-foreground text-sm">
              Username
            </Label>
            <Input
              id="username"
              placeholder="johndoe"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setErrors((prev) => ({ ...prev, username: undefined }));
              }}
              className={
                errors.username
                  ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

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

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="confirmPassword"
              className="text-foreground text-sm"
            >
              Confirm password
            </Label>
            <Input
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              type="password"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
              }}
              className={
                errors.confirmPassword
                  ? "border-red-500 ring-1 ring-red-500 focus-visible:ring-red-500"
                  : ""
              }
            />

            {errors.confirmPassword && (
              <p className="text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <Button type="submit" className="h-11 w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-muted-foreground text-center text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

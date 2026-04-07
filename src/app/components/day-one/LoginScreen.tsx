import { useState } from "react";
import { Lock } from "lucide-react";
import { ConceptualLabel } from "../../../imports/ConceptualLabel-1";

interface LoginScreenProps {
  onComplete: () => void;
}

export function LoginScreen({ onComplete }: LoginScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ backgroundColor: "var(--background)" }}
    >
      <div
        className="w-full max-w-md p-8 border bg-card"
        style={{
          borderRadius: "var(--radius)",
          borderColor: "var(--border)",
          boxShadow: "var(--elevation-md)",
        }}
      >
        {/* Logo/Header Area */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-16 h-16 mb-4 border"
            style={{
              borderRadius: "var(--radius)",
              borderColor: "var(--border)",
              backgroundColor: "var(--muted)",
            }}
          >
            <Lock className="w-8 h-8 text-primary" />
          </div>

          <h1
            className="mb-2"
            style={{
              fontFamily: "var(--font-family-display)",
              fontSize: "var(--text-2xl)",
              fontWeight: "var(--font-weight-medium)",
            }}
          >
            OpenShift Management Engine
          </h1>
          <p
            className="text-muted-foreground"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
            }}
          >
            Sign in to continue
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="username"
              className="block mb-2"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
                borderRadius: "var(--radius)",
                borderColor: "var(--border)",
              }}
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block mb-2"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-weight-medium)",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              style={{
                fontFamily: "var(--font-family-text)",
                fontSize: "var(--text-sm)",
                borderRadius: "var(--radius)",
                borderColor: "var(--border)",
              }}
              placeholder="Enter your password"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-primary text-primary-foreground hover:opacity-90 transition-opacity mt-6"
            style={{
              fontFamily: "var(--font-family-text)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-weight-medium)",
              borderRadius: "var(--radius)",
            }}
          >
            Log in
          </button>
        </form>
      </div>

      <ConceptualLabel />
    </div>
  );
}
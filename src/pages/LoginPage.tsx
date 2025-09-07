import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../api";
import { useAsyncAction } from "../hooks/useApi";

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const { loading, error, execute } = useAsyncAction<{ token: string }>();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const result = await execute(() => login(email, password));
            
            // Store token in localStorage
            localStorage.setItem("token", result.token);
            
            // Navigate to home page
            navigate("/home");
        } catch (err) {
            // Error is already handled by useAsyncAction hook
            console.error("Login failed:", err);
            
            // Fallback to dummy auth for development
            if (email === "admin@example.com" && password === "password") {
                localStorage.setItem("token", "dummy-token");
                navigate("/home");
            }
        }
    };

    return (
        <div>
            <div className="flex flex-col items-center justify-center h-screen px-4">
                <h1 className="text-2xl mb-4">Login</h1>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full max-w-xs">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="border rounded px-3 py-2"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="border rounded px-3 py-2"
                        required
                    />
                    <button 
                        type="submit" 
                        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Development fallback: Try admin@example.com/password
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

export default LoginPage;

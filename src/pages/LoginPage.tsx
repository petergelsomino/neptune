import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Dummy check for demo purposes
        if (username === "admin" && password === "password") {
            navigate("/home");
        } else {
            setError("Invalid username or password");
        }
    };

    return (
        <div>
            <div className="flex flex-col items-center justify-center h-screen px-4">
                <h1 className="text-2xl mb-4">Login</h1>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-4 w-full max-w-xs">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
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
                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                        Login
                    </button>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                </form>
            </div>
        </div>
    );
}

export default LoginPage;

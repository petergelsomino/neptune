import { logout } from "../api";

interface HeaderProps {
    title?: string;
}

function Header({ title = "Home Boys Confidence Pool" }: HeaderProps) {
    const handleLogout = () => {
        logout();
        window.location.href = '/login';
    };

    return (
        <header className="bg-gray-800 text-white px-4 py-3 shadow-md">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
                <h1 className="text-xl font-bold">{title}</h1>
                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                >
                    Logout
                </button>
            </div>
        </header>
    );
}

export default Header;
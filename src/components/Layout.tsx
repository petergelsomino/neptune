import { Outlet } from "react-router-dom";
import Header from "./Header";

function Layout() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;

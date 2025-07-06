import { useNavigate } from "react-router-dom";

const leagues = [
    { id: "1", name: "Premier League" },
    { id: "2", name: "Champions League" },
];

function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="p-4">
            <h2 className="text-xl mb-4">Your Leagues</h2>
            <ul>
                {leagues.map((league) => (
                    <li key={league.id}>
                        <button
                            className="text-blue-500 underline"
                            onClick={() => navigate(`/league/${league.id}`)}
                        >
                            {league.name}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default HomePage;

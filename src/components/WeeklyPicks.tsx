import { useParams } from "react-router-dom";

const games = [
    { id: "game1", teams: "Team A vs Team B" },
    { id: "game2", teams: "Team C vs Team D" },
];

function WeeklyPicks() {
    const { leagueId } = useParams();

    return (
        <div className="p-4">
            <h2 className="text-xl mb-4">Select Games - League {leagueId}</h2>
            <ul>
                {games.map((game) => (
                    <li key={game.id} className="mb-2">
                        <label>
                            <input type="checkbox" className="mr-2" /> {game.teams}
                        </label>
                    </li>
                ))}
            </ul>
            <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
                Submit Picks
            </button>
        </div>
    );
}

export default WeeklyPicks;

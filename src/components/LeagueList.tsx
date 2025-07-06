import { useParams } from "react-router-dom";

const games = [
    { id: "game1", teams: "Team A vs Team B" },
    { id: "game2", teams: "Team C vs Team D" },
];

function LeagueList() {

    return (
        <div className="p-4">
            <h2 className="text-xl mb-4">Welcome to your Pick Leagues</h2>
        </div>
    );
}

export default LeagueList;

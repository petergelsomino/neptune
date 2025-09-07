const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:8080/api";

export async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || res.statusText);
    }

    return res.json();
}

export async function login(email: string, password: string) {
    return apiRequest<{ token: string }>("/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

// League/Group endpoints
export async function getUserLeagues() {
    return apiRequest("/me/leagues");
}

export async function getLeagueDetails(leagueId: string) {
    return apiRequest<{ id: string; league_name: string }>(`/leagues/${leagueId}`);
}

export async function getLeagueSeasons(leagueId: string) {
    return apiRequest(`/leagues/${leagueId}/seasons`);
}

// Games and Picks endpoints
export async function getWeeklyGames(leagueId: string, seasonId: string, week: number) {
    return apiRequest(`/leagues/${leagueId}/seasons/${seasonId}/weeks/${week}/games`);
}

export async function getUserPicks(leagueId: string, seasonId: string, week: number) {
    return apiRequest(`/leagues/${leagueId}/seasons/${seasonId}/weeks/${week}/picks`);
}

export async function submitPicks(leagueId: string, seasonId: string, week: number, picks: { gameId: string; points: number; selectedTeam: 'home' | 'away'; selectedSpread: number }[]) {
    return apiRequest(`/leagues/${leagueId}/seasons/${seasonId}/weeks/${week}/picks`, {
        method: "POST",
        body: JSON.stringify({ picks }),
    });
}

// Season/Week navigation
export async function getCurrentWeek(leagueId: string, seasonId: string) {
    return apiRequest(`/leagues/${leagueId}/seasons/${seasonId}/current-week`);
}

export async function getWeeklyLeaderboard(leagueId: string, seasonId: string, week?: number) {
    const weekParam = week ? `?week=${week}` : '';
    return apiRequest(`/leagues/${leagueId}/seasons/${seasonId}/leaderboard${weekParam}`);
}

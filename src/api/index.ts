const API_BASE_URL = "https://your-api-url.com/api";  // ✅ CHANGE THIS

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

export async function login(username: string, password: string) {
    return apiRequest<{ token: string }>("/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
    });
}

export async function getWeeklyGames(leagueId: string, week: number) {
    return apiRequest(`/leagues/${leagueId}/weeks/${week}/games`);
}

export async function getUserPicks(leagueId: string, week: number) {
    return apiRequest(`/leagues/${leagueId}/weeks/${week}/picks`);
}

export async function submitPicks(leagueId: string, week: number, picks: { gameId: string; points: number }[]) {
    return apiRequest(`/leagues/${leagueId}/weeks/${week}/picks`, {
        method: "POST",
        body: JSON.stringify({ picks }),
    });
}

import { GraphQLClient } from 'graphql-request';

const GRAPHQL_ENDPOINT = process.env.REACT_APP_GRAPHQL_URL || 'http://localhost:8080/query';

// Create GraphQL client with auth headers
export function createGraphQLClient() {
    const token = localStorage.getItem('token');
    
    return new GraphQLClient(GRAPHQL_ENDPOINT, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
}

// GraphQL Queries
export const GET_LEAGUE_SEASONS_BY_ID = `
  query GetLeagueSeasonsById($leagueID: ID!) {
    GetLeagueSeasonsById(leagueID: $leagueID) {
      id
      year_start
      year_end
      sport
    }
  }
`;

export const GET_WEEKLY_NFL_GAME_SPREADS = `
  query {
    GetWeeklyNflGameSpreads {
      homeTeam {
        name
        spread
      }
      awayTeam {
        name
        spread
      }
      commenceTime
      isSelectable
      oddsGameId
    }
  }
`;

export const CREATE_GAME_PICK = `
  mutation CreateGamePick($input: NewGamePickInput!) {
    CreateGamePick(input: $input) {
      id
      season_id
      week_id
      selected_team_name
      opponent_team_name
      spread_selection
      spread_result
      points_assigned
    }
  }
`;

// TypeScript interfaces for GraphQL responses
export interface Season {
    id: string;
    year_start: number;
    year_end: number;
    sport: string;
}

export interface Team {
    name: string;
    spread: number;
}

export interface WeeklyGame {
    homeTeam: Team;
    awayTeam: Team;
    commenceTime: string;
    isSelectable: boolean;
    oddsGameId: string;
}

export interface GamePick {
    id: string;
    season_id: string;
    week_id: string;
    selected_team_name: string;
    opponent_team_name: string;
    spread_selection: number;
    spread_result: number;
    points_assigned: number;
}

export interface NewGamePickInput {
    season_id: string;
    week_id: string;
    selected_team_name: string;
    opponent_team_name: string;
    spread_selection: number;
    spread_result: number;
    points_assigned: number;
}

// GraphQL API functions
export async function getLeagueSeasons(leagueId: string): Promise<Season[]> {
    const client = createGraphQLClient();
    const response = await client.request<{ GetLeagueSeasonsById: Season[] }>(
        GET_LEAGUE_SEASONS_BY_ID,
        { leagueID: leagueId }
    );
    return response.GetLeagueSeasonsById;
}

export async function getWeeklyGames(): Promise<WeeklyGame[]> {
    const client = createGraphQLClient();
    const response = await client.request<{ GetWeeklyNflGameSpreads: WeeklyGame[] }>(
        GET_WEEKLY_NFL_GAME_SPREADS
    );
    return response.GetWeeklyNflGameSpreads;
}

export async function createGamePick(input: NewGamePickInput): Promise<GamePick> {
    const client = createGraphQLClient();
    const response = await client.request<{ CreateGamePick: GamePick }>(
        CREATE_GAME_PICK,
        { input }
    );
    return response.CreateGamePick;
}
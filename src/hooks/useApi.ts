import { useState, useEffect } from 'react';

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export function useApi<T>(apiCall: () => Promise<T>, dependencies: any[] = []) {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        let isCancelled = false;

        const fetchData = async () => {
            setState(prev => ({ ...prev, loading: true, error: null }));
            
            try {
                const result = await apiCall();
                if (!isCancelled) {
                    setState({ data: result, loading: false, error: null });
                }
            } catch (error) {
                if (!isCancelled) {
                    setState({ 
                        data: null, 
                        loading: false, 
                        error: error instanceof Error ? error.message : 'An error occurred' 
                    });
                }
            }
        };

        fetchData();

        return () => {
            isCancelled = true;
        };
    }, dependencies);

    return state;
}

export function useAsyncAction<T>() {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = async (apiCall: () => Promise<T>) => {
        setState({ data: null, loading: true, error: null });
        
        try {
            const result = await apiCall();
            setState({ data: result, loading: false, error: null });
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            setState({ data: null, loading: false, error: errorMessage });
            throw error;
        }
    };

    return { ...state, execute };
}
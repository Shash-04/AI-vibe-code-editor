import { useState, useCallback, useRef } from "react";


interface AISuggestionsState {
    suggestion: string | null;
    isLoading: boolean;
    position: { line: number; column: number } | null;
    decoration: string[];
    isEnabled: boolean;
}

interface UseAISuggestionsReturn extends AISuggestionsState {
    toggleEnabled: () => void;
    fetchSuggestion: (type: string, editor: any) => Promise<void>;
    acceptSuggestion: (editor: any, monaco: any) => void;
    rejectSuggestion: (editor: any) => void;
    clearSuggestion: (editor: any) => void;
}

export const useAISuggestions = (): UseAISuggestionsReturn => {
    const [state, setState] = useState<AISuggestionsState>({
        suggestion: null,
        isLoading: false,
        position: null,
        decoration: [],
        isEnabled: true,
    });

    // Mirror the latest state in a ref so the async/callback handlers can read
    // current values and run side effects OUTSIDE of the setState updater
    // (keeping updaters pure and StrictMode-safe).
    const stateRef = useRef(state);
    stateRef.current = state;

    // Monotonically increasing id so a slow in-flight request can never
    // overwrite the result of a newer one.
    const requestIdRef = useRef(0);

    const toggleEnabled = useCallback(() => {
        setState((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
    }, []);

    const fetchSuggestion = useCallback(async (type: string, editor: any) => {
        if (!stateRef.current.isEnabled || !editor) return;

        const model = editor.getModel();
        const cursorPosition = editor.getPosition();
        if (!model || !cursorPosition) return;

        const requestId = ++requestIdRef.current;
        setState((prev) => ({ ...prev, isLoading: true }));

        try {
            const payload = {
                fileContent: model.getValue(),
                cursorLine: cursorPosition.lineNumber - 1,
                cursorColumn: cursorPosition.column - 1,
                suggestionType: type,
            };

            const response = await fetch("/api/code-completion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error(`API responded with status ${response.status}`);
            }

            const data = await response.json();

            // A newer request has superseded this one — drop the stale result.
            if (requestId !== requestIdRef.current) return;

            if (data.suggestion) {
                setState((prev) => ({
                    ...prev,
                    suggestion: data.suggestion.trim(),
                    position: {
                        line: cursorPosition.lineNumber,
                        column: cursorPosition.column,
                    },
                    isLoading: false,
                }));
            } else {
                console.warn("No suggestion received from API.");
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        } catch (error) {
            console.error("Error fetching code suggestion:", error);
            if (requestId === requestIdRef.current) {
                setState((prev) => ({ ...prev, isLoading: false }));
            }
        }
    }, []);

    // The editor component inserts the suggestion text itself before calling
    // this handler, so here we only clear the hook's suggestion state and any
    // decorations — inserting again would double-paste the text.
    const acceptSuggestion = useCallback((editor: any, _monaco: any) => {
        const { decoration } = stateRef.current;
        if (editor && decoration.length > 0) {
            editor.deltaDecorations(decoration, []);
        }
        setState((prev) => ({
            ...prev,
            suggestion: null,
            position: null,
            decoration: [],
        }));
    }, []);

    const rejectSuggestion = useCallback((editor: any) => {
        const { decoration } = stateRef.current;
        if (editor && decoration.length > 0) {
            editor.deltaDecorations(decoration, []);
        }
        setState((prev) => ({
            ...prev,
            suggestion: null,
            position: null,
            decoration: [],
        }));
    }, []);

    const clearSuggestion = useCallback((editor: any) => {
        const { decoration } = stateRef.current;
        if (editor && decoration.length > 0) {
            editor.deltaDecorations(decoration, []);
        }
        setState((prev) => ({
            ...prev,
            suggestion: null,
            position: null,
            decoration: [],
        }));
    }, []);

    return {
        ...state,
        toggleEnabled,
        fetchSuggestion,
        acceptSuggestion,
        rejectSuggestion,
        clearSuggestion,
    };
};


import { useState, useEffect, useCallback, useRef } from "react";
import { WebContainer } from "@webcontainer/api";
import { TemplateFolder } from "@/modules/playground/lib/path-to-json";

interface UseWebContainerProps {
    templateData: TemplateFolder;
}

interface UseWebContaierReturn {
    serverUrl: string | null;
    isLoading: boolean;
    error: string | null;
    instance: WebContainer | null;
    writeFileSync: (path: string, content: string) => Promise<void>;
    destory: () => void;
}

// Module-level singleton: WebContainer can only be booted once per page load.
// We keep the instance here so navigating away and back reuses it safely.
let _wcInstance: WebContainer | null = null;

export const useWebContainer = ({
    templateData,
}: UseWebContainerProps): UseWebContaierReturn => {
    const [serverUrl, setServerUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(!_wcInstance);
    const [error, setError] = useState<string | null>(null);
    const [instance, setInstance] = useState<WebContainer | null>(_wcInstance);

    // Use a ref so the cleanup function always has access to the latest instance
    const instanceRef = useRef<WebContainer | null>(_wcInstance);

    useEffect(() => {
        let mounted = true;

        async function initializeWebContainer() {
            // Reuse the existing singleton if already booted
            if (_wcInstance) {
                setInstance(_wcInstance);
                instanceRef.current = _wcInstance;
                setIsLoading(false);
                return;
            }

            try {
                const webcontainerInstance = await WebContainer.boot();
                _wcInstance = webcontainerInstance;

                if (!mounted) return;

                instanceRef.current = webcontainerInstance;
                setInstance(webcontainerInstance);
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to initialize WebContainer:", err);
                if (mounted) {
                    setError(
                        err instanceof Error
                            ? err.message
                            : "Failed to initialize WebContainer"
                    );
                    setIsLoading(false);
                }
            }
        }

        initializeWebContainer();

        return () => {
            mounted = false;
            // NOTE: We do NOT teardown here — the singleton lives for the full
            // page session. Call destory() explicitly only when truly done.
        };
    }, []);

    const writeFileSync = useCallback(
        async (path: string, content: string): Promise<void> => {
            const inst = instanceRef.current;
            if (!inst) {
                throw new Error("WebContainer instance is not available");
            }

            try {
                const pathParts = path.split("/");
                const folderPath = pathParts.slice(0, -1).join("/");

                if (folderPath) {
                    await inst.fs.mkdir(folderPath, { recursive: true });
                }

                await inst.fs.writeFile(path, content);
            } catch (err) {
                const errorMessage =
                    err instanceof Error ? err.message : "Failed to write file";
                console.error(`Failed to write file at ${path}:`, err);
                throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
            }
        },
        []
    );

    const destory = useCallback(() => {
        if (instanceRef.current) {
            instanceRef.current.teardown();
            instanceRef.current = null;
            _wcInstance = null;
            setInstance(null);
            setServerUrl(null);
        }
    }, []);

    return { serverUrl, isLoading, error, instance, writeFileSync, destory };
};
import React, {createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState} from "react";
import {BeatmapDifficultySection, BeatmapMetadataSection} from "osu-classes";
import {StandardModCombination} from "osu-standard-stable";
import {StandardBeatmapPreview} from "osu-beatmap-preview";
import {useTime} from "./TimeContext";

interface BeatmapPreviewContextProps {
    beatmapId: string | null;
    setBeatmapId: (id: string | null) => void;
    modCombination: StandardModCombination | null;
    setModCombination: (combination: StandardModCombination | null) => void;
    previewerRef: React.RefObject<StandardBeatmapPreview | null>;
    initializePreviewer: (canvas: HTMLCanvasElement) => void;
    loadBeatmap: () => Promise<boolean>;
    isLoaded: boolean;
    metadata: BeatmapMetadataSection | null;
    difficulty: BeatmapDifficultySection | null;
}

const BeatmapPreviewContext = createContext<BeatmapPreviewContextProps | undefined>(undefined);

let cachedBeatmapText: { beatmapId: string; text: string } | null = null;

export const BeatmapPreviewProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [beatmapId, setBeatmapId] = useState<string | null>(null);
    const [metadata, setMetadata] = useState<BeatmapMetadataSection | null>(null);
    const [difficulty, setDifficulty] = useState<BeatmapDifficultySection | null>(null);
    const [modCombination, setModCombination] = useState<StandardModCombination | null>(null);
    const [previewerReady, setPreviewerReady] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const {setTotalLength} = useTime();
    const previewerRef = useRef<StandardBeatmapPreview | null>(null);

    const initializePreviewer = useCallback((canvas: HTMLCanvasElement) => {
        previewerRef.current?.dispose();
        previewerRef.current = new StandardBeatmapPreview(canvas, {
            width: 640,
            height: 480,
        });
        setPreviewerReady(true);
    }, []);

    const loadBeatmap = useCallback(async (): Promise<boolean> => {
        if (!previewerRef.current || !beatmapId) {
            setIsLoaded(false);
            return false;
        }

        setIsLoaded(false);

        try {
            const text = await getBeatmapText(beatmapId);
            const beatmap = previewerRef.current.loadBeatmapText(text, {
                mods: modCombination?.bitwise ?? 0,
            });

            setTotalLength(beatmap.totalLength || 1000);
            setMetadata(beatmap.metadata || null);
            setDifficulty(beatmap.difficulty || null);
            previewerRef.current.render(0);
            setIsLoaded(true);
            return true;
        } catch (error) {
            console.error("Failed to load beatmap", error);
            setTotalLength(0);
            setMetadata(null);
            setDifficulty(null);
            return false;
        }
    }, [beatmapId, modCombination, setTotalLength]);

    useEffect(() => {
        if (!previewerReady) {
            return;
        }

        void loadBeatmap();
    }, [loadBeatmap, previewerReady]);

    return (
        <BeatmapPreviewContext.Provider
            value={{
                beatmapId,
                setBeatmapId,
                modCombination,
                setModCombination,
                previewerRef,
                initializePreviewer,
                loadBeatmap,
                isLoaded,
                metadata,
                difficulty,
            }}>
            {children}
        </BeatmapPreviewContext.Provider>
    );
};

export const useBeatmapPreview = (): BeatmapPreviewContextProps => {
    const context = useContext(BeatmapPreviewContext);

    if (!context) {
        throw new Error("useBeatmapPreview must be used within a BeatmapPreviewProvider");
    }

    return context;
};

const getBeatmapText = async (beatmapId: string): Promise<string> => {
    if (cachedBeatmapText?.beatmapId === beatmapId) {
        return cachedBeatmapText.text;
    }

    const response = await fetch(`https://osu.ppy.sh/osu/${beatmapId}`);

    if (!response.ok) {
        throw new Error(`Beatmap request failed with ${response.status}`);
    }

    const text = await response.text();
    cachedBeatmapText = {beatmapId, text};
    return text;
};

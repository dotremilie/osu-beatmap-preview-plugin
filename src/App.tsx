import React, {useEffect, useRef} from "react";
import browser from "webextension-polyfill";
import {StandardModCombination} from "osu-standard-stable";
import {useTime} from "./contexts/TimeContext";
import PlayerControls from "./ui/PlayerControls";
import ModSelectButton from "./ui/mods/ModSelectButton";
import {useBeatmapPreview} from "./contexts/BeatmapPreviewContext";

const HASH_BEATMAP_ID_REGEX = /#(?:osu|taiko|fruits|mania)\/(\d+)/i;
const DIRECT_BEATMAP_ID_REGEX = /^\/(?:b|beatmaps)\/(\d+)/i;
const OSU_HOSTS = new Set(["osu.ppy.sh", "new.ppy.sh"]);

function App() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const {timestamp, isRunning, start} = useTime();
    const {
        setBeatmapId,
        setModCombination,
        previewerRef,
        initializePreviewer,
        isLoaded,
        metadata,
        difficulty,
    } = useBeatmapPreview();

    useEffect(() => {
        if (!canvasRef.current) {
            return;
        }

        initializePreviewer(canvasRef.current);
    }, [initializePreviewer]);

    useEffect(() => {
        const onStartup = async () => {
            const [tab] = await browser.tabs.query({active: true, currentWindow: true});
            setBeatmapId(getBeatmapIdFromUrl(tab?.url));
            setModCombination(new StandardModCombination());
        };

        void onStartup().catch(console.error);
    }, [setBeatmapId, setModCombination]);

    useEffect(() => {
        if (isLoaded && !isRunning) {
            start();
        }
    }, [isLoaded, isRunning, start]);

    useEffect(() => {
        if (isRunning && isLoaded) {
            previewerRef.current?.render(timestamp);
        }
    }, [timestamp, isRunning, isLoaded, previewerRef]);

    return (
        <>
            <div className="flex items-center justify-between bg-primary-b4 p-4">
                <div className="flex flex-col">
                    <div className="flex items-baseline w-full gap-1.5 max-w-full truncate">
                        <span className="text-2xl font-bold truncate">
                            {metadata?.title}
                        </span>
                        <span className="text-xl truncate">
                            {metadata?.artist}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 w-full">
                        <div className="text-xl">&#10687;</div>
                        <div className="flex items-baseline w-full gap-1.5">
                            <span className="font-bold">
                                {metadata?.version}
                            </span>
                            <span className="font-light text-primary-l1">
                                mapped by
                            </span>
                            <span>
                                {metadata?.creator}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-6 bg-primary-b5 py-2 px-4 rounded-lg">
                    <div className="grid grid-cols-2 gap-x-4 text-sm flex-1">
                        <div className="flex justify-between gap-4">
                            <div>CS</div>
                            <div className="font-bold">
                                {formatDifficultyValue(difficulty?.circleSize)}
                            </div>
                        </div>
                        <div className="flex justify-between gap-4">
                            <div>AR</div>
                            <div className="font-bold">
                                {formatDifficultyValue(difficulty?.approachRate)}
                            </div>
                        </div>
                        <div className="flex justify-between gap-4">
                            <div>OD</div>
                            <div className="font-bold">
                                {formatDifficultyValue(difficulty?.overallDifficulty)}
                            </div>
                        </div>
                        <div className="flex justify-between gap-4">
                            <div>HP</div>
                            <div className="font-bold">
                                {formatDifficultyValue(difficulty?.drainRate)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative">
                <div className="absolute flex z-10 p-2 w-full items-end justify-end">
                    <ModSelectButton/>
                </div>

                <div
                    style={{backgroundImage: `url('https://assets.ppy.sh/beatmaps/${metadata?.beatmapSetId}/covers/cover@2x.jpg')`}}
                    className="bg-cover bg-center w-[640px] h-[480px] bg-primary-b6">
                    <canvas ref={canvasRef} className="w-full h-full bg-black/25 backdrop-blur-sm"/>
                </div>

                <PlayerControls/>
            </div>
        </>
    );
}

const getBeatmapIdFromUrl = (value?: string): string | null => {
    if (!value) {
        return null;
    }

    try {
        const url = new URL(value);

        if (!OSU_HOSTS.has(url.hostname)) {
            return null;
        }

        return url.hash.match(HASH_BEATMAP_ID_REGEX)?.[1]
            ?? url.pathname.match(DIRECT_BEATMAP_ID_REGEX)?.[1]
            ?? null;
    } catch {
        return null;
    }
};

const formatDifficultyValue = (value?: number): string => {
    if (value === undefined) {
        return "";
    }

    return value % 1 !== 0 ? value.toFixed(1) : value.toFixed(0);
};

export default App;

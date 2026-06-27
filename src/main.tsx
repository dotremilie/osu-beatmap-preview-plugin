import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import {TimeProvider} from "./contexts/TimeContext";
import {BeatmapPreviewProvider} from "./contexts/BeatmapPreviewContext";

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <TimeProvider>
            <BeatmapPreviewProvider>
                <App />
            </BeatmapPreviewProvider>
        </TimeProvider>
    </StrictMode>,
)

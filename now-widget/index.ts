import React from 'react';
import { createRoot } from 'react-dom/client';
import NowWidget from './NowWidget';

interface WidgetConfig {
    userId: string;
    token: string;
    theme?: 'light' | 'dark';
    position?: 'left' | 'right';
    buttonColor?: string;
    buttonSize?: number;
}

function init(config: WidgetConfig) {
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'nownownow-widget-container';
    document.body.appendChild(widgetContainer);

    createRoot(widgetContainer).render(
        React.createElement(NowWidget, config)
    );
}

export { init };

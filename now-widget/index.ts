import React from 'react';
import { createRoot } from 'react-dom/client';
import NowWidget from './NowWidget';

function init() {
    const script = document.currentScript as HTMLScriptElement;
    const userId = script.getAttribute('data-user-id');
    const token = script.getAttribute('data-token');

    if (!userId || !token) {
        console.error('NowNowNow Widget: Missing user ID or token');
        return;
    }

    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'nownownow-widget-container';
    document.body.appendChild(widgetContainer);

    createRoot(widgetContainer).render(
        React.createElement(NowWidget, { userId, token })
    );
}

// Initialize the widget when the script loads
init();

export { init };

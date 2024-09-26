import React from 'react';
import { createRoot } from 'react-dom/client';
import NowWidget from './NowWidget';

function init() {
    console.log('NowNowNow Widget: Initializing');
    const script = document.currentScript as HTMLScriptElement;
    const userId = script.getAttribute('data-user-id');
    const token = script.getAttribute('data-token');

    console.log('NowNowNow Widget: User ID:', userId);
    console.log('NowNowNow Widget: Token:', token);

    if (!userId || !token) {
        console.error('NowNowNow Widget: Missing user ID or token');
        return;
    }

    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'nownownow-widget-container';
    document.body.appendChild(widgetContainer);

    console.log('NowNowNow Widget: Container created');

    createRoot(widgetContainer).render(
        React.createElement(NowWidget, { userId, token })
    );

    console.log('NowNowNow Widget: Rendered');
}

// Initialize the widget when the script loads
init();

export { init };

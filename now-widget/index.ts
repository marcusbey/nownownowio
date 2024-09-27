import React from 'react';
import ReactDOM from 'react-dom/client';
import NowWidget from './NowWidget';

function init() {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const userId = currentScript.getAttribute('data-user-id');
    const token = currentScript.getAttribute('data-token');


    if (!userId || !token) {
        return;
    }

    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'nownownow-widget-container';
    document.body.appendChild(widgetContainer);

    const root = ReactDOM.createRoot(widgetContainer);
    root.render(React.createElement(NowWidget, { userId, token }));
}

// Initialize the widget immediately
init();

// Make init function available globally if needed
(window as any).NowNowNowWidget = { init };

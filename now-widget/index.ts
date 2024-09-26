import React from 'react';
import ReactDOM from 'react-dom/client';
import NowWidget from './NowWidget';

console.log('Widget bundle loaded');
console.log('React version:', React.version);
console.log('ReactDOM version:', ReactDOM.version);

function init() {
    console.log('NowNowNow Widget: Initializing');
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const userId = currentScript.getAttribute('data-user-id');
    const token = currentScript.getAttribute('data-token');

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

    const root = ReactDOM.createRoot(widgetContainer);
    root.render(React.createElement(NowWidget, { userId, token }));

    console.log('NowNowNow Widget: Rendered');
}

// Initialize the widget immediately
init();

// Make init function available globally if needed
(window as any).NowNowNowWidget = { init };

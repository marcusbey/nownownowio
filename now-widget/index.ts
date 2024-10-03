import React from 'react';
import ReactDOM from 'react-dom/client';
import NowWidget from './components/NowWidget';

function init() {
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const userId = currentScript.getAttribute('data-user-id');
    const token = currentScript.getAttribute('data-token');

    if (!userId || !token) {
        console.error("Missing userId or token");
        return;
    }

    let widgetContainer = document.getElementById('nownownow-widget-container');
    if (!widgetContainer) {
        widgetContainer = document.createElement('div');
        widgetContainer.id = 'nownownow-widget-container';
        document.body.appendChild(widgetContainer);
    }

    console.log("Widget container:", widgetContainer);

    try {
        const root = ReactDOM.createRoot(widgetContainer);
        root.render(React.createElement(NowWidget, { userId, token, pathname: window.location.pathname }));
    } catch (error) {
        console.error("Error rendering widget:", error);
    }
}

// Initialize the widget immediately
init();

// Make init function available globally if needed
(window as any).NowNowNowWidget = { init };

// Add a fallback initialization
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('nownownow-widget-container')) {
        init();
    }
});
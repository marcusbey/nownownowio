import React from 'react';
import ReactDOM from 'react-dom/client';
import NowWidget from './NowWidget';

function init() {
    console.log("Initializing NowNowNow Widget");
    const scripts = document.getElementsByTagName('script');
    const currentScript = scripts[scripts.length - 1];
    const userId = currentScript.getAttribute('data-user-id');
    const token = currentScript.getAttribute('data-token');

    console.log("User ID:", userId);
    console.log("Token:", token);

    if (!userId || !token) {
        console.error("Missing userId or token");
        return;
    }

    let widgetContainer = document.getElementById('nownownow-widget-container');
    if (!widgetContainer) {
        console.log("Creating widget container");
        widgetContainer = document.createElement('div');
        widgetContainer.id = 'nownownow-widget-container';
        document.body.appendChild(widgetContainer);
    }

    console.log("Widget container:", widgetContainer);

    try {
        const root = ReactDOM.createRoot(widgetContainer);
        root.render(React.createElement(NowWidget, { userId, token }));
        console.log("Widget rendered successfully");
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
        console.log("Fallback initialization");
        init();
    }
});

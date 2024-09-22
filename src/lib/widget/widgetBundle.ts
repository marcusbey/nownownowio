
interface WidgetConfig {
    userId: string;
    token: string;
    cdnUrl?: string;
}

const loadScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.head.appendChild(script);
    });
};

const loadStylesheet = (href: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = () => resolve();
        link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
        document.head.appendChild(link);
    });
};

const initWidget = async (config: WidgetConfig): Promise<void> => {
    const cdnUrl = config.cdnUrl || 'https://your-cdn-url.com';

    try {
        await Promise.all([
            loadScript(`${cdnUrl}/widget-bundle.js`),
            loadStylesheet(`${cdnUrl}/widget-styles.css`)
        ]);

        const container = document.createElement('div');
        container.id = 'nownownow-widget-container';
        document.body.appendChild(container);

        // Assuming NowWidget is globally available after loading widget-bundle.js
        (window as any).NowWidget.init(container, config);
    } catch (error) {
        console.error('Failed to initialize NowNowNow widget:', error);
    }
};

(window as any).NowNowNowWidget = { init: initWidget };
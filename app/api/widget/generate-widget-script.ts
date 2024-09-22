// pages/api/widget/generate-script.ts
import { generateWidgetToken } from '@/lib/widget/widgetUtils';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  const token = generateWidgetToken(userId);

  const script = `
    <script>
    (function() {
      // Create widget container
      var container = document.createElement('div');
      container.id = 'nownownow-widget-container';
      document.body.appendChild(container);

      // Set up configuration
      window.NOW_WIDGET_CONFIG = {
        userId: '${userId}',
        token: '${token}'
      };

      // Load main widget script
      var script = document.createElement('script');
      script.src = '${process.env.NEXT_PUBLIC_WIDGET_URL}/nownownow-widget-bundle.js';
      script.async = true;
      script.onload = function() {
        // Initialize widget after script is loaded
        if (window.NowNowNowWidget && typeof window.NowNowNowWidget.init === 'function') {
          window.NowNowNowWidget.init(window.NOW_WIDGET_CONFIG);
        } else {
          console.error('NowNowNow Widget failed to initialize');
        }
      };
      document.body.appendChild(script);
    })();
    </script>
  `;

  res.status(200).json({ script: script.trim() });
}
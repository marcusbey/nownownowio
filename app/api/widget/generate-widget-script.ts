// pages/api/widget/generate-script.ts
import { generateWidgetToken } from '@/lib/widget/widgetUtils';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body;

  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  const token = generateWidgetToken(userId);

  res.status(200).json({
    script: process.env.NEXT_PUBLIC_WIDGET_URL + '/nownownow-widget-bundle.js',
    token
  });
}
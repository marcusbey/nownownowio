'use client';

import { useState } from 'react';

export function GenerateScriptButton({ userId }: { userId: string }) {
  const [script, setScript] = useState('');

  const generateScript = async () => {
    const response = await fetch(`/api/v1/widget/generate-script?userId=${userId}`);
    const data = await response.json();
    setScript(data.script);
  };

  return (
    <>
      <button onClick={generateScript}>Generate Script</button>
      {script && (
        <div>
          <h2>Your Widget Script:</h2>
          <p>Copy and paste this script tag into your website:</p>
          <textarea readOnly value={script} rows={10} cols={50} />
        </div>
      )}
    </>
  );
}
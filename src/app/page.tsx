
'use client'
import React, { useState } from 'react';

const Home = () => {
  const [textColor, setTextColor] = useState('#000000');

  const handleSubmit = async () => {
    const res = await fetch('/api/update-config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ textColor,newRepoName: 'MobileTemplateFork3' }),
    });

    if (res.ok) {
      alert('Configuration updated successfully!');
    } else {
      alert('Error updating configuration.');
    }
  };

  return (
    <div style={{ padding: '50px' }}>
      <h1>Edit Mobile App</h1>
      <label>Text Color:</label>
      <input
        type="color"
        value={textColor}
        onChange={(e) => setTextColor(e.target.value)}
      />
      <button onClick={handleSubmit}>Save Changes</button>
    </div>
  );
};

export default Home;

import React from 'react';
import MagicBento from '../../components/MagicBento';
import '../../components/MagicBento.css'

const BentoDashboard = () => {
  return (
    <div style={{ padding: '40px', background: '#0a0a1f', minHeight: '100vh' }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
        Hey There!
      </h1>
      <MagicBento
        enableStars={true}
        enableSpotlight={true}
        enableBorderGlow={true}
        enableTilt={true}
        clickEffect={true}
        enableMagnetism={true}
      />
    </div>
  );
};

export default BentoDashboard;

import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
    <footer style={{
      position: 'fixed',
      left: 'calc(env(safe-area-inset-left, 0px) + 1rem)',
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 1rem)',
      margin: 0,
      padding: '0.25rem 0.5rem',
      borderTop: 'none',
      background: document.body.classList.contains('dark-theme')
        ? 'linear-gradient(135deg, rgba(0,229,255,0.18), rgba(255,62,165,0.18))'
        : 'linear-gradient(135deg, rgba(255,255,255,0.6), rgba(255,255,255,0.4))',
      border: '1px solid rgba(0,0,0,0.06)',
      borderRadius: '10px',
      boxShadow: '0 8px 26px rgba(2, 6, 23, 0.12), 0 0 0 2px rgba(255,255,255,0.3) inset',
      backdropFilter: 'blur(8px) saturate(140%)',
      WebkitBackdropFilter: 'blur(8px) saturate(140%)',
      zIndex: 999
    }}>
      <small style={{ opacity: 0.8 }}>
        © {year} User Portal. Alla rättigheter förbehållna.
      </small>
    </footer>
  );
};

export default Footer;

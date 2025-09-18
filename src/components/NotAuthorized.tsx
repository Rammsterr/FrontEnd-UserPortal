import React from 'react';
import { Link } from 'react-router-dom';

const NotAuthorized: React.FC = () => {
  return (
    <section style={{ textAlign: 'center' }}>
      <h2>Inte behörig</h2>
      <p>Du har inte behörighet att visa den här sidan.</p>
      <Link className="btn-secondary btn-inline" to="/">Till startsidan</Link>
    </section>
  );
};

export default NotAuthorized;

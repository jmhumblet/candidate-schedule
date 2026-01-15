import React from 'react';

const Logo: React.FC = () => (
  <div className="d-flex align-items-center gap-2 user-select-none">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C7.58 2 4 5.58 4 10V14H6V10C6 6.69 8.69 4 12 4C15.31 4 18 6.69 18 10V15H20V10C20 5.58 16.42 2 12 2Z" fill="currentColor"/>
      <path d="M6 16C4.9 16 4 16.9 4 18C4 19.1 4.9 20 6 20C7.1 20 8 19.1 8 18C8 16.9 7.1 16 6 16Z" fill="currentColor"/>
      <path d="M12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="currentColor"/>
      <path d="M18 16C16.9 16 16 16.9 16 18C16 19.1 16.9 20 18 20C19.1 20 20 19.1 20 18C20 16.9 19.1 16 18 16Z" fill="currentColor"/>
    </svg>
    <span className="fw-bold fs-5 tracking-tight">jules</span>
  </div>
);

export default Logo;

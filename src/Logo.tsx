import React from 'react';

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "text-primary" }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={{ display: 'block' }}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
      <path d="M7 14H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7 18H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
);

const Logo: React.FC = () => (
  <div className="d-flex align-items-center gap-2 user-select-none">
    {/* Simple Calendar/Checklist Icon */}
    <LogoIcon />
    <span className="fw-bold fs-5 tracking-tight text-body">PlanIt</span>
  </div>
);

export default Logo;

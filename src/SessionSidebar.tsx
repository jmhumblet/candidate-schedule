import React, { useState, useEffect, useRef } from 'react';
import { OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { SavedSession } from './domain/session';
import { FaTrash, FaGithub, FaChevronRight, FaPlus, FaColumns, FaEnvelope } from 'react-icons/fa';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import './Sidebar.css';

interface SessionSidebarProps {
    sessions: SavedSession[];
    onLoadSession: (session: SavedSession) => void;
    onDeleteSession: (id: string) => void;
    onNewSession: () => void;
    onOpenTemplateEditor: () => void;

    // Layout props
    width: number;
    setWidth: (width: number) => void;
    collapsed: boolean;
    setCollapsed: (collapsed: boolean) => void;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
    sessions,
    onLoadSession,
    onDeleteSession,
    onNewSession,
    onOpenTemplateEditor,
    width,
    setWidth,
    collapsed,
    setCollapsed
}) => {
    const [searchTerm, setSearchTerm] = useState('');

    // Resize logic
    const isResizing = useRef(false);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isResizing.current) {
                const newWidth = Math.max(200, Math.min(600, e.clientX)); // Min 200, Max 600
                setWidth(newWidth);
            }
        };

        const handleMouseUp = () => {
            isResizing.current = false;
            document.body.style.cursor = 'default';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [setWidth]);

    const handleMouseDown = (e: React.MouseEvent) => {
        isResizing.current = true;
        document.body.style.cursor = 'col-resize';
        e.preventDefault();
    };

    // Filter sessions
    const sortedSessions = [...sessions].sort((a, b) => {
        return new Date(b.juryDate).getTime() - new Date(a.juryDate).getTime();
    });

    const filteredSessions = sortedSessions.filter(s =>
        (s.jobTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        s.juryDate.includes(searchTerm)
    );

    const isPast = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(dateStr);
        return date < today;
    };

    if (collapsed) {
        return (
            <div className="sidebar-container collapsed-sidebar" style={{ width: 60 }}>
                <div className="d-flex flex-column align-items-center gap-3 w-100">
                     <Button variant="link" className="p-0 text-secondary mb-2" onClick={() => setCollapsed(false)} title="Expand Sidebar" aria-label="Expand Sidebar">
                        <FaChevronRight size={20} />
                    </Button>

                    <div style={{ width: '24px', overflow: 'hidden', height: '24px' }} title="PlanIt">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-primary">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                            <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                            <path d="M7 14H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M7 18H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </div>

                    <OverlayTrigger placement="right" overlay={<Tooltip>Nouvelle Session</Tooltip>}>
                        <Button variant="primary" size="sm" onClick={onNewSession} className="rounded-circle p-2 d-flex justify-content-center align-items-center" style={{ width: 32, height: 32 }} aria-label="Nouvelle Session">
                            <FaPlus size={12} />
                        </Button>
                    </OverlayTrigger>

                    <OverlayTrigger placement="right" overlay={<Tooltip>Modèles d'emails</Tooltip>}>
                        <Button variant="link" className="text-secondary p-0" onClick={onOpenTemplateEditor} aria-label="Modèles d'emails">
                            <FaEnvelope size={20} />
                        </Button>
                    </OverlayTrigger>

                    <div className="mt-auto pb-3 d-flex flex-column gap-3 align-items-center">
                         <ThemeToggle className="btn btn-link text-secondary p-0 border-0" showLabel={false} variant="link" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="sidebar-container" style={{ width }}>
            <div className="resize-handle" onMouseDown={handleMouseDown} />

            <div className="sidebar-header">
                <Logo />
                <div className="d-flex gap-2 align-items-center">
                    <ThemeToggle className="btn btn-sm btn-link text-secondary p-1 border-0" showLabel={false} variant="link"/>
                    <Button variant="link" size="sm" className="text-secondary p-1" onClick={() => setCollapsed(true)} title="Collapse Sidebar" aria-label="Collapse Sidebar">
                        <FaColumns />
                    </Button>
                </div>
            </div>

            <div className="sidebar-search">
                <div className="position-relative">
                    <input
                        type="text"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="sidebar-content">
                <div className="d-flex justify-content-between align-items-center px-3 mb-2">
                     <span className="sidebar-section-title px-0">Sessions Récentes</span>
                     <OverlayTrigger overlay={<Tooltip>Nouvelle Session</Tooltip>}>
                        <Button variant="link" size="sm" className="p-0 text-primary" onClick={onNewSession} aria-label="Nouvelle Session">
                            <FaPlus />
                        </Button>
                     </OverlayTrigger>
                </div>

                {filteredSessions.map(session => (
                    <div
                        key={session.id}
                        className={`sidebar-item ${isPast(session.juryDate) ? 'text-muted' : ''}`}
                        onClick={() => onLoadSession(session)}
                    >
                        <div className="text-truncate me-2" style={{ maxWidth: '80%' }}>
                            <div className="fw-bold text-truncate" style={{ fontSize: '0.9em' }}>{session.jobTitle || "Sans titre"}</div>
                            <div style={{ fontSize: '0.75em', opacity: 0.7 }}>{session.juryDate}</div>
                        </div>
                         <OverlayTrigger overlay={<Tooltip>Supprimer</Tooltip>}>
                            <div
                                className="text-secondary p-1 rounded hover-bg-dark"
                                role="button"
                                aria-label="Supprimer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSession(session.id);
                                }}
                            >
                                <FaTrash size={12} />
                            </div>
                        </OverlayTrigger>
                    </div>
                ))}

                {filteredSessions.length === 0 && (
                    <div className="px-3 text-muted" style={{ fontSize: '0.8em' }}>Aucune session trouvée.</div>
                )}

                <div className="mt-4 px-3">
                     <div className="sidebar-section-title px-0 mb-2">Outils</div>
                     <div className="sidebar-item" onClick={onOpenTemplateEditor} role="button" aria-label="Modèles d'emails">
                        <span className="d-flex align-items-center gap-2">
                             <FaEnvelope size={14} /> Modèles d'emails
                        </span>
                     </div>
                </div>
            </div>

            <div className="sidebar-footer">
                <div className="d-flex justify-content-between text-secondary">
                    <div className="d-flex gap-3">
                        <a href="https://github.com/jmhumblet/candidate-schedule" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-1 text-decoration-none text-secondary">
                            <FaGithub /> GitHub
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SessionSidebar;

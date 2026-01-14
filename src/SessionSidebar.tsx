import React from 'react';
import { Offcanvas, Button, ListGroup } from 'react-bootstrap';
import { SavedSession } from './domain/session';
import { FaTrash } from 'react-icons/fa';

interface SessionSidebarProps {
    show: boolean;
    onHide: () => void;
    sessions: SavedSession[];
    onLoadSession: (session: SavedSession) => void;
    onDeleteSession: (id: string) => void;
    onNewSession: () => void;
}

const SessionSidebar: React.FC<SessionSidebarProps> = ({
    show,
    onHide,
    sessions,
    onLoadSession,
    onDeleteSession,
    onNewSession
}) => {
    // Sort sessions by juryDate (descending)
    const sortedSessions = [...sessions].sort((a, b) => {
        return new Date(b.juryDate).getTime() - new Date(a.juryDate).getTime();
    });

    const isPast = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const date = new Date(dateStr);
        return date < today;
    };

    return (
        <Offcanvas show={show} onHide={onHide}>
            <Offcanvas.Header closeButton>
                <Offcanvas.Title>Sessions Sauvegardées</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
                <div className="d-grid gap-2 mb-3">
                    <Button variant="success" onClick={() => { onNewSession(); onHide(); }}>
                        + Nouvelle Session
                    </Button>
                </div>
                <ListGroup>
                    {sortedSessions.map(session => (
                        <ListGroup.Item
                            key={session.id}
                            as="div"
                            action
                            onClick={() => onLoadSession(session)}
                            className="d-flex justify-content-between align-items-center"
                            style={{ backgroundColor: isPast(session.juryDate) ? '#ffe6e6' : 'inherit', cursor: 'pointer' }}
                        >
                            <div>
                                <div className="fw-bold">{session.jobTitle || "Sans titre"}</div>
                                <small>{session.juryDate}</small>
                            </div>
                            <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDeleteSession(session.id);
                                }}
                            >
                                <FaTrash />
                            </Button>
                        </ListGroup.Item>
                    ))}
                    {sortedSessions.length === 0 && (
                        <div className="text-center text-muted mt-3">
                            Aucune session sauvegardée.
                        </div>
                    )}
                </ListGroup>
            </Offcanvas.Body>
        </Offcanvas>
    );
};

export default SessionSidebar;

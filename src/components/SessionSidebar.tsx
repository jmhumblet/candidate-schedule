import React, { useState, useEffect, useRef } from 'react';
import { OverlayTrigger, Tooltip, Button, Modal, Form, Spinner, Alert } from 'react-bootstrap';
import { SavedSession } from '../domain/session';
import { FaTrash, FaGithub, FaChevronRight, FaPlus, FaColumns, FaEnvelope, FaCloud, FaCloudUploadAlt, FaUserFriends, FaSignOutAlt, FaGoogle, FaShareAlt, FaWifi } from 'react-icons/fa';
import Logo, { LogoIcon } from './Logo';
import ThemeToggle from './ThemeToggle';
import './Sidebar.css';
import { useAuth } from '../contexts/AuthContext';
import { SessionWithStatus } from '../repositories/types';

interface SessionSidebarProps {
    sessions: SessionWithStatus[];
    onLoadSession: (session: SavedSession) => void;
    onDeleteSession: (id: string) => void;
    onNewSession: () => void;
    onShareSession: (id: string, email: string) => Promise<void>;
    onOpenTemplateEditor: () => void;
    isCloud: boolean;

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
    onShareSession,
    onOpenTemplateEditor,
    isCloud,
    width,
    setWidth,
    collapsed,
    setCollapsed
}) => {
    const { user, login, loginWithEmail, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');

    // Sharing State
    const [showShareModal, setShowShareModal] = useState(false);
    const [sessionToShare, setSessionToShare] = useState<SavedSession | null>(null);
    const [shareEmail, setShareEmail] = useState('');
    const [sharing, setSharing] = useState(false);

    // Login State
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [loginError, setLoginError] = useState('');


    // Online Status State
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

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

    const handleShareClick = (e: React.MouseEvent, session: SavedSession) => {
        e.stopPropagation();
        setSessionToShare(session);
        setShareEmail('');
        setShowShareModal(true);
    };

    const handleShareSubmit = async () => {
        if (!sessionToShare || !shareEmail) return;
        setSharing(true);
        try {
            await onShareSession(sessionToShare.id, shareEmail);
            setShowShareModal(false);
            // Optional: toast or alert
        } catch (e: any) {
            alert("Erreur lors du partage : " + (e.message || e));
        } finally {
            setSharing(false);
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoggingIn(true);
        setLoginError('');
        try {
            await loginWithEmail(loginEmail, loginPassword);
            setShowLoginModal(false);
            setLoginEmail('');
            setLoginPassword('');
        } catch (err: any) {
            setLoginError("Échec de la connexion. Vérifiez vos identifiants.");
        } finally {
            setIsLoggingIn(false);
        }
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

    const getSyncIcon = (session: SessionWithStatus) => {
        if (!isCloud) return null;
        if (session.syncStatus === 'offline') {
            return <FaCloudUploadAlt className="text-warning ms-1" title="En attente de synchronisation" size={12} />;
        }
        if (session.ownerId && user && session.ownerId !== user.uid) {
             return <FaUserFriends className="text-info ms-1" title="Partagé avec vous" size={12} />;
        }
        // If shared with others?
        if (session.sharedWith && session.sharedWith.length > 0) {
             return <FaUserFriends className="text-primary ms-1" title="Partagé par vous" size={12} />;
        }

        return <FaCloud className="text-success ms-1" title="Synchronisé" size={12} />;
    };

    if (collapsed) {
        return (
            <div className="sidebar-container collapsed-sidebar" style={{ width: 60 }}>
                <div className="d-flex flex-column align-items-center gap-3 w-100">
                     <Button variant="link" className="p-0 text-secondary mb-2" onClick={() => setCollapsed(false)} title="Expand Sidebar" aria-label="Expand Sidebar">
                        <FaChevronRight size={20} />
                    </Button>

                    <div style={{ width: '24px', overflow: 'hidden', height: '24px' }} title="PlanIt">
                        <LogoIcon />
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
                         {user ? (
                             <OverlayTrigger placement="right" overlay={<Tooltip>{user.displayName || 'Compte'}</Tooltip>}>
                                 <img src={user.photoURL || undefined} alt="User" className="rounded-circle border" style={{width: 24, height: 24}} />
                             </OverlayTrigger>
                         ) : (
                             <OverlayTrigger placement="right" overlay={<Tooltip>Se connecter</Tooltip>}>
                                 <Button variant="link" className="text-secondary p-0" onClick={() => login()}>
                                     <FaGoogle size={20} />
                                 </Button>
                             </OverlayTrigger>
                         )}
                         {!isOnline && (
                             <OverlayTrigger placement="right" overlay={<Tooltip>Mode hors ligne</Tooltip>}>
                                 <div className="text-warning">
                                     <FaWifi size={16} />
                                 </div>
                             </OverlayTrigger>
                         )}
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
                        <div className="text-truncate me-2 flex-grow-1" style={{ overflow: 'hidden' }}>
                            <div className="fw-bold text-truncate d-flex align-items-center gap-1" style={{ fontSize: '0.9em' }}>
                                {session.jobTitle || "Sans titre"}
                                {getSyncIcon(session)}
                            </div>
                            <div style={{ fontSize: '0.75em', opacity: 0.7 }}>{session.juryDate}</div>
                        </div>

                        <div className="d-flex align-items-center gap-1">
                             {isCloud && (
                                <OverlayTrigger overlay={<Tooltip>Partager</Tooltip>}>
                                    <div
                                        className="text-secondary p-1 rounded hover-bg-dark action-icon"
                                        role="button"
                                        aria-label="Partager"
                                        onClick={(e) => handleShareClick(e, session)}
                                    >
                                        <FaShareAlt size={12} />
                                    </div>
                                </OverlayTrigger>
                             )}
                             <OverlayTrigger overlay={<Tooltip>Supprimer</Tooltip>}>
                                <div
                                    className="text-secondary p-1 rounded hover-bg-dark action-icon"
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
                {!isOnline && (
                    <Alert variant="warning" className="m-2 p-2 small">
                        <FaWifi className="me-2" /> Mode hors ligne. Vos modifications sont sauvegardées localement.
                    </Alert>
                )}
                {!user && isOnline && (
                    <div className="px-3 pb-2 text-center text-muted" style={{ fontSize: '0.75em' }}>
                        Connectez-vous pour sauvegarder vos données dans le cloud et y accéder partout.
                    </div>
                )}
                <div className="border-bottom pb-2 mb-2">
                    {user ? (
                        <div className="d-flex align-items-center gap-2 px-2">
                             <img src={user.photoURL || undefined} className="rounded-circle" width="32" height="32" alt={user.displayName || 'User'} />
                             <div className="text-truncate flex-grow-1" style={{fontSize: '0.85em'}}>
                                 <div className="fw-bold text-truncate">{user.displayName || user.email}</div>
                                 <div className="small text-muted text-truncate">{user.email}</div>
                             </div>
                             <Button variant="link" size="sm" onClick={() => logout()} className="text-secondary p-0" title="Se déconnecter">
                                <FaSignOutAlt />
                             </Button>
                        </div>
                    ) : (
                        <div className="d-flex flex-column gap-2">
                            <Button variant="outline-primary" size="sm" className="w-100 d-flex align-items-center justify-content-center gap-2" onClick={() => login()}>
                                <FaGoogle /> Se connecter
                            </Button>
                             <Button variant="link" size="sm" className="w-100 d-flex align-items-center justify-content-center gap-2 text-decoration-none text-secondary" onClick={() => setShowLoginModal(true)}>
                                <small>Se connecter avec Email</small>
                            </Button>
                        </div>
                    )}
                </div>
                <div className="d-flex justify-content-between text-secondary pt-1">
                    <div className="d-flex gap-3">
                        <a href="https://github.com/jmhumblet/candidate-schedule" target="_blank" rel="noopener noreferrer" className="d-flex align-items-center gap-1 text-decoration-none text-secondary" style={{fontSize: '0.9em'}}>
                            <FaGithub /> GitHub
                        </a>
                    </div>
                </div>
            </div>

            <Modal show={showShareModal} onHide={() => setShowShareModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Partager la session</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Entrez l'adresse email de l'utilisateur avec qui vous souhaitez partager <strong>{sessionToShare?.jobTitle}</strong>.</p>
                    <Form.Group>
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="exemple@email.com"
                            value={shareEmail}
                            onChange={e => setShareEmail(e.target.value)}
                            autoFocus
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowShareModal(false)} disabled={sharing}>Annuler</Button>
                    <Button variant="primary" onClick={handleShareSubmit} disabled={!shareEmail || sharing}>
                        {sharing ? <Spinner size="sm" animation="border" /> : 'Partager'}
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Connexion Email</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleEmailLogin}>
                    <Modal.Body>
                        {loginError && <Alert variant="danger">{loginError}</Alert>}
                        <Form.Group className="mb-3" controlId="loginEmail">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="name@example.com"
                                value={loginEmail}
                                onChange={e => setLoginEmail(e.target.value)}
                                required
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="loginPassword">
                            <Form.Label>Mot de passe</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Mot de passe"
                                value={loginPassword}
                                onChange={e => setLoginPassword(e.target.value)}
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowLoginModal(false)} disabled={isLoggingIn}>Annuler</Button>
                        <Button variant="primary" type="submit" disabled={isLoggingIn}>
                            {isLoggingIn ? <Spinner size="sm" animation="border" /> : 'Se connecter'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default SessionSidebar;

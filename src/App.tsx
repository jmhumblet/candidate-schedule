import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import { Button } from "react-bootstrap";
import InterviewForm from "./components/InterviewForm";
import SchedulingService from "./domain/schedulingService";
import { JuryDayParameters } from "./domain/parameters";
import { StructuredSchedule } from "./domain/scheduleTypes";
import ScheduleTable from "./components/ScheduleTable";
import TimelineVisualization from "./components/TimelineVisualization";
import SessionSidebar from "./components/SessionSidebar";
import { SessionService, SavedSession, JuryDayParametersModel } from "./domain/session";
import { FaColumns } from "react-icons/fa";
import EmailTemplateEditor from "./components/EmailTemplateEditor";
import { EmailTemplateService } from "./domain/EmailTemplates";
import { useSessions } from "./hooks/useSessions";
import { usePreferences } from "./hooks/usePreferences";
import { SessionWithStatus } from "./repositories/types";

const App: React.FC = () => {
    const date = new Date();
    date.setDate(date.getDate() + 10);

    const { sessions, saveSession, deleteSession, shareSession, isCloud } = useSessions();
    const { emailTemplates } = usePreferences();

    const [schedule, setSchedule] = useState<StructuredSchedule | null>(null);
    const [juryDate, setJuryDate] = useState<string>(date.toISOString().split('T')[0]);
    const [jobTitle, setJobTitle] = useState<string>('');

    // Session Management State
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    // Store metadata like ownerId and createdAt to avoid dependency on the full sessions list
    const [currentSessionMeta, setCurrentSessionMeta] = useState<{ ownerId?: string; createdAt?: string } | null>(null);

    const currentSession = useMemo(() => sessions.find(s => s.id === currentSessionId), [sessions, currentSessionId]);
    const isLocked = currentSession?.isLocked ?? false;

    const [initialParameters, setInitialParameters] = useState<JuryDayParametersModel | null>(null);
    const [confirmedCandidates, setConfirmedCandidates] = useState<string[]>([]);
    const [showTemplateEditor, setShowTemplateEditor] = useState<boolean>(false);

    // Sidebar State
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // State Ref to hold volatile state properties and avoid recreating callbacks
    const stateRef = useRef({
        confirmedCandidates,
        sessions,
        currentSessionId,
        currentSessionMeta,
        saveSession,
        initialParameters,
        juryDate,
        jobTitle,
        isLocked
    });

    useEffect(() => {
        stateRef.current = {
            confirmedCandidates,
            sessions,
            currentSessionId,
            currentSessionMeta,
            saveSession,
            initialParameters,
            juryDate,
            jobTitle,
            isLocked
        };
    });

    useEffect(() => {
        const mql = window.matchMedia('(max-width: 767px)');
        const handleChange = (e: MediaQueryListEvent) => {
            const mobile = e.matches;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarCollapsed(true);
            }
        };
        mql.addEventListener('change', handleChange);
        setIsMobile(mql.matches);
        if (mql.matches) {
            setSidebarCollapsed(true);
        }
        return () => mql.removeEventListener('change', handleChange);
    }, []);

    const handleFormSubmit = useCallback(async (parameters: JuryDayParameters, lock: boolean = false) => {
        const newStructuredSchedule = SchedulingService.generateSchedule(parameters);
        setSchedule(newStructuredSchedule);

        const {
            currentSessionId: currentId,
            currentSessionMeta: currentMeta,
            juryDate: currentDate,
            jobTitle: currentJobTitle,
            confirmedCandidates: currentConfirmed,
            saveSession: currentSave,
            sessions: currentSessions,
            isLocked: currentIsLocked
        } = stateRef.current;

        const sessionId = currentId || crypto.randomUUID();
        const createdAt = currentMeta?.createdAt || new Date().toISOString();
        const modelParams = SessionService.mapToModel(parameters);
        const sessionToSave: SavedSession = {
            id: sessionId,
            createdAt: createdAt,
            juryDate: currentDate,
            jobTitle: currentJobTitle,
            parameters: modelParams,
            confirmedCandidates: currentConfirmed,
            isLocked: lock || currentIsLocked
        };

        const existingSession = currentSessions.find(s => s.id === sessionId);
        const ownerId = currentMeta?.ownerId || existingSession?.ownerId;
        if (ownerId) {
            (sessionToSave as any).ownerId = ownerId;
        }

        await currentSave(sessionToSave);
        setCurrentSessionId(sessionId);

        if (!currentMeta) {
            setCurrentSessionMeta({ createdAt, ownerId });
        }

        setInitialParameters(modelParams);
    }, []);

    const slots = useMemo(() => {
        if (!schedule) return [];
        return [...schedule.generalSlots, ...schedule.candidateSchedules.flatMap(cs => cs.interviewSlots)];
    }, [schedule]);

    const handleLoadSession = (session: SavedSession) => {
        setCurrentSessionId(session.id);
        setCurrentSessionMeta({
            ownerId: (session as SessionWithStatus).ownerId,
            createdAt: session.createdAt
        });

        setJuryDate(session.juryDate);
        setJobTitle(session.jobTitle);
        setInitialParameters(session.parameters);
        setConfirmedCandidates(session.confirmedCandidates);

        const parameters = SessionService.mapFromModel(session.parameters);
        const newStructuredSchedule = SchedulingService.generateSchedule(parameters);
        setSchedule(newStructuredSchedule);

        if (window.innerWidth < 768) {
            setSidebarCollapsed(true);
        }
    };

    const handleDeleteSession = async (id: string) => {
        await deleteSession(id);
        if (currentSessionId === id) {
             handleNewSession();
        }
    };

    const handleNewSession = () => {
        setCurrentSessionId(null);
        setCurrentSessionMeta(null);
        setJuryDate(date.toISOString().split('T')[0]);
        setJobTitle('');
        setInitialParameters(null);
        setConfirmedCandidates([]);
        setSchedule(null);
    };

    const handleConfirmCandidate = useCallback(async (candidateName: string, isConfirmed: boolean) => {
        const {
            confirmedCandidates: currentConfirmed,
            sessions: currentSessions,
            currentSessionId: currentId,
            currentSessionMeta: currentMeta,
            saveSession: currentSave,
            initialParameters: currentParams,
            juryDate: currentDate,
            jobTitle: currentJobTitle,
            isLocked: currentIsLocked
        } = stateRef.current;

        const newConfirmed = isConfirmed
            ? [...currentConfirmed, candidateName]
            : currentConfirmed.filter(c => c !== candidateName);

        setConfirmedCandidates(newConfirmed);

        if (currentId && currentParams) {
            const existingSession = currentSessions.find(s => s.id === currentId);
            const createdAt = currentMeta?.createdAt || existingSession?.createdAt || new Date().toISOString();

            const sessionToSave: SavedSession = {
                id: currentId,
                createdAt: createdAt,
                juryDate: currentDate,
                jobTitle: currentJobTitle,
                parameters: currentParams,
                confirmedCandidates: newConfirmed,
                isLocked: currentIsLocked
            };

            const ownerId = currentMeta?.ownerId || existingSession?.ownerId;
            if (ownerId) {
                (sessionToSave as any).ownerId = ownerId;
            }

            await currentSave(sessionToSave);
        }
    }, []);

    const handleSendJuryEmail = useCallback(() => {
        if (!slots.length) return;
        const formattedDate = new Date(juryDate).toLocaleDateString('fr-FR');
        const link = EmailTemplateService.generateJuryLink(emailTemplates.jury, formattedDate, slots);
        window.location.href = link;
    }, [slots, juryDate, emailTemplates]);

    const handleSendWelcomeEmail = useCallback(() => {
         if (!slots.length) return;
        const formattedDate = new Date(juryDate).toLocaleDateString('fr-FR');
        const link = EmailTemplateService.generateWelcomeLink(emailTemplates.welcome, formattedDate, slots);
        window.location.href = link;
    }, [slots, juryDate, emailTemplates]);

    // Grid Layout Style
    const gridStyle: React.CSSProperties = {
        display: 'grid',
        gridTemplateColumns: isMobile
            ? '1fr'
            : `${sidebarCollapsed ? '60px' : `${sidebarWidth}px`} 1fr`,
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: 'var(--bg-body)'
    };

    return (
        <div style={gridStyle}>
            <SessionSidebar
                sessions={sessions}
                onLoadSession={handleLoadSession}
                onDeleteSession={handleDeleteSession}
                onNewSession={handleNewSession}
                onShareSession={shareSession}
                isCloud={isCloud}
                onOpenTemplateEditor={() => setShowTemplateEditor(true)}
                width={sidebarWidth}
                setWidth={setSidebarWidth}
                collapsed={sidebarCollapsed}
                setCollapsed={setSidebarCollapsed}
                isMobile={isMobile}
            />

            <div id="main-content" className="flex-grow-1 d-flex flex-column overflow-hidden position-relative main-content">
                <div className="overflow-auto h-100 w-100 p-3">
                    <div className="container-fluid" style={{ maxWidth: '1200px' }}>

                        <div className="d-flex align-items-center mb-3">
                            {isMobile && (
                                <Button
                                    id="drawer-open"
                                    variant="outline-secondary"
                                    className="me-2 d-md-none"
                                    aria-label="Menu"
                                    aria-expanded="false"
                                    aria-controls="drawer"
                                >
                                    <FaColumns aria-hidden="true" />
                                </Button>
                            )}
                            <h1 className="mb-0">Entretiens</h1>
                        </div>

                        <InterviewForm
                            onSubmit={handleFormSubmit}
                            initialParameters={initialParameters}
                            juryDate={juryDate}
                            setJuryDate={setJuryDate}
                            jobTitle={jobTitle}
                            setJobTitle={setJobTitle}
                            isLocked={isLocked}
                        />

                        {schedule && (
                            <>
                                <ScheduleTable
                                    schedule={slots}
                                    date={juryDate}
                                    confirmedCandidates={confirmedCandidates}
                                    onConfirmCandidate={handleConfirmCandidate}
                                    emailTemplates={emailTemplates}
                                    onSendJuryEmail={handleSendJuryEmail}
                                    onSendWelcomeEmail={handleSendWelcomeEmail}
                                />
                                <TimelineVisualization schedule={schedule} />
                            </>
                        )}
                    </div>
                </div>
            </div>

            <EmailTemplateEditor
                show={showTemplateEditor}
                onHide={() => setShowTemplateEditor(false)}
            />
        </div>
    )
};

export default App;

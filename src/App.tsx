import React, { useCallback, useMemo, useState } from "react";
import InterviewForm from "./components/InterviewForm";
import SchedulingService from "./domain/schedulingService";
import { JuryDayParameters } from "./domain/parameters";
import { StructuredSchedule } from "./domain/scheduleTypes";
import ScheduleTable from "./components/ScheduleTable";
import TimelineVisualization from "./components/TimelineVisualization";
import { Button } from "react-bootstrap";
import SessionSidebar from "./components/SessionSidebar";
import { SessionService, SavedSession, JuryDayParametersModel } from "./domain/session";
import { FaEnvelope } from "react-icons/fa";
import EmailTemplateEditor from "./components/EmailTemplateEditor";
import { EmailTemplateService } from "./domain/EmailTemplates";
import { useSessions } from "./hooks/useSessions";
import { usePreferences } from "./hooks/usePreferences";

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
    const [initialParameters, setInitialParameters] = useState<JuryDayParametersModel | null>(null);
    const [confirmedCandidates, setConfirmedCandidates] = useState<string[]>([]);
    const [showTemplateEditor, setShowTemplateEditor] = useState<boolean>(false);

    // Sidebar State
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const handleFormSubmit = useCallback(async (parameters: JuryDayParameters) => {
        const newStructuredSchedule = SchedulingService.generateSchedule(parameters);
        setSchedule(newStructuredSchedule);

        // Auto-save logic
        // We preserve the existing session ID if editing, or create a new one
        const sessionId = currentSessionId || crypto.randomUUID();

        // If we are updating an existing session, we need to preserve its metadata (like ownerId)
        // The repository handles ownerId preservation if we don't pass it,
        // BUT if we have the session object in memory, passing it is safer.
        // Let's find the existing session object to merge if needed, or just build fresh data.
        // Since SavedSession is just data, we construct it:

        // However, if we are editing a shared session, we want to ensure we don't break it.
        // The repository handles the merge. We just send the data fields we know about.
        // We do want to ensure we don't lose the 'confirmedCandidates' if we didn't touch them?
        // confirmedCandidates are part of the state here.

        const modelParams = SessionService.mapToModel(parameters);
        const sessionToSave: SavedSession = {
            id: sessionId,
            createdAt: new Date().toISOString(),
            juryDate: juryDate,
            jobTitle: jobTitle,
            parameters: modelParams,
            confirmedCandidates: confirmedCandidates
        };

        // We try to pass the existing ownerId if we know it (from sessions list) to avoid ambiguity
        const existingSession = sessions.find(s => s.id === sessionId);
        if (existingSession) {
            (sessionToSave as any).ownerId = existingSession.ownerId;
        }

        await saveSession(sessionToSave);
        setCurrentSessionId(sessionId);
        setInitialParameters(modelParams);
    }, [currentSessionId, juryDate, jobTitle, confirmedCandidates, saveSession, sessions]);

    const slots = useMemo(() => {
        if (!schedule) return [];
        return [...schedule.generalSlots, ...schedule.candidateSchedules.flatMap(cs => cs.interviewSlots)];
    }, [schedule]);

    const handleLoadSession = (session: SavedSession) => {
        setCurrentSessionId(session.id);
        setJuryDate(session.juryDate);
        setJobTitle(session.jobTitle);
        setInitialParameters(session.parameters);
        setConfirmedCandidates(session.confirmedCandidates);

        // Regenerate schedule
        const parameters = SessionService.mapFromModel(session.parameters);
        const newStructuredSchedule = SchedulingService.generateSchedule(parameters);
        setSchedule(newStructuredSchedule);
    };

    const handleDeleteSession = async (id: string) => {
        await deleteSession(id);
        if (currentSessionId === id) {
             handleNewSession();
        }
    };

    const handleNewSession = () => {
        setCurrentSessionId(null);
        setJuryDate(date.toISOString().split('T')[0]);
        setJobTitle('');
        setInitialParameters(null);
        setConfirmedCandidates([]);
        setSchedule(null);
    };

    const handleConfirmCandidate = useCallback(async (candidateName: string, isConfirmed: boolean) => {
        const newConfirmed = isConfirmed
            ? [...confirmedCandidates, candidateName]
            : confirmedCandidates.filter(c => c !== candidateName);

        setConfirmedCandidates(newConfirmed);

        // Auto-save if we are in a session
        if (currentSessionId && initialParameters) {
            // Reconstruct session from state to ensure we can save even if sessions list is syncing
            const currentSession = sessions.find(s => s.id === currentSessionId);

            const sessionToSave: SavedSession = {
                id: currentSessionId,
                createdAt: currentSession?.createdAt || new Date().toISOString(),
                juryDate,
                jobTitle,
                parameters: initialParameters,
                confirmedCandidates: newConfirmed
            };

            // Preserve ownerId if available
            if (currentSession) {
                (sessionToSave as any).ownerId = currentSession.ownerId;
            }

            await saveSession(sessionToSave);
        }
    }, [confirmedCandidates, sessions, currentSessionId, saveSession, initialParameters, juryDate, jobTitle]);

    const handleSendJuryEmail = () => {
        if (!slots.length) return;
        const formattedDate = new Date(juryDate).toLocaleDateString('fr-FR');
        // Use templates from hook
        const link = EmailTemplateService.generateJuryLink(emailTemplates.jury, formattedDate, slots);
        window.location.href = link;
    };

    const handleSendWelcomeEmail = () => {
         if (!slots.length) return;
        const formattedDate = new Date(juryDate).toLocaleDateString('fr-FR');
        // Use templates from hook
        const link = EmailTemplateService.generateWelcomeLink(emailTemplates.welcome, formattedDate, slots);
        window.location.href = link;
    };

    return (
        <div className="d-flex vh-100 overflow-hidden bg-body">
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
            />

            <div className="flex-grow-1 d-flex flex-column overflow-hidden position-relative">
                <div className="overflow-auto h-100 w-100 p-3">
                    <div className="container-fluid" style={{ maxWidth: '1200px' }}>

                        <div className="d-flex align-items-center mb-3">
                            <h1 className="mb-0">Entretiens</h1>
                        </div>

                        <InterviewForm
                            onSubmit={handleFormSubmit}
                            initialParameters={initialParameters}
                            juryDate={juryDate}
                            setJuryDate={setJuryDate}
                            jobTitle={jobTitle}
                            setJobTitle={setJobTitle}
                        />

                        {schedule && (
                            <>
                                <div className="d-flex justify-content-end mb-2 gap-2">
                                    <Button variant="outline-primary" onClick={handleSendJuryEmail}>
                                        <FaEnvelope className="me-2" />
                                        Email Jury
                                    </Button>
                                    <Button variant="outline-primary" onClick={handleSendWelcomeEmail}>
                                        <FaEnvelope className="me-2" />
                                        Email Accueil
                                    </Button>
                                </div>
                                <ScheduleTable
                                    schedule={slots}
                                    date={juryDate}
                                    confirmedCandidates={confirmedCandidates}
                                    onConfirmCandidate={handleConfirmCandidate}
                                    emailTemplates={emailTemplates}
                                />
                                <TimelineVisualization slots={slots} />
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

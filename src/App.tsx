import React, { useCallback, useMemo, useState, useEffect } from "react";
import InterviewForm from "./components/InterviewForm";
import SchedulingService from "./domain/schedulingService";
import { JuryDayParameters } from "./domain/parameters";
import { StructuredSchedule } from "./domain/scheduleTypes";
import ScheduleTable from "./components/ScheduleTable";
import TimelineVisualization from "./components/TimelineVisualization";
import SessionSidebar from "./components/SessionSidebar";
import { SessionService, SavedSession, JuryDayParametersModel } from "./domain/session";
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

    const [initialParameters, setInitialParameters] = useState<JuryDayParametersModel | null>(null);
    const [confirmedCandidates, setConfirmedCandidates] = useState<string[]>([]);
    const [showTemplateEditor, setShowTemplateEditor] = useState<boolean>(false);

    // Sidebar State
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            if (mobile) {
                setSidebarCollapsed(true);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleFormSubmit = useCallback(async (parameters: JuryDayParameters) => {
        const newStructuredSchedule = SchedulingService.generateSchedule(parameters);
        setSchedule(newStructuredSchedule);

        const sessionId = currentSessionId || crypto.randomUUID();
        const createdAt = currentSessionMeta?.createdAt || new Date().toISOString();

        const modelParams = SessionService.mapToModel(parameters);
        const sessionToSave: SavedSession = {
            id: sessionId,
            createdAt: createdAt,
            juryDate: juryDate,
            jobTitle: jobTitle,
            parameters: modelParams,
            confirmedCandidates: confirmedCandidates
        };

        if (currentSessionMeta?.ownerId) {
            (sessionToSave as any).ownerId = currentSessionMeta.ownerId;
        }

        await saveSession(sessionToSave);
        setCurrentSessionId(sessionId);

        if (!currentSessionMeta) {
            setCurrentSessionMeta({ createdAt });
        }

        setInitialParameters(modelParams);
    }, [currentSessionId, juryDate, jobTitle, confirmedCandidates, saveSession, currentSessionMeta]);

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
        const newConfirmed = isConfirmed
            ? [...confirmedCandidates, candidateName]
            : confirmedCandidates.filter(c => c !== candidateName);

        setConfirmedCandidates(newConfirmed);

        if (currentSessionId && initialParameters) {
            const createdAt = currentSessionMeta?.createdAt || new Date().toISOString();

            const sessionToSave: SavedSession = {
                id: currentSessionId,
                createdAt: createdAt,
                juryDate,
                jobTitle,
                parameters: initialParameters,
                confirmedCandidates: newConfirmed
            };

            if (currentSessionMeta?.ownerId) {
                (sessionToSave as any).ownerId = currentSessionMeta.ownerId;
            }

            await saveSession(sessionToSave);
        }
    }, [confirmedCandidates, currentSessionId, saveSession, initialParameters, juryDate, jobTitle, currentSessionMeta]);

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

    const currentSidebarWidth = sidebarCollapsed ? '60px' : `${sidebarWidth}px`;

    return (
        <div
            className="app-layout"
            style={{ '--sidebar-current-width': currentSidebarWidth } as React.CSSProperties}
        >
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

            <div className="d-flex flex-column overflow-hidden position-relative main-content">
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
                                <ScheduleTable
                                    schedule={slots}
                                    date={juryDate}
                                    confirmedCandidates={confirmedCandidates}
                                    onConfirmCandidate={handleConfirmCandidate}
                                    emailTemplates={emailTemplates}
                                    onSendJuryEmail={handleSendJuryEmail}
                                    onSendWelcomeEmail={handleSendWelcomeEmail}
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

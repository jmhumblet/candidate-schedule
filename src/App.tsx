import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InterviewForm from "./InterviewForm";
import SchedulingService from "./domain/schedulingService";
import { JuryDayParameters } from "./domain/parameters";
import { StructuredSchedule } from "./domain/scheduleTypes";
import ScheduleTable from "./ScheduleTable";
import TimelineVisualization from "./TimelineVisualization";
import { Button, Col, Form, Row } from "react-bootstrap";
import SessionSidebar from "./SessionSidebar";
import { SessionService, SavedSession, JuryDayParametersModel } from "./domain/session";
import { FaEnvelope } from "react-icons/fa";
import EmailTemplateEditor from "./EmailTemplateEditor";
import { EmailTemplateService } from "./domain/EmailTemplates";

const App: React.FC = () => {
    const date = new Date();
    date.setDate(date.getDate() + 10);

    const [schedule, setSchedule] = useState<StructuredSchedule | null>(null);
    const [juryDate, setJuryDate] = useState<string>(date.toISOString().split('T')[0]);
    const [jobTitle, setJobTitle] = useState<string>('');

    // Session Management State
    const [sessions, setSessions] = useState<SavedSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [initialParameters, setInitialParameters] = useState<JuryDayParametersModel | null>(null);
    const [confirmedCandidates, setConfirmedCandidates] = useState<string[]>([]);
    const [showTemplateEditor, setShowTemplateEditor] = useState<boolean>(false);

    // Sidebar State
    const [sidebarWidth, setSidebarWidth] = useState(300);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        setSessions(SessionService.getSessions());
    }, []);

    const handleFormSubmit = useCallback((parameters: JuryDayParameters) => {
        const newStructuredSchedule = SchedulingService.generateSchedule(parameters);
        setSchedule(newStructuredSchedule);

        // Auto-save logic
        const sessionToSave: SavedSession = {
            id: currentSessionId || crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            juryDate: juryDate,
            jobTitle: jobTitle,
            parameters: SessionService.mapToModel(parameters),
            confirmedCandidates: confirmedCandidates
        };

        SessionService.saveSession(sessionToSave);
        setSessions(SessionService.getSessions()); // Refresh list
        setCurrentSessionId(sessionToSave.id);
    }, [currentSessionId, juryDate, jobTitle, confirmedCandidates]);

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

    const handleDeleteSession = (id: string) => {
        SessionService.deleteSession(id);
        setSessions(SessionService.getSessions());
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

    const handleConfirmCandidate = useCallback((candidateName: string, isConfirmed: boolean) => {
        const newConfirmed = isConfirmed
            ? [...confirmedCandidates, candidateName]
            : confirmedCandidates.filter(c => c !== candidateName);

        setConfirmedCandidates(newConfirmed);

        // Auto-save if we are in a session
        if (currentSessionId) {
            const currentSession = sessions.find(s => s.id === currentSessionId);
            if (currentSession) {
                const updatedSession = { ...currentSession, confirmedCandidates: newConfirmed };
                SessionService.saveSession(updatedSession);
                setSessions(SessionService.getSessions());
            }
        }
    }, [confirmedCandidates, sessions, currentSessionId]);

    const formRef = useRef<HTMLFormElement | null>(null);

    const handleSendJuryEmail = () => {
        if (!slots.length) return;
        const templates = EmailTemplateService.getTemplates();
        const formattedDate = new Date(juryDate).toLocaleDateString('fr-FR');
        const link = EmailTemplateService.generateJuryLink(templates.jury, formattedDate, slots);
        window.location.href = link;
    };

    const handleSendWelcomeEmail = () => {
         if (!slots.length) return;
        const templates = EmailTemplateService.getTemplates();
        const formattedDate = new Date(juryDate).toLocaleDateString('fr-FR');
        const link = EmailTemplateService.generateWelcomeLink(templates.welcome, formattedDate, slots);
        window.location.href = link;
    };

    return (
        <div className="d-flex vh-100 overflow-hidden bg-body">
            <SessionSidebar
                sessions={sessions}
                onLoadSession={handleLoadSession}
                onDeleteSession={handleDeleteSession}
                onNewSession={handleNewSession}
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

                        <Form ref={formRef} className="form-horizontal" >
                            <Form.Group className="mb-3" as={Row}>

                                <Form.Label column sm={4} className="control-label" htmlFor="juryDate">Date du jury</Form.Label>
                                <Col sm={2}>
                                    <Form.Control
                                        id="juryDate"
                                        type="date"
                                        value={juryDate}
                                        onChange={(e) => setJuryDate(e.target.value)}
                                        required
                                    />
                                </Col>
                                <Form.Label column sm={1} className="control-label" htmlFor="jobTitle">Poste</Form.Label>
                                <Col sm={5}>
                                    <Form.Control
                                        id="jobTitle"
                                        type="text"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder='Gestionnaire de projet'
                                    />
                                </Col>
                            </Form.Group>
                        </Form>

                        <InterviewForm onSubmit={handleFormSubmit} initialParameters={initialParameters} />

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

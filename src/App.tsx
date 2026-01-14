import React, { useEffect, useMemo, useRef, useState } from "react";
import InterviewForm from "./InterviewForm";
import SchedulingService from "./domain/schedulingService";
import { JuryDayParameters } from "./domain/parameters";
import { StructuredSchedule } from "./domain/scheduleTypes";
import ScheduleTable from "./ScheduleTable";
import TimelineVisualization from "./TimelineVisualization"; // Import the new component
import { Button, Col, Form, Row } from "react-bootstrap";
import SessionSidebar from "./SessionSidebar";
import { SessionService, SavedSession, JuryDayParametersModel } from "./domain/session";
import { FaBars } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import EmailTemplateModal from "./EmailTemplateModal";
import { loadTemplates } from "./domain/emailTemplates";
import { InterviewSlot, Slot } from "./domain/interviewSlot";

const App: React.FC = () => {
    const date = new Date();
    date.setDate(date.getDate() + 10);

    const [schedule, setSchedule] = useState<StructuredSchedule | null>(null);
    const [juryDate, setJuryDate] = useState<string>(date.toISOString().split('T')[0]);
    const [jobTitle, setJobTitle] = useState<string>('');

    // Session Management State
    const [showSidebar, setShowSidebar] = useState<boolean>(false);
    const [showEmailModal, setShowEmailModal] = useState<boolean>(false);
    const [sessions, setSessions] = useState<SavedSession[]>([]);
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
    const [initialParameters, setInitialParameters] = useState<JuryDayParametersModel | null>(null);
    const [confirmedCandidates, setConfirmedCandidates] = useState<string[]>([]);

    useEffect(() => {
        setSessions(SessionService.getSessions());
    }, []);

    const handleFormSubmit = (parameters: JuryDayParameters) => {
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
    }

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

        setShowSidebar(false);
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
        setShowSidebar(false);
    };

    const handleConfirmCandidate = (candidateName: string, isConfirmed: boolean) => {
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
    };

    const replaceCommonPlaceholders = (text: string) => {
        return text
            .replace(/{jobTitle}/g, jobTitle)
            .replace(/{juryDate}/g, juryDate);
    };

    const handleSendCandidateEmail = (slot: InterviewSlot) => {
        const templates = loadTemplates();
        let subject = replaceCommonPlaceholders(templates.candidate.subject);
        let body = replaceCommonPlaceholders(templates.candidate.body);

        const replacements: Record<string, string> = {
            '{candidateName}': slot.candidate.name,
            '{startTime}': slot.timeSlot.startTime.toString(),
            '{casusStart}': slot.casusStartTime.toString(),
            '{correctionStart}': slot.correctionStartTime.toString(),
            '{interviewStart}': slot.meetingStartTime.toString(),
            '{debriefStart}': slot.debriefingStartTime.toString(),
        };

        Object.entries(replacements).forEach(([key, value]) => {
            body = body.replace(new RegExp(key, 'g'), value);
            subject = subject.replace(new RegExp(key, 'g'), value);
        });

        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const handleSendJuryEmail = () => {
        if (!schedule) return;
        const templates = loadTemplates();
        let subject = replaceCommonPlaceholders(templates.jury.subject);
        let body = replaceCommonPlaceholders(templates.jury.body);

        const sortedSlots = [...slots].sort((a, b) => {
            if (a.timeSlot.startTime.hour !== b.timeSlot.startTime.hour) {
                return a.timeSlot.startTime.hour - b.timeSlot.startTime.hour;
            }
            return a.timeSlot.startTime.minute - b.timeSlot.startTime.minute;
        });

        const scheduleString = sortedSlots.map(s => {
            const time = s.timeSlot.startTime.toString();
            let desc = "";
            if (s instanceof InterviewSlot) desc = `Entretien: ${s.candidate.name}`;
            else if (s.constructor.name === 'LunchSlot') desc = "Pause midi";
            else if (s.constructor.name === 'JuryWelcomeSlot') desc = "Accueil Jury";
            else if (s.constructor.name === 'FinalDebriefingSlot') desc = "Débriefing final";
            return `${time} : ${desc}`;
        }).join('\n');

        body = body.replace(/{schedule}/g, scheduleString);

        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    };

    const handleSendWelcomeEmail = () => {
         if (!schedule) return;
        const templates = loadTemplates();
        let subject = replaceCommonPlaceholders(templates.welcome.subject);
        let body = replaceCommonPlaceholders(templates.welcome.body);

        const interviews = slots.filter(s => s instanceof InterviewSlot) as InterviewSlot[];
        const sortedInterviews = interviews.sort((a, b) => {
            if (a.timeSlot.startTime.hour !== b.timeSlot.startTime.hour) {
                return a.timeSlot.startTime.hour - b.timeSlot.startTime.hour;
            }
            return a.timeSlot.startTime.minute - b.timeSlot.startTime.minute;
        });

        const arrivalsString = sortedInterviews.map(s => {
            return `${s.timeSlot.startTime.toString()} : ${s.candidate.name}`;
        }).join('\n');

        body = body.replace(/{arrivals}/g, arrivalsString);

        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }

    const formRef = useRef<HTMLFormElement | null>(null);

    return (
        <div className="container mt-3 position-relative">
            <ThemeToggle />
            <div className="d-flex align-items-center mb-3">
                 <Button variant="light" className="me-3" onClick={() => setShowSidebar(true)}>
                    <FaBars />
                </Button>
                <h1 className="mb-0">Entretiens</h1>
            </div>

            <SessionSidebar
                show={showSidebar}
                onHide={() => setShowSidebar(false)}
                sessions={sessions}
                onLoadSession={handleLoadSession}
                onDeleteSession={handleDeleteSession}
                onNewSession={handleNewSession}
                onManageEmails={() => setShowEmailModal(true)}
            />

            <EmailTemplateModal
                show={showEmailModal}
                onHide={() => setShowEmailModal(false)}
            />

            <div className="container">
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
            </div>
            <InterviewForm onSubmit={handleFormSubmit} initialParameters={initialParameters} />

            {schedule && (
                <>
                    <ScheduleTable
                        schedule={slots}
                        date={juryDate}
                        confirmedCandidates={confirmedCandidates}
                        onConfirmCandidate={handleConfirmCandidate}
                        onSendCandidateEmail={handleSendCandidateEmail}
                        onSendJuryEmail={handleSendJuryEmail}
                        onSendWelcomeEmail={handleSendWelcomeEmail}
                    />
                    <TimelineVisualization slots={slots} />
                </>
            )}

        </div>
    )
};

export default App;

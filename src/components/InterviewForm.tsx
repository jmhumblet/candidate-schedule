import React, { useEffect, useRef, useState } from 'react';
import { JuryDayParameters, Candidate, InterviewParameters, Duration } from '../domain/parameters';
import { Button, Col, Form, Row, OverlayTrigger, Tooltip, InputGroup, Card } from 'react-bootstrap'
import { FaClock, FaHourglassHalf } from 'react-icons/fa';
import Time from '../domain/time';
import SchedulingService from '../domain/schedulingService';

import { JuryDayParametersModel } from '../domain/session';

type InterviewFormProps = {
    onSubmit: (parameters: JuryDayParameters) => void;
    initialParameters?: JuryDayParametersModel | null;
    juryDate: string;
    setJuryDate: (date: string) => void;
    jobTitle: string;
    setJobTitle: (title: string) => void;
};

const InterviewForm: React.FC<InterviewFormProps> = ({
    onSubmit,
    initialParameters,
    juryDate,
    setJuryDate,
    jobTitle,
    setJobTitle
}) => {
    const DEFAULT_CANDIDATE_COUNT: number = 5;
    // States to hold form data
    const date = new Date();
    date.setDate(date.getDate() + 10);

    const [candidatesCount, setCandidatesCount] = useState<number>(DEFAULT_CANDIDATE_COUNT);
    const [candidatesInput, setCandidatesInput] = useState<string>('');
    const [jurorsStartTime, setJurorsStartTime] = useState<string>('09:00');
    const [welcomeDuration, setWelcomeDuration] = useState<number>(15);
    const [casusDuration, setCasusDuration] = useState<number>(60);
    const [correctionDuration, setCorrectionDuration] = useState<number>(15);
    const [interviewDuration, setInterviewDuration] = useState<number>(60);
    const [debriefingDuration, setDebriefingDuration] = useState<number>(15);
    const [lunchTargetTime, setLunchTargetTime] = useState<string>('12:45');
    const [lunchDuration, setLunchDuration] = useState<number>(30);
    const [finalDebriefingDuration, setFinalDebriefingDuration] = useState<number>(15);

    const parseDurationToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    useEffect(() => {
        if (initialParameters) {
            setJurorsStartTime(initialParameters.jurorsStartTime);
            setWelcomeDuration(parseDurationToMinutes(initialParameters.interviewParameters.welcomeDuration));
            setCasusDuration(parseDurationToMinutes(initialParameters.interviewParameters.casusDuration));
            setCorrectionDuration(parseDurationToMinutes(initialParameters.interviewParameters.correctionDuration));
            setInterviewDuration(parseDurationToMinutes(initialParameters.interviewParameters.interviewDuration));
            setDebriefingDuration(parseDurationToMinutes(initialParameters.interviewParameters.debriefingDuration));
            setLunchTargetTime(initialParameters.lunchTargetTime);
            setLunchDuration(parseDurationToMinutes(initialParameters.lunchDuration));
            setFinalDebriefingDuration(parseDurationToMinutes(initialParameters.finalDebriefingDuration));

            // Reconstruct candidates input string
            const candidatesStr = initialParameters.candidates.map(c => {
                if (c.email) {
                    return `${c.name}; ${c.email}`;
                }
                return c.name;
            }).join('\n');

            setCandidatesInput(candidatesStr);
            setCandidatesCount(initialParameters.candidates.length);
        } else {
            // Reset to defaults if initialParameters is explicitly null (New Session)
            setJurorsStartTime('09:00');
            setWelcomeDuration(15);
            setCasusDuration(60);
            setCorrectionDuration(15);
            setInterviewDuration(60);
            setDebriefingDuration(15);
            setLunchTargetTime('12:45');
            setLunchDuration(30);
            setFinalDebriefingDuration(15);
            setCandidatesInput('');
            setCandidatesCount(DEFAULT_CANDIDATE_COUNT);
        }
    }, [initialParameters]);

    const hasCandidatesNames = Boolean(candidatesInput.trim());

    const formRef = useRef<HTMLFormElement | null>(null);

    const parseCandidate = (line: string) => {
        var parts = line.split(/[\t;]/);

        var emailIndex = -1;

        var email = parts.find((v, i) => {
            if (v.match(/@/)) {
                emailIndex = i;
                return true;
            }
            return false;
        })

        if (emailIndex !== -1) {
            parts.splice(emailIndex, 1);
        }

        const name = parts.join(' ');

        return new Candidate(name, email ?? null);
    }

    const onCandidatesListChange = (value: string) => {
        setCandidatesInput(value);

        if (value.trim()) {
            setCandidatesCount(value.trim().split('\n').length);
        } else {
            setCandidatesCount(DEFAULT_CANDIDATE_COUNT);
        }
    }

    useEffect(() => {
        const submitOnCtrlEnter = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === 'Enter') {
                if (formRef.current) {
                    formRef.current.requestSubmit();
                }
            }
        };

        window.addEventListener('keydown', submitOnCtrlEnter);
        return () => {
            window.removeEventListener('keydown', submitOnCtrlEnter);
        };
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let candidateList: Candidate[] = [];
        if (candidatesInput.trim()) {
            candidateList = candidatesInput.split('\n').map((line) => parseCandidate(line));
        } else if (candidatesCount !== undefined) {
            candidateList = Array.from({ length: candidatesCount }, (_, index) => {
                return new Candidate(`${index + 1}`, null);
            });
        }

        // Create the JuryDayParameters object with all the form inputs
        const juryDayParams = new JuryDayParameters(
            candidateList,
            Time.Parse(jurorsStartTime),
            new InterviewParameters(
                new Duration(0, welcomeDuration),
                new Duration(0, casusDuration),
                new Duration(0, correctionDuration),
                new Duration(0, interviewDuration),
                new Duration(0, debriefingDuration)
            ),
            Time.Parse(lunchTargetTime),
            new Duration(0, lunchDuration),
            new Duration(0, finalDebriefingDuration)
        );

        onSubmit(juryDayParams);
    };

    const totalDuration = React.useMemo(() => {
        let candidateList: Candidate[] = [];
        if (candidatesInput.trim()) {
            candidateList = candidatesInput.split('\n').map((line) => parseCandidate(line));
        } else if (candidatesCount !== undefined) {
            candidateList = Array.from({ length: candidatesCount }, (_, index) => {
                return new Candidate(`${index + 1}`, null);
            });
        }

        if (candidateList.length === 0) return '0h00';

        const juryDayParams = new JuryDayParameters(
            candidateList,
            Time.Parse(jurorsStartTime),
            new InterviewParameters(
                new Duration(0, welcomeDuration),
                new Duration(0, casusDuration),
                new Duration(0, correctionDuration),
                new Duration(0, interviewDuration),
                new Duration(0, debriefingDuration)
            ),
            Time.Parse(lunchTargetTime),
            new Duration(0, lunchDuration),
            new Duration(0, finalDebriefingDuration)
        );

        const schedule = SchedulingService.generateSchedule(juryDayParams);
        const allSlots = [...schedule.generalSlots, ...schedule.candidateSchedules.flatMap(cs => cs.interviewSlots)];

        if (allSlots.length === 0) return '0h00';

        const timeToMinutes = (t: Time) => t.hour * 60 + t.minute;
        const minMinutes = Math.min(...allSlots.map(s => timeToMinutes(s.timeSlot.startTime)));
        const maxMinutes = Math.max(...allSlots.map(s => timeToMinutes(s.timeSlot.endTime)));

        const diff = maxMinutes - minMinutes;
        return new Duration(Math.floor(diff / 60), diff % 60).toString();
    }, [candidatesCount, candidatesInput, jurorsStartTime, welcomeDuration, casusDuration, correctionDuration, interviewDuration, debriefingDuration, lunchTargetTime, lunchDuration, finalDebriefingDuration]);

    return (
        <div className="container-fluid p-0">
            <Form ref={formRef} className="form-horizontal" onSubmit={handleSubmit}>
                <Row>
                    {/* Card 1: Informations Session */}
                    <Col md={12} lg={4} className="mb-3">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Header className="bg-body-secondary fw-bold">Informations Session</Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="juryDate" className="small fw-bold text-uppercase text-secondary">Date du jury</Form.Label>
                                    <Form.Control
                                        id="juryDate"
                                        type="date"
                                        value={juryDate}
                                        onChange={(e) => setJuryDate(e.target.value)}
                                        required
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="jobTitle" className="small fw-bold text-uppercase text-secondary">Poste</Form.Label>
                                    <Form.Control
                                        id="jobTitle"
                                        type="text"
                                        value={jobTitle}
                                        onChange={(e) => setJobTitle(e.target.value)}
                                        placeholder='Gestionnaire de projet'
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="candidatesCount" className="small fw-bold text-uppercase text-secondary">Candidats</Form.Label>
                                    <InputGroup className="mb-2">
                                        <InputGroup.Text>Nombre</InputGroup.Text>
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={hasCandidatesNames ? <Tooltip id="tooltip-disabled">Désactivé car des noms ont été fournis</Tooltip> : <div></div>}>
                                            <Form.Control
                                                id="candidatesCount"
                                                type="number"
                                                value={candidatesCount}
                                                onChange={(e) => setCandidatesCount(Number(e.target.value))}
                                                disabled={hasCandidatesNames}
                                            />
                                        </OverlayTrigger>
                                    </InputGroup>
                                    <Form.Text className="text-muted mb-1 d-block small">Ou saisir la liste :</Form.Text>
                                    <Form.Control
                                        id="candidatesInput"
                                        as="textarea"
                                        rows={5}
                                        value={candidatesInput}
                                        onChange={(e) => onCandidatesListChange(e.target.value)}
                                        placeholder={`Un nom par ligne...\nJohn Doe\nJane Doe; jane@example.com`}
                                        title={hasCandidatesNames ? 'Désactivé car des noms ont été fournis' : ''}
                                        style={{ resize: 'none' }}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Card 2: Planification */}
                    <Col md={12} lg={4} className="mb-3">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Header className="bg-body-secondary fw-bold">Planification</Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="jurorsStartTime" className="small fw-bold text-uppercase text-secondary">Début jury</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FaClock /></InputGroup.Text>
                                        <Form.Control
                                            id="jurorsStartTime"
                                            type="time"
                                            step="300"
                                            value={jurorsStartTime}
                                            onChange={(e) => setJurorsStartTime(e.target.value)}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="lunchTargetTime" className="small fw-bold text-uppercase text-secondary">Cible Déjeuner</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FaClock /></InputGroup.Text>
                                        <Form.Control
                                            id="lunchTargetTime"
                                            type="time"
                                            step="300"
                                            value={lunchTargetTime}
                                            onChange={(e) => setLunchTargetTime(e.target.value)}
                                            required
                                        />
                                    </InputGroup>
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label htmlFor="lunchDuration" className="small fw-bold text-uppercase text-secondary">Durée Déjeuner</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text><FaHourglassHalf /></InputGroup.Text>
                                        <Form.Control
                                            id="lunchDuration"
                                            type="number"
                                            value={lunchDuration}
                                            onChange={(e) => setLunchDuration(Number(e.target.value))}
                                            required
                                        />
                                        <InputGroup.Text>min</InputGroup.Text>
                                    </InputGroup>
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Card 3: Séquence d'Entretien */}
                    <Col md={12} lg={4} className="mb-3">
                        <Card className="h-100 shadow-sm border-0">
                            <Card.Header className="bg-body-secondary fw-bold">Séquence d'Entretien</Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col sm={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="welcomeDuration" className="small fw-bold text-uppercase text-secondary">Accueil</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Control id="welcomeDuration" type="number" value={welcomeDuration} onChange={(e) => setWelcomeDuration(Number(e.target.value))} required />
                                                <InputGroup.Text>min</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="casusDuration" className="small fw-bold text-uppercase text-secondary">Casus</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Control id="casusDuration" type="number" value={casusDuration} onChange={(e) => setCasusDuration(Number(e.target.value))} required />
                                                <InputGroup.Text>min</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="correctionDuration" className="small fw-bold text-uppercase text-secondary">Correction</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Control id="correctionDuration" type="number" value={correctionDuration} onChange={(e) => setCorrectionDuration(Number(e.target.value))} required />
                                                <InputGroup.Text>min</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="interviewDuration" className="small fw-bold text-uppercase text-secondary">Entretien</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Control id="interviewDuration" type="number" value={interviewDuration} onChange={(e) => setInterviewDuration(Number(e.target.value))} required />
                                                <InputGroup.Text>min</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="debriefingDuration" className="small fw-bold text-uppercase text-secondary">Débriefing</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Control id="debriefingDuration" type="number" value={debriefingDuration} onChange={(e) => setDebriefingDuration(Number(e.target.value))} required />
                                                <InputGroup.Text>min</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="finalDebriefingDuration" className="small fw-bold text-uppercase text-secondary">Débr. Final</Form.Label>
                                            <InputGroup size="sm">
                                                <Form.Control id="finalDebriefingDuration" type="number" value={finalDebriefingDuration} onChange={(e) => setFinalDebriefingDuration(Number(e.target.value))} required />
                                                <InputGroup.Text>min</InputGroup.Text>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col className="d-flex justify-content-between align-items-center mb-3">
                        <div className="text-muted small">
                            <strong>Durée totale de la journée estimée : {totalDuration}</strong>
                        </div>
                        <Button type="submit" variant="orange">Générer (Ctrl + Enter)</Button>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default React.memo(InterviewForm);

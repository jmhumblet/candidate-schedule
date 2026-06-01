import React, { useEffect, useRef, useState } from 'react';
import { JuryDayParameters, Candidate, InterviewParameters, Duration } from '../domain/parameters';
import { Button, Col, Form, Row, OverlayTrigger, Tooltip, InputGroup, Card, Alert, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import { FaClock, FaHourglassHalf, FaLock, FaExclamationTriangle } from 'react-icons/fa';
import Time from '../domain/time';
import SchedulingService from '../domain/schedulingService';
import useDebounce from '../hooks/useDebounce';

import { JuryDayParametersModel } from '../domain/session';

type InterviewFormProps = {
    onSubmit: (parameters: JuryDayParameters, isLocked: boolean) => void;
    initialParameters?: JuryDayParametersModel | null;
    juryDate: string;
    setJuryDate: (date: string) => void;
    jobTitle: string;
    setJobTitle: (title: string) => void;
    isLocked: boolean;
};

const InterviewForm: React.FC<InterviewFormProps> = ({
    onSubmit,
    initialParameters,
    juryDate,
    setJuryDate,
    jobTitle,
    setJobTitle,
    isLocked
}) => {
    const DEFAULT_CANDIDATE_COUNT: number = 5;
    // States to hold form data
    const date = new Date();
    date.setDate(date.getDate() + 10);

    const [candidatesCount, setCandidatesCount] = useState<number>(DEFAULT_CANDIDATE_COUNT);
    const [candidatesInput, setCandidatesInput] = useState<string>('');
    const [jurorsStartTime, setJurorsStartTime] = useState<string>('09:00');
    const [scheduleMode, setScheduleMode] = useState<'start' | 'end'>('start');
    const [endTime, setEndTime] = useState<string>('17:00');
    const [welcomeDuration, setWelcomeDuration] = useState<number>(15);
    const [casusDuration, setCasusDuration] = useState<number>(60);
    const [correctionDuration, setCorrectionDuration] = useState<number>(15);
    const [interviewDuration, setInterviewDuration] = useState<number>(60);
    const [debriefingDuration, setDebriefingDuration] = useState<number>(15);
    const [lunchTargetTime, setLunchTargetTime] = useState<string>('12:45');
    const [lunchDuration, setLunchDuration] = useState<number>(30);
    const [forceLunch, setForceLunch] = useState<boolean>(false);
    const [finalDebriefingDuration, setFinalDebriefingDuration] = useState<number>(15);

    const [formError, setFormError] = useState<string>('');

    // Debounce inputs that trigger expensive recalculations
    const debouncedCandidatesInput = useDebounce(candidatesInput, 300);
    const debouncedCandidatesCount = useDebounce(candidatesCount, 300);

    const parseDurationToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    useEffect(() => {
        setFormError('');
        if (initialParameters) {
            setJurorsStartTime(initialParameters.jurorsStartTime);
            setScheduleMode(initialParameters.scheduleMode ?? 'start');
            setEndTime(initialParameters.endTime ?? '17:00');
            setWelcomeDuration(parseDurationToMinutes(initialParameters.interviewParameters.welcomeDuration));
            setCasusDuration(parseDurationToMinutes(initialParameters.interviewParameters.casusDuration));
            setCorrectionDuration(parseDurationToMinutes(initialParameters.interviewParameters.correctionDuration));
            setInterviewDuration(parseDurationToMinutes(initialParameters.interviewParameters.interviewDuration));
            setDebriefingDuration(parseDurationToMinutes(initialParameters.interviewParameters.debriefingDuration));
            setLunchTargetTime(initialParameters.lunchTargetTime);
            setLunchDuration(parseDurationToMinutes(initialParameters.lunchDuration));
            setForceLunch(initialParameters.forceLunch ?? false);
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
            setScheduleMode('start');
            setEndTime('17:00');
            setWelcomeDuration(15);
            setCasusDuration(60);
            setCorrectionDuration(15);
            setInterviewDuration(60);
            setDebriefingDuration(15);
            setLunchTargetTime('12:45');
            setLunchDuration(30);
            setForceLunch(false);
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

    useEffect(() => {
        const syncAria = (el: HTMLElement) => {
            if (el.matches) {
                const isUserInvalid = el.matches(':user-invalid');
                el.setAttribute('aria-invalid', isUserInvalid ? 'true' : 'false');
            }
        };

        const handleBlur = (e: FocusEvent) => {
            syncAria(e.target as HTMLElement);
        };

        const handleInput = (e: Event) => {
            const el = e.target as HTMLElement;
            if (el.hasAttribute('aria-invalid')) {
                syncAria(el);
            }
        };

        const form = formRef.current;
        if (form) {
            form.addEventListener('blur', handleBlur, true);
            form.addEventListener('input', handleInput);
        }

        return () => {
            if (form) {
                form.removeEventListener('blur', handleBlur, true);
                form.removeEventListener('input', handleInput);
            }
        };
    }, []);

    const validateForm = (): boolean => {
        const form = formRef.current;
        if (form && !form.checkValidity()) {
            // Unsuccessful submission
            // Mark all invalid fields with aria-invalid="true" and add standard user-invalid-fallback class
            const invalidFields = form.querySelectorAll('input, textarea, select');
            invalidFields.forEach((field) => {
                const el = field as HTMLElement;
                if (el.matches && el.matches(':invalid')) {
                    el.setAttribute('aria-invalid', 'true');
                    el.classList.add('user-invalid-fallback');
                } else {
                    el.setAttribute('aria-invalid', 'false');
                    el.classList.remove('user-invalid-fallback');
                }
            });

            // Focus the first invalid field programmatically
            const firstInvalid = form.querySelector('input:invalid, textarea:invalid, select:invalid') as HTMLElement;
            if (firstInvalid) {
                firstInvalid.focus();
            }

            // Set global error alert strictly in French
            setFormError('Le formulaire contient des erreurs. Veuillez corriger les champs invalides ci-dessous.');
            return false;
        }

        setFormError('');
        return true;
    };

    const createParams = (): JuryDayParameters => {
        let candidateList: Candidate[] = [];
        if (candidatesInput.trim()) {
            candidateList = candidatesInput.split('\n').map((line) => parseCandidate(line));
        } else if (candidatesCount !== undefined) {
            candidateList = Array.from({ length: candidatesCount }, (_, index) => {
                return new Candidate(`${index + 1}`, null);
            });
        }

        return new JuryDayParameters(
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
            new Duration(0, finalDebriefingDuration),
            forceLunch,
            scheduleMode,
            Time.Parse(endTime)
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        onSubmit(createParams(), false);
    };

    const handleLock = () => {
        if (!validateForm()) return;
        onSubmit(createParams(), true);
    };

    const EARLY_ARRIVAL_LIMIT = 7 * 60 + 45; // 07h45 in minutes

    const scheduleInfo = React.useMemo(() => {
        let candidateList: Candidate[] = [];
        if (debouncedCandidatesInput.trim()) {
            candidateList = debouncedCandidatesInput.split('\n').map((line) => parseCandidate(line));
        } else if (debouncedCandidatesCount !== undefined) {
            candidateList = Array.from({ length: debouncedCandidatesCount }, (_, index) => {
                return new Candidate(`${index + 1}`, null);
            });
        }

        const empty = { totalDuration: '0h00', effectiveStartTime: jurorsStartTime, computedEndTime: endTime, hasEarlyArrival: false };
        if (candidateList.length === 0) return empty;

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
            new Duration(0, finalDebriefingDuration),
            forceLunch,
            scheduleMode,
            Time.Parse(endTime)
        );

        const schedule = SchedulingService.generateSchedule(juryDayParams);
        const allSlots = [...schedule.generalSlots, ...schedule.candidateSchedules.flatMap(cs => cs.interviewSlots)];

        if (allSlots.length === 0) return empty;

        const timeToMinutes = (t: Time) => t.hour * 60 + t.minute;
        const minMinutes = Math.min(...allSlots.map(s => timeToMinutes(s.timeSlot.startTime)));
        const maxMinutes = Math.max(...allSlots.map(s => timeToMinutes(s.timeSlot.endTime)));

        const diff = maxMinutes - minMinutes;
        // The jury welcome is always the first general slot; its start is the effective jury start.
        const effectiveStartTime = schedule.generalSlots[0].timeSlot.startTime.toInputString();
        // The final debriefing is always the last general slot; its end is the real end of the jury's work.
        const computedEndTime = schedule.generalSlots[schedule.generalSlots.length - 1].timeSlot.endTime.toInputString();

        return {
            totalDuration: new Duration(Math.floor(diff / 60), diff % 60).toString(),
            effectiveStartTime,
            computedEndTime,
            hasEarlyArrival: minMinutes < EARLY_ARRIVAL_LIMIT,
        };
    }, [debouncedCandidatesCount, debouncedCandidatesInput, jurorsStartTime, scheduleMode, endTime, welcomeDuration, casusDuration, correctionDuration, interviewDuration, debriefingDuration, lunchTargetTime, lunchDuration, finalDebriefingDuration, forceLunch]);

    const totalDuration = scheduleInfo.totalDuration;

    const handleScheduleModeChange = (mode: 'start' | 'end') => {
        if (mode === scheduleMode) return;
        if (mode === 'end') {
            // Switching to "end" mode: seed the end field with the currently computed end time
            // so the displayed time stays continuous.
            setEndTime(scheduleInfo.computedEndTime);
        } else {
            // Switching back to "start" mode: seed the start field with the computed start.
            setJurorsStartTime(scheduleInfo.effectiveStartTime);
        }
        setScheduleMode(mode);
    };

    return (
        <div className="container-fluid p-0">
            <Form ref={formRef} className="form-horizontal" onSubmit={handleSubmit} noValidate>
                {formError && (
                    <Alert variant="danger" role="alert" aria-live="assertive" className="mb-3">
                        {formError}
                    </Alert>
                )}
                <fieldset disabled={isLocked}>
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
                                            aria-errormessage="juryDate-error"
                                            aria-describedby="juryDate-error"
                                        />
                                        <div id="juryDate-error" className="error-msg" role="alert">
                                            <span aria-hidden="true">❌</span> Veuillez saisir une date de jury valide.
                                        </div>
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
                                                    min="1"
                                                    required
                                                    aria-errormessage="candidatesCount-error"
                                                    aria-describedby="candidatesCount-error"
                                                />
                                            </OverlayTrigger>
                                        </InputGroup>
                                        <div id="candidatesCount-error" className="error-msg mb-2" role="alert">
                                            <span aria-hidden="true">❌</span> Le nombre de candidats doit être d'au moins 1.
                                        </div>
                                        <Form.Label htmlFor="candidatesInput" className="text-muted mb-1 d-block small">Ou saisir la liste :</Form.Label>
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
                                        <ToggleButtonGroup
                                            type="radio"
                                            name="scheduleMode"
                                            value={scheduleMode}
                                            onChange={handleScheduleModeChange}
                                            className="w-100 mb-2 schedule-mode-toggle"
                                        >
                                            <ToggleButton
                                                id="scheduleMode-start"
                                                value="start"
                                                variant="outline-orange"
                                                className="fw-bold text-uppercase"
                                            >
                                                Début du jury
                                            </ToggleButton>
                                            <ToggleButton
                                                id="scheduleMode-end"
                                                value="end"
                                                variant="outline-orange"
                                                className="fw-bold text-uppercase"
                                            >
                                                Fin du jury
                                            </ToggleButton>
                                        </ToggleButtonGroup>
                                        <InputGroup>
                                            {/* The leading icon box switches to a warning when the first candidate
                                                would arrive unusually early — keeping the box (and thus the input
                                                width) identical so there is no layout shift. */}
                                            <InputGroup.Text>
                                                {scheduleInfo.hasEarlyArrival ? (
                                                    <OverlayTrigger
                                                        placement="top"
                                                        overlay={<Tooltip id="early-arrival-tooltip">Le premier candidat doit arriver plus tôt que d'habitude (avant 07h45).</Tooltip>}
                                                    >
                                                        <span className="text-warning" role="img" aria-label="Avertissement : arrivée anticipée du premier candidat">
                                                            <FaExclamationTriangle aria-hidden="true" />
                                                        </span>
                                                    </OverlayTrigger>
                                                ) : (
                                                    <FaClock aria-hidden="true" />
                                                )}
                                            </InputGroup.Text>
                                            <Form.Control
                                                id="jurorsStartTime"
                                                type="time"
                                                step="300"
                                                value={scheduleMode === 'start' ? jurorsStartTime : endTime}
                                                onChange={(e) => scheduleMode === 'start' ? setJurorsStartTime(e.target.value) : setEndTime(e.target.value)}
                                                required
                                                aria-label={scheduleMode === 'start' ? 'Heure de début du jury' : 'Heure de fin du jury'}
                                                aria-errormessage="jurorsStartTime-error"
                                                aria-describedby="jurorsStartTime-error"
                                            />
                                        </InputGroup>
                                        <div id="jurorsStartTime-error" className="error-msg" role="alert">
                                            <span aria-hidden="true">❌</span> Veuillez saisir une heure valide.
                                        </div>
                                    </Form.Group>
                                    {scheduleInfo.effectiveStartTime < '12:00' ? (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Label htmlFor="lunchTargetTime" className="small fw-bold text-uppercase text-secondary">Cible Déjeuner</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text><FaClock aria-hidden="true" /></InputGroup.Text>
                                                    <Form.Control
                                                        id="lunchTargetTime"
                                                        type="time"
                                                        step="300"
                                                        value={lunchTargetTime}
                                                        onChange={(e) => setLunchTargetTime(e.target.value)}
                                                        required
                                                        aria-errormessage="lunchTargetTime-error"
                                                        aria-describedby="lunchTargetTime-error"
                                                    />
                                                </InputGroup>
                                                <div id="lunchTargetTime-error" className="error-msg" role="alert">
                                                    <span aria-hidden="true">❌</span> Veuillez saisir une heure de déjeuner cible valide.
                                                </div>
                                            </Form.Group>
                                            <Form.Group className="mb-3">
                                                <Form.Label htmlFor="lunchDuration" className="small fw-bold text-uppercase text-secondary">Durée Déjeuner</Form.Label>
                                                <InputGroup>
                                                    <InputGroup.Text><FaHourglassHalf aria-hidden="true" /></InputGroup.Text>
                                                    <Form.Control
                                                        id="lunchDuration"
                                                        type="number"
                                                        value={lunchDuration}
                                                        onChange={(e) => setLunchDuration(Number(e.target.value))}
                                                        min="0"
                                                        required
                                                        aria-errormessage="lunchDuration-error"
                                                        aria-describedby="lunchDuration-error"
                                                    />
                                                    <InputGroup.Text>min</InputGroup.Text>
                                                </InputGroup>
                                                <div id="lunchDuration-error" className="error-msg" role="alert">
                                                    <span aria-hidden="true">❌</span> La durée de déjeuner doit être supérieure ou égale à 0.
                                                </div>
                                            </Form.Group>
                                        </>
                                    ) : (
                                        <>
                                            <Form.Group className="mb-3">
                                                <Form.Check
                                                    type="switch"
                                                    id="forceLunch"
                                                    label="Ajouter une pause déjeuner"
                                                    checked={forceLunch}
                                                    onChange={(e) => setForceLunch(e.target.checked)}
                                                />
                                            </Form.Group>
                                            {forceLunch && (
                                                <>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label htmlFor="lunchTargetTime" className="small fw-bold text-uppercase text-secondary">Cible Déjeuner</Form.Label>
                                                        <InputGroup>
                                                            <InputGroup.Text><FaClock aria-hidden="true" /></InputGroup.Text>
                                                            <Form.Control
                                                                id="lunchTargetTime"
                                                                type="time"
                                                                step="300"
                                                                value={lunchTargetTime}
                                                                onChange={(e) => setLunchTargetTime(e.target.value)}
                                                                required
                                                                aria-errormessage="lunchTargetTime-error"
                                                                aria-describedby="lunchTargetTime-error"
                                                            />
                                                        </InputGroup>
                                                        <div id="lunchTargetTime-error" className="error-msg" role="alert">
                                                            <span aria-hidden="true">❌</span> Veuillez saisir une heure de déjeuner cible valide.
                                                        </div>
                                                    </Form.Group>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label htmlFor="lunchDuration" className="small fw-bold text-uppercase text-secondary">Durée Déjeuner</Form.Label>
                                                        <InputGroup>
                                                            <InputGroup.Text><FaHourglassHalf aria-hidden="true" /></InputGroup.Text>
                                                            <Form.Control
                                                                id="lunchDuration"
                                                                type="number"
                                                                value={lunchDuration}
                                                                onChange={(e) => setLunchDuration(Number(e.target.value))}
                                                                min="0"
                                                                required
                                                                aria-errormessage="lunchDuration-error"
                                                                aria-describedby="lunchDuration-error"
                                                            />
                                                            <InputGroup.Text>min</InputGroup.Text>
                                                        </InputGroup>
                                                        <div id="lunchDuration-error" className="error-msg" role="alert">
                                                            <span aria-hidden="true">❌</span> La durée de déjeuner doit être supérieure ou égale à 0.
                                                        </div>
                                                    </Form.Group>
                                                </>
                                            )}
                                        </>
                                    )}
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
                                                    <Form.Control id="welcomeDuration" type="number" value={welcomeDuration} onChange={(e) => setWelcomeDuration(Number(e.target.value))} min="0" required aria-errormessage="welcomeDuration-error" aria-describedby="welcomeDuration-error" />
                                                    <InputGroup.Text>min</InputGroup.Text>
                                                </InputGroup>
                                                <div id="welcomeDuration-error" className="error-msg" role="alert">
                                                    <span aria-hidden="true">❌</span> Doit être &gt;= 0.
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label htmlFor="casusDuration" className="small fw-bold text-uppercase text-secondary">Casus</Form.Label>
                                                <InputGroup size="sm">
                                                    <Form.Control id="casusDuration" type="number" value={casusDuration} onChange={(e) => setCasusDuration(Number(e.target.value))} min="0" required aria-errormessage="casusDuration-error" aria-describedby="casusDuration-error" />
                                                    <InputGroup.Text>min</InputGroup.Text>
                                                </InputGroup>
                                                <div id="casusDuration-error" className="error-msg" role="alert">
                                                    <span aria-hidden="true">❌</span> Doit être &gt;= 0.
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label htmlFor="correctionDuration" className="small fw-bold text-uppercase text-secondary">Correction</Form.Label>
                                                <InputGroup size="sm">
                                                    <Form.Control id="correctionDuration" type="number" value={correctionDuration} onChange={(e) => setCorrectionDuration(Number(e.target.value))} min="0" required aria-errormessage="correctionDuration-error" aria-describedby="correctionDuration-error" />
                                                    <InputGroup.Text>min</InputGroup.Text>
                                                </InputGroup>
                                                <div id="correctionDuration-error" className="error-msg" role="alert">
                                                    <span aria-hidden="true">❌</span> Doit être &gt;= 0.
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label htmlFor="interviewDuration" className="small fw-bold text-uppercase text-secondary">Entretien</Form.Label>
                                                <InputGroup size="sm">
                                                    <Form.Control id="interviewDuration" type="number" value={interviewDuration} onChange={(e) => setInterviewDuration(Number(e.target.value))} min="1" required aria-errormessage="interviewDuration-error" aria-describedby="interviewDuration-error" />
                                                    <InputGroup.Text>min</InputGroup.Text>
                                                </InputGroup>
                                                <div id="interviewDuration-error" className="error-msg" role="alert">
                                                    <span aria-hidden="true">❌</span> Doit être &gt;= 1.
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label htmlFor="debriefingDuration" className="small fw-bold text-uppercase text-secondary">Débriefing</Form.Label>
                                                <InputGroup size="sm">
                                                    <Form.Control id="debriefingDuration" type="number" value={debriefingDuration} onChange={(e) => setDebriefingDuration(Number(e.target.value))} min="0" required aria-errormessage="debriefingDuration-error" aria-describedby="debriefingDuration-error" />
                                                    <InputGroup.Text>min</InputGroup.Text>
                                                </InputGroup>
                                                <div id="debriefingDuration-error" className="error-msg" role="alert">
                                                    <span aria-hidden="true">❌</span> Doit être &gt;= 0.
                                                </div>
                                            </Form.Group>
                                        </Col>
                                        <Col sm={6}>
                                            <Form.Group className="mb-3">
                                                <Form.Label htmlFor="finalDebriefingDuration" className="small fw-bold text-uppercase text-secondary">Débr. Final</Form.Label>
                                                <InputGroup size="sm">
                                                    <Form.Control id="finalDebriefingDuration" type="number" value={finalDebriefingDuration} onChange={(e) => setFinalDebriefingDuration(Number(e.target.value))} min="0" required aria-errormessage="finalDebriefingDuration-error" aria-describedby="finalDebriefingDuration-error" />
                                                    <InputGroup.Text>min</InputGroup.Text>
                                                </InputGroup>
                                                <div id="finalDebriefingDuration-error" className="error-msg" role="alert">
                                                    <span aria-hidden="true">❌</span> Doit être &gt;= 0.
                                                </div>
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </fieldset>
                <Row>
                    <Col className="d-flex justify-content-between align-items-center mb-3">
                        <div className="text-muted small">
                            <strong>Durée totale de la journée estimée : {totalDuration}</strong>
                        </div>
                        <div className="d-flex gap-2">
                            <OverlayTrigger
                                placement="top"
                                overlay={
                                    <Tooltip id="tooltip-lock">
                                        {isLocked
                                            ? "Cette session est verrouillée et ne peut plus être modifiée."
                                            : "Verrouiller la session pour empêcher toute modification des paramètres et des candidats."}
                                    </Tooltip>
                                }
                            >
                                <span className="d-inline-block">
                                    <Button
                                        variant={isLocked ? "secondary" : "outline-danger"}
                                        onClick={handleLock}
                                        disabled={isLocked}
                                    >
                                        {isLocked ? "Session verrouillée" : <><FaLock className="me-2" />Verrouiller</>}
                                    </Button>
                                </span>
                            </OverlayTrigger>
                            {isLocked ? (
                                <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip>La session est verrouillée</Tooltip>}
                                >
                                    <span className="d-inline-block">
                                        <Button type="submit" variant="orange" disabled>Générer (Ctrl + Enter)</Button>
                                    </span>
                                </OverlayTrigger>
                            ) : (
                                <Button type="submit" variant="orange">Générer (Ctrl + Enter)</Button>
                            )}
                        </div>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

export default React.memo(InterviewForm);

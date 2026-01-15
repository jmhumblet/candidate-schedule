import React, { useEffect, useRef, useState } from 'react';
import { JuryDayParameters, Candidate, InterviewParameters, Duration } from './domain/parameters'; // Assuming you have these models in a separate file
import { Button, Col, Form, Row, OverlayTrigger, Tooltip, InputGroup } from 'react-bootstrap'
import { FaClock, FaHourglassHalf } from 'react-icons/fa';
import Time from './domain/time';
import SchedulingService from './domain/schedulingService';

import { JuryDayParametersModel } from './domain/session';

type InterviewFormProps = {
    onSubmit: (parameters: JuryDayParameters) => void;
    initialParameters?: JuryDayParametersModel | null;
};

const InterviewForm: React.FC<InterviewFormProps> = ({ onSubmit, initialParameters }) => {
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
        <div className="container">
            <Form ref={formRef} className="form-horizontal" onSubmit={handleSubmit}>

                <Form.Group className="mb-3" as={Row} controlId="candidateNames">
                    <Form.Label column sm={4} className="control-label">Nombre de candidats</Form.Label>
                    <Col sm={2}>
                        <OverlayTrigger
                            placement="top"
                            overlay={hasCandidatesNames ? <Tooltip id="tooltip-disabled">Désactivé car des noms ont été fournis</Tooltip> : <div></div>}>
                            <Form.Control
                                type="number"
                                value={candidatesCount}
                                onChange={(e) => setCandidatesCount(Number(e.target.value))}
                                disabled={hasCandidatesNames}
                            />
                        </OverlayTrigger>
                    </Col>
                    <Form.Label column sm={1} className="control-label">Ou</Form.Label>
                    <Col sm={5}>
                        <Form.Control
                            as="textarea"
                            rows={6}
                            value={candidatesInput}
                            onChange={(e) => onCandidatesListChange(e.target.value)}
                            placeholder={`Un nom par ligne, par exemple\nJohn Doe\nJane Doe; jane.doe@gmail.com`}
                            title={hasCandidatesNames ? 'Désactivé car des noms ont été fournis' : ''}
                        />
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="juryStartTime">
                    <Form.Label column sm={4} className="control-label">Heure de début pour le jury</Form.Label>
                    <Col sm={8}>
                        <InputGroup>
                            <InputGroup.Text className="input-group-text-time">
                                <FaClock className="indicator-icon" /> Heure
                            </InputGroup.Text>
                            <Form.Control
                                type="time"
                                step="300"
                                value={jurorsStartTime}
                                onChange={(e) => setJurorsStartTime(e.target.value)}
                                className="input-time"
                                required
                            />
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="welcomeDuration">
                    <Form.Label column sm={4} className="control-label">Durée de l'accueil</Form.Label>
                    <Col sm={8}>
                        <InputGroup>
                            <InputGroup.Text className="input-group-text-duration">
                                <FaHourglassHalf className="indicator-icon" /> Durée
                            </InputGroup.Text>
                            <Form.Control
                                type="number"
                                value={welcomeDuration}
                                onChange={(e) => setWelcomeDuration(Number(e.target.value))}
                                required
                            />
                            <InputGroup.Text className="input-group-text-unit">min</InputGroup.Text>
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="casusDuration">
                    <Form.Label column sm={4} className="control-label">Durée du casus</Form.Label>
                    <Col sm={8}>
                        <InputGroup>
                            <InputGroup.Text className="input-group-text-duration">
                                <FaHourglassHalf className="indicator-icon" /> Durée
                            </InputGroup.Text>
                            <Form.Control
                                type="number"
                                value={casusDuration}
                                onChange={(e) => setCasusDuration(Number(e.target.value))}
                                required
                            />
                            <InputGroup.Text className="input-group-text-unit">min</InputGroup.Text>
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="correctionDuration">
                    <Form.Label column sm={4} className="control-label">Durée de correction</Form.Label>
                    <Col sm={8}>
                        <InputGroup>
                            <InputGroup.Text className="input-group-text-duration">
                                <FaHourglassHalf className="indicator-icon" /> Durée
                            </InputGroup.Text>
                            <Form.Control
                                type="number"
                                value={correctionDuration}
                                onChange={(e) => setCorrectionDuration(Number(e.target.value))}
                                required
                            />
                            <InputGroup.Text className="input-group-text-unit">min</InputGroup.Text>
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="interviewDuration">
                    <Form.Label column sm={4} className="control-label">Durée de l'entretien</Form.Label>
                    <Col sm={8}>
                        <InputGroup>
                            <InputGroup.Text className="input-group-text-duration">
                                <FaHourglassHalf className="indicator-icon" /> Durée
                            </InputGroup.Text>
                            <Form.Control
                                type="number"
                                value={interviewDuration}
                                onChange={(e) => setInterviewDuration(Number(e.target.value))}
                                required
                            />
                            <InputGroup.Text className="input-group-text-unit">min</InputGroup.Text>
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="debriefingDuration">
                    <Form.Label column sm={4} className="control-label">Durée du débriefing</Form.Label>
                    <Col sm={8}>
                        <InputGroup>
                            <InputGroup.Text className="input-group-text-duration">
                                <FaHourglassHalf className="indicator-icon" /> Durée
                            </InputGroup.Text>
                            <Form.Control
                                type="number"
                                value={debriefingDuration}
                                onChange={(e) => setDebriefingDuration(Number(e.target.value))}
                                required
                            />
                            <InputGroup.Text className="input-group-text-unit">min</InputGroup.Text>
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="lunchTargetTime">
                    <Form.Label column sm={4} className="control-label">Heure ciblée pour la pause déjeuner</Form.Label>
                    <Col sm={8}>
                        <InputGroup>
                            <InputGroup.Text className="input-group-text-time">
                                <FaClock className="indicator-icon" /> Heure
                            </InputGroup.Text>
                            <Form.Control
                                type="time"
                                step="300"
                                value={lunchTargetTime}
                                onChange={(e) => setLunchTargetTime(e.target.value)}
                                className="input-time"
                                required
                            />
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="lunchDuration">
                    <Form.Label column sm={4} className="control-label">Durée de la pause déjeuner</Form.Label>
                    <Col sm={8}>
                        <InputGroup>
                            <InputGroup.Text className="input-group-text-duration">
                                <FaHourglassHalf className="indicator-icon" /> Durée
                            </InputGroup.Text>
                            <Form.Control
                                type="number"
                                value={lunchDuration}
                                onChange={(e) => setLunchDuration(Number(e.target.value))}
                                required
                            />
                            <InputGroup.Text className="input-group-text-unit">min</InputGroup.Text>
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="finalDebriefingDuration">
                    <Form.Label column sm={4} className="control-label">Durée du débriefing final</Form.Label>
                    <Col sm={8}>
                        <InputGroup>
                            <InputGroup.Text className="input-group-text-duration">
                                <FaHourglassHalf className="indicator-icon" /> Durée
                            </InputGroup.Text>
                            <Form.Control
                                type="number"
                                value={finalDebriefingDuration}
                                onChange={(e) => setFinalDebriefingDuration(Number(e.target.value))}
                                required
                            />
                            <InputGroup.Text className="input-group-text-unit">min</InputGroup.Text>
                        </InputGroup>
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row}>
                    <Col sm={{ span: 8, offset: 4 }}>
                        <div className="mb-3">
                            <strong>Durée totale de la journée : {totalDuration}</strong>
                        </div>
                        <Button type="submit" variant="orange">Générer (Ctrl + Enter)</Button>
                        {/* <Button type="reset" variant="warning" className="ml-2">Reset</Button> */}
                    </Col>
                </Form.Group>
            </Form>
        </div>
    );
};

export default React.memo(InterviewForm);

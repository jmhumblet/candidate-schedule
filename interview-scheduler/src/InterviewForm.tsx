import React, { useEffect, useRef, useState } from 'react';
import { JuryDayParameters, Candidate, InterviewParameters, Duration } from './domain/parameters'; // Assuming you have these models in a separate file
import { Button, Col, Form, Row, OverlayTrigger, Tooltip } from 'react-bootstrap'

type InterviewFormProps = {
    onSubmit: (parameters: JuryDayParameters) => void;
};

const InterviewForm: React.FC<InterviewFormProps> = ({ onSubmit }) => {
    const DEFAULT_CANDIDATE_COUNT : number = 4;
    // States to hold form data
    const date = new Date();
    date.setDate(date.getDate() + 10);

    const [juryDate, setJuryDate] = useState<string>(date.toISOString().split('T')[0]);
    const [jobTitle, setJobTitle] = useState<string>('');
    const [candidatesCount, setCandidatesCount] = useState<number>(DEFAULT_CANDIDATE_COUNT); 
    const [candidatesInput, setCandidatesInput] = useState<string>(''); 
    const [jurorsStartTime, setJurorsStartTime] = useState<string>('09:00');
    const [welcomeDuration, setWelcomeDuration] = useState<string>('00:15');
    const [casusDuration, setCasusDuration] = useState<string>('01:00');
    const [correctionDuration, setCorrectionDuration] = useState<string>('00:10');
    const [interviewDuration, setInterviewDuration] = useState<string>('01:00');
    const [debriefingDuration, setDebriefingDuration] = useState<string>('00:15');
    const [lunchTargetTime, setLunchTargetTime] = useState<string>('12:45');
    const [lunchDuration, setLunchDuration] = useState<string>('00:45');
    const [finalDebriefingDuration, setFinalDebriefingDuration] = useState<string>('00:15');

    const hasCandidatesNames = Boolean(candidatesInput.trim());

    const formRef = useRef<HTMLFormElement | null>(null);
    
    const parseCandidate = (line: string) => {
        var parts = line.split(/[\t;]/);

        var emailIndex = -1;

        var email = parts.find((v,i) => {
            if (v.match(/@/)){
                emailIndex = i;
                return true;
            }
            return false;
        })	

        if (emailIndex !== -1){
            parts.splice(emailIndex, 1);
        }

        const name = parts.join(' ');

        return new Candidate(name, email ?? null);
    }


    const onCandidatesListChange = (value: string) => {
        setCandidatesInput(value);

        if (value.trim()){
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
        if (candidatesInput.trim()){
            candidateList = candidatesInput.split('\n').map((line) => parseCandidate(line));
        } else if (candidatesCount !== undefined) {
            candidateList = Array.from({ length: candidatesCount }, (_, index) => {
                return new Candidate(`Candidate ${index + 1}`, null);
            });
        }

        // Create the JuryDayParameters object with all the form inputs
        const juryDayParams = new JuryDayParameters(
            new Date(juryDate),
            jobTitle,
            candidateList,
            new Date(`1970-01-01T${jurorsStartTime}:00`),
            new InterviewParameters(
                Duration.fromTime(welcomeDuration),
                Duration.fromTime(casusDuration),
                Duration.fromTime(correctionDuration),
                Duration.fromTime(interviewDuration),
                Duration.fromTime(debriefingDuration)
            ),
            new Date(`1970-01-01T${lunchTargetTime}:00`),
            Duration.fromTime(lunchDuration),
            Duration.fromTime(finalDebriefingDuration)
        );

        onSubmit(juryDayParams);
    };

    return (
        <div className="container">
            <Form ref={formRef} className="form-horizontal" onSubmit={handleSubmit}>
                <Form.Group className="mb-3" as={Row} controlId="date">

                    <Form.Label column sm={4} className="control-label">Date du jury</Form.Label>
                    <Col sm={2}>
                        <Form.Control
                            type="date"
                            value={juryDate}
                            onChange={(e) => setJuryDate(e.target.value)}
                            required
                        />
                    </Col>
                    <Form.Label column sm={1} className="control-label">Poste</Form.Label>
                    <Col sm={5}>
                        <Form.Control
                            type="text"
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder='Gestionnaire de projet'
                        />
                    </Col>
                </Form.Group>

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
                        <Form.Control
                            type="time"
                            step="300"
                            value={jurorsStartTime}
                            onChange={(e) => setJurorsStartTime(e.target.value)}
                            required
                        />
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="welcomeDuration">
                    <Form.Label column sm={4} className="control-label">Durée de l'accueil</Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            type="time"
                            step="300"
                            value={welcomeDuration}
                            onChange={(e) => setWelcomeDuration(e.target.value)}
                            required
                        />
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="casusDuration">
                    <Form.Label column sm={4} className="control-label">Durée du casus</Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            type="time"
                            step="300"
                            value={casusDuration}
                            onChange={(e) => setCasusDuration(e.target.value)}
                            required
                        />
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="correctionDuration">
                    <Form.Label column sm={4} className="control-label">Durée de correction</Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            type="time"
                            step="300"
                            value={correctionDuration}
                            onChange={(e) => setCorrectionDuration(e.target.value)}
                            required
                        />
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="interviewDuration">
                    <Form.Label column sm={4} className="control-label">Durée de l'entretien</Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            type="time"
                            step="300"
                            value={interviewDuration}
                            onChange={(e) => setInterviewDuration(e.target.value)}
                            required
                        />
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="debriefingDuration">
                    <Form.Label column sm={4} className="control-label">Durée du débriefing</Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            type="time"
                            step="300"
                            value={debriefingDuration}
                            onChange={(e) => setDebriefingDuration(e.target.value)}
                            required
                        />
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="lunchTargetTime">
                    <Form.Label column sm={4} className="control-label">Heure ciblée pour la pause déjeuner</Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            type="time"
                            step="300"
                            value={lunchTargetTime}
                            onChange={(e) => setLunchTargetTime(e.target.value)}
                            required
                        />
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="lunchDuration">
                    <Form.Label column sm={4} className="control-label">Durée de la pause déjeuner</Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            type="time"
                            step="300"
                            value={lunchDuration}
                            onChange={(e) => setLunchDuration(e.target.value)}
                            required
                        />
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row} controlId="finalDebriefingDuration">
                    <Form.Label column sm={4} className="control-label">Durée du débriefing final</Form.Label>
                    <Col sm={8}>
                        <Form.Control
                            type="time"
                            step="300"
                            value={finalDebriefingDuration}
                            onChange={(e) => setFinalDebriefingDuration(e.target.value)}
                            required
                        />
                    </Col>
                </Form.Group>

                <Form.Group className="mb-3" as={Row}>
                    <Col sm={{ span: 8, offset: 4 }}>
                        <Button type="submit" variant="primary">Générer (Ctrl + Enter)</Button>
                        {/* <Button type="reset" variant="warning" className="ml-2">Reset</Button> */}
                    </Col>
                </Form.Group>
            </Form>
        </div>
    );
};

export default InterviewForm;

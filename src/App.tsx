import React, { useRef, useState } from "react";
import InterviewForm from "./InterviewForm";
import SchedulingService from "./domain/schedulingService";
import { JuryDayParameters } from "./domain/parameters";
import { Slot } from "./domain/interviewSlot";
import { StructuredSchedule } from "./domain/scheduleTypes";
import ScheduleTable from "./ScheduleTable";
import TimelineVisualization from "./TimelineVisualization"; // Import the new component
import { Col, Form, Row } from "react-bootstrap";

const App: React.FC = () => {
    const date = new Date();
    date.setDate(date.getDate() + 10);

    const [schedule, setSchedule] = useState<StructuredSchedule | null>(null);
    const [juryDate, setJuryDate] = useState<string>(date.toISOString().split('T')[0]);
    const [jobTitle, setJobTitle] = useState<string>('');

    const handleFormSubmit = (parameters : JuryDayParameters) => {
        const newStructuredSchedule = SchedulingService.generateSchedule(parameters);
        setSchedule(newStructuredSchedule);
    }

    const formRef = useRef<HTMLFormElement | null>(null);  

    return (
        <div className="container mt-3">
            <h1>Entretiens</h1>
            <div className="container">
            <Form ref={formRef} className="form-horizontal" >
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
            </Form>
            </div>
            <InterviewForm onSubmit={handleFormSubmit} />

            { schedule && (
                <>
                    <ScheduleTable schedule={[...schedule.generalSlots, ...schedule.candidateSchedules.flatMap(cs => cs.interviewSlots)]} date={juryDate} />
                    <TimelineVisualization schedule={schedule} /> {/* Add the new component here */}
                </>
            )}

        </div>
    )
};



export default App;
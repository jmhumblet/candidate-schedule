import React, { useState } from "react";
import InterviewForm from "./InterviewForm";
import SchedulingService from "./domain/schedulingService";
import { JuryDayParameters } from "./domain/parameters";
import { InterviewSlot, Slot } from "./domain/interviewSlot";

const App: React.FC = () => {
    const [schedule, setSchedule] = useState<Slot[] | null>(null);

    const handleFormSubmit = (parameters : JuryDayParameters) => {
        const newSchedule = SchedulingService.generateSchedule(parameters);

        setSchedule(newSchedule);
    }

    return (
        <div className="container mt-3">
            <h1>Entretiens</h1>
            <InterviewForm onSubmit={handleFormSubmit} />

            {schedule && (
                <div>
                    <h2>Generated schedule</h2>
                    <ul>
                        {schedule.map((slot, index) => (
                            <li key={index}>Candidate {('candidate' in slot) ? (slot as InterviewSlot).candidate.name : ''}: {slot.timeSlot.toString()}</li>
                        ))}
                    </ul>
                </div>

            )}
        </div>
    )
};



export default App;
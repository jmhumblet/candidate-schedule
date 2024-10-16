import React, { useState } from "react";
import InterviewForm from "./InterviewForm";
import SchedulingService from "./domain/schedulingService";
import Schedule from "./domain/schedule";
import { JuryDayParameters } from "./domain/parameters";

const App: React.FC = () => {
    const [schedule, setSchedule] = useState<Schedule | null>(null);

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
                        {schedule.getSlots().map((slot, index) => (
                            <li key={index}>Candidate {slot.candidateId}: {slot.timeslot.toString()}</li>
                        ))}
                    </ul>
                </div>

            )}
        </div>
    )
};



export default App;
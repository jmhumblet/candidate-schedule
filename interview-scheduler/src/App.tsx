import React, { useState } from "react";
import InterviewForm from "./InterviewForm";
import SchedulingService from "./domain/schedulingService";
import Schedule from "./domain/schedule";

const App: React.FC = () => {
    const [schedule, setSchedule] = useState<Schedule | null>(null);

    const handleFormSubmit = (candidateCount: number, timings: string) => {
        const [startTime, endTime] = parseTimings(timings);
        const newSchedule = SchedulingService.generateSchedule(candidateCount, startTime, endTime);

        setSchedule(newSchedule);
    }

    return (
        <div>
            <h1>Interview Scheduler</h1>
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

const parseTimings = (timings: string): [Date, Date] => {
    const [start, end] = timings.split('-').map(time => time.trim());
    const startTime = new Date();
    const endTime = new Date();

    const [startHours, startMinutes] = start.split(':').map(Number);
    const [endHours, endMinutes] = end.split(':').map(Number);

    startTime.setHours(startHours, startMinutes);
    endTime.setHours(endHours, endMinutes);

    return [startTime, endTime];
}

const generateSchedule = (candidateCount: number, startTime: Date, endTime: Date) => {
    const schedule: string[] = [];

    const totalMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    const slotDuration = totalMinutes / candidateCount;

    let currentTime = startTime;

    for (let i = 0; i < candidateCount; i++){
        const slotStart = new Date(currentTime);
        const slotEnd = new Date(currentTime.getTime() + slotDuration * 60 * 1000);

        const formattedStart = slotStart.toTimeString().substring(0,5);
        const formattedEnd = slotEnd.toTimeString().substring(0,5);

        schedule.push(`Interview ${i+1}: ${formattedStart} - ${formattedEnd}`);
        currentTime = slotEnd;
    }

    return schedule;
}

export default App;
import React, {useState} from "react";

type ScheduleProps = {
    totalCandidates: number;
}

const Schedule: React.FC<ScheduleProps> = ({ totalCandidates }) => {
    const [currentCandidates] = useState<number>(totalCandidates);

    return (
        <div>
            <h2>Total Candidates: {currentCandidates}</h2>
        </div>
    );
};

export default Schedule;
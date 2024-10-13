import React, {useState} from "react";

type InterviewFormProps = {
    onSubmit: (candidateCount: number, timings: string) => void;
};

const InterviewForm: React.FC<InterviewFormProps> = ({ onSubmit }) => {
    const [candidateCount, setCandidateCount] = useState<number>(3);
    const [timings, setTimings] = useState<string>('09:00 - 12:00');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(candidateCount, timings);
    }

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>
                    Number of candidates:
                    <input 
                        type="number" 
                        value={candidateCount} 
                        onChange={(e) => setCandidateCount(Number(e.target.value))} 
                        required
                    />
                </label>
            </div>

            <div>
                <label>
                    Timings (eg: 09:00 - 12:00):
                    <input
                        type="text"
                        value={timings}
                        onChange={(e) => setTimings(e.target.value)}
                        required
                    />
                </label>
            </div>

            <button type="submit">Generate Schedule</button>
        </form>
    )
}

export default InterviewForm;
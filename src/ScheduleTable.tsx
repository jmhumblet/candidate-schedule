import React, { useState } from "react";
import { FinalDebriefingSlot, InterviewSlot, JuryWelcomeSlot, LunchSlot, Slot } from "./domain/interviewSlot";
import Time from "./domain/time"; // Import Time
import { FaPause, FaUser, FaEdit, FaCopy, FaCheck } from 'react-icons/fa';
import Clipboard from 'react-clipboard.js';

type ScheduleTableProps = {
    schedule : Slot[];
    date : string;
    confirmedCandidates: string[];
    onConfirmCandidate: (candidateName: string, isConfirmed: boolean) => void;
}

// Helper function for time comparison
const timeToMinutes = (time: Time): number => time.hour * 60 + time.minute;

// Helper function to get the relevant time for jury intervention based sorting
const getJurySortTime = (slot: Slot): Time => {
    if (slot instanceof InterviewSlot) {
        return (slot as InterviewSlot).correctionStartTime;
    }
    return slot.timeSlot.startTime;
};

const ScheduleTable: React.FC<ScheduleTableProps> = React.memo(({schedule, date, confirmedCandidates, onConfirmCandidate}) => {
    const [isCopied, setIsCopied] = useState(false);
    let typedDate = new Date(date);
    date = typedDate.toLocaleDateString('fr-FR');

    // Sort the schedule by jury intervention time
    const sortedSchedule = [...schedule].sort((a, b) => {
        const timeA = timeToMinutes(getJurySortTime(a));
        const timeB = timeToMinutes(getJurySortTime(b));
        return timeA - timeB;
    });

    React.useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    const handleCopySuccess = () => {
        setIsCopied(true);
    };

    return (
<div>
    <div className="d-flex align-items-center mb-3">
        <Clipboard
            data-clipboard-target="#schedule-content"
            className={`btn ${isCopied ? 'btn-success' : 'btn-outline-primary'} me-3`}
            onSuccess={handleCopySuccess}
            title="Copier l'horaire"
        >
            {isCopied ? <><FaCheck /> Copié !</> : <><FaCopy /> Copier</>}
        </Clipboard>
    </div>

    <div id="schedule-content">
        <h2>Horaire du {date}</h2>

        <table id="result" className="table table-striped table-hover text-center">
            <thead>
                <tr>
                    <th>Candidat</th>
                    <th>Accueil candidat</th>
                    <th>Casus</th>
                    <th>Correction du casus</th>
                    <th>Entretien</th>
                    <th>Délibération</th>
                    <th>Confirmé ?</th>
                </tr>
            </thead>
            <tbody>
            {sortedSchedule.map((slot, index) => {
                if (slot instanceof InterviewSlot) {
                    return <InterviewSlotRow
                        key={index}
                        slot={slot}
                        isConfirmed={confirmedCandidates.includes(slot.candidate.name)}
                        onConfirm={(confirmed) => onConfirmCandidate(slot.candidate.name, confirmed)}
                    />;
                } else if (slot instanceof LunchSlot) {
                    return <LunchSlotRow key={index} slot={slot} />;
                } else if (slot instanceof FinalDebriefingSlot) {
                    return <FinalDebriefingSlotRow key={index} slot={slot} />;
                } else if (slot instanceof JuryWelcomeSlot) {
                    return <JuryWelcomeSlotRow key={index} slot={slot} />;
                }
                return null;
            })}
            </tbody>
        </table>
    </div>
</div>
    )
});

const InterviewSlotRow = ({ slot, isConfirmed, onConfirm }: { slot: InterviewSlot, isConfirmed: boolean, onConfirm: (confirmed: boolean) => void }) => (
    <tr>
        <td>{slot.candidate.name}</td>
        <td>{slot.timeSlot.startTime.toString()}</td>
        <td>{slot.casusStartTime.toString()} - {slot.correctionStartTime.toString()}</td>
        <td>{slot.correctionStartTime.toString()} - {slot.meetingStartTime.toString()}</td>
        <td>{slot.meetingStartTime.toString()} - {slot.debriefingStartTime.toString()}</td>
        <td>{slot.debriefingStartTime.toString()} - {slot.timeSlot.endTime.toString()}</td>
        <td>
            <input
                type="checkbox"
                checked={isConfirmed}
                onChange={(e) => onConfirm(e.target.checked)}
            />
        </td>
    </tr>
);

const LunchSlotRow = ({ slot }: { slot: LunchSlot }) => (
    <tr>
        <td colSpan={7} className="text-center">
            <FaPause /> <b>Pause midi ({slot.timeSlot.startTime.toString()} - {slot.timeSlot.endTime.toString()})</b>
        </td>
    </tr>
);

const FinalDebriefingSlotRow = ({ slot }: { slot: FinalDebriefingSlot }) => (
    <tr>
        <td colSpan={7} className="text-center">
            <FaEdit /> <b>Débriefing final ({slot.timeSlot.startTime.toString()} - {slot.timeSlot.endTime.toString()})</b>
        </td>
    </tr>
);

const JuryWelcomeSlotRow = ({ slot }: { slot: JuryWelcomeSlot }) => (
    <tr>
        <td colSpan={7} className="text-center">
            <FaUser /> <b>Accueil du jury ({slot.timeSlot.startTime.toString()} - {slot.timeSlot.endTime.toString()})</b>
        </td>
    </tr>
);

export default ScheduleTable;
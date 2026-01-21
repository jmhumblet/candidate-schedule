import React, { useState, useCallback, useRef, useEffect } from "react";
import { FinalDebriefingSlot, InterviewSlot, JuryWelcomeSlot, LunchSlot, Slot } from "../domain/interviewSlot";
import Time from "../domain/time"; // Import Time
import { FaPause, FaUser, FaEdit, FaCopy, FaCheck, FaEnvelope } from 'react-icons/fa';
import Clipboard from 'react-clipboard.js';
import { EmailTemplateService, EmailTemplatesMap } from "../domain/EmailTemplates";
import { Button } from "react-bootstrap";

type ScheduleTableProps = {
    schedule : Slot[];
    date : string;
    confirmedCandidates: string[];
    onConfirmCandidate: (candidateName: string, isConfirmed: boolean) => void;
    emailTemplates?: EmailTemplatesMap;
    onSendJuryEmail?: () => void;
    onSendWelcomeEmail?: () => void;
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

const ScheduleTable: React.FC<ScheduleTableProps> = React.memo(({schedule, date, confirmedCandidates, onConfirmCandidate, emailTemplates, onSendJuryEmail, onSendWelcomeEmail}) => {
    const [isCopied, setIsCopied] = useState(false);
    let typedDate = new Date(date);
    date = typedDate.toLocaleDateString('fr-FR');

    // Create stable handler ref
    const onConfirmRef = useRef(onConfirmCandidate);
    useEffect(() => {
        onConfirmRef.current = onConfirmCandidate;
    }, [onConfirmCandidate]);

    // Create stable callback that calls the ref
    const handleConfirm = useCallback((name: string, confirmed: boolean) => {
        onConfirmRef.current(name, confirmed);
    }, []);

    // Sort the schedule by jury intervention time
    const sortedSchedule = React.useMemo(() => [...schedule].sort((a, b) => {
        const timeA = timeToMinutes(getJurySortTime(a));
        const timeB = timeToMinutes(getJurySortTime(b));
        return timeA - timeB;
    }), [schedule]);

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
    <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Horaire du {date}</h2>
        <div className="d-flex gap-2">
            {onSendJuryEmail && (
                <Button variant="outline-primary" onClick={onSendJuryEmail}>
                    <FaEnvelope className="me-2" />
                    Email Jury
                </Button>
            )}
            {onSendWelcomeEmail && (
                <Button variant="outline-primary" onClick={onSendWelcomeEmail}>
                    <FaEnvelope className="me-2" />
                    Email Accueil
                </Button>
            )}
            <Clipboard
                data-clipboard-target="#schedule-content"
                className={`btn ${isCopied ? 'btn-success' : 'btn-outline-primary'}`}
                onSuccess={handleCopySuccess}
                title="Copier l'horaire"
            >
                {isCopied ? <><FaCheck className="me-2" /> Copié !</> : <><FaCopy className="me-2" /> Copier</>}
            </Clipboard>
        </div>
    </div>

    <div id="schedule-content">
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
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
            {sortedSchedule.map((slot, index) => {
                if (slot instanceof InterviewSlot) {
                    return <InterviewSlotRow
                        key={index}
                        slot={slot}
                        isConfirmed={confirmedCandidates.includes(slot.candidate.name)}
                        onConfirm={handleConfirm}
                        date={date}
                        emailTemplates={emailTemplates}
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

// Optimized: Wrapped in React.memo and takes stable onConfirm + name
const InterviewSlotRow = React.memo(({ slot, isConfirmed, onConfirm, date, emailTemplates }: { slot: InterviewSlot, isConfirmed: boolean, onConfirm: (candidateName: string, confirmed: boolean) => void, date: string, emailTemplates?: EmailTemplatesMap }) => {
    const handleEmail = useCallback(() => {
        // Use passed templates or fall back to service (legacy/local)
        const templates = emailTemplates || EmailTemplateService.getTemplates();
        const link = EmailTemplateService.generateCandidateLink(templates.candidate, slot.candidate.name, date, slot);
        window.location.href = link;
    }, [emailTemplates, slot, date]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        onConfirm(slot.candidate.name, e.target.checked);
    }, [onConfirm, slot.candidate.name]);

    return (
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
                    onChange={handleChange}
                    aria-label={`Confirmer ${slot.candidate.name}`}
                />
            </td>
            <td>
                <Button variant="outline-primary" size="sm" onClick={handleEmail} title="Envoyer email au candidat">
                    <FaEnvelope />
                </Button>
            </td>
        </tr>
    );
});

const LunchSlotRow = React.memo(({ slot }: { slot: LunchSlot }) => (
    <tr>
        <td colSpan={8} className="text-center">
            <FaPause /> <b>Pause midi ({slot.timeSlot.startTime.toString()} - {slot.timeSlot.endTime.toString()})</b>
        </td>
    </tr>
));

const FinalDebriefingSlotRow = React.memo(({ slot }: { slot: FinalDebriefingSlot }) => (
    <tr>
        <td colSpan={8} className="text-center">
            <FaEdit /> <b>Débriefing final ({slot.timeSlot.startTime.toString()} - {slot.timeSlot.endTime.toString()})</b>
        </td>
    </tr>
));

const JuryWelcomeSlotRow = React.memo(({ slot }: { slot: JuryWelcomeSlot }) => (
    <tr>
        <td colSpan={8} className="text-center">
            <FaUser /> <b>Accueil du jury ({slot.timeSlot.startTime.toString()} - {slot.timeSlot.endTime.toString()})</b>
        </td>
    </tr>
));

export default ScheduleTable;

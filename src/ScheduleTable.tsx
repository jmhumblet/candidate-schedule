import React from "react";
import { FinalDebriefingSlot, InterviewSlot, JuryWelcomeSlot, LunchSlot, Slot } from "./domain/interviewSlot";
import { FaPause, FaUser, FaEdit, FaCopy } from 'react-icons/fa';
import Clipboard from 'react-clipboard.js';

type ScheduleTableProps = {
    schedule : Slot[];
    date : string;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({schedule, date}) => {
    let typedDate = new Date(date);
    date = typedDate.toLocaleDateString();
    return (
<div>
    <div id="clippy-target">
        <Clipboard component="h2"  data-clipboard-target="#clippy-target">
            <FaCopy /> <span id="timetableTitle">Horaire du {date}</span>
        </Clipboard>


        <table id="result" className="table table-striped table-hover text-center">
            <thead>
                <th>Candidat</th>
                <th>Accueil candidat</th>
                <th>Casus</th>
                <th>Correction du casus</th>
                <th>Entretien</th>
                <th>Délibération</th>
                <th>Confirmé ?</th>
            </thead>
            <tbody>
            {schedule.map((slot, index) => {
                if (slot instanceof InterviewSlot) {
                    return <InterviewSlotRow key={index} slot={slot} />;
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
}

const InterviewSlotRow = ({ slot }: { slot: InterviewSlot }) => (
    <tr>
        <td>{slot.candidate.name}</td>
        <td>{slot.timeSlot.startTime.toString()}</td>
        <td>{slot.casusStartTime.toString()} - {slot.correctionStartTime.toString()}</td>
        <td>{slot.correctionStartTime.toString()} - {slot.meetingStartTime.toString()}</td>
        <td>{slot.meetingStartTime.toString()} - {slot.debriefingStartTime.toString()}</td>
        <td>{slot.debriefingStartTime.toString()} - {slot.timeSlot.endTime.toString()}</td>
        <td></td>
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
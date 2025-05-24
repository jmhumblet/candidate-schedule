import React from 'react';
import { StructuredSchedule, CandidateSchedule } from './domain/scheduleTypes';
import { InterviewSlot } from './domain/interviewSlot';
import Time from './domain/time';
import './TimelineVisualization.css';

interface TimelineVisualizationProps {
  schedule: StructuredSchedule;
}

const timeToMinutes = (time: Time): number => time.hour * 60 + time.minute;
const PIXELS_PER_MINUTE = 2;

const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({ schedule }) => {
  if (!schedule || !schedule.candidateSchedules) {
    return <p>No schedule data available.</p>;
  }

  const renderSegment = (startTime: Time, endTime: Time, className: string, label: string) => {
    const startTimeInMinutes = timeToMinutes(startTime);
    const endTimeInMinutes = timeToMinutes(endTime);
    const durationInMinutes = endTimeInMinutes - startTimeInMinutes;
    
    if (durationInMinutes <= 0) return null; // Don't render zero or negative duration segments

    const segmentWidth = durationInMinutes * PIXELS_PER_MINUTE;

    return (
      <div
        className={`timeline-segment ${className}`}
        style={{ width: `${segmentWidth}px` }}
        title={`${label}: ${startTime.toString()} - ${endTime.toString()}`}
      >
        <span className="segment-time">{startTime.toString()}</span>
        <span className="segment-time">{endTime.toString()}</span>
      </div>
    );
  };

  return (
    <div className="timeline-container">
      <h2>Candidate Timelines</h2>
      {schedule.candidateSchedules.map((candidateSchedule: CandidateSchedule, index: number) => (
        <div key={index} className="candidate-entry"> {/* Changed from candidate-row to avoid conflict if styles differ */}
          <div className="candidate-name">{candidateSchedule.candidate.name}</div>
          <div className="timeline-segments-container">
            {candidateSchedule.interviewSlots.map((interviewSlot: InterviewSlot, slotIndex: number) => (
              <React.Fragment key={slotIndex}>
                {/* Welcome Phase */}
                {renderSegment(
                  interviewSlot.timeSlot.startTime,
                  interviewSlot.casusStartTime,
                  'darkblue-segment',
                  'Welcome'
                )}
                {/* Casus Phase */}
                {renderSegment(
                  interviewSlot.casusStartTime,
                  interviewSlot.correctionStartTime,
                  'neutral-segment',
                  'Casus'
                )}
                {/* Correction Phase */}
                {renderSegment(
                  interviewSlot.correctionStartTime,
                  interviewSlot.meetingStartTime,
                  'lightblue-segment',
                  'Correction'
                )}
                {/* Interview Phase */}
                {renderSegment(
                  interviewSlot.meetingStartTime,
                  interviewSlot.debriefingStartTime,
                  'darkblue-segment',
                  'Interview'
                )}
                {/* Debriefing Phase */}
                {renderSegment(
                  interviewSlot.debriefingStartTime,
                  interviewSlot.timeSlot.endTime,
                  'lightblue-segment',
                  'Debriefing'
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TimelineVisualization;

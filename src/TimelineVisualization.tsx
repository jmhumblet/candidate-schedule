import React, { useState, useEffect } from 'react';
import { StructuredSchedule, CandidateSchedule } from './domain/scheduleTypes';
import { InterviewSlot } from './domain/interviewSlot';
import Time from './domain/time';
import './TimelineVisualization.css';

interface TimelineVisualizationProps {
  schedule: StructuredSchedule;
}

const timeToMinutes = (time: Time): number => time.hour * 60 + time.minute;
const PIXELS_PER_MINUTE = 2;

interface TimelineHeaderProps {
  startTime: Time;
  endTime: Time;
  pixelsPerMinute: number;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({ startTime, endTime, pixelsPerMinute }) => {
  const headerWidth = (timeToMinutes(endTime) - timeToMinutes(startTime)) * pixelsPerMinute;
  const timeMarkers = [];

  // Ensure startTime and endTime are valid before proceeding
  if (!startTime || !endTime) {
    return null;
  }

  const startHour = startTime.hour;
  // Loop until the hour of the end time.
  // For example, if endTime is 17:30, we want markers up to 17:00.
  // If endTime is 17:00, we also want a marker at 17:00.
  const endHourLoop = endTime.minute === 0 ? endTime.hour + 1 : endTime.hour +1;


  for (let hour = startHour; hour < endHourLoop; hour++) {
    const markerTime = new Time(hour, 0);
    // Ensure markerTime is not earlier than startTime and not later than endTime
    if (timeToMinutes(markerTime) < timeToMinutes(startTime) || timeToMinutes(markerTime) > timeToMinutes(endTime)) {
        // Special case for the very first marker if startTime is not on the hour
        if (hour === startHour && startTime.minute > 0) {
            // This marker will be for startTime itself, positioned at 0
             const position = (timeToMinutes(startTime) - timeToMinutes(startTime)) * pixelsPerMinute;
             timeMarkers.push(
                <div
                    key={`marker-start`}
                    className="time-marker"
                    style={{ left: `${position}px` }}
                    title={startTime.toString()}
                >
                    {startTime.toString()}
                </div>
            );
            continue; // continue to next hour for regular hourly markers
        } else {
            continue; // Skip markers outside the overall time range
        }
    }


    const position = (timeToMinutes(markerTime) - timeToMinutes(startTime)) * pixelsPerMinute;
    timeMarkers.push(
      <div
        key={`marker-${hour}`}
        className="time-marker"
        style={{ left: `${position}px` }}
        title={markerTime.toString()}
      >
        {markerTime.toString()}
      </div>
    );
  }

  return (
    <div className="main-timeline-header" style={{ width: `${headerWidth}px` }}>
      {timeMarkers}
    </div>
  );
};

const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({ schedule }) => {
  const [overallDayStartTime, setOverallDayStartTime] = useState<Time | null>(null);
  const [overallDayEndTime, setOverallDayEndTime] = useState<Time | null>(null);

  useEffect(() => {
    const calculateOverallTimes = () => {
      if (!schedule || !schedule.candidateSchedules || schedule.candidateSchedules.length === 0) {
        setOverallDayStartTime(null);
        setOverallDayEndTime(null);
        return;
      }

      let earliestStartTime: Time | null = null;
      let latestEndTime: Time | null = null;

      schedule.candidateSchedules.forEach(candidateSchedule => {
        candidateSchedule.interviewSlots.forEach(slot => {
          if (!earliestStartTime || timeToMinutes(slot.timeSlot.startTime) < timeToMinutes(earliestStartTime)) {
            earliestStartTime = slot.timeSlot.startTime;
          }
          if (!latestEndTime || timeToMinutes(slot.timeSlot.endTime) > timeToMinutes(latestEndTime)) {
            latestEndTime = slot.timeSlot.endTime;
          }
        });
      });

      setOverallDayStartTime(earliestStartTime);
      setOverallDayEndTime(latestEndTime);
    };

    calculateOverallTimes();
  }, [schedule]);

  if (!schedule || !schedule.candidateSchedules) {
    return <p>No schedule data available.</p>;
  }

  // Display overall start and end times (optional, for debugging or UI)
  // console.log("Overall Day Start Time:", overallDayStartTime?.toString());
  // console.log("Overall Day End Time:", overallDayEndTime?.toString());

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
      {overallDayStartTime && overallDayEndTime && (
        <TimelineHeader
          startTime={overallDayStartTime}
          endTime={overallDayEndTime}
          pixelsPerMinute={PIXELS_PER_MINUTE}
        />
      )}
      {schedule.candidateSchedules.map((candidateSchedule: CandidateSchedule, index: number) => (
        <div key={index} className="candidate-entry"> {/* Changed from candidate-row to avoid conflict if styles differ */}
          <div className="candidate-name">{candidateSchedule.candidate.name}</div>
          <div className="timeline-segments-container">
            {candidateSchedule.interviewSlots.length > 0 && overallDayStartTime && (() => {
              // Assuming interviewSlots are sorted or the first one is the earliest for offset calculation
              const candidateFirstActivityStartTime = candidateSchedule.interviewSlots[0].timeSlot.startTime;
              const offsetMinutes = timeToMinutes(candidateFirstActivityStartTime) - timeToMinutes(overallDayStartTime);

              if (offsetMinutes > 0) {
                const offsetWidth = offsetMinutes * PIXELS_PER_MINUTE;
                // Adding explicit height here as per the example in the subtask description
                return <div className="timeline-offset-segment" style={{ width: `${offsetWidth}px`, height: '40px' }} />;
              }
              return null;
            })()}
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

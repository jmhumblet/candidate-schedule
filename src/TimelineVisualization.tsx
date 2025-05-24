import React, { useState, useEffect } from 'react';
import { Slot, InterviewSlot, LunchSlot, FinalDebriefingSlot, JuryWelcomeSlot } from './domain/interviewSlot';
import { Candidate } from './domain/parameters'; // Assuming Candidate is here
import Time from './domain/time';
import './TimelineVisualization.css';

interface TimelineVisualizationProps {
  slots: Slot[];
}

// Define a type for the processed candidate schedule structure
interface ProcessedCandidateSchedule {
  candidate: Candidate;
  interviewSlots: InterviewSlot[];
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

  if (!startTime || !endTime) {
    return null;
  }

  const startHour = startTime.hour;
  const endHourLoop = endTime.minute === 0 ? endTime.hour + 1 : endTime.hour +1;

  for (let hour = startHour; hour < endHourLoop; hour++) {
    const markerTime = new Time(hour, 0);
    if (timeToMinutes(markerTime) < timeToMinutes(startTime) || timeToMinutes(markerTime) > timeToMinutes(endTime)) {
        if (hour === startHour && startTime.minute > 0) {
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
            continue; 
        } else {
            continue; 
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

// Helper functions for global slots
const getGlobalSlotName = (slot: Slot): string => {
  if (slot instanceof LunchSlot) return "Lunch Break";
  if (slot instanceof FinalDebriefingSlot) return "Final Debriefing";
  if (slot instanceof JuryWelcomeSlot) return "Jury Welcome";
  return "Unknown Event";
};

const getGlobalSlotSegmentClass = (slot: Slot): string => {
  if (slot instanceof LunchSlot) return "lunch-segment";
  if (slot instanceof FinalDebriefingSlot) return "final-debriefing-segment";
  if (slot instanceof JuryWelcomeSlot) return "jury-welcome-segment";
  return "unknown-segment";
};

const TimelineVisualization: React.FC<TimelineVisualizationProps> = ({ slots }) => {
  const [overallDayStartTime, setOverallDayStartTime] = useState<Time | null>(null);
  const [overallDayEndTime, setOverallDayEndTime] = useState<Time | null>(null);
  const [processedCandidateSchedules, setProcessedCandidateSchedules] = useState<ProcessedCandidateSchedule[]>([]);
  const [processedGlobalSlots, setProcessedGlobalSlots] = useState<Slot[]>([]);

  useEffect(() => {
    const calculateOverallTimes = () => {
      if (!slots || slots.length === 0) {
        setOverallDayStartTime(null);
        setOverallDayEndTime(null);
        return;
      }
      let earliestStartTime: Time | null = null;
      let latestEndTime: Time | null = null;
      slots.forEach(slot => {
        if (!earliestStartTime || timeToMinutes(slot.timeSlot.startTime) < timeToMinutes(earliestStartTime)) {
          earliestStartTime = slot.timeSlot.startTime;
        }
        if (!latestEndTime || timeToMinutes(slot.timeSlot.endTime) > timeToMinutes(latestEndTime)) {
          latestEndTime = slot.timeSlot.endTime;
        }
      });
      setOverallDayStartTime(earliestStartTime);
      setOverallDayEndTime(latestEndTime);
    };

    calculateOverallTimes();

    if (!slots || slots.length === 0) {
      setProcessedCandidateSchedules([]);
      setProcessedGlobalSlots([]);
      return;
    }

    const interviewSlotsByCandidate = new Map<string, { candidate: Candidate, interviewSlots: InterviewSlot[] }>();
    const globalSlots: Slot[] = [];

    slots.forEach(slot => {
      if (slot instanceof InterviewSlot) {
        const candidateId = slot.candidate.id;
        if (!interviewSlotsByCandidate.has(candidateId)) {
          interviewSlotsByCandidate.set(candidateId, { candidate: slot.candidate, interviewSlots: [] });
        }
        interviewSlotsByCandidate.get(candidateId)!.interviewSlots.push(slot);
      } else if (slot instanceof LunchSlot || slot instanceof FinalDebriefingSlot || slot instanceof JuryWelcomeSlot) {
        globalSlots.push(slot);
      }
    });

    setProcessedCandidateSchedules(Array.from(interviewSlotsByCandidate.values()));
    // Sort global slots by start time before setting state
    globalSlots.sort((a, b) => timeToMinutes(a.timeSlot.startTime) - timeToMinutes(b.timeSlot.startTime));
    setProcessedGlobalSlots(globalSlots);

  }, [slots]);

  if (!slots || slots.length === 0) {
    return <p>No schedule data available.</p>;
  }

  const renderSegment = (startTime: Time, endTime: Time, className: string, label: string) => {
    const startTimeInMinutes = timeToMinutes(startTime);
    const endTimeInMinutes = timeToMinutes(endTime);
    const durationInMinutes = endTimeInMinutes - startTimeInMinutes;
    
    if (durationInMinutes <= 0) return null;

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
      {/* Render Processed Candidate Schedules */}
      {processedCandidateSchedules.map((candidateSchedule, index) => (
        <div key={candidateSchedule.candidate.id || index} className="candidate-entry">
          <div className="candidate-name">{candidateSchedule.candidate.name}</div>
          <div className="timeline-segments-container">
            {candidateSchedule.interviewSlots.length > 0 && overallDayStartTime && (() => {
              const candidateFirstActivityStartTime = candidateSchedule.interviewSlots[0].timeSlot.startTime;
              const offsetMinutes = timeToMinutes(candidateFirstActivityStartTime) - timeToMinutes(overallDayStartTime);
              if (offsetMinutes > 0) {
                const offsetWidth = offsetMinutes * PIXELS_PER_MINUTE;
                return <div className="timeline-offset-segment" style={{ width: `${offsetWidth}px`, height: '40px' }} />;
              }
              return null;
            })()}
            {candidateSchedule.interviewSlots.map((interviewSlot, slotIndex) => (
              <React.Fragment key={slotIndex}>
                {renderSegment(
                  interviewSlot.timeSlot.startTime,
                  interviewSlot.casusStartTime,
                  'darkblue-segment',
                  'Welcome'
                )}
                {renderSegment(
                  interviewSlot.casusStartTime,
                  interviewSlot.correctionStartTime,
                  'neutral-segment',
                  'Casus'
                )}
                {renderSegment(
                  interviewSlot.correctionStartTime,
                  interviewSlot.meetingStartTime,
                  'lightblue-segment',
                  'Correction'
                )}
                {renderSegment(
                  interviewSlot.meetingStartTime,
                  interviewSlot.debriefingStartTime,
                  'darkblue-segment',
                  'Interview'
                )}
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

      {/* Render Processed Global Slots */}
      {processedGlobalSlots.map((globalSlot, index) => {
        const slotName = getGlobalSlotName(globalSlot);
        const segmentClass = getGlobalSlotSegmentClass(globalSlot);
        let offsetSegmentRender = null;

        if (overallDayStartTime && globalSlot.timeSlot.startTime) {
          const offsetMinutes = timeToMinutes(globalSlot.timeSlot.startTime) - timeToMinutes(overallDayStartTime);
          if (offsetMinutes > 0) {
            const offsetWidth = offsetMinutes * PIXELS_PER_MINUTE;
            offsetSegmentRender = <div className="timeline-offset-segment" style={{ width: `${offsetWidth}px`, height: '40px' }} />;
          }
        }

        return (
          <div key={`global-${index}`} className="global-slot-entry">
            <div className="global-slot-name">{slotName}</div>
            <div className="timeline-segments-container">
              {offsetSegmentRender}
              {renderSegment(
                globalSlot.timeSlot.startTime,
                globalSlot.timeSlot.endTime,
                segmentClass,
                slotName
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimelineVisualization;

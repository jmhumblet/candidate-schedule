import React, { useMemo } from 'react';
import { Slot, InterviewSlot, LunchSlot, FinalDebriefingSlot, JuryWelcomeSlot } from './domain/interviewSlot';
import { Candidate } from './domain/parameters'; // Assuming Candidate is here
import Time from './domain/time';
import './TimelineVisualization.css';

interface TimelineVisualizationProps {
  slots: Slot[];
}

// New Unified Item Types
interface RenderableCandidateSchedule {
  type: 'candidate';
  candidate: Candidate;
  interviewSlots: InterviewSlot[];
  sortTime: Time; // Earliest start time for this candidate
}

interface RenderableGlobalSlot {
  type: 'global';
  slot: LunchSlot | FinalDebriefingSlot | JuryWelcomeSlot;
  sortTime: Time; // Start time of the global slot
}

type RenderableItem = RenderableCandidateSchedule | RenderableGlobalSlot;


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
  if (slot instanceof LunchSlot) return "Pause déjeuner";
  if (slot instanceof FinalDebriefingSlot) return "Débriefing final";
  if (slot instanceof JuryWelcomeSlot) return "Accueil du jury";
  return "Événement inconnu";
};

const getGlobalSlotSegmentClass = (slot: Slot): string => {
  if (slot instanceof LunchSlot) return "lunch-segment";
  if (slot instanceof FinalDebriefingSlot) return "final-debriefing-segment";
  if (slot instanceof JuryWelcomeSlot) return "jury-welcome-segment";
  return "unknown-segment";
};

const TimelineVisualization: React.FC<TimelineVisualizationProps> = React.memo(({ slots }) => {

  const { overallDayStartTime, overallDayEndTime } = useMemo(() => {
    if (!slots || slots.length === 0) {
        return { overallDayStartTime: null, overallDayEndTime: null };
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
    return { overallDayStartTime: earliestStartTime, overallDayEndTime: latestEndTime };
  }, [slots]);

  const itemsToRender = useMemo(() => {
    if (!slots || slots.length === 0) {
      return [];
    }

    const interviewSlotsByCandidate = new Map<string, { candidate: Candidate, interviewSlots: InterviewSlot[] }>();
    const globalSlotInputs: (LunchSlot | FinalDebriefingSlot | JuryWelcomeSlot)[] = [];

    slots.forEach(slot => {
      if (slot instanceof InterviewSlot) {
        const candidateName = slot.candidate.name;
        if (!interviewSlotsByCandidate.has(candidateName)) {
          interviewSlotsByCandidate.set(candidateName, { candidate: slot.candidate, interviewSlots: [] });
        }
        const candidateData = interviewSlotsByCandidate.get(candidateName)!;
        candidateData.interviewSlots.push(slot);
        // Ensure interviewSlots for a candidate are sorted by start time (overall slot start)
        candidateData.interviewSlots.sort((a,b) => timeToMinutes(a.timeSlot.startTime) - timeToMinutes(b.timeSlot.startTime));

      } else if (slot instanceof LunchSlot || slot instanceof FinalDebriefingSlot || slot instanceof JuryWelcomeSlot) {
        globalSlotInputs.push(slot);
      }
    });

    const candidateRenderItems: RenderableCandidateSchedule[] = Array.from(interviewSlotsByCandidate.values())
      .map(cs => ({
        type: 'candidate',
        candidate: cs.candidate,
        interviewSlots: cs.interviewSlots, 
        // sortTime is now the correctionStartTime of the first interview slot for the candidate
        sortTime: cs.interviewSlots.length > 0 ? cs.interviewSlots[0].correctionStartTime : new Time(23,59) 
      }));

    const globalRenderItems: RenderableGlobalSlot[] = globalSlotInputs.map(slot => ({
      type: 'global',
      slot: slot,
      sortTime: slot.timeSlot.startTime
    }));

    const combinedItems: RenderableItem[] = [...candidateRenderItems, ...globalRenderItems];
    combinedItems.sort((a, b) => timeToMinutes(a.sortTime) - timeToMinutes(b.sortTime));

    return combinedItems;
  }, [slots]);

  if (!slots || slots.length === 0) {
    return <p>Aucun horaire disponible.</p>;
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
      <h2>Chronologie des candidats</h2>
      {overallDayStartTime && overallDayEndTime && (
        <TimelineHeader
          startTime={overallDayStartTime}
          endTime={overallDayEndTime}
          pixelsPerMinute={PIXELS_PER_MINUTE}
        />
      )}
      
      {/* Unified Rendering Loop */}
      {itemsToRender.map((item, index) => {
        if (item.type === 'candidate') {
          const candidateSchedule = item as RenderableCandidateSchedule;
          // For offset calculation of candidate row, use the overall start time of the first interview slot
          // This is different from sortTime which is now correctionStartTime
          const candidateRowDisplayStartTime = candidateSchedule.interviewSlots.length > 0 
                                            ? candidateSchedule.interviewSlots[0].timeSlot.startTime 
                                            : candidateSchedule.sortTime; // Fallback to sortTime if no slots (should not happen)

          return (
            <div key={candidateSchedule.candidate.name || `candidate-${index}`} className="candidate-entry">
              <div className="candidate-name">{candidateSchedule.candidate.name}</div>
              <div className="timeline-segments-container">
                {candidateSchedule.interviewSlots.length > 0 && overallDayStartTime && (() => {
                  const offsetMinutes = timeToMinutes(candidateRowDisplayStartTime) - timeToMinutes(overallDayStartTime);
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
                      'welcome-segment', 
                      'Accueil'
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
                      'Entretien'
                    )}
                    {renderSegment(
                      interviewSlot.debriefingStartTime,
                      interviewSlot.timeSlot.endTime,
                      'lightblue-segment',
                      'Délibération'
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          );
        } else if (item.type === 'global') {
          const globalSlotItem = item as RenderableGlobalSlot;
          const globalSlot = globalSlotItem.slot; 
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
            <div key={`${slotName}-${index}`} className="global-slot-entry">
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
        }
        return null; // Should not happen if types are correct
      })}
    </div>
  );
});

export default TimelineVisualization;

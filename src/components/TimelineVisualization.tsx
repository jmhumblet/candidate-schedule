import React, { useMemo } from 'react';
import { Slot, InterviewSlot, LunchSlot, FinalDebriefingSlot, JuryWelcomeSlot } from '../domain/interviewSlot';
import { Candidate } from '../domain/parameters';
import Time from '../domain/time';
import './TimelineVisualization.css';

interface TimelineVisualizationProps {
  slots: Slot[];
}

// Unified Item Types
interface RenderableCandidateSchedule {
  type: 'candidate';
  candidate: Candidate;
  interviewSlots: InterviewSlot[];
  sortTime: Time;
}

interface RenderableGlobalSlot {
  type: 'global';
  slot: LunchSlot | FinalDebriefingSlot | JuryWelcomeSlot;
  sortTime: Time;
}

type RenderableItem = RenderableCandidateSchedule | RenderableGlobalSlot;

const timeToMinutes = (time: Time): number => time.hour * 60 + time.minute;
const PIXELS_PER_MINUTE = 2;
const HOUR_WIDTH = 60 * PIXELS_PER_MINUTE;

const getGlobalSlotName = (slot: Slot): string => {
  if (slot.type === 'lunch') return "Pause déjeuner";
  if (slot.type === 'final_debriefing') return "Débriefing final";
  if (slot.type === 'jury_welcome') return "Accueil du jury";
  return "Événement inconnu";
};

const getGlobalSlotSegmentClass = (slot: Slot): string => {
  if (slot.type === 'lunch') return "segment-darkblue"; // Match CSS class
  if (slot.type === 'final_debriefing') return "segment-darkblue";
  if (slot.type === 'jury_welcome') return "segment-darkblue";
  return "segment-unknown";
};

const TimelineVisualization: React.FC<TimelineVisualizationProps> = React.memo(({ slots }) => {

  // Calculate global start/end times, rounded to hours for the grid
  const { roundedStartTime, totalWidth, totalHours, startHour } = useMemo(() => {
    if (!slots || slots.length === 0) {
      return { roundedStartTime: null, totalWidth: 0, totalHours: 0, startHour: 0 };
    }

    let minMinutes = Infinity;
    let maxMinutes = -Infinity;

    slots.forEach(slot => {
      const start = timeToMinutes(slot.timeSlot.startTime);
      const end = timeToMinutes(slot.timeSlot.endTime);
      if (start < minMinutes) minMinutes = start;
      if (end > maxMinutes) maxMinutes = end;
    });

    const startHour = Math.floor(minMinutes / 60);
    const endHour = Math.ceil(maxMinutes / 60);
    const totalHours = endHour - startHour;

    // Ensure at least one hour if something is weird, though typical schedule is > 1h
    const safeTotalHours = Math.max(1, totalHours);

    return {
      roundedStartTime: new Time(startHour, 0),
      totalWidth: safeTotalHours * 60 * PIXELS_PER_MINUTE,
      totalHours: safeTotalHours,
      startHour
    };
  }, [slots]);

  const itemsToRender = useMemo(() => {
    if (!slots || slots.length === 0) return [];

    const interviewSlotsByCandidate = new Map<string, { candidate: Candidate, interviewSlots: InterviewSlot[] }>();
    const globalSlotInputs: (LunchSlot | FinalDebriefingSlot | JuryWelcomeSlot)[] = [];

    slots.forEach(slot => {
      if (slot.type === 'interview') {
        const interviewSlot = slot as InterviewSlot;
        const candidateName = interviewSlot.candidate.name;
        if (!interviewSlotsByCandidate.has(candidateName)) {
          interviewSlotsByCandidate.set(candidateName, { candidate: interviewSlot.candidate, interviewSlots: [] });
        }
        interviewSlotsByCandidate.get(candidateName)!.interviewSlots.push(interviewSlot);
      } else if (slot.type === 'lunch' || slot.type === 'final_debriefing' || slot.type === 'jury_welcome') {
        globalSlotInputs.push(slot as LunchSlot | FinalDebriefingSlot | JuryWelcomeSlot);
      }
    });

    interviewSlotsByCandidate.forEach(candidateData => {
      candidateData.interviewSlots.sort((a,b) => timeToMinutes(a.timeSlot.startTime) - timeToMinutes(b.timeSlot.startTime));
    });

    const candidateRenderItems: RenderableCandidateSchedule[] = Array.from(interviewSlotsByCandidate.values())
      .map(cs => ({
        type: 'candidate',
        candidate: cs.candidate,
        interviewSlots: cs.interviewSlots, 
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

  if (!slots || slots.length === 0 || !roundedStartTime) {
    return <p>Aucun horaire disponible.</p>;
  }

  // Render Time Markers
  const renderTimeMarkers = () => {
    const markers = [];
    for (let i = 0; i <= totalHours; i++) {
      const hour = startHour + i;
      const left = i * 60 * PIXELS_PER_MINUTE;
      const isFirst = i === 0;

      // Adjust positioning for the first marker to prevent clipping
      const markerStyle: React.CSSProperties = isFirst
        ? { left: `${left}px`, transform: 'none' }
        : { left: `${left}px` };

      const tickStyle: React.CSSProperties = isFirst
        ? { left: '0', height: '5px', bottom: '0' }
        : { height: '5px', bottom: '0' }; // Default CSS handles left: 50%

      const labelStyle: React.CSSProperties = isFirst
        ? { position: 'absolute', bottom: '8px', left: '2px', transform: 'none' }
        : { position: 'absolute', bottom: '8px', transform: 'translateX(-50%)' };

      markers.push(
        <div key={hour} className="time-marker" style={markerStyle}>
           {/* Tick Mark */}
           <div className="time-marker-tick" style={tickStyle}></div>
           {/* Label */}
           <span style={labelStyle}>
             {hour.toString().padStart(2, '0')}h00
           </span>
        </div>
      );
    }
    return markers;
  };

  const renderSegment = (startTime: Time, endTime: Time, className: string, label: string, key: string) => {
    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    const globalStartMinutes = timeToMinutes(roundedStartTime);
    
    const offsetMinutes = startMinutes - globalStartMinutes;
    const durationMinutes = endMinutes - startMinutes;

    if (durationMinutes <= 0) return null;

    const left = offsetMinutes * PIXELS_PER_MINUTE;
    const width = Math.max(0, durationMinutes * PIXELS_PER_MINUTE); // Subtract borders if needed, but flex/abs handles it well

    return (
      <div
        key={key}
        className={`timeline-segment ${className}`}
        style={{ left: `${left}px`, width: `${width}px` }}
        title={`${label}: ${startTime.toString()} - ${endTime.toString()}`}
      >
        {durationMinutes > 15 && <span className="segment-time me-1">{startTime.toString()}</span>}
        {durationMinutes > 30 && <span className="segment-label">{label}</span>}
      </div>
    );
  };

  // Inline style for grid background
  const gridBackgroundStyle: React.CSSProperties = {
    backgroundImage: `linear-gradient(to right, var(--border-color-subtle) 1px, transparent 1px)`,
    backgroundSize: `${HOUR_WIDTH}px 100%`,
    backgroundPosition: '0 0', // Aligned because we start at roundedStartTime (xx:00)
    width: `${totalWidth}px`
  };

  return (
    <div className="timeline-container">
      <h2>Chronologie des candidats</h2>
      
      <div className="timeline-grid">
        {/* Top Left Corner */}
        <div className="timeline-corner">
          Horaire
        </div>

        {/* Top Header Track */}
        <div className="timeline-time-header" style={{ width: totalWidth }}>
          {renderTimeMarkers()}
          {/* Also render background ticks if needed, but markers should suffice */}
        </div>

        {/* Rows */}
        {itemsToRender.map((item, index) => {
          const isGlobal = item.type === 'global';
          const rowKey = isGlobal ? `global-${index}` : `candidate-${(item as RenderableCandidateSchedule).candidate.name}`;
          const label = isGlobal ? getGlobalSlotName((item as RenderableGlobalSlot).slot) : (item as RenderableCandidateSchedule).candidate.name;
          const rowClass = isGlobal ? 'row-global' : '';

          return (
            <React.Fragment key={rowKey}>
              {/* Row Label */}
              <div className={`timeline-row-label ${rowClass}`}>
                {label}
              </div>

              {/* Row Track */}
              <div className={`timeline-row-track ${isGlobal ? 'track-global' : ''}`} style={gridBackgroundStyle}>
                {isGlobal ? (
                   // Global Slot Render
                   renderSegment(
                     (item as RenderableGlobalSlot).slot.timeSlot.startTime,
                     (item as RenderableGlobalSlot).slot.timeSlot.endTime,
                     getGlobalSlotSegmentClass((item as RenderableGlobalSlot).slot),
                     label,
                     'seg-global'
                   )
                ) : (
                   // Candidate Slots Render
                   (item as RenderableCandidateSchedule).interviewSlots.map((slot, sIdx) => (
                     <React.Fragment key={`slot-${sIdx}`}>
                        {renderSegment(slot.timeSlot.startTime, slot.casusStartTime, 'segment-welcome', 'Accueil', `s${sIdx}-1`)}
                        {renderSegment(slot.casusStartTime, slot.correctionStartTime, 'segment-neutral', 'Casus', `s${sIdx}-2`)}
                        {renderSegment(slot.correctionStartTime, slot.meetingStartTime, 'segment-lightblue', 'Correction', `s${sIdx}-3`)}
                        {renderSegment(slot.meetingStartTime, slot.debriefingStartTime, 'segment-darkblue', 'Entretien', `s${sIdx}-4`)}
                        {renderSegment(slot.debriefingStartTime, slot.timeSlot.endTime, 'segment-lightblue', 'Délibération', `s${sIdx}-5`)}
                     </React.Fragment>
                   ))
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
});

export default TimelineVisualization;

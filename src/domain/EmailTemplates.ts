import { Slot, InterviewSlot } from "./interviewSlot";

export type EmailTemplateType = 'candidate' | 'jury' | 'welcome';

export interface EmailTemplate {
    subject: string;
    body: string;
}

export type EmailTemplatesMap = Record<EmailTemplateType, EmailTemplate>;

export const DEFAULT_TEMPLATES: EmailTemplatesMap = {
    candidate: {
        subject: "Confirmation de votre entretien",
        body: "Bonjour {{name}},\n\nVoici les détails de votre entretien du {{date}} :\n\nArrivée : {{startTime}}\nCasus : {{casusTime}}\nCorrection : {{correctionTime}}\nEntretien : {{interviewTime}}\nDébriefing : {{debriefingTime}}\n\nCordialement,"
    },
    jury: {
        subject: "Planning du jury - {{date}}",
        body: "Bonjour,\n\nVoici le planning pour la journée du {{date}} :\n\n{{schedule}}\n\nCordialement,"
    },
    welcome: {
        subject: "Liste des arrivées - {{date}}",
        body: "Bonjour,\n\nVoici les arrivées prévues pour le {{date}} :\n\n{{schedule}}\n\nCordialement,"
    }
};

const STORAGE_KEY = 'email_templates';

export class EmailTemplateService {
    static getTemplates(): EmailTemplatesMap {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                // Merge with defaults to ensure all keys exist
                return { ...DEFAULT_TEMPLATES, ...parsed };
            } catch (e) {
                console.error("Error parsing templates", e);
                return DEFAULT_TEMPLATES;
            }
        }
        return DEFAULT_TEMPLATES;
    }

    static saveTemplates(templates: EmailTemplatesMap) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }

    static resetTemplates() {
        localStorage.removeItem(STORAGE_KEY);
    }

    static generateCandidateLink(template: EmailTemplate, candidateName: string, date: string, slot: InterviewSlot): string {
        let subject = template.subject;
        let body = template.body;

        const replacements: Record<string, string> = {
            '{{name}}': candidateName,
            '{{date}}': date,
            '{{startTime}}': slot.timeSlot.startTime.toString(),
            '{{casusTime}}': `${slot.casusStartTime} - ${slot.correctionStartTime}`,
            '{{correctionTime}}': `${slot.correctionStartTime} - ${slot.meetingStartTime}`,
            '{{interviewTime}}': `${slot.meetingStartTime} - ${slot.debriefingStartTime}`,
            '{{debriefingTime}}': `${slot.debriefingStartTime} - ${slot.timeSlot.endTime}`
        };

        Object.entries(replacements).forEach(([key, value]) => {
            subject = subject.replaceAll(key, value);
            body = body.replaceAll(key, value);
        });

        return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    static generateJuryLink(template: EmailTemplate, date: string, schedule: Slot[]): string {
        let subject = template.subject;
        let body = template.body;

        const scheduleText = EmailTemplateService.formatSchedule(schedule);

        const replacements: Record<string, string> = {
            '{{date}}': date,
            '{{schedule}}': scheduleText
        };

        Object.entries(replacements).forEach(([key, value]) => {
            subject = subject.replaceAll(key, value);
            body = body.replaceAll(key, value);
        });

        return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    static generateWelcomeLink(template: EmailTemplate, date: string, schedule: Slot[]): string {
        let subject = template.subject;
        let body = template.body;

        const arrivalText = EmailTemplateService.formatArrivals(schedule);

        const replacements: Record<string, string> = {
            '{{date}}': date,
            '{{schedule}}': arrivalText
        };

        Object.entries(replacements).forEach(([key, value]) => {
            subject = subject.replaceAll(key, value);
            body = body.replaceAll(key, value);
        });

        return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    private static formatSchedule(schedule: Slot[]): string {
        type ScheduleEvent = {
            startTime: number; // minutes from midnight
            startTimeStr: string;
            endTimeStr: string;
            description: string;
        };

        const events: ScheduleEvent[] = [];

        schedule.forEach(slot => {
            if (slot.type === 'interview') {
                const s = slot as InterviewSlot;
                // 1. Correction
                events.push({
                    startTime: s.correctionStartTime.hour * 60 + s.correctionStartTime.minute,
                    startTimeStr: s.correctionStartTime.toString(),
                    endTimeStr: s.meetingStartTime.toString(),
                    description: `Correction du casus (${s.candidate.name})`
                });
                // 2. Interview
                events.push({
                    startTime: s.meetingStartTime.hour * 60 + s.meetingStartTime.minute,
                    startTimeStr: s.meetingStartTime.toString(),
                    endTimeStr: s.debriefingStartTime.toString(),
                    description: `Entretien (${s.candidate.name})`
                });
                // 3. Debriefing
                events.push({
                    startTime: s.debriefingStartTime.hour * 60 + s.debriefingStartTime.minute,
                    startTimeStr: s.debriefingStartTime.toString(),
                    endTimeStr: s.timeSlot.endTime.toString(),
                    description: `Débriefing (${s.candidate.name})`
                });
            } else {
                let description = "";
                if (slot.type === 'lunch') {
                    description = "Pause midi";
                } else if (slot.type === 'final_debriefing') {
                    description = "Débriefing final";
                } else if (slot.type === 'jury_welcome') {
                    description = "Accueil du jury";
                } else {
                    description = "Autre";
                }

                events.push({
                    startTime: slot.timeSlot.startTime.hour * 60 + slot.timeSlot.startTime.minute,
                    startTimeStr: slot.timeSlot.startTime.toString(),
                    endTimeStr: slot.timeSlot.endTime.toString(),
                    description: description
                });
            }
        });

        // Sort by start time
        const sortedEvents = events.sort((a, b) => a.startTime - b.startTime);

        return sortedEvents.map(event => {
            return `${event.startTimeStr} - ${event.endTimeStr} : ${event.description}`;
        }).join('\n');
    }

    private static formatArrivals(schedule: Slot[]): string {
        // Only interested in candidates
        const candidates = schedule.filter(s => s.type === 'interview') as InterviewSlot[];

        // Sort by start time (arrival)
        const sorted = candidates.sort((a, b) =>
            (a.timeSlot.startTime.hour * 60 + a.timeSlot.startTime.minute) -
            (b.timeSlot.startTime.hour * 60 + b.timeSlot.startTime.minute)
        );

        return sorted.map(slot => {
            return `${slot.timeSlot.startTime} : ${slot.candidate.name}`;
        }).join('\n');
    }
}

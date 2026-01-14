import { Slot, InterviewSlot, JuryWelcomeSlot, LunchSlot, FinalDebriefingSlot } from "./interviewSlot";

export type EmailTemplateType = 'candidate' | 'jury' | 'welcome';

export interface EmailTemplate {
    subject: string;
    body: string;
}

export const DEFAULT_TEMPLATES: Record<EmailTemplateType, EmailTemplate> = {
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
    static getTemplates(): Record<EmailTemplateType, EmailTemplate> {
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

    static saveTemplates(templates: Record<EmailTemplateType, EmailTemplate>) {
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
        // Sort by start time
        const sorted = [...schedule].sort((a, b) =>
            (a.timeSlot.startTime.hour * 60 + a.timeSlot.startTime.minute) -
            (b.timeSlot.startTime.hour * 60 + b.timeSlot.startTime.minute)
        );

        return sorted.map(slot => {
            const time = `${slot.timeSlot.startTime} - ${slot.timeSlot.endTime}`;
            let description = "";

            if (slot instanceof InterviewSlot) {
                description = `Entretien: ${slot.candidate.name}`;
            } else if (slot instanceof LunchSlot) {
                description = "Pause midi";
            } else if (slot instanceof FinalDebriefingSlot) {
                description = "Débriefing final";
            } else if (slot instanceof JuryWelcomeSlot) {
                description = "Accueil du jury";
            } else {
                description = "Autre";
            }

            return `${time} : ${description}`;
        }).join('\n');
    }

    private static formatArrivals(schedule: Slot[]): string {
        // Only interested in candidates
        const candidates = schedule.filter(s => s instanceof InterviewSlot) as InterviewSlot[];

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

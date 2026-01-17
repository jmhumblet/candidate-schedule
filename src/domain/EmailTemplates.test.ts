import { EmailTemplateService, DEFAULT_TEMPLATES } from './EmailTemplates';
import { InterviewSlot, LunchSlot, JuryWelcomeSlot } from './interviewSlot';
import { Candidate, InterviewParameters, Duration } from './parameters';
import Time from './time';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('EmailTemplateService', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    test('getTemplates returns default templates if storage is empty', () => {
        const templates = EmailTemplateService.getTemplates();
        expect(templates).toEqual(DEFAULT_TEMPLATES);
    });

    test('saveTemplates stores templates in localStorage', () => {
        const newTemplates = { ...DEFAULT_TEMPLATES };
        newTemplates.candidate.subject = "New Subject";
        EmailTemplateService.saveTemplates(newTemplates);

        const stored = EmailTemplateService.getTemplates();
        expect(stored.candidate.subject).toBe("New Subject");
    });

    test('generateCandidateLink replaces placeholders', () => {
        const candidate = new Candidate("John Doe", null);
        const startTime = new Time(9, 0);
        const params = new InterviewParameters(
            new Duration(0, 10), // welcome
            new Duration(0, 30), // casus
            new Duration(0, 10), // correction
            new Duration(0, 20), // interview
            new Duration(0, 10)  // debriefing
        );
        const slot = new InterviewSlot(candidate, startTime, params);

        const template = {
            subject: "Meeting with {{name}}",
            body: "Hi {{name}}, come at {{startTime}} on {{date}}."
        };

        const link = EmailTemplateService.generateCandidateLink(template, "John Doe", "12/12/2023", slot);

        // encodeURIComponent check
        // "Meeting with John Doe" -> "Meeting%20with%20John%20Doe"
        expect(link).toContain("subject=Meeting%20with%20John%20Doe");
        // "Hi John Doe, come at 09h00 on 12/12/2023."
        expect(link).toContain("body=Hi%20John%20Doe%2C%20come%20at%2009h00%20on%2012%2F12%2F2023.");
    });

    test('generateJuryLink formats schedule with detailed interview parts and other slots', () => {
        const candidate = new Candidate("Alice", null);
        const startTime = new Time(9, 0);
        // Total duration: 10+30+10+20+10 = 80 mins = 1h20. End time: 10h20.
        // Correction start: 9h00 + 10 + 30 = 9h40
        // Correction end / Interview start: 9h40 + 10 = 9h50
        // Interview end / Debriefing start: 9h50 + 20 = 10h10
        // Debriefing end: 10h10 + 10 = 10h20
        const params = new InterviewParameters(
            new Duration(0, 10), // welcome
            new Duration(0, 30), // casus
            new Duration(0, 10), // correction
            new Duration(0, 20), // interview
            new Duration(0, 10)  // debriefing
        );
        const slot = new InterviewSlot(candidate, startTime, params);

        const lunchStart = new Time(12, 0);
        const lunchDuration = new Duration(1, 0);
        const lunchSlot = new LunchSlot(lunchStart, lunchDuration);

        // Jury welcome at 8h45
        const juryWelcome = new JuryWelcomeSlot(new Time(8, 45));

        const schedule = [slot, lunchSlot, juryWelcome];
        const date = "12/12/2023";
        const template = DEFAULT_TEMPLATES.jury;

        const link = EmailTemplateService.generateJuryLink(template, date, schedule);
        const decodedLink = decodeURIComponent(link);

        expect(decodedLink).toContain("08h45 - 09h00 : Accueil du jury");
        expect(decodedLink).toContain("09h40 - 09h50 : Correction du casus (Alice)");
        expect(decodedLink).toContain("09h50 - 10h10 : Entretien (Alice)");
        expect(decodedLink).toContain("10h10 - 10h20 : Débriefing (Alice)");
        expect(decodedLink).toContain("12h00 - 13h00 : Pause midi");

        // Ensure the old generic "Entretien" line is NOT present
        expect(decodedLink).not.toContain("09h00 - 10h20 : Entretien: Alice");
    });
});

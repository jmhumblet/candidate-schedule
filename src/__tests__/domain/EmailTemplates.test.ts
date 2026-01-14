import { EmailTemplateService, DEFAULT_TEMPLATES } from '../../domain/EmailTemplates';
import { InterviewSlot } from '../../domain/interviewSlot';
import { Candidate, InterviewParameters, Duration } from '../../domain/parameters';
import Time from '../../domain/time';

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
});

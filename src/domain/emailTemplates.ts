export interface EmailTemplate {
    subject: string;
    body: string;
}

export interface EmailTemplates {
    candidate: EmailTemplate;
    jury: EmailTemplate;
    welcome: EmailTemplate;
}

export const defaultTemplates: EmailTemplates = {
    candidate: {
        subject: "Confirmation d'entretien - {jobTitle}",
        body: "Bonjour {candidateName},\n\nNous vous confirmons votre entretien pour le poste de {jobTitle}.\n\nDate : {juryDate}\nHeure d'arrivée : {startTime}\n\nCordialement,"
    },
    jury: {
        subject: "Planning du jury - {jobTitle} - {juryDate}",
        body: "Bonjour,\n\nVoici le planning pour la session de recrutement du {juryDate} ({jobTitle}) :\n\n{schedule}\n\nCordialement,"
    },
    welcome: {
        subject: "Planning des arrivées - {jobTitle} - {juryDate}",
        body: "Bonjour,\n\nVoici la liste des arrivées des candidats pour le {juryDate} :\n\n{arrivals}\n\nCordialement,"
    }
};

const STORAGE_KEY = 'email_templates';

export const loadTemplates = (): EmailTemplates => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
        try {
            return { ...defaultTemplates, ...JSON.parse(stored) };
        } catch (e) {
            console.error("Failed to parse stored templates", e);
        }
    }
    return defaultTemplates;
};

export const saveTemplates = (templates: EmailTemplates) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
};

export const PLACEHOLDERS = {
    common: [
        { key: '{jobTitle}', label: 'Intitulé du poste' },
        { key: '{juryDate}', label: 'Date du jury' }
    ],
    candidate: [
        { key: '{candidateName}', label: 'Nom du candidat' },
        { key: '{startTime}', label: "Heure d'arrivée" },
        { key: '{casusStart}', label: 'Début casus' },
        { key: '{correctionStart}', label: 'Début correction' },
        { key: '{interviewStart}', label: 'Début entretien' },
        { key: '{debriefStart}', label: 'Début délibération' }
    ],
    jury: [
        { key: '{schedule}', label: 'Planning complet' }
    ],
    welcome: [
        { key: '{arrivals}', label: 'Liste des arrivées' }
    ]
};

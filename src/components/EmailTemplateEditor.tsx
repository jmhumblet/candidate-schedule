import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Tabs, Tab, Badge, OverlayTrigger, Tooltip, Card } from 'react-bootstrap';
import { EmailTemplate, EmailTemplateService, EmailTemplateType, DEFAULT_TEMPLATES } from '../domain/EmailTemplates';

interface EmailTemplateEditorProps {
    show: boolean;
    onHide: () => void;
}

const PLACEHOLDERS: Record<EmailTemplateType, string[]> = {
    candidate: ['{{name}}', '{{date}}', '{{startTime}}', '{{casusTime}}', '{{correctionTime}}', '{{interviewTime}}', '{{debriefingTime}}'],
    jury: ['{{date}}', '{{schedule}}'],
    welcome: ['{{date}}', '{{schedule}}']
};

const EXAMPLE_VALUES: Record<EmailTemplateType, Record<string, string>> = {
    candidate: {
        '{{name}}': 'Jean Dupont',
        '{{date}}': '24/05/2024',
        '{{startTime}}': '08:30',
        '{{casusTime}}': '08:45 - 09:45',
        '{{correctionTime}}': '09:45 - 10:15',
        '{{interviewTime}}': '10:15 - 11:00',
        '{{debriefingTime}}': '11:00 - 11:15'
    },
    jury: {
        '{{date}}': '24/05/2024',
        '{{schedule}}': `08:30 - 08:45 : Accueil du jury\n09:45 - 11:15 : Entretien: Jean Dupont\n13:00 - 14:00 : Pause midi`
    },
    welcome: {
        '{{date}}': '24/05/2024',
        '{{schedule}}': `08:30 : Jean Dupont\n10:30 : Marie Curie`
    }
};

const LABELS: Record<EmailTemplateType, string> = {
    candidate: "Candidats",
    jury: "Jury",
    welcome: "Accueil"
};

const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ show, onHide }) => {
    const [templates, setTemplates] = useState<Record<EmailTemplateType, EmailTemplate>>(DEFAULT_TEMPLATES);
    const [activeTab, setActiveTab] = useState<EmailTemplateType>('candidate');

    useEffect(() => {
        if (show) {
            setTemplates(EmailTemplateService.getTemplates());
        }
    }, [show]);

    const handleChange = (field: 'subject' | 'body', value: string) => {
        setTemplates(prev => ({
            ...prev,
            [activeTab]: {
                ...prev[activeTab],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        EmailTemplateService.saveTemplates(templates);
        onHide();
    };

    const handleReset = () => {
        if (window.confirm("Êtes-vous sûr de vouloir réinitialiser les modèles par défaut ?")) {
            EmailTemplateService.resetTemplates();
            setTemplates(DEFAULT_TEMPLATES);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here but let's keep it simple for now
    };

    const getPreview = (type: EmailTemplateType, template: EmailTemplate) => {
        let subject = template.subject;
        let body = template.body;
        const examples = EXAMPLE_VALUES[type];

        Object.entries(examples).forEach(([key, value]) => {
            subject = subject.replaceAll(key, value);
            body = body.replaceAll(key, value);
        });

        return { subject, body };
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Modèles d'emails</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k as EmailTemplateType)}
                    className="mb-3"
                >
                    {(Object.keys(LABELS) as EmailTemplateType[]).map(type => (
                        <Tab eventKey={type} title={LABELS[type]} key={type}>
                             <div className="mb-3">
                                <small className="text-muted">Cliquez sur un placeholder pour le copier : </small>
                                <div>
                                    {PLACEHOLDERS[type].map(ph => (
                                        <OverlayTrigger
                                            key={ph}
                                            placement="top"
                                            overlay={<Tooltip id={`tooltip-${ph}`}>Ex: {EXAMPLE_VALUES[type][ph]}</Tooltip>}
                                        >
                                            <Badge
                                                bg="info"
                                                className="me-1"
                                                style={{cursor: 'pointer'}}
                                                onClick={() => copyToClipboard(ph)}
                                            >
                                                {ph}
                                            </Badge>
                                        </OverlayTrigger>
                                    ))}
                                </div>
                             </div>

                            <Form.Group className="mb-3">
                                <Form.Label>Sujet</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={templates[type].subject}
                                    onChange={(e) => handleChange('subject', e.target.value)}
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Corps</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={10}
                                    value={templates[type].body}
                                    onChange={(e) => handleChange('body', e.target.value)}
                                />
                            </Form.Group>

                            <Card className="mt-3 bg-light">
                                <Card.Header>Aperçu</Card.Header>
                                <Card.Body>
                                    <h6 className="card-subtitle mb-2 text-muted">Objet : {getPreview(type, templates[type]).subject}</h6>
                                    <pre style={{whiteSpace: 'pre-wrap', fontFamily: 'inherit', marginBottom: 0}}>{getPreview(type, templates[type]).body}</pre>
                                </Card.Body>
                            </Card>
                        </Tab>
                    ))}
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="outline-danger" onClick={handleReset} className="me-auto">
                    Réinitialiser défauts
                </Button>
                <Button variant="secondary" onClick={onHide}>
                    Annuler
                </Button>
                <Button variant="primary" onClick={handleSave}>
                    Sauvegarder
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EmailTemplateEditor;

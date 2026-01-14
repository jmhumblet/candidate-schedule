import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Tabs, Tab, Badge } from 'react-bootstrap';
import { EmailTemplate, EmailTemplateService, EmailTemplateType, DEFAULT_TEMPLATES } from './domain/EmailTemplates';

interface EmailTemplateEditorProps {
    show: boolean;
    onHide: () => void;
}

const PLACEHOLDERS: Record<EmailTemplateType, string[]> = {
    candidate: ['{{name}}', '{{date}}', '{{startTime}}', '{{casusTime}}', '{{correctionTime}}', '{{interviewTime}}', '{{debriefingTime}}'],
    jury: ['{{date}}', '{{schedule}}'],
    welcome: ['{{date}}', '{{schedule}}']
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
                                        <Badge
                                            bg="info"
                                            className="me-1"
                                            key={ph}
                                            style={{cursor: 'pointer'}}
                                            onClick={() => copyToClipboard(ph)}
                                            title="Copier"
                                        >
                                            {ph}
                                        </Badge>
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

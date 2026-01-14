import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Tabs, Tab, Row, Col, Card, Badge } from 'react-bootstrap';
import { EmailTemplates, loadTemplates, saveTemplates, PLACEHOLDERS } from './domain/emailTemplates';

interface EmailTemplateModalProps {
    show: boolean;
    onHide: () => void;
}

const EmailTemplateModal: React.FC<EmailTemplateModalProps> = ({ show, onHide }) => {
    const [templates, setTemplates] = useState<EmailTemplates>(loadTemplates());
    const [activeTab, setActiveTab] = useState<string>('candidate');

    useEffect(() => {
        if (show) {
            setTemplates(loadTemplates());
        }
    }, [show]);

    const handleChange = (type: keyof EmailTemplates, field: 'subject' | 'body', value: string) => {
        setTemplates(prev => ({
            ...prev,
            [type]: {
                ...prev[type],
                [field]: value
            }
        }));
    };

    const handleSave = () => {
        saveTemplates(templates);
        onHide();
    };

    const renderPlaceholders = (type: 'candidate' | 'jury' | 'welcome') => {
        const specific = PLACEHOLDERS[type];
        const common = PLACEHOLDERS.common;
        const all = [...common, ...specific];

        return (
            <div className="mt-3">
                <h6>Variables disponibles :</h6>
                <small className="text-muted d-block mb-2">Glissez-déposez ou copiez ces variables dans le texte.</small>
                <div className="d-flex flex-wrap gap-2">
                    {all.map(p => (
                        <Badge
                            bg="secondary"
                            key={p.key}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData("text", p.key)}
                            style={{ cursor: 'grab' }}
                            title={p.label}
                        >
                            {p.key}
                        </Badge>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <Modal show={show} onHide={onHide} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Gérer les modèles d'e-mails</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k || 'candidate')} className="mb-3">
                    <Tab eventKey="candidate" title="Candidat">
                        <Row>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sujet</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={templates.candidate.subject}
                                        onChange={(e) => handleChange('candidate', 'subject', e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Corps du message</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={10}
                                        value={templates.candidate.body}
                                        onChange={(e) => handleChange('candidate', 'body', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Card className="p-3 bg-light h-100">
                                    {renderPlaceholders('candidate')}
                                </Card>
                            </Col>
                        </Row>
                    </Tab>
                    <Tab eventKey="jury" title="Jury">
                        <Row>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sujet</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={templates.jury.subject}
                                        onChange={(e) => handleChange('jury', 'subject', e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Corps du message</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={10}
                                        value={templates.jury.body}
                                        onChange={(e) => handleChange('jury', 'body', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Card className="p-3 bg-light h-100">
                                    {renderPlaceholders('jury')}
                                </Card>
                            </Col>
                        </Row>
                    </Tab>
                    <Tab eventKey="welcome" title="Accueil">
                        <Row>
                            <Col md={8}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Sujet</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={templates.welcome.subject}
                                        onChange={(e) => handleChange('welcome', 'subject', e.target.value)}
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Corps du message</Form.Label>
                                    <Form.Control
                                        as="textarea"
                                        rows={10}
                                        value={templates.welcome.body}
                                        onChange={(e) => handleChange('welcome', 'body', e.target.value)}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Card className="p-3 bg-light h-100">
                                    {renderPlaceholders('welcome')}
                                </Card>
                            </Col>
                        </Row>
                    </Tab>
                </Tabs>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Annuler</Button>
                <Button variant="primary" onClick={handleSave}>Enregistrer</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EmailTemplateModal;

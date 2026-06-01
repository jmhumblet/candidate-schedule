import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import InterviewForm from './InterviewForm';

describe('InterviewForm', () => {
    const dummyProps = {
        onSubmit: jest.fn(),
        initialParameters: null,
        juryDate: '2023-01-01',
        setJuryDate: jest.fn(),
        jobTitle: 'Test Job',
        setJobTitle: jest.fn(),
        isLocked: false,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders generate button with correct class', () => {
        render(<InterviewForm {...dummyProps} />);
        const button = screen.getByRole('button', { name: /Générer/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('btn-orange');
    });

    test('has programmatic label association for form inputs', () => {
        render(<InterviewForm {...dummyProps} />);
        
        // Check date field
        const dateInput = screen.getByLabelText(/Date du jury/i);
        expect(dateInput).toBeInTheDocument();
        expect(dateInput).toHaveAttribute('type', 'date');

        // Check job title field
        const jobTitleInput = screen.getByLabelText(/Poste/i);
        expect(jobTitleInput).toBeInTheDocument();
        expect(jobTitleInput).toHaveAttribute('type', 'text');

        // Check candidate count field
        const countInput = screen.getByLabelText(/Candidats/i);
        expect(countInput).toBeInTheDocument();
        expect(countInput).toHaveAttribute('type', 'number');

        // Check candidate list textarea field
        const listTextarea = screen.getByLabelText(/Ou saisir la liste/i);
        expect(listTextarea).toBeInTheDocument();
    });

    test('announces errors programmatically and accessibly in French upon invalid submission', () => {
        // Render form with empty juryDate to trigger validation error
        const propsWithEmptyDate = {
            ...dummyProps,
            juryDate: '',
        };
        render(<InterviewForm {...propsWithEmptyDate} />);

        // Mock checkValidity to return false and report validity
        const formElement = document.querySelector('form');
        if (formElement) {
            formElement.checkValidity = jest.fn().mockReturnValue(false);
            const dateInput = formElement.querySelector('#juryDate') as HTMLInputElement;
            if (dateInput) {
                const originalMatches = dateInput.matches;
                // Mock matches function to simulate validation state
                dateInput.matches = jest.fn().mockImplementation((selector) => {
                    if (selector === ':invalid') return true;
                    return originalMatches.call(dateInput, selector);
                });
            }
        }

        // Click generate button
        const button = screen.getByRole('button', { name: /Générer/i });
        fireEvent.click(button);

        // Expect onSubmit not to be called because form is invalid
        expect(propsWithEmptyDate.onSubmit).not.toHaveBeenCalled();

        // Check that a top-level alert is announced in French
        const alert = screen.getByText(/Le formulaire contient des erreurs/i);
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent(/Le formulaire contient des erreurs/i);

        // Check that the date field has aria-invalid="true"
        const dateInputEl = screen.getByLabelText(/Date du jury/i);
        expect(dateInputEl).toHaveAttribute('aria-invalid', 'true');
        expect(dateInputEl).toHaveAttribute('aria-describedby', 'juryDate-error');
        expect(dateInputEl).toHaveAttribute('aria-errormessage', 'juryDate-error');

        // Check that the date field's error message element has role="alert"
        const dateError = document.getElementById('juryDate-error');
        expect(dateError).toBeInTheDocument();
        expect(dateError).toHaveAttribute('role', 'alert');
        expect(dateError).toHaveTextContent(/Veuillez saisir une date de jury valide/i);
    });

    test('start/end segmented toggle flips the label and reinterprets the time field', () => {
        render(<InterviewForm {...dummyProps} />);

        // The segmented control offers both modes as radio options; start is selected by default.
        const startOption = screen.getByRole('radio', { name: /Début du jury/i });
        const endOption = screen.getByRole('radio', { name: /Fin du jury/i });
        expect(startOption).toBeChecked();
        // In start mode, the time input is labelled as the start time.
        expect(screen.getByLabelText(/Heure de début du jury/i)).toBeInTheDocument();

        fireEvent.click(endOption);

        // After toggling, the end option is selected and the time input switches to "end" semantics.
        expect(endOption).toBeChecked();
        expect(screen.getByLabelText(/Heure de fin du jury/i)).toBeInTheDocument();
    });

    test('shows an early-arrival warning when the first candidate arrives before 07h45', async () => {
        render(<InterviewForm {...dummyProps} />);

        // No warning for the default 09:00 start.
        expect(screen.queryByLabelText(/arrivée anticipée/i)).not.toBeInTheDocument();

        // Switch to "end" mode and request a very early finish so the day must start before dawn.
        fireEvent.click(screen.getByRole('radio', { name: /Fin du jury/i }));
        const timeInput = screen.getByLabelText(/Heure de fin du jury/i);
        fireEvent.change(timeInput, { target: { value: '08:00' } });

        // The debounced schedule recompute drives the warning icon.
        const warning = await screen.findByLabelText(/arrivée anticipée/i);
        expect(warning).toBeInTheDocument();
    });
});

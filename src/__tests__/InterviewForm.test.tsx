import React from 'react';
import { render, screen } from '@testing-library/react';
import InterviewForm from '../InterviewForm';

describe('InterviewForm', () => {
    test('renders generate button with correct class', () => {
        const dummyProps = {
            onSubmit: () => {},
            initialParameters: null,
            juryDate: '2023-01-01',
            setJuryDate: () => {},
            jobTitle: 'Test Job',
            setJobTitle: () => {},
        };
        render(<InterviewForm {...dummyProps} />);
        const button = screen.getByRole('button', { name: /Générer/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('btn-orange');
    });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import InterviewForm from '../InterviewForm';

describe('InterviewForm', () => {
    test('renders generate button with correct class', () => {
        render(<InterviewForm onSubmit={() => {}} />);
        const button = screen.getByRole('button', { name: /Générer/i });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass('btn-orange');
    });
});

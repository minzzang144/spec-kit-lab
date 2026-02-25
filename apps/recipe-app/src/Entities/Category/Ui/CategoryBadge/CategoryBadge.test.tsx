import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CategoryBadge } from './CategoryBadge';

describe('CategoryBadge', () => {
	it('should render category name', () => {
		render(<CategoryBadge name="Breakfast" color="#F59E0B" />);
		expect(screen.getByText('Breakfast')).toBeInTheDocument();
	});

	it('should apply color to text', () => {
		render(<CategoryBadge name="Lunch" color="#10B981" />);
		const badge = screen.getByText('Lunch');
		expect(badge).toHaveStyle({ color: '#10B981' });
	});

	it('should apply transparent background color', () => {
		render(<CategoryBadge name="Dinner" color="#6366F1" />);
		const badge = screen.getByText('Dinner');
		expect(badge).toHaveStyle({
			backgroundColor: '#6366F120',
		});
	});
});

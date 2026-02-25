import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import type { Recipe } from '#/Entities/Recipe';

import { RecipeDetail } from './RecipeDetail';

const MOCK_RECIPE: Recipe = {
	id: 'recipe-1',
	title: 'Fluffy Pancakes',
	description: 'Light and fluffy pancakes for breakfast.',
	categoryId: 'cat-breakfast',
	cookingTime: 20,
	difficulty: 'Easy',
	ingredientList: [
		{ name: 'Flour', amount: 200, unit: 'g' },
		{ name: 'Milk', amount: 300, unit: 'ml' },
	],
	createdAt: '2026-02-01T09:00:00.000Z',
	updatedAt: '2026-02-01T09:00:00.000Z',
};

const MOCK_CATEGORY = {
	id: 'cat-breakfast',
	name: 'Breakfast',
	color: '#F59E0B',
};

function renderWithRouter(ui: React.ReactElement) {
	return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('RecipeDetail', () => {
	it('should render recipe title', () => {
		renderWithRouter(
			<RecipeDetail recipe={MOCK_RECIPE} category={MOCK_CATEGORY} />,
		);
		expect(screen.getByText('Fluffy Pancakes')).toBeInTheDocument();
	});

	it('should render recipe description', () => {
		renderWithRouter(
			<RecipeDetail recipe={MOCK_RECIPE} category={MOCK_CATEGORY} />,
		);
		expect(
			screen.getByText('Light and fluffy pancakes for breakfast.'),
		).toBeInTheDocument();
	});

	it('should render category badge', () => {
		renderWithRouter(
			<RecipeDetail recipe={MOCK_RECIPE} category={MOCK_CATEGORY} />,
		);
		expect(screen.getByText('Breakfast')).toBeInTheDocument();
	});

	it('should render difficulty and cooking time', () => {
		renderWithRouter(
			<RecipeDetail recipe={MOCK_RECIPE} category={MOCK_CATEGORY} />,
		);
		expect(screen.getByText('Easy')).toBeInTheDocument();
		expect(screen.getByText('⏱ 20분')).toBeInTheDocument();
	});

	it('should render all ingredients', () => {
		renderWithRouter(
			<RecipeDetail recipe={MOCK_RECIPE} category={MOCK_CATEGORY} />,
		);
		expect(screen.getByText('Flour')).toBeInTheDocument();
		expect(screen.getByText('200 g')).toBeInTheDocument();
		expect(screen.getByText('Milk')).toBeInTheDocument();
		expect(screen.getByText('300 ml')).toBeInTheDocument();
	});

	it('should render action slot when provided', () => {
		renderWithRouter(
			<RecipeDetail
				recipe={MOCK_RECIPE}
				category={MOCK_CATEGORY}
				actionSlot={<button type="button">삭제</button>}
			/>,
		);
		expect(screen.getByText('삭제')).toBeInTheDocument();
	});
});

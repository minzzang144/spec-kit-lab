# Feature Specification: Recipe Book App

**Feature Branch**: `spec/#13403104-fsd-recipe-app`
**Created**: 2026-02-23
**Status**: Draft
**Input**: User description: "FSD architecture rules testing via recipe book app with multiple domains, sub-domains, cross-entity references, and various type grouping patterns"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Browse Recipe List with Category Filter (Priority: P1)

A user opens the app and sees a list of all recipes displayed as cards. Each card shows the recipe title, a brief description, cooking time, difficulty level, and the category it belongs to (shown as a colored badge). The user can filter recipes by selecting a category from a category filter bar at the top. Selecting "All" shows every recipe. When no recipes match the selected category, a friendly empty state message is displayed with a prompt to create a new recipe.

**Why this priority**: This is the core browsing experience and the first thing users interact with. Without the ability to see and filter recipes, no other feature has value. It delivers a usable MVP on its own.

**Independent Test**: Can be fully tested by loading the recipe list page with pre-populated data and verifying card display, category filtering, and empty state handling.

**Acceptance Scenarios**:

1. **Given** the app has recipes across multiple categories, **When** the user opens the recipe list page, **Then** all recipes are displayed as cards with title, description preview, cooking time, difficulty, and category badge.
2. **Given** the recipe list is displayed, **When** the user selects a specific category from the filter bar, **Then** only recipes belonging to that category are shown.
3. **Given** the recipe list is filtered by category, **When** the user selects "All" in the filter bar, **Then** all recipes are displayed again.
4. **Given** a category has no recipes, **When** the user selects that category, **Then** an empty state message is displayed suggesting the user create a new recipe.
5. **Given** the app has no recipes at all, **When** the user opens the recipe list page, **Then** an empty state is shown with guidance on how to get started.

---

### User Story 2 - View Recipe Detail (Priority: P2)

A user taps on a recipe card from the list to view its full details. The detail page shows the complete recipe information: title, full description, category (as a badge), cooking time, difficulty level, and a complete list of ingredients with their amounts and units. The user can navigate back to the recipe list. The detail page also provides access to edit and delete actions.

**Why this priority**: Viewing recipe details is the natural next step after browsing. Users need to see full ingredient information and cooking details to use a recipe. This builds directly on US1 and completes the read-only experience.

**Independent Test**: Can be tested by navigating to a recipe detail page via URL with a specific recipe identifier and verifying all recipe fields, ingredient list display, and back navigation.

**Acceptance Scenarios**:

1. **Given** the recipe list is displayed, **When** the user taps on a recipe card, **Then** the app navigates to the recipe detail page showing all recipe information.
2. **Given** the detail page is displayed, **When** the user views the ingredient section, **Then** each ingredient shows its name, amount, and unit of measurement.
3. **Given** the detail page is displayed, **When** the user taps the back button, **Then** the app returns to the recipe list with the previous filter state preserved.
4. **Given** the user navigates directly to a detail page with an invalid recipe identifier, **When** the page loads, **Then** a "Recipe not found" message is displayed with a link back to the recipe list.

---

### User Story 3 - Create and Edit Recipe (Priority: P3)

A user can create a new recipe by filling out a form with: title, description, category selection (from existing categories), cooking time, difficulty level, and a dynamic ingredient list. For ingredients, the user can add multiple rows, each with ingredient name, amount, and unit. The user can also remove ingredient rows. When editing an existing recipe, the form is pre-filled with current values. The form validates inputs before submission and shows inline error messages for invalid fields. After successful save, the user is redirected to the recipe detail page.

**Why this priority**: Creating and editing recipes enables users to build their personal recipe collection. It depends on US1 (to see the result) and US2 (to verify the detail), making it a natural P3.

**Independent Test**: Can be tested by navigating to the create recipe page, filling out the form with valid/invalid data, managing the ingredient list, submitting, and verifying the created recipe appears in the list and detail views.

**Acceptance Scenarios**:

1. **Given** the user is on the recipe list page, **When** the user clicks the "Create Recipe" button, **Then** the app navigates to the recipe creation form.
2. **Given** the creation form is displayed, **When** the user fills all required fields (title, description, category, cooking time, difficulty, at least one ingredient) and submits, **Then** the recipe is saved and the user is redirected to the new recipe's detail page.
3. **Given** the creation form is displayed, **When** the user submits with missing required fields, **Then** inline validation errors are shown for each invalid field.
4. **Given** the creation form is displayed, **When** the user clicks "Add Ingredient", **Then** a new empty ingredient row (name, amount, unit) is appended to the ingredient list.
5. **Given** the ingredient list has more than one row, **When** the user clicks the remove button on an ingredient row, **Then** that row is removed from the list.
6. **Given** the ingredient list has exactly one row, **When** the user attempts to remove it, **Then** the removal is prevented (at least one ingredient is required).
7. **Given** the user is viewing a recipe detail page, **When** the user clicks the "Edit" action, **Then** the app navigates to the edit form pre-filled with the recipe's current data.
8. **Given** the edit form is displayed with existing data, **When** the user modifies fields and submits, **Then** the recipe is updated and the user is redirected back to the updated detail page.

---

### User Story 4 - Delete Recipe (Priority: P4)

A user can delete a recipe from the detail page. Clicking the delete action opens a confirmation dialog asking "Are you sure you want to delete this recipe?" with "Cancel" and "Delete" options. If confirmed, the recipe is permanently removed and the user is redirected to the recipe list. If cancelled, the dialog closes and nothing changes.

**Why this priority**: Deletion is a secondary action that completes the CRUD cycle. It depends on having recipes (US3) and viewing them (US2), making it the lowest priority among the core features.

**Independent Test**: Can be tested by navigating to a recipe detail page, triggering the delete action, verifying the confirmation dialog appears, confirming deletion, and verifying the recipe no longer exists in the list.

**Acceptance Scenarios**:

1. **Given** the user is on a recipe detail page, **When** the user clicks the "Delete" action, **Then** a confirmation dialog appears asking to confirm deletion.
2. **Given** the confirmation dialog is displayed, **When** the user clicks "Delete", **Then** the recipe is permanently removed and the user is redirected to the recipe list.
3. **Given** the confirmation dialog is displayed, **When** the user clicks "Cancel", **Then** the dialog closes and the recipe remains unchanged.
4. **Given** a recipe has been deleted, **When** the user tries to navigate to its detail page via direct URL, **Then** a "Recipe not found" message is displayed.

---

### Edge Cases

- What happens when the user creates a recipe with extremely long title or description? System enforces character limits: title max 100 characters, description max 2000 characters.
- How does the system handle if the user tries to add more than 50 ingredients to a single recipe? System enforces a maximum of 50 ingredients per recipe.
- What happens when the user enters a cooking time of 0 or a negative number? System validates that cooking time is a positive integer, minimum 1 minute.
- How does the system behave when the recipe list page loads with a very large number of recipes (100+)? System handles rendering gracefully.
- What happens when the user submits a form while a previous submission is still processing? Submit button is disabled during processing to prevent duplicate submissions.
- What happens when a save or delete operation fails due to a server error? User sees an error message and can retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a list of recipes as cards, each showing title, description preview (first 100 characters), cooking time, difficulty level, and category badge.
- **FR-002**: System MUST provide a category filter bar that allows users to filter recipes by category, with an "All" option to show all recipes.
- **FR-003**: System MUST maintain the selected category filter state when navigating between pages (e.g., from detail back to list).
- **FR-004**: System MUST display a recipe detail page showing all recipe fields: title, full description, category badge, cooking time, difficulty level, and complete ingredient list.
- **FR-005**: System MUST allow users to create a new recipe via a form with fields: title (required, max 100 chars), description (required, max 2000 chars), category (required, selected from existing categories), cooking time in minutes (required, positive integer), difficulty level (required, one of: Easy, Medium, Hard), and ingredient list (required, at least 1 ingredient).
- **FR-006**: System MUST allow users to dynamically add and remove ingredient rows in the recipe form. Each ingredient row consists of: name (required), amount (required, positive number), and unit (required, selected from predefined list).
- **FR-007**: System MUST validate all form inputs before submission and display inline error messages for invalid fields.
- **FR-008**: System MUST allow users to edit an existing recipe, pre-filling the form with current values.
- **FR-009**: System MUST allow users to delete a recipe, with a confirmation dialog before permanent removal.
- **FR-010**: System MUST display appropriate empty states when no recipes exist or no recipes match the selected category filter.
- **FR-011**: System MUST display a "Recipe not found" message when accessing a non-existent recipe's detail page.
- **FR-012**: System MUST redirect users to the recipe detail page after successful creation or edit.
- **FR-013**: System MUST redirect users to the recipe list after successful deletion.
- **FR-014**: System MUST prevent form double-submission by disabling the submit button while a save operation is in progress.
- **FR-015**: System MUST display user-friendly error messages when save or delete operations fail, allowing the user to retry.
- **FR-016**: System MUST enforce a maximum of 50 ingredients per recipe.

### Key Entities

- **Recipe**: The core entity representing a cooking recipe. Key attributes: unique identifier, title, description, cooking time (in minutes), difficulty level (Easy/Medium/Hard), creation timestamp, last update timestamp. A recipe belongs to exactly one category and contains one or more ingredients.
- **Ingredient**: Represents a single ingredient within a recipe. Key attributes: name, amount (numeric quantity), unit of measurement. Ingredients exist only as part of a recipe (embedded, not standalone).
- **Category**: A classification label for organizing recipes. Key attributes: unique identifier, name, display color. Categories are predefined and shared across all recipes. A category can have zero or more recipes associated with it.

### Entity Relationships

- Recipe to Category: Many-to-one (each recipe belongs to one category; one category can have many recipes)
- Recipe to Ingredient: One-to-many (each recipe contains one or more ingredients; ingredients are embedded within the recipe)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can browse the recipe list and identify a recipe of interest within 5 seconds of page load.
- **SC-002**: Users can filter recipes by category with results updating within 1 second of selection.
- **SC-003**: Users can view complete recipe details (including all ingredients) within 2 seconds of tapping a recipe card.
- **SC-004**: Users can create a new recipe with 5 ingredients in under 3 minutes, including form filling and submission.
- **SC-005**: Users can edit an existing recipe and save changes in under 2 minutes.
- **SC-006**: Users can delete a recipe (including confirmation) in under 10 seconds.
- **SC-007**: All form validation errors are visible inline within 1 second of submission attempt.
- **SC-008**: 95% of users successfully create their first recipe on the first attempt without encountering unclear form behavior.
- **SC-009**: Navigation between list, detail, create, and edit pages feels instant (perceived transition under 500ms).

## Assumptions

- Categories are predefined and managed separately (not user-created in this feature scope). A reasonable set of default categories is provided (e.g., Breakfast, Lunch, Dinner, Dessert, Snack, Drink).
- The app operates with mock data. Data is simulated in-memory without a real backend server.
- Authentication is not required. The app is single-user.
- The ingredient unit list is predefined (g, kg, ml, L, cups, tbsp, tsp, pieces, pinch) and users select from these options.
- Images/photos for recipes are out of scope for this feature.
- Search by keyword (beyond category filtering) is out of scope for this feature.

## E2E Test Scenarios *(mandatory)*

### E2E Scenarios for User Story 1

- **E2E-US1-001**: User opens the recipe list page and sees all recipes displayed as cards with correct information (title, description preview, cooking time, difficulty, category badge).
- **E2E-US1-002**: User selects a category filter and only recipes of that category are shown; selecting "All" restores the full list.
- **E2E-US1-003**: User visits the recipe list when no recipes exist and sees the empty state with guidance.

### E2E Scenarios for User Story 2

- **E2E-US2-001**: User clicks a recipe card from the list and the detail page shows complete recipe information including all ingredients with amounts and units.
- **E2E-US2-002**: User navigates back from detail to list and the category filter state is preserved.
- **E2E-US2-003**: User navigates directly to a non-existent recipe URL and sees the "Recipe not found" message.

### E2E Scenarios for User Story 3

- **E2E-US3-001**: User creates a new recipe by filling out all required fields, adding 3 ingredients, and submitting. Recipe appears in the list and detail page shows correct data.
- **E2E-US3-002**: User attempts to submit the creation form with missing required fields and sees inline validation errors for each missing field.
- **E2E-US3-003**: User edits an existing recipe (changes title and adds an ingredient), submits, and verifies the updated data on the detail page.
- **E2E-US3-004**: User adds and removes ingredient rows in the form, verifying that at least one ingredient row is always present.

### E2E Scenarios for User Story 4

- **E2E-US4-001**: User deletes a recipe from the detail page (click delete, confirm in dialog), is redirected to the list, and the recipe no longer appears.
- **E2E-US4-002**: User opens the delete confirmation dialog and clicks "Cancel". Recipe remains unchanged and dialog closes.

### Cross-Story E2E Scenarios

- **E2E-INT-001**: Full CRUD lifecycle: User creates a recipe, views it in list, opens detail, edits it, verifies changes, deletes it, and verifies removal from list.
- **E2E-INT-002**: Filter persistence through navigation: User filters by category, opens a recipe detail, goes back, filter is still applied, creates a new recipe in that category, goes back to list, new recipe appears under the active filter.

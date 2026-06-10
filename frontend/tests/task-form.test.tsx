import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from '@/components/task/task-form';

// Mock next-themes to avoid hydration issues in tests
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

describe('TaskForm validation', () => {
  it('should show error for empty title', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm onSubmit={handleSubmit} />);

    // Try submitting with empty title
    await user.click(screen.getByRole('button', { name: /save task/i }));

    await waitFor(() => {
      expect(screen.getByText('Title is required')).toBeInTheDocument();
    });

    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('should render prefilled data in edit mode', () => {
    const handleSubmit = vi.fn();

    render(
      <TaskForm
        onSubmit={handleSubmit}
        defaultValues={{
          title: 'Existing Task',
          description: 'Some description',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          dueDate: '2026-12-31',
        }}
      />
    );

    const titleInput = screen.getByDisplayValue('Existing Task');
    expect(titleInput).toBeInTheDocument();

    const descInput = screen.getByDisplayValue('Some description');
    expect(descInput).toBeInTheDocument();
  });

  it('should call onSubmit with form data', async () => {
    const handleSubmit = vi.fn();
    const user = userEvent.setup();

    render(<TaskForm onSubmit={handleSubmit} />);

    await user.type(screen.getByLabelText(/title/i), 'My Task');
    await user.click(screen.getByRole('button', { name: /save task/i }));

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'My Task' }),
        expect.anything()
      );
    });
  });
});

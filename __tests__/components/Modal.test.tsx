import React, { useState } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'

import { Modal } from '@/components/ui/Modal'

// Every real call site passes an inline arrow for onClose and holds the form
// state in the *parent* — admin/schedule, admin/first-timers, admin/content,
// admin/events. These harnesses reproduce that shape exactly, because the bug
// this suite exists for only appears when onClose changes identity on a render
// the dialog itself triggers.

function ServiceFormHarness({ onSave }: { onSave?: () => void } = {}) {
  const [open, setOpen] = useState(true)
  const [day, setDay] = useState('')

  return (
    <Modal
      isOpen={open}
      onClose={() => setOpen(false)}
      title="Edit Service"
      size="lg"
    >
      <label htmlFor="day">Day</label>
      <input
        id="day"
        value={day}
        onChange={(e) => setDay(e.target.value)}
      />
      <button onClick={onSave}>Save Changes</button>
    </Modal>
  )
}

function OpenerHarness() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Edit</button>
      <Modal isOpen={open} onClose={() => setOpen(false)} title="Edit Service">
        <input aria-label="Day" />
      </Modal>
    </>
  )
}

describe('Modal', () => {
  it('renders nothing while closed', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Edit Service">
        <p>Body</p>
      </Modal>
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.queryByText('Body')).not.toBeInTheDocument()
  })

  // The regression this suite was written for. The keyboard/focus effect used
  // to list onClose in its dependencies; since callers pass an inline arrow,
  // its identity changed on every parent render — and a form inside the dialog
  // re-renders the parent on every keystroke. The effect tore down (handing
  // focus back to the opener) and re-ran (focusing the first control), so the
  // caret left the field after the first character and the rest of the word
  // was typed into the header's close button. Asserting the full value rather
  // than focus alone is deliberate: it fails with "expected 'Sunday', got 'S'",
  // which names the symptom a user would actually report.
  it('keeps the caret in a field while typing', async () => {
    const user = userEvent.setup()
    render(<ServiceFormHarness />)

    const day = screen.getByLabelText('Day')
    await user.click(day)
    await user.type(day, 'Sunday')

    expect(day).toHaveValue('Sunday')
    expect(day).toHaveFocus()
  })

  // Guards the other side of that fix: onClose now lives in a ref, so the
  // hazard flips from "re-subscribes too often" to "invokes a stale closure".
  // Escape must run the handler from the latest render, not the first.
  it('closes with the handler from the latest render, not a stale one', async () => {
    const user = userEvent.setup()
    const onCloseSpy = vi.fn()

    function StaleClosureHarness() {
      const [count, setCount] = useState(0)
      return (
        <Modal isOpen onClose={() => onCloseSpy(count)} title="Edit Service">
          <button onClick={() => setCount((c) => c + 1)}>Bump</button>
        </Modal>
      )
    }

    render(<StaleClosureHarness />)

    const bump = screen.getByRole('button', { name: 'Bump' })
    await user.click(bump)
    await user.click(bump)
    await user.click(bump)

    await user.keyboard('{Escape}')

    expect(onCloseSpy).toHaveBeenCalledTimes(1)
    expect(onCloseSpy).toHaveBeenCalledWith(3)
  })

  it('closes on a backdrop click', async () => {
    const user = userEvent.setup()
    render(<OpenerHarness />)

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    // The backdrop is the only aria-hidden element in the overlay.
    const backdrop = document.querySelector('[aria-hidden="true"]')!
    await user.click(backdrop)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('moves focus into the dialog and hands it back to the opener on close', async () => {
    const user = userEvent.setup()
    render(<OpenerHarness />)

    const opener = screen.getByRole('button', { name: 'Edit' })
    await user.click(opener)

    // First focusable inside the panel is the header's close button.
    expect(screen.getByLabelText('Close modal')).toHaveFocus()

    await user.keyboard('{Escape}')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(opener).toHaveFocus()
  })

  // The width map is the whole of the size API, and dense admin dialogs (the
  // CITH hub manager, the course editor's grid-cols-3 row) depend on xl being
  // meaningfully wider than lg. A typo'd or dropped key degrades silently —
  // Tailwind emits nothing and the panel falls back to full width.
  it.each([
    ['sm', 'max-w-sm'],
    ['md', 'max-w-md'],
    ['lg', 'max-w-lg'],
    ['xl', 'max-w-2xl'],
  ] as const)('applies the %s width', (size, expected) => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Edit Service" size={size}>
        <p>Body</p>
      </Modal>
    )

    expect(screen.getByRole('dialog')).toHaveClass(expected)
  })

  it('defaults to md when no size is given', () => {
    render(
      <Modal isOpen onClose={vi.fn()} title="Edit Service">
        <p>Body</p>
      </Modal>
    )

    expect(screen.getByRole('dialog')).toHaveClass('max-w-md')
  })

  it('locks background scrolling only while open', async () => {
    const user = userEvent.setup()
    render(<OpenerHarness />)

    expect(document.body.style.overflow).not.toBe('hidden')

    await user.click(screen.getByRole('button', { name: 'Edit' }))
    expect(document.body.style.overflow).toBe('hidden')

    await user.keyboard('{Escape}')
    expect(document.body.style.overflow).toBe('unset')
  })
})

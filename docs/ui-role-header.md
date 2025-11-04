# UI: Active-Role Header & Role Switch — Implementation Guidance

Purpose: Provide a small reference for engineers and designers for the header component that displays the user's active role and allows safe switching between roles.

## Goals:
- Make the user's active role and context unambiguous
- Only show the role switch control when the user has multiple roles
- Record role switches in audit logs
- Update available UI controls immediately after switching role

## Microcopy guidance

- Active role label examples:
  - "Acting as: Reviewer — Reviewing: Akira Sato"
  - "Acting as: Reviewee — Your self-evaluation"
  - "Acting as: HR Admin — System configuration"
- Short helper text when switching: "Switching roles changes what you can edit. All role switches are recorded."

## Color hints

- Employee (edit fields): blue (#1e40af)
- Manager (edit fields): orange (#f59e0b)
- HR Admin (read-only for records): neutral gray

## React example (pseudo-code)

Note: This is a small illustrative example for the header component. Adapt to your component library.

---

// RoleHeader.jsx (pseudo-code)

import React from 'react'

export default function RoleHeader({ user, activeRole, contextName, onSwitchRole }) {
  const canSwitch = user.roles && user.roles.length > 1

  return (
    <header className="role-header" aria-live="polite">
      <div className="role-label">
        <strong>Acting as:</strong> {activeRole}
        {contextName ? ` — ${contextName}` : ''}
      </div>

      {canSwitch && (
        <div className="role-switch">
          <label htmlFor="role-select" className="sr-only">Switch role</label>
          <select
            id="role-select"
            value={activeRole}
            onChange={(e) => onSwitchRole(e.target.value)}
            aria-label="Switch active role"
          >
            {user.roles.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      )}

      <style jsx>{`
        .role-header { display:flex; justify-content:space-between; align-items:center; padding:8px 12px; }
        .role-label { font-size:14px; }
        select { padding:6px; }
      `}</style>
    </header>
  )
}

## Behavior notes for engineers

- onSwitchRole(role): call an API endpoint to record the role switch (server should create an AuditEntry with action "switch_role") and update client session state.
- After role switch, re-evaluate permission flags on the page and re-render controls (enable/disable edit buttons, show/hide manager-only sections).
- Ensure keyboard accessibility for the select control. Provide an alternative button-based switcher for power users if desired.
- Display a short transient toast: "Now acting as: Manager — You can edit manager fields. All role switches are logged."

## Acceptance criteria reference (mapped to story 1.11)

- Header displays active role and context
- Role switch available only for multi-role users
- Role switch creates an AuditEntry and updates the UI immediately
- Microcopy present explaining effect of role change

## Design handoff

- Provide component variants for each role state (employee manager hr_admin) and a Figma/Sketch token list for colors and microcopy.

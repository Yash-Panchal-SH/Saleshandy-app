# State

## Server state

- TanStack Query for all server data
- One query-key namespace per feature; co-locate hooks in the feature folder
- Tag-based invalidation via `queryClient.invalidateQueries({ queryKey: [...] })`
- Optimistic updates for fast actions, rollback on failure
- Polling / WebSocket where realtime is needed (unified inbox, dialer)

## Client / UI state

- Zustand for shared cross-feature UI state (theme, sidebar, global modals)
- `useState` for component-local state
- Passing props 2–3 levels deep is fine — don't reach for Context just to skip prop drilling
- Use Context only when the value is widely consumed (theme, auth, feature flags) or prop-drilling pain is real

## URL state

- TanStack Router search params (typed with Zod)
- Filters, sort, pagination, active tab, modal open/close → URL
- Deep-linkable, shareable

## Form state

- react-hook-form + Zod schemas
- One schema source for client validation + server contract reuse
- No Formik in new code

## Persisted state

- HttpOnly cookies for auth tokens
- IndexedDB (via `idb-keyval`) for large client caches (drafts, offline queue)
- localStorage for user preferences (theme, density, language)
- sessionStorage only for OAuth code exchange

## Realtime

- WebSocket for inbox, dialer events
- Firebase events

## Stale-time guidelines

| Data type                        | `staleTime`      | Reasoning                              |
| -------------------------------- | ---------------- | -------------------------------------- |
| User profile                     | 5 minutes        | Rarely changes during a session        |
| List data (leads, contacts)      | 30 seconds       | Others might be making changes         |
| Config / settings                | 10 minutes       | Practically static                     |
| Dashboard metrics                | 1 minute         | Balance between freshness and API load |
| Real-time data (notifications)   | 0 (always stale) | Refetch on every focus                 |

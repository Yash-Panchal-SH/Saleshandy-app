# State

## Server state

- Tanstack Query for all server data
- One `createApi` per feature module
- Tag-based invalidation
- Optimistic updates for fast actions
- Polling / WebSocket where realtime needed (unified inbox, dialer)

## Client / UI state

- Zustand for shared cross-feature UI state
- Zustand or `useState` for component-local state
- No Redux/zustand for ephemeral local state (modals, hover, etc.)
- For more than 3 depth of child prop drilling contenxt API as a state

## URL state

- TanStack Router search params (typed with Zod)
- Filters, sort, pagination, active tab → URL
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

## Cache invalidation

- Tag-based via Tanstack Query
- Manual `dispatch(api.util.invalidateTags([...]))` on cross-feature side effects

## Slice migration target

- Collapse legacy `createAsyncThunk` calls into RTK Query endpoints where the data is server-owned
- Migrate for client-owned state (UI flags, multi-step wizard progress, filter drafts)

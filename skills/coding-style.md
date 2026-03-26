---
skill: Coding Style
description: Strict typing and code style rules for this project.
---

# Coding Style

## Strict Typing — Always

Every piece of data must have a named interface or type. No inline object types. No anonymous shapes. This includes API request bodies, response bodies, error responses, and `as` casts.

### ❌ Never do this

```typescript
function getUser(): { name: string; age: number } {
  return { name: "Jace", age: 22  };
}

const point: { x: number; y: number } = { x: 1, y: 2 };

// Lazy inline cast on req.body
const { hashtags } = req.body as {
  hashtags?: string[];
  resultsType?: "posts" | "reels";
};

// Inline nested object type
export interface Parent {
  child?: {
    name?: string;
    age?: number;
  };
}
```

### ✅ Always do this

```typescript
interface User {
  name: string;
  age: number;
}

interface Point {
  x: number;
  y: number;
}

function getUser(): User {
  return { name: "Jace", age: 22 };
}

const point: Point = { x: 1, y: 2 };

// Named type for the request body
interface HashtagRequestBody {
  hashtags: string[];
  resultsType?: "posts" | "reels";
}
const body = req.body as HashtagRequestBody;

// Named type for nested objects
interface ChildInfo {
  name?: string;
  age?: number;
}

interface Parent {
  child?: ChildInfo;
}
```

## Full-Stack Consistency — Mandatory

Every change must be treated as a full-stack change. When modifying an endpoint, type, request body, response shape, or any shared contract on one side of the stack, you **must** inspect and update **all** parts of the other side that consume or produce it. No exceptions.

### What this means in practice

1. **Changing a backend route or its request/response types?** Find and update every frontend call site, request body construction, type definition, and UI element that touches that route.
2. **Changing a frontend request body or adding/removing a field?** Verify the backend route destructures it, validates it, and passes it through correctly.
3. **Adding a new route?** The frontend must have a matching typed fetch call, a request body type, and any necessary UI controls wired up.
4. **Removing a field or route?** Remove it from both sides — types, request construction, route handler, and UI.
5. **Renaming anything shared (field, route path, type)?** Rename it everywhere in both `backend/` and `client/`.

### The rule

> Before marking any change as done, confirm that both sides of the stack are fully in sync: types match, data flows end-to-end, and nothing references stale contracts.

## Rules

1. **Every object shape gets a named `interface` or `type`.** Even if it's only used once.
2. **No `any`.** Use `unknown` if the type is truly unknown, then narrow it.
3. **API request bodies, response bodies, and error responses must each have their own named type.** Never cast `req.body as { ... }` inline.
4. **External API data gets a raw type, then we map it to our strict internal type.** Raw types have all fields optional. Internal types have strict nullability.
5. **Function parameters and return types must be explicit.** Don't rely on inference for public functions.
6. **Types live in dedicated files.** Place them in `src/types/` organized by domain (e.g. `instagram.ts`, `user.ts`).
7. **Prefer `interface` for object shapes.** Use `type` for unions, intersections, and primitives.
8. **Null vs undefined:** Use `null` for intentionally absent values. Use `undefined` only when a property is optional (`?`).
9. **No inline nested object types.** If an interface has a nested object, that nested shape must be its own named interface.

## File Organization

```
backend/src/types/
  instagram.ts    — Instagram post types, music info, API request/response types, raw Apify types.
  (future files as domains grow)

client/src/types/
  instagram.ts    — Client-side mirrors of the types the API returns.
  (future files as domains grow)
```

Types are imported wherever needed — routes, services, utilities, components.

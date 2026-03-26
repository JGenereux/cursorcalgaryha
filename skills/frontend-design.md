---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, or applications. Generates creative, polished code that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic aesthetics. Write real working code with genuine attention to visual detail and creative intent.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Design Thinking

Before writing code, understand the context and commit to a clear aesthetic direction:

- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick a direction and commit. Brutally minimal, maximalist, retro-futuristic, organic, luxury, playful, editorial, brutalist, art deco, industrial — whatever is right for the context. Use these as starting points, not destinations.
- **Constraints**: Technical requirements — framework, performance, accessibility.
- **Differentiation**: What will someone remember about this? One strong, specific answer is better than a list.

Choose a conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work. What fails is ambivalence.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is production-grade, visually distinctive, and cohesive.

## Aesthetic Guidelines

**Typography**

Choose fonts that are beautiful and specific to the context. Avoid the defaults — Inter, Roboto, Arial, system-ui. These are fine for dashboards no one looks at; they're wrong here. Pair a display font with a refined body font. The pairing should feel intentional, not assembled from a shortlist.

**Color**

Commit to a palette. Dominant colors with sharp accents outperform timid, evenly-distributed schemes. Use CSS variables for consistency. Dark and light themes are both fair game — vary between them across different generations rather than converging on one.

**Motion**

Animate for effect and meaning, not coverage. One well-orchestrated page load with staggered reveals creates more impression than scattered micro-interactions everywhere. Prefer CSS-only animations for HTML. Use the Motion library for React when available. Hover states and scroll triggers should feel considered, not default.

**Spatial Composition**

Fight the grid sometimes. Asymmetry, overlapping elements, diagonal flow, and generous negative space all signal intentionality. Controlled density can work equally well. The default equal-margin, centered-everything layout should be a conscious choice, not a fallback.

**Backgrounds and Depth**

Solid colors are the minimum viable option. Gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, grain overlays — these create atmosphere. Match the texture to the aesthetic. A brutalist interface and a luxury interface should feel nothing alike at this level.

## What to Avoid

Generic AI-generated aesthetics are recognizable immediately: Space Grotesk or DM Sans on a white background, purple-to-blue gradients, card grids with rounded corners and drop shadows, hero sections with a headline and a CTA button centered on the page. These patterns exist because they are safe, not because they are good.

Every design should be specific to its context. No two outputs should converge on the same stack of choices.

Match implementation complexity to the vision. Maximalist designs need elaborate code — extensive animations, layered effects, dense detail. Minimalist designs need restraint and precision — spacing, type scale, and subtle details doing all the work. Elegance is executing the vision well, not adding more.

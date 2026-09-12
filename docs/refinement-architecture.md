# STARTS Forward refinement

Implemented against the existing starter-derived application, without replacing its runtime, design system, approval boundary or saved projects. The user brief is preserved in product-vision.md.

## Product and navigation

Students and early-career professionals are now the primary audience. The definition of STARTS and three pillars appear on the overview. South Florida is presented as the first coordination hub of a distributed network and gateway to the Americas.

The existing project workspace, partner network, career pathways, source library and approval controls remain. New sections are Global network, Evidence studio, Intelligence, Influence ladder, Paid projects and Impact tracker.

## Capability architecture

`apps/web/src/lib/bridge-instructions.ts` is the runtime system prompt, re-exported through bridge.ts and consumed by the existing CopilotKit agent endpoint. It implements the vision, nine coordinated capability roles, reciprocal cross-country collaboration, institutional influence, paid project safeguards and evidence/impact boundaries. These are prompt instructions, not fine-tuned model weights.

`apps/web/src/lib/ecosystem.ts` supplies typed capability inputs/outputs, a synthetic team registry, explainable matching, system dependencies and the seven influence stages. `run_capability` is a frontend tool available to the existing agent. All capabilities use the same selected priority and learning context; they are not independent chatbots.

Without provider credentials, capability previews are deterministic and labeled rule-based. With credentials, the existing agent can reason over the context and call the same tools. No live AI calls or external research were performed to validate this refinement.

Matching weights shared health priority, expertise that meets the selected team's needs, and reciprocal expertise. It does not score real applicants. Filters cover health priority, region and free-text team/organization/skill/SDG search. Six synthetic teams illustrate South Florida, Haiti, Colombia, Rwanda, Jamaica and Brazil. No actual affiliation, team availability or funded opportunity is claimed.

## Data and persistence

The learning workspace keeps evidence notes, self-reported influence connections and impact entries per priority in browser localStorage, using a versioned key and schema validation. It survives reloads in that browser. Storage failures are surfaced. This is local learning state, not collaborative institution-wide storage or verified data. Records are capped at 100 evidence and 100 impact entries per priority. Source references are stored as text, not automatically fetched or validated.

The existing server approval and project storage workflow remains separate. Feature buttons prepare collaboration, influence or paid-project briefs for the existing review step. They do not contact a person, commit funds, hire anyone or implement services. Four priority IDs include the new maternal-health example while preserving existing IDs and saved records.

An eventual multi-user release should replace local learning state with authenticated workspace-scoped storage, shared permissions, versioned evidence provenance, validated opportunity ingestion and explicit tool authorization. Current prompt rules do not substitute for those application controls.

## Paid project architecture

The illustrative Haiti maternal-referral brief assembles Haitian and South Florida students, a faculty mentor and an NGO technical lead. The institution supplies problem, mentorship, resources and funding; students contribute supervised research and implementation support; STARTS supplies the coordination infrastructure. Output choices include implementation plans, community interventions, policy recommendations, research outputs, evidence dashboards, partnership proposals and evaluations.

Compensation, hours, payment schedule, supervision, access costs, authorship and ownership must be agreed before real delivery. There is no payment processor, hiring workflow, opportunity feed or automatic team assignment in this prototype.

## Influence and impact

The ladder identifies the potential actor, scope of authority, evidence artifact, missing connection and next step for each level. It is not a required hierarchy; local institutional action can be the appropriate endpoint. Connection statuses are user-reported, not verified contacts.

Impact entries explicitly distinguish outputs, institutional decisions, implementation and observed outcomes. Baseline/current values carry a unit or denominator, source and date. Arithmetic change is reported without claiming benefit or causality. Saving a charter does not count as institutional adoption, employment or improved health.

## Visual provenance

The network map uses equirectangular Natural Earth 110m land geometry, rounded to a compact SVG path dataset in world-land.json; Antarctica is omitted from this project-focused view. Source: https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson . Natural Earth map data are public domain. The map contains no jurisdiction boundaries; arcs are hypothetical collaboration suggestions.

The five-panel editorial visual was generated with the built-in image-generation tool. It depicts South Florida, the Caribbean, Latin America, student collaboration and a global health team. It is explicitly labeled illustrative. See generated-imagery.md for the exact prompt and asset path.

## Validation

99 offline tests pass, including all existing approval tests plus new checks for reciprocal matching, unknown-team rejection, influence gaps, nine capability outputs, source/uncertainty preservation, and charter payload limits. Build and browser results are recorded in STARTS-FORWARD-README.md.

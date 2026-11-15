---
title: agent-skills
summary: Skills for coding agents, for writing, learning, coding and job applications.
area: personal
repos:
  - { name: agent-skills, url: "https://github.com/AhmedKishki/agent-skills", note: "Claude Code plugin marketplace" }
languages: [Python, Shell, Markdown]
started: "2026-08"
updated: "2026-11"
status: 13 skills
order: 70
draft: false
---

Each skill is a folder whose `SKILL.md` tells a coding agent how to carry out one kind of task. The collection installs as a Claude Code plugin marketplace, or its installer links the skills into Claude Code, Kilo Code and Cline.

## Skills

| Skill | What it does |
|---|---|
| white-box-synthesis | answers only from supplied sources, rebuilt from exact source spans, with unsupported links marked as gaps |
| draft-writing | develops an article with its author, one section at a time |
| human-writing | makes every sentence justify its logical connection |
| humaniser | checks Markdown against a list of AI writing patterns |
| write-like-me | writes in the user's voice from a profile they keep |
| markdown-refactor | gives each kind of information in agent files one owner |
| read-along-guide | builds book companions with verified quotes |
| scheduled-learning | works through a long source one section per run |
| guided-learning | diagnoses, plans and teaches a course lesson by lesson |
| active-objects | holds embedded C to the active-object pattern |
| coding-partner | explains code chunk by chunk |
| collaborative-coding | applies one approved patch at a time |
| auto-jobber | prepares CVs, cover letters and research statements |

## How a skill is loaded and routed

A skill's `SKILL.md` has frontmatter with only a `name` and a `description`, and the description holds the trigger condition. white-box-synthesis's description ends "Use when the user supplies sources with a question to answer from them, or asks for a white-box, source-only, traceable or provenance-preserving answer." human-writing's notes give its reason for a broad description: "A skill triggers only through its description, so a narrow description would leave most generation unchecked."

The body is a router. `AGENTS.md` requires it to link every supporting file and state when to read it, so that detailed procedures sit in `references/` and the entry point stays short.

`.claude-plugin/marketplace.json` lists 13 plugins with `source: ./skills/<name>`, and each `plugin.json` sets `"skills": ["./"]`, which points Claude Code at the skill's root `SKILL.md`. `bin/agent-skills install` is the alternative route. It symlinks each skill into the `skills/` folder of Claude Code, Kilo Code and Cline, only where that agent's home directory exists.

## White-box synthesis

With white-box-synthesis my aim is to allow the agent only a few operations for building a response, as a first step towards a traceable output. [research-rag](/projects/research-rag/) builds its answers with a renderer derived from it.

The invariant is that every character of the reply outside a marker replays from an exact source span through the legal operations. The agent therefore writes a derivation as JSON, and `scripts/render.py` builds the reply from it or rejects it.

The derivation states the answer as a conclusion Z and the steps A, B, … that make it true. Each step is a claim that a source asserts and supports one later step or Z. Each link between steps has the status `part`, `stated`, `gap` or `ai`. A link is `stated` only if a source span states that relation in the same direction, between the same things in the sources' own words, with no source denying it and any hedge carried along. "After" therefore licenses sequence but not cause.

Each sentence is built from pieces, and each piece is an exact whole-word span of one source plus ordered operations from closed lists. DELETE must keep the subject and predicate, negation, modality, quantifiers, conditions, attribution and scope. INFLECT changes only listed agreement forms, or replaces a listed pronoun with its antecedent from the same source, and tense never changes. NORMALISE has six rules, such as case, quote glyphs and end-stop. ORDER keeps sentences in the order of the chain.

Pieces from different sources join only through a connective piece that names the step whose link it realises. The renderer accepts it only if that step is `stated` and the connective is copied from inside the licence span. With the licence "The cooperative dissolved because its members left.", the reply reads "In 2009 the cooperative dissolved because its members left [S1; S2]." Where no source states the link, the reply shows `⟦GAP: X → Y: what is missing⟧` after the step's last sentence.

The reply has four parts: the synthesis, with a source marker on each sentence; the references; the provenance, which lists the operations on each sentence; and the reasoning, which gives each step's link status and a gap count ("The sources establish Z only at 0"). A form rule can be broken only by a stated `deviation`, which the reply records.

The seven evals include a splice trap: "The mill did not close because prices rose" and "Wages fell, so workers left" must not become "wages fell because prices rose", and the cause is marked as a gap. `tests/test_render.py` checks that a join without a connective, a tense change and an AI link without permission are each refused.

## Human-writing

human-writing defines an artificial sentence as one that "makes no logical connection". Each sentence belongs to a part whose purpose is the question it answers or the claim it establishes. A sentence is judged by what it does for that purpose and how it relates to the sentences before and after it.

Seven rules apply this, and the first six restrict sentences. A sentence with no work for its part is cut. A plain assertion stays only if its context gives it work. "And" and "also" set claims side by side without relating them. Two claims share a sentence only if one is the reason, condition, consequence, concession or contrast of the other. "Not X but Y" stays only if a reader could mistake X for Y. A connector such as "because" requires that the content hold that relation. The seventh rule lets facts that argue nothing, such as specification values, sit in lists and tables.

For every sentence the agent writes `does`, `back`, `next`, `joins` and `confusable` lines that end in a verdict of keep, repair, split or cut. It revises by the verdicts and delivers only the prose. The README traces rules 3 and 4 to a test round in which the agent accepted "also" as a link.

## Draft-writing

draft-writing keeps the author in charge: the user decides "the thesis, claims, structure, wording and final form". A new project has three article files, shared source maps and four files per section (arc, progress, material and draft). Sections share only the source maps and the article files, and "Do not copy or reference another section's user inputs, material or draft as synthesis inputs."

Each file has an owner module with a closed list of allowed content. Material, for example, may hold exact author wording, approved passages, basis references, provenance and passage-specific constraints. Before every write, the agent splits a proposal into units, finds the one owner whose Allowed list admits each unit, and writes nothing if none does. Approvals are separate: approving a source excerpt does not approve a synthesis, and approving material does not approve inserting it into the draft.

When white-box synthesis cannot fill a gap, AI text is written only on the user's request. It is marked `⟦AI-AUTHORED: exact wording⟧` through every save and insertion, and it is permanently excluded as white-box input, along with any relation that depends on it, because "Approval, copying, storage in material or surrounding Human wording never removes that exclusion."

## Standalone repositories

In October the skills were briefly split into separate repositories, which remain on GitHub as frozen copies.

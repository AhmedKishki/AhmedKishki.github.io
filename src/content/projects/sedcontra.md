---
title: sedcontra
summary: Adversarial cross-examination of an agent's proposal by two other agents.
area: personal
repos:
  - { name: sedcontra, url: "https://github.com/AhmedKishki/sedcontra" }
languages: [Rust]
started: "2026-10"
updated: "2026-11"
status: Version 0.1.0
order: 50
draft: false
---

sedcontra is a multi-agent system based on adversarial cross-examination. An agent cannot reliably review its own proposal, because a step it invented looks as solid to it as a true one, so sedcontra hands the proposal to two other models: an adversary raises critiques, and an advocate answers each one from the proposal's own words.

## The critique discipline

Both agents argue under one discipline, and every critique and answer quotes the proposal. A critique is substantial when it shows a failure in the proposal's own argument, so that the argument loses a step if the critique stands. It names its places, which are quotes from the proposal, and supports itself in one of five ways:

- **Gap:** a step $X \to Y$ whose premises can hold while its conclusion fails. The critique gives a case with $X$ true and $Y$ false and says what the step assumes without saying. In "our queries are slow, so we should move to Postgres" the queries may be slow because an index is missing, and then the move fixes nothing. A claim that $X$ is necessary for $Y$ is the step $\neg X \to \neg Y$.
- **Circularity:** a step that presupposes what it concludes. The critique quotes the premise and the conclusion and shows that they say the same thing.
- **Conflict:** two places that cannot both hold, both quoted.
- **Shift:** a word that changes meaning between a premise and a conclusion, both uses quoted.
- **Unused text:** a premise or stretch that no step uses, quoted.

A wish for more, such as a definition, a mechanism, a criterion or a theory, is not a critique unless it shows a step that fails without it.

## The advocate's rules

The advocate accepts a critique that shows a failure, and the acceptance says what the argument now lacks. It does not discuss a critique because the missing premise is true or obvious: if the proposal does not say it, the critique stands. It discusses a critique on one of two grounds:

- **Misreads:** the critique misreads the proposal. The advocate quotes the misread words and, when there is one, the place that answers it.
- **Unclear:** the critique gives no case, or its case has a false premise or a conclusion that still holds, or it asks for something no step needs. The advocate says exactly what is missing.

Quoting the place a critique attacks does not answer it, because the critique asks what that place rests on, whatever the place says. The advocate proposes no premise, reading or repair of its own, and only the adversary words a critique.

## Turns and code checks

Turns alternate, adversary first, and one adversary turn with one advocate turn is a round. Each agent has its own history and no tools, and sees only the proposal, the caller's context and the earlier turns. In round 1 the adversary raises every critique it can substantiate, and the advocate answers each one. In later rounds the adversary responds to every critique the advocate discussed. It drops the critique when the advocate's reading is right or it cannot supply what was asked, or it presses the critique with the case or quote the advocate asked for, not a restatement. It may raise critiques that the answers open up, and the advocate answers every critique raised or pressed.

The adversary declares itself satisfied when it has nothing to press or raise. The debate ends at that turn or after the advocate's turn in the last round. The round limit defaults to 1 and is clamped to 1–10, so a mistyped setting cannot run without end.

Code checks form and quotes and never substance, because the other side judges substance under the same discipline and no third agent referees. Every place and quote must occur in the proposal word for word once whitespace runs are collapsed to one space, and a quote that starts or ends with a letter or digit must match at a word boundary, so "so" does not match inside "also". The advocate must answer every critique raised or pressed exactly once, and the adversary must respond exactly once to every critique discussed and to no other. A turn that fails a check is sent back with the failures listed, and a second failure fails the run.

## How a critique ends

Each critique forms a thread of replies, and the last reply decides its status. An accept by the advocate makes the critique accepted, and a drop by the adversary makes it dropped. Any other last reply, a discussion by the advocate or a press by the adversary, leaves it open, with both sides' arguments in the report because neither has yielded. A satisfied adversary turn drops every critique still under discussion.

With the default single round the adversary critiques once and the advocate answers each critique, so every accepted critique is settled and every discussed one is open, and dropping needs a second round. The report gives the ending (satisfied in round 2 of 3, or the round limit reached with open critiques), a ledger of every critique with its kind, first place, round and status, the arguments behind each status and the transcript. It describes the proposal and never judges it, because the caller decides what to do with it.

It runs as an MCP server and a command line. Both agents use DeepSeek by default, so the proposal goes to that provider. No results are recorded yet.

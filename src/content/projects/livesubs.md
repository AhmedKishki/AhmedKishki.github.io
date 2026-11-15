---
title: livesubs
summary: Live transcription and translation of speech, as subtitles on attendees' phones.
area: personal
repos:
  - { name: livesubs, url: "https://github.com/AhmedKishki/livesubs", note: "MIT" }
languages: [Python, JavaScript]
started: "2026-10"
updated: "2026-10"
status: Version 1.1.0
order: 60
draft: false
---

livesubs is a pipeline for serving events with real-time translation. A Linux machine captures one shared microphone, Deepgram transcribes the speech, DeepSeek translates it, and attendees read English, German or Arabic subtitles in their phone browser after scanning a QR code.

## Pipeline

```text
microphone (PipeWire) -> Deepgram -> segmenter (pause or 2 s)
  -> one worker per language: transcription or translation
  -> WebSocket hub -> phones
```

## Capture and the sample clock

Capture delivers 16 kHz mono samples in frames of 20 ms, and ingest derives time from the samples consumed, $t = n/16000$ s for $n$ samples, never from the wall clock. Frame arrival also drives the segment cap and the silence detector, so nothing drifts against the audio and a file replayed at twice speed behaves as in real time. A recorder asked for its format with `-P` ignores the request and delivers 48 kHz stereo, six times the data rate of 16 kHz mono, which would corrupt every timing. `--rate`, `--channels` and `--format` are honoured.

A frame counts as speech when

$$
L \ge \max(F + 9\ \mathrm{dB},\ -60\ \mathrm{dBFS}),
$$

where $L$ is its level after removing the DC offset and $F$ is the noise floor. $F$ drops to any quieter frame at once and rises slowly, so speech does not immediately become the room's baseline. The absolute gate of −60 dBFS keeps a nearly silent room from reading as continuous talking.

## Segmentation

A speech run closes at the first of three signals: the 2 s cap, checked first, which closes the run even during unbroken speech; the provider's end-of-utterance hint; and 350 ms of trailing silence from the energy detector. The hint and the silence close a run only after 400 ms, because shorter fragments translate badly.

The cap follows from reading speed. Speech runs at 150–210 words per minute, so 2 s holds 5–7 words, and at 200 words per minute reading those take $5/200 \times 60 = 1.5$ s to $7/200 \times 60 = 2.1$ s. Segment cadence then matches reading time and lag stays stable. A larger cap gives the translator more of a clause but delays the request. A smaller cap makes shorter fragments and more requests, and a short German fragment may lack the clause-final verb its translation needs. The 2 s default has not been compared with 1.5 s or 3 s.

## The transcript assembler

A streaming recogniser describes speech in spans: while a span is open each event replaces the last hypothesis, and when it settles its text is complete. The segmenter cuts on its own schedule, so taking the newest event as the segment fails in two ways, both seen in real recordings. After a cut inside a span the next interim still starts with the words already sent, and a span that settles between two cuts is overwritten and its words are lost.

The assembler keeps the settled text, the open hypothesis and how far text has been sent, and a segment receives only what has not been sent. A word with start time $s$ and end time $e$ counts as unsent when its midpoint $(s+e)/2$ lies after $c$, the latest end time of the words already committed. The midpoint is used because the same word is re-timed by a few milliseconds between an interim and its final, and a test on the end would admit it twice.

## Language classification and routing

Automatic mode runs one Deepgram stream with `language=multi`, which labels each word with a language. The labels are used directly, because a separate text classifier would add a decision that can disagree with recognition. A segment is classified from the words it keeps, by the first matching rule: a label other than English or German gives `unknown`, all English gives `en`, all German gives `de`, both give `mixed`, and anything else gives `unknown`. A missing label is not filled from a majority vote, the previous segment, script or confidence, because a dominant language does not show that every word is in it.

| Class | English reader | German reader | Arabic reader |
|---|---|---|---|
| `en` | transcription | translation | translation |
| `de` | translation | transcription | translation |
| `mixed`, `unknown` | translation | translation | translation |

Transcription needs evidence that every word is in the reader's language, so any doubt is translated.

## Ordered workers, seq and rev

Each target language has one worker that handles one segment at a time and takes transcription and translation from the same queue, so a transcription cannot overtake an earlier translation. Languages keep separate queues, contexts and revision counters, so a slow request in one language blocks no other. `seq` numbers the source segments, and `rev` counts the revisions of one segment in one language, from 0. Translation streams text, which becomes draft revisions, and the finished translation is a `final`, after which no revision of that segment follows. A newer `rev` replaces the line in place.

Each connection has a mailbox holding at most one pending message per language, and the hub never waits on it, so a phone on poor WiFi cannot stall transcription for everyone. A newer revision replaces the pending one, which loses nothing because a revision completely replaces the older one. The mailbox refuses anything at or below the highest $(\mathrm{seq},\mathrm{rev})$ it has already accepted, so a phone never sees a `final` and then a `draft`.

## Demand-driven processing

Recognition runs while at least one viewer is connected, and operator connections do not count. It closes when the last viewer leaves, which stops the stream-open time the recognition provider bills. Each language is counted separately, so a translator is built, warmed and called only while someone reads that language and a segment needs translation, and a matching transcription never reaches one. A generation number advances only when the audience crosses between none and some, so a consumer that recorded it when it started paid work can tell that going to no viewers and back has made that work stale.

## Measurements

A 118.6 s recording of alternating English and German put no subtitle line in the wrong language, with a median server-side delay of 1.04–1.08 s for final lines; 8–13 of 55 lines per language were too short to tell. A load test with 1,000 simulated phones kept the server's 95th-percentile event-loop lateness at 17 ms. The recording used audiobook clips rather than a live room, and both tests predate the current language routing.

---
title: furniture-detection
summary: Finds the running heads and page numbers on PDF pages by comparing code lengths.
area: personal
repos:
  - { name: furniture-detection, url: "https://github.com/AhmedKishki/furniture-detection", note: "on crates.io, MIT" }
languages: [Rust]
started: "2026-11"
updated: "2026-11"
status: Version 0.2.1
order: 40
draft: false
---

When I ingest a book into my RAG, its headers, footers and page numbers end up in the text and pollute the results. furniture-detection finds these lines, which typesetters call furniture, in the positioned text lines from any PDF reader.

## Code length as the test

A code gives an event of probability $p$ a codeword of $-\log_2 p$ bits. A message of several events costs the sum of their lengths, each event coded given the ones before it:

$$
L(x_1 \dots x_n) = \sum_{i=1}^{n} -\log_2 P(x_i \mid x_1 \dots x_{i-1}).
$$

Two descriptions of the same line are two probability models of it, and a description $k$ bits shorter gave the line $2^k$ times the probability. The minimum description length principle turns this into a decision rule: prefer the description with fewer bits. A description has to pay for every choice it makes, including which page it copies from and the text it copies. Otherwise a copy could try every page and keep the best fit, and its length would stop measuring how well one other page predicts the line.

Video coding makes the same split: a frame is coded partly from its own pixels (intra prediction) and partly from the previous frame (inter prediction). With a page in place of a frame, furniture is what is cheaper to code from another page.

## Tokens and templates

Each line is normalised and split into tokens: words, single punctuation marks and numbers. A run of digits becomes the token `#` and a roman numeral `#r`, with the value kept apart. The token sequence without the values is the line's template, so `352 | Index` and `354 | Index` share the template `# | index`.

## Three descriptions of a line

**By its tokens.** Each token $w$ is coded given the token $v$ before it:

$$
P(w \mid v) = \frac{c(v,w) + \beta\,P_1(w)}{c(v) + \beta}, \qquad P_1(w) = \frac{c_\text{page}(w) + \alpha\,P_\text{book}(w)}{n_\text{page} + \alpha}.
$$

Here $c(v,w)$ counts the pair $v, w$ in the rest of the book and $c(v)$ the pairs that start with $v$. $c_\text{page}(w)$ and $n_\text{page}$ count $w$ and all tokens on the rest of the line's page. $P_\text{book}(w)$ is the book's frequency of $w$ with $\tfrac12$ added to every count, so that an unseen token costs a finite number of bits. The weights $\alpha$ and $\beta$ act as pseudo-observations of the broader estimate, so a context seen often relies mostly on its own counts. They are fitted to the book by golden-section search for the shortest total code length, which is maximum likelihood, so no threshold is set by hand. Every count leaves out the line itself, because counting it would let the line predict itself and favour exactly the lines that should cost most. The documentation's four-page example shows the effect: a body line costs 67.96 bits with itself left out and would cost 20.39 with its own tokens counted.

A number costs $-\log_2 P(n)$ with $P(n) = \dfrac{c(n) + \gamma\,2^{-\ell(n)}}{N + \gamma}$. Here $c(n)$ counts the same number elsewhere in the book, $N$ counts all numbers, $\gamma$ is a fitted weight, and $\ell(n) = E(d) + d \log_2 10$ is the cost of writing out the $d$ digits of $n$. $E(d) = 2\lfloor \log_2 d \rfloor + 1$ is the Elias gamma code, which gives small integers short codewords.

**As a copy of the line above.** The reference is the nearest line above on the same page whose horizontal extent overlaps and whose template is the same. Each number costs $\log_2 3$ bits to say whether it is the same as above, one more, or neither, plus its own code in the last case. Lists describe themselves this way. Without this description, the second item of a list that recurs at the same place on the next page would look like furniture.

**As a copy from another page.** The reference is the nearest line on another page that has the same template, measured between left edges, centres or right edges, whichever pair is closest, so that right-aligned folios pair up. With $p$ the line's page, $q$ the page copied and $u$ the number of users:

$$
L_\text{copy} = 1 + E(|q-p|) + \sum_{\text{numbers}} \big(\log_2 3 + c_n\big) + \frac{L_\text{tokens}}{u}
$$

where $c_n$ is 0 for a number that matches and $-\log_2 P(n)$ for one that does not.

The offset $1 + E(|q-p|)$ is one bit for the sign and the gamma code of the distance: 2 bits for the next page, 4 for two pages away, 10 for a page 18 to 20 pages away. Each number costs $\log_2 3$ bits to say whether it equals the reference's number, equals it moved on by the pages between the two, or is neither. This is why a page number, which is the earlier one plus the distance, costs almost nothing.

The last term was added in version 0.2.0. A copy needs a text to copy, which has to be written once, so its $u$ users split its cost $L_\text{tokens}$. A user is a page whose copy is shorter than the tokens. Before, two pages printing the same line each counted as a copy of the other and neither paid for the text, so a table header repeated on two pages was removed as furniture. In one book on critical realism, a table header on two successive pages costs 23.3 bits by its tokens and 2 as a copy, but pays 11.65 for the text, so the copy saves 9.7 bits, less than the 10.7 to 14.4 that the book's shares ask for. A running head on many pages pays next to nothing and is still found.

## Fitting the shares with hard EM

Saying which description a line uses also costs bits, $-\log_2 \pi_m$ for description $m$, where $\pi_m$ is the share of the book's lines that use it. The shares are unknown and depend on which line takes which description, so hard (classification) expectation–maximisation breaks the circle. It starts with each share at $\tfrac13$, gives each line the description with the smallest $L_m - \log_2 \pi_m$, and recounts

$$
\pi_m = \frac{\text{lines choosing } m + \tfrac12}{\text{lines} + \tfrac32},
$$

repeating until no line changes, for at most 64 rounds. A line is furniture when its final choice is the copy from another page. A copy therefore wins when

$$
L_\text{tokens} - L_\text{copy} > \log_2 \frac{\pi_\text{tokens}}{\pi_\text{copy}}.
$$

The threshold comes from the book. If 95% of its lines are described by their tokens and 5% as copies from another page, a copy must save more than $\log_2(0.95/0.05) = 4.25$ bits, and at 88% and 12% more than 2.87. In Hall's *Selected Writings on Marxism*, `354 | Index` on page 365 costs 37.4 bits by its tokens and 11.8 as a copy, which saves 25.6 against that book's threshold of 4.18, so it is removed. In Weatherby's *Language Machines*, the nearest other folio to `213` on page 222 is 18 pages back, so the copy saves 0.4 bits against 4.42 and the folio stays in the text. Hard EM leaves each line wholly in one description, where soft EM would keep fractions of a line in each.

## Results

On 550 pages from 22 books, with every disagreement with docling judged by hand:

| | Furniture found | Correct flags | Time per page |
|---|---|---|---|
| furniture-detection 0.1.1 | 98% | 92% | 5 ms |
| docling's layout model | 95% | 99% | 970 ms |

It finds more furniture than docling but removes more real text, mostly short note and citation lines. One person judged, the figures predate version 0.2, and the 5 ms covers the whole PDF extraction.

Written inside [ebook-hero](/projects/ebook-hero/) and moved into its own crate with [concept-map](/projects/concept-map/). The [documentation](https://github.com/AhmedKishki/furniture-detection/blob/main/docs/furniture-detection.md) works through the mathematics.

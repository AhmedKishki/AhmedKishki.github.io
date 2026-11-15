---
title: ebook-hero
summary: Search, read and quote-check one PDF or EPUB, from the command line, MCP or a desktop app.
area: personal
repos:
  - { name: ebook-hero, url: "https://github.com/AhmedKishki/ebook-hero", note: "MIT; 0.4.0 on crates.io" }
languages: [Rust, JavaScript]
started: "2026-11"
updated: "2026-11"
status: Version 0.5.0
order: 20
draft: false
---

ebook-hero searches one book, prints the text around a hit, checks quotes against the book and maps its concepts. A command line, an MCP server for agents and a small desktop window share one result format.

## Passages and locators

Each reader turns a PDF or an EPUB into blocks (headings, paragraphs, list items and notes) in reading order, and nothing after the readers changes them. The PDF reader compares each line with measures of its own page: a step between line tops of more than 1.5 times the page's median step opens a paragraph, so a 12 pt pitch makes any step over 18 pt a break. [furniture-detection](/projects/furniture-detection/) sets aside running heads and page numbers before paragraphs are built.

A passage is the unit of the index, the embeddings, the hits, `read` and quote verification. Whole blocks are packed in reading order until the next block would take the passage past 220 words. A heading closes the passage and reaches later passages only as their `section` path, and a passage never crosses a section or an EPUB file. Using the same unit everywhere means a hit needs no further cutting: the text a search returns is the text `read` prints and verification checks. A locator such as `p. 12–13 (xii–xiii)` or `CHAPTER I ¶3–5, print p. 45` sits beside the text and is never written into it, so search and verification compare text that holds only the book's words. [concept-map](/projects/concept-map/) builds the concept graph from the same passages.

## BM25 ranking

Each passage is indexed in two fields with tantivy. The `text` field is lowercased, stripped of 33 English stopwords and nine question words, and stemmed, so "heads" matches "head" and a query phrased as a question does not match every passage that asks one. The `text_exact` field keeps every word unstemmed, because phrases and verification must report what the book says. A term $t$ in a passage $d$ scores

$$
\mathrm{bm25}(t,d)=\mathrm{idf}(t)\cdot\frac{(k_1+1)\,f}{f+k_1\left(1-b+b\,\frac{|d|}{\mathrm{avgdl}}\right)},\qquad \mathrm{idf}(t)=\ln\left(1+\frac{N-n+0.5}{n+0.5}\right).
$$

Here $f$ counts the occurrences of $t$ in $d$, $|d|$ is the number of tokens kept for $d$, $\mathrm{avgdl}$ is the average of $|d|$ over all passages, $N$ is the number of passages and $n$ the number that contain $t$. The constants are $k_1=1.2$ and $b=0.75$. The idf makes a rare term count more than a common one. The fraction saturates: in a passage of average length a term occurring once contributes $1\cdot\mathrm{idf}$, twice $1.375\cdot\mathrm{idf}$ and never more than $2.2\cdot\mathrm{idf}$. The factor $b$ discounts passages longer than average.

## Embeddings and rank fusion

`BAAI/bge-small-en-v1.5` maps a text to 384 numbers, trained so that a query and a passage that answers it point in similar directions. Vectors are scaled to unit length, so the dot product of a query vector $q$ and a passage vector $p$ is their cosine similarity:

$$
\cos(q,p)=\sum_{i=1}^{384} q_i\,p_i.
$$

The best 50 passages at or above 0.55 are kept. Every passage has some similarity to any query, so without the floor an unrelated query would still return a full list.

Hybrid search merges the best 50 passages by BM25 and the best 50 by cosine with weighted reciprocal rank fusion:

$$
\mathrm{rrf}(d)=\sum_{i\,:\,d\in L_i}\frac{w_i}{60+r_i(d)}.
$$

Here $L_i$ is one of the two lists, $r_i(d)$ the rank of passage $d$ in it counted from 1, and $w_i$ the list's weight, 1.25 for BM25 and 1.0 for the vectors. Cormack, Clarke and Büttcher defined the unweighted form with the constant 60; the weights are ebook-hero's. Ranks are fused because BM25 scores have no upper bound and depend on the query's terms, while cosines lie between −1 and 1. A passage ranked 2nd by BM25 and 1st by cosine scores $1.25/62 + 1/61 \approx 0.0366$, and a passage that only BM25 ranks 1st scores $1.25/61 \approx 0.0205$.

## Reranking

The cross-encoder `jina-reranker-v1-turbo-en` reads the query and one passage together and returns a score for how well the passage answers it. The embedding model encodes passages separately, so their vectors are computed once, while the reranker costs one model run per candidate on every query. The fused list therefore picks 30 candidates and the reranker reorders only those. Since `top_k` is at most 20, every returned hit has been reranked.

## Quote verification

A quote that differs from the book by one word makes a citation wrong, so `verify` forgives only case, punctuation and spacing and computes no similarity score. Quote and book pass through the same normalisation (ligatures expanded, soft hyphens and control characters dropped, NFC, whitespace collapsed) and are split into words, which are runs of letters and digits, lowercased and unstemmed. `exact` is a case-sensitive match that starts and ends on word boundaries, so `5 percent` does not match inside `3.5 percent`. `equivalent` is the same words in the same order. An `exact` match anywhere beats an `equivalent` one, and a changed word form such as `entropies` for `entropy` gives `none`.

The search window is a passage plus the next one, so a quote spans at most two passages and a quote over 440 words is refused. A cited passage is checked first. If it lacks the quote and another passage holds it, the result is `none` with `found_elsewhere`, which means the citation names the wrong passage. For `none`, the closest passage shares the longest run of consecutive words with the quote. With $\mathrm{run}(i,j)$ the length of the shared run ending at quote word $i$ and passage word $j$, a dynamic programme computes

$$
\mathrm{run}(i,j)=\begin{cases}\mathrm{run}(i-1,j-1)+1 & \text{if quote word } i \text{ equals passage word } j,\\ 0 & \text{otherwise.}\end{cases}
$$

The quote "the Queen was very kind to everyone" shares "the queen was" with passage 93 of *Alice's Adventures in Wonderland*, which gives 3 of 7 words, differing at "very".

## Limits

- English only, and a PDF needs a text layer.
- Search quality is untested beyond a five-query regression test.

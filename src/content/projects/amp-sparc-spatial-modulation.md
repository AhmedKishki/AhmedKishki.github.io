---
title: Spatial Modulation and Sparse Regression Codes
summary: Approximate message passing for spatial modulation over frequency-selective MIMO channels.
area: research
repos:
  - { name: AMP-SPARC-SpatialModulation, url: "https://github.com/AhmedKishki/AMP-SPARC-SpatialModulation" }
languages: [Python]
started: "2023-10"
updated: "2024-07"
order: 1
---

I studied how to recover the active transmit antennas and their symbols in a frequency-selective multiple-input multiple-output (MIMO) channel. Volker Kühn and I published the work at ISWCS 2024. [IEEE paper](https://ieeexplore.ieee.org/document/10639126)

## From spatial modulation to SPARCs

A modulated sparse regression code (SPARC) splits a coefficient vector $\boldsymbol{x}$ into $L$ sections of $M$ entries. In section $\ell$, the index $i_\ell$ selects one column $\boldsymbol{a}_{\ell,i_\ell}$ of the design matrix $\boldsymbol{A}$ and the symbol $s_\ell$ from constellation $\mathcal{S}$ sets its weight. With $\boldsymbol{e}_i$ the $i$-th unit vector, the SPARC codeword $\boldsymbol{c}$ is the sum of those weighted columns. [Modulated SPARC construction](https://arxiv.org/html/2004.09549#S2)

$$
\begin{aligned}
\boldsymbol{x}_\ell &= s_\ell\boldsymbol{e}_{i_\ell},\\
\boldsymbol{c}=\boldsymbol{A}\boldsymbol{x}
  &= \sum_{\ell=1}^{L}s_\ell\boldsymbol{a}_{\ell,i_\ell}.
\end{aligned}
$$

In the simulator, each section represents one group of transmit antennas in one time slot. The nonzero position selects the active antenna and its value gives the transmitted symbol. This example activates antennas 2 and 7.

$$
\boldsymbol{x}[t]
= \bigl[\underbrace{0,\,s_1,\,0,\,0}_{\text{group 1}}
  \ \big|\ \underbrace{0,\,0,\,s_2,\,0}_{\text{group 2}}\bigr]^{\mathsf T}.
$$

The receiver sees $D$ delayed copies of the transmit signal, each mixed by a channel tap $\boldsymbol{H}_d$, plus additive white Gaussian noise $\boldsymbol{w}[t]$. Stacking time slots gives the sparse regression model with the channel as $\boldsymbol{A}$.

$$
\begin{aligned}
\boldsymbol{y}[t]
  &= \sum_{d=0}^{D-1}\boldsymbol{H}_d\boldsymbol{x}[t-d]+\boldsymbol{w}[t],\\
\boldsymbol{y} &= \boldsymbol{A}\boldsymbol{x}+\boldsymbol{w}.
\end{aligned}
$$

Each tap occupies a block diagonal of $\boldsymbol{A}$, giving a block-Toeplitz matrix. The tap powers give the decoder a banded variance profile like that of a spatially coupled SPARC. [Channel model](https://github.com/AhmedKishki/AMP-SPARC-SpatialModulation/blob/8a3d2d61f7b3a3017bf6bf88bea696ee6021c30e/channel.py#L75-L92)

## AMP decoding

At iteration $k$, the spatially coupled approximate message passing decoder (SCAMP) updates the residual $\boldsymbol{z}^k$ and uses the conjugate transpose $\boldsymbol{A}^{\mathsf H}$ to form a noisy estimate $\boldsymbol{r}^k$ of the sparse transmit vector.

$$
\begin{aligned}
\boldsymbol{z}^k
  &= \boldsymbol{y}-\boldsymbol{A}\hat{\boldsymbol{x}}^k
       +\boldsymbol{b}^k\odot\boldsymbol{z}^{k-1},\\
\boldsymbol{r}^k
  &= \hat{\boldsymbol{x}}^k
       +\boldsymbol{\tau}^k\odot\boldsymbol{A}^{\mathsf H}
        \bigl(\boldsymbol{z}^k/\boldsymbol{\phi}^k\bigr).
\end{aligned}
$$

The term with $\boldsymbol{b}^k$ is the Onsager correction. It compensates for feedback from reusing the channel matrix across iterations. The code estimates the variance weights $\boldsymbol{\phi}^k$ and $\boldsymbol{\tau}^k$ per receive and transmit block. Products marked $\odot$ and the division are elementwise. [SCAMP implementation](https://github.com/AhmedKishki/AMP-SPARC-SpatialModulation/blob/8a3d2d61f7b3a3017bf6bf88bea696ee6021c30e/scamp.py#L43-L67)

The denoiser treats $\boldsymbol{r}_\ell^k$ as the true section plus circular complex Gaussian noise with variance $\tau_\ell^k$ per entry. For uniform choices and equal-energy symbols such as QPSK, it gives each candidate antenna and symbol pair a posterior probability $p_\ell^k(i,s)$. The next estimate is the weighted mean of those candidates.

$$
\begin{aligned}
p_\ell^k(i,s)
  &\propto \exp\!\left(\frac{2\operatorname{Re}(\bar{s}\,r_{\ell,i}^k)}
                                      {\tau_\ell^k}\right),\\
\hat{\boldsymbol{x}}_\ell^{k+1}
  &= \sum_{i,s}p_\ell^k(i,s)\,s\,\boldsymbol{e}_i.
\end{aligned}
$$

The probabilities sum to one across all positions and symbols in the section. Every candidate has one active antenna, which is how the denoiser uses the SPARC structure. [Modulated SPARC decoder](https://arxiv.org/html/2004.09549#S3)

## Follow-up decoders

- **VAMP** (vector approximate message passing) uses a singular value decomposition of the channel for its linear minimum mean-square error step and alternates that step with sparse denoising. [VAMP paper](https://arxiv.org/abs/1610.03082) · [Implementation](https://github.com/AhmedKishki/AMP-SPARC-SpatialModulation/blob/8a3d2d61f7b3a3017bf6bf88bea696ee6021c30e/vamp.py#L56-L94)
- **BAMP** propagates individual variances using the squared channel magnitudes $|A_{ij}|^2$. For segmented inputs it computes posterior means and variances with a prior of one active antenna per group. [BAMP implementation](https://github.com/AhmedKishki/AMP-SPARC-SpatialModulation/blob/8a3d2d61f7b3a3017bf6bf88bea696ee6021c30e/bamp.py#L48-L79)

## Monte Carlo simulations

The PyTorch simulator sweeps $E_b/N_0$, the ratio of energy per bit to noise spectral density. At each point it samples antenna selections, symbols and Gaussian noise in batches and periodically draws a new fading channel. It makes hard decisions to measure bit and frame error rates, then averages the rates and iteration counts across trials and saves them as JSON. [Simulation loop](https://github.com/AhmedKishki/AMP-SPARC-SpatialModulation/blob/8a3d2d61f7b3a3017bf6bf88bea696ee6021c30e/scamp_model.py#L43-L66) · [Error metrics](https://github.com/AhmedKishki/AMP-SPARC-SpatialModulation/blob/8a3d2d61f7b3a3017bf6bf88bea696ee6021c30e/loss.py#L67-L103)

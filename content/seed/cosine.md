Here is a small identity I keep coming back to, because the proof is shorter than the statement looks.

**Claim.** For every real $\theta$,
$$\cos^2\theta = \frac{1 + \cos 2\theta}{2}.$$

**Proof.** Start from the addition formula $\cos(\alpha+\beta) = \cos\alpha\cos\beta - \sin\alpha\sin\beta$. Setting $\alpha = \beta = \theta$ gives
$$\cos 2\theta = \cos^2\theta - \sin^2\theta.$$
Now replace $\sin^2\theta$ with $1 - \cos^2\theta$:
$$\cos 2\theta = \cos^2\theta - (1 - \cos^2\theta) = 2\cos^2\theta - 1.$$
Rearranging for $\cos^2\theta$ gives the claim. $\blacksquare$

The same move, applied to $\sin^2\theta = \tfrac{1}{2}(1 - \cos 2\theta)$, is the engine behind half of the integrals you will ever compute by hand. For instance,
$$\int_0^{\pi} \cos^2\theta \, d\theta = \int_0^{\pi} \frac{1 + \cos 2\theta}{2}\, d\theta = \frac{\pi}{2}.$$

A short table, because the blog supports them:

| $n$ | $\displaystyle\int_0^{\pi}\cos^{n}\theta\,d\theta$ |
| :-: | :-: |
| $0$ | $\pi$ |
| $2$ | $\pi/2$ |
| $4$ | $3\pi/8$ |

Nothing deep — just a reminder that the double-angle formula earns its keep.

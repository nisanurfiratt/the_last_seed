# The Last Seed — Design Rationale

### Idea

The Last Seed is an interactive ecosystem in which the participant tries to grow the last surviving seed with limited water and solar energy. Actions change the plant’s condition, while its final flower colour reflects the environment shaped through play. The goal is to discover how resource choices affect a fragile system.

### Premise A and B

The project combines Agency and Possibility. Agency appears through choices to water, redirect light, nourish soil, build a shelter or let a cycle pass. Their consequences depend on conditions: redirecting light supports growth only when moisture is at least 35%; otherwise, it raises stress. Possibility appears through changing action availability. Nourishing soil unlocks after sprouting and requires water and solar energy. A shelter unlocks at 20% stress if solar energy remains. Blooming requires 82% growth, moisture of at least 25%, soil health of at least 45% and stress below 65%. Each action therefore changes what can happen next.

### Theory

Wardrip-Fruin et al. (2009) connect agency to the relationship between participants’ intentions and the actions supported by a system’s computational model. This informed the resource rules: choices must produce consequential effects. However, the paper does not specify how users should perceive each consequence. Gaver (1991) describes affordances as action possibilities arising from the relationship between an actor and an environment, and stresses their perceptibility. This shaped the interface: unavailable actions remain visible with the condition needed to unlock them. Gaver’s framework does not prescribe the numerical thresholds; these are design decisions in this prototype.

### What I Learned

I tested the project with an English-speaking participant who had not seen it before. Initially, they were unsure what to do; after reading the interface text, they understood that actions could be selected, but first chose options by trial and error. After roughly 10–15 repeated attempts (about 8–9 minutes), they began to infer the resource logic and noticed that flower colours differed between runs. In response, I revised the opening instruction to state the goal and clarify that choices change which actions become available. The test showed that colour feedback is noticeable, while strategy takes experimentation to learn.

---

**Live project:** https://nisanurfiratt.github.io/the_last_seed/

### References

Wardrip-Fruin, N., Mateas, M., Dow, S., & Sali, S. (2009). Agency reconsidered. *Proceedings of the 2009 DiGRA International Conference: Breaking New Ground: Innovation in Games, Play, Practice and Theory*. DiGRA. https://doi.org/10.26503/dl.v2009i1.369

Gaver, W. W. (1991). Technology affordances. In *Proceedings of the SIGCHI Conference on Human Factors in Computing Systems* (pp. 79–84). ACM. https://doi.org/10.1145/108844.108856

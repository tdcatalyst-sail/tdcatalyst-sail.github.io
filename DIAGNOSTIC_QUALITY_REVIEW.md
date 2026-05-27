# AI Adoption Diagnostic — Quality Review

## Executive Summary
The diagnostic is well-constructed with strong logic and research grounding. Minor refinements identified below can enhance clarity and strengthen archetype differentiation.

---

## 1. QUESTION ANALYSIS

### Strengths
✓ All 12 questions are well-anchored to research sources (Deloitte, MIT, SHRM, etc.)
✓ Questions progress logically: **Diagnosis → Assessment → Root Causes → Response Patterns → Outcome**
✓ Clear, scenario-based language that practitioners recognize
✓ Supporting data in option descriptions grounds answers in evidence

### Structure Quality
**Q1-3 (Diagnosis & Assessment):** Where and how the stall appears
**Q4-6 (Root Cause Exploration):** Governance, timing, and response patterns
**Q7-9 (Organizational Capability):** Sensing-Seizing-Transforming framework (Teece)
**Q10-12 (Lived Experience & Clarity):** Workforce reality and stated needs

### Minor Issues & Recommendations

#### Issue #1: Q2 Option Inconsistency
**Problem:** Q2 "Which tier describes your organization" has 5 options, but the framing suggests a single tier choice. However, "Select all that apply" allows multi-selection. This creates logical tension.
- "Hard to say" (option 3) and "Pre-deployment" (option 4) are different _states_
- Others are maturity _levels_ on a progression

**Recommendation:** Reframe Q2 instructions or split into two tighter questions:
- ONE question: "Best describes our current position" (single select)
- Or clarify that orgs with fractured tiers should select multiple

#### Issue #2: Q4 & Q5 Redundancy
**Problem:** Both questions probe HR/People Operations involvement but from different angles:
- Q4: "Who owns AI transformation?" → HR/People OPs as owner
- Q5: "When did People Operations become a voice?" → Timing of HR involvement

While both are valuable, they overlap. An organization answering "HR owns it" in Q4 will likely answer "From the beginning" in Q5.

**Recommendation:** Keep both but add context to Q5 to clarify the distinction:
- Q5 could shift to: "How empowered is People Operations to influence operating model redesign?" (probe actual _authority_, not just _presence_)

#### Issue #3: Q6 Covers Too Much Ground
**Problem:** Q6 asks about response to "skills and talent challenge" but options span:
- Opt 1: Fluency training (access/enablement layer)
- Opt 2: Upskilling (skills layer)
- Opt 3: Career redesign (role structure layer)
- Opt 4: Organizational redesign (system layer)

This is a maturity progression, not a choice of _response types_. An organization may use ALL of these simultaneously.

**Recommendation:** Reframe Q6 as: "What is your organization's PRIMARY response (the one receiving the most investment/focus)?" or split into two questions.

#### Issue #4: Q7-9 Naming (Sensing-Seizing-Transforming)
**Clarity Issue:** While parenthetical labels are good, the framework names may not be immediately recognizable to practitioners unfamiliar with Teece.

**Recommendation:** Keep the labels but add a one-sentence context in the intro or tooltip:
- "(Sensing) How well can your organization detect and respond to weak signals?"
- "(Seizing) How quickly do you move from insight to commitment?"
- "(Transforming) How frequently does work actually redesign when AI arrives?"

---

## 2. SCORING LOGIC ANALYSIS

### Current Distribution
| Archetype | Max Points | % of Total | Ideality |
|-----------|-----------|-----------|----------|
| Seam | 29 | 23% | ✓ Good |
| UP | 31 | 24% | ✓ Good |
| OM | 35 | 28% | ⚠ Slightly High |
| Sensing | 32 | 25% | ✓ Good |
| **Total** | **127** | **100%** | Avg Deviation: 1.8pts |

### Scoring Alignment Audit

#### Seam Organization (Governance/Structural Seam)
**Expected Indicators:**
- Technology/IT/Product owns transformation (Q4 opts 0-2) ✓
- HR brought in late (Q5 opt 1) ✓
- Tool fit problems (Q1 opt 4, Q3 opt 4) ✓
- Access without activation (Q10 opt 0) ✓
- Small group driving, majority watching (Q10 opt 0) ✓

**Scoring Quality:** Excellent. Seam questions form a coherent narrative: _governance gap → late HR involvement → tool-fit mismatches → adoption theater_.

**One Question:** Is Q11 opt 0 ("Access and training") correctly weighted for Seam? This feels more like a _symptom_ Seam creates, rather than a _cause_. Currently weighted {Seam: 1, Sensing: 1}. Consider {Seam: 0, Sensing: 1} since "access blocks" are often _misdiagnosed_ by Seam orgs.

---

#### Unmarked Passage / Identity (UP)
**Expected Indicators:**
- Belief/trust gaps (Q3 opt 1) ✓✓ [3pts]
- Fractured leadership signals (Q2 opt 3) ✓
- Leadership performing transition not yet entered (Q4 opt 4, Q5 opt 3) ✓
- Compliance without belief (Q10 opt 2-3) ✓
- Identity/passage unclear (Q12 opt 2) ✓

**Scoring Quality:** Strong. UP questions capture the _liminal collapse_ (Victor Turner reference) — organizations in transition that haven't yet named the shift.

**Strength Question:** Why is "How to align leadership team" (Q12 opt 2) weighted {UP: 3}? This feels equally valid for _all_ archetypes. 

**Recommendation:** Consider {UP: 2, OM: 1} to signal that alignment is both an identity AND operating model problem.

**Missing Indicator:** There's no Q directly asking about "vocabulary shifts" or "espoused vs. enacted strategy." Q10 options capture belief gaps, but not explicit _identity framing_ gaps. This is addressed thematically but could be more explicit.

---

#### Operating Model Lag (OM)
**Expected Indicators:**
- Tools deployed, work unchanged (Q1 opt 2, Q9 opt 0) ✓✓ [3pts each]
- Surface-level use (Q2 opt 0) ✓
- Structural problem recognized (Q3 opt 2) ✓
- HR empowered to redesign (Q4 opt 3) ✓
- Redesign not yet prioritized (Q9 opt 1) ✓

**Scoring Quality:** Very strong. Questions clearly map to "tools exist, workflows don't."

**Concern - Overweighting:** OM has 35 max points (+5 above target). This is driven by:
- Q1 opt 2: 3pts
- Q9 opt 0: 3pts
- Q12 opt 1: 3pts
- Q7 opt 2, Q8 opt 2, Q11 opt 2: 2pts each

OM is being heavily weighted in "best practices" options (systematic redesign). While OM is the "most common" stall, the over-representation may bias diagnosis toward OM in ambiguous cases.

**Recommendation:** Consider reducing one of the 3-point OM options:
- Q12 opt 1 ("How to move from surface to redesign") → reduce from {OM: 3} to {OM: 2, Sensing: 1}? 
- This would drop OM from 35 → 34, bringing it to target.

---

#### Sensing Deficit (Environmental)
**Expected Indicators:**
- Board asking unanswerable questions (Q1 opt 3) ✓
- Fractured position (Q2 opt 3) ✓
- Right frame lacking (Q3 opt 3) ✓
- Weak sensing capability (Q7 opt 0) ✓
- Slow decision speed (Q8 opt 0) ✓
- Systematic sensing lacking (Q9 opt 2) ✓

**Scoring Quality:** Excellent. Clear narrative: _environment changing faster than sensing infrastructure can detect → decision speed lags → transformation can't adapt_.

**Strength Check:** Sensing questions form a tight, cohesive story around the "detect-activate-respond" loop. No contradictions found.

---

## 3. ARCHETYPE DISTINCTNESS CHECK

### Do results point to clearly different challenges?

| Challenge | Primary Driver | Secondary Driver | Tertiary |
|-----------|----------------|------------------|----------|
| **Seam** | Governance (Q4-5) | Tool fit (Q1, Q3) | Activation theater (Q10) |
| **UP** | Belief gap (Q3) | Identity framing (Q2, Q4, Q5) | Leadership signal (Q10) |
| **OM** | Workflow redesign gap (Q1, Q9) | Tool-work fit (Q2) | Role structure (Q6) |
| **Sensing** | Environmental radar (Q7-8) | Strategy currency (Q3, Q12) | Decision speed (Q8) |

**Distinctness Rating: 8/10 ✓**

Archetypes are clearly separable:
- **Seam vs. OM:** Seam = _who's in the room_; OM = _what work redesign_
- **UP vs. Seam:** UP = _identity unnamed_; Seam = _structural (not identity)_
- **Sensing vs. OM:** Sensing = _external radar_; OM = _internal workflow_

**Edge Case:** Could someone score high on both Seam _and_ OM?
- Yes, if: governance is fragmented AND workflows haven't redesigned. This is realistic (many orgs have both).
- The normalization algorithm will pick whichever is _stronger_, which is correct.

---

## 4. QUESTION-TO-RESULT PATHWAY LOGIC

### Test Cases: Do answers produce sensible diagnoses?

#### Test 1: Pure "Seam" Scenario
**Answer pattern:** 
- Q1: Tech/IT leadership (Seam)
- Q4: "Technology owns it" (Seam)
- Q5: "Brought in after tech decisions" (Seam)
- Q10: "Small group driving, majority watching" (Seam)
- Q11: "Access/training was the block" (Seam)
- Remaining: Mixed/neutral

**Expected Result:** Seam Organization ✓
**Diagnosis Quality:** Excellent — "The right people weren't in the room early."

---

#### Test 2: Pure "Unmarked Passage" Scenario
**Answer pattern:**
- Q3: "Belief/trust problem" (UP 3pts)
- Q4: "No clear owner" (UP 3pts)
- Q10: "Compliance not belief" (UP 2-3pts)
- Q12: "Align leadership on moves, not tools" (UP 3pts)
- Remaining: Mixed

**Expected Result:** Unmarked Passage ✓
**Diagnosis Quality:** Excellent — "Leadership is performing a transition it hasn't entered."

---

#### Test 3: Pure "Operating Model Lag" Scenario
**Answer pattern:**
- Q1: "Work unchanged despite usage" (OM 3pts)
- Q2: "Surface level" (OM 2pts)
- Q9: "Rarely redesign, layer on top" (OM 3pts)
- Q12: "How to move from surface to redesign" (OM 3pts)
- Remaining: Mixed

**Expected Result:** Operating Model Lag ✓
**Diagnosis Quality:** Excellent — "Tools exist, workflows don't."

---

#### Test 4: Mixed Scenario (Realistic Edge Case)
**Answer pattern:**
- Strong OM signals: Q1 opt 2, Q9 opt 0, Q12 opt 1 (OM: 3+3+3 = 9pts)
- Strong Seam signals: Q4 opt 0, Q5 opt 1 (Seam: 2+2 = 4pts)
- Moderate UP signals: Q3 opt 1, Q10 opt 2 (UP: 3+2 = 5pts)

**Score normalization:**
- OM: 9/35 = 26% (normalized)
- Seam: 4/29 = 14% (normalized)
- UP: 5/31 = 16% (normalized)

**Result:** Operating Model Lag (highest normalized %)

**Quality Check:** Is this the RIGHT diagnosis for an org that has BOTH governance gaps (Seam) and workflow redesign gaps (OM)?
- **Answer:** Yes. If pressed to name ONE challenge, OM is more immediately solvable and less structural than Seam.
- The result could include a note: "With secondary governance considerations" (future enhancement).

---

## 5. LOGICAL CONSISTENCY AUDIT

### Question Coherence Matrix

| Q# | Archetype Focus | Consistency |
|--|--|--|
| Q1 | Seam, OM, Sensing | ✓ Where stall appears |
| Q2 | OM, UP, Sensing | ✓ Maturity/clarity assessment |
| Q3 | UP, OM, Seam, Sensing | ✓ Gap framing (all archetypes cover gaps) |
| Q4 | Seam, UP | ✓ Ownership structure |
| Q5 | Seam, UP, Sensing | ✓ HR voice/timing |
| Q6 | OM, Sensing, UP | ✓ Response maturity |
| Q7 | Sensing | ✓ Detection capability |
| Q8 | Sensing, OM | ✓ Response speed |
| Q9 | OM, Sensing, UP | ✓ Redesign frequency |
| Q10 | Seam, OM, UP, Sensing | ✓ Workforce experience |
| Q11 | Seam, OM, UP, Sensing | ✓ Barriers |
| Q12 | OM, UP, Sensing, Seam | ✓ Clarity needs |

**Finding:** No illogical question orderings. The progression from diagnosis → assessment → root cause → patterns → clarity is sound.

---

## 6. REFINEMENT RECOMMENDATIONS

### Priority 1 (High Impact)
**Reduce Q12 opt 1 OM weight from 3 → 2**
- Current: Q12 opt 1 = {OM: 3}
- Proposed: Q12 opt 1 = {OM: 2, Sensing: 1}
- Rationale: Brings OM from 35 → 34, achieving target 30±5. The option is about moving from surface to redesign, which is both OM (redesign) and Sensing (strategic clarity).

**Impact on scores:** Seam: 29, UP: 31, OM: 34, Sensing: 33 (excellent balance)

---

### Priority 2 (Clarity/UX)
**Reframe Q6 instructions:**
- Current: "What is your organization's primary response to the AI skills and talent challenge?"
- Proposed: "Which response has received the MOST investment and focus?"
- Rationale: Clarifies that this is a ranking of _actual priority_, not a choice of single path.

---

### Priority 3 (Optional Enhancement)
**Add archetype relationship note in results:**
- After primary diagnosis, note secondary patterns if applicable.
- Example: "Your primary challenge is Operating Model Lag. However, your responses suggest secondary Seam dynamics—governance may be limiting your redesign efforts."
- Rationale: Acknowledges that most organizations have overlapping challenges; increases diagnostic credibility.

---

### Priority 4 (Future Refinement)
**Consider split Q2 into two tighter questions:**
- Q2a (single-select): "Which best describes where you are?" (maturity tier)
- Q2b (multi-select): "Which other tiers does your organization occupy across functions?" (fractured position)
- Rationale: Improves clarity of tier vs. fragmentation.

---

## 7. RESEARCH GROUNDING CHECK

All 12 questions cite research. Verification:
- ✓ Deloitte cited 8 times (appropriate weight for largest dataset)
- ✓ MIT/Harvard cited 3 times (specialized: GenAI Divide, NANDA)
- ✓ SHRM, Index.dev, BetterUp, Teece: each cited appropriately
- ✓ TDcatalyst proprietary frameworks included (ownership claimed)

**Quality:** Excellent. Heavy reliance on 2026 Deloitte data (current). No single source dominates inappropriately.

---

## 8. FINAL ASSESSMENT

| Dimension | Rating | Notes |
|-----------|--------|-------|
| **Question Design** | 8.5/10 | Minor clarity issues in Q2, Q6. Overall coherent. |
| **Scoring Logic** | 8/10 | OM slightly overweighted. Easy fix (1 reduction). |
| **Archetype Distinctness** | 8.5/10 | Clear separation. Some realistic overlap expected. |
| **Research Grounding** | 9.5/10 | Excellent citation density and currency. |
| **Pathway Logic** | 9/10 | Test cases all produce sensible results. |
| **User Experience** | 8/10 | Clear flow. Minor UX clarity improvements suggested. |

### Overall: **8.3/10 — Strong Diagnostic with Minor Refinements Pending**

---

## RECOMMENDED ACTION PLAN

### Implement Immediately (1 file change):
1. **Reduce Q12 opt 1 OM weight:** {OM: 3} → {OM: 2, Sensing: 1}
   - File: preliminary-diagnostic.html, line ~512
   - Impact: Brings OM to target; no breaking changes

### Implement in Next Round (UX/Clarity):
2. Clarify Q6 instructions
3. Add parenthetical context to Sensing/Seizing/Transforming labels

### Consider for Future Enhancement:
4. Split Q2 into two-part question (maturity + fragmentation)
5. Add secondary diagnosis notation in result copy

---

## Sign-off
**Diagnostic quality is production-ready.** Recommended priority-1 refinement (Q12 scoring) is low-risk and high-benefit. All test cases produce coherent, actionable diagnoses.

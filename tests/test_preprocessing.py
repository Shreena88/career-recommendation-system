"""
Property-based tests for normalization functions in utils/preprocessing.py.

**Validates: Requirements 2.1–2.5**
"""

import sys
import os

# Ensure the project root is on the path so utils can be imported
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from hypothesis import given, settings
import hypothesis.strategies as st

from utils.preprocessing import (
    SKILL_ALIASES,
    EDUCATION_NORMALIZATION,
    SPECIALIZATION_NORMALIZATION,
    CAREER_NORMALIZATION,
    normalize_skill,
    normalize_skills_list,
    normalize_education,
    normalize_specialization,
    normalize_career,
)


# ---------------------------------------------------------------------------
# Property 1: Normalization alias round-trip
# Validates: Requirements 2.1
# ---------------------------------------------------------------------------

@given(st.sampled_from(list(SKILL_ALIASES.keys())))
@settings(max_examples=100)
def test_property1_normalize_skill_round_trip(alias):
    """
    **Validates: Requirements 2.1**

    For any known skill alias, applying normalize_skill once gives the
    canonical form. Applying it a second time must return the same result
    (idempotence / round-trip property).
    """
    once = normalize_skill(alias)
    twice = normalize_skill(once)
    assert twice == once, (
        f"normalize_skill is not idempotent for alias '{alias}': "
        f"first={once!r}, second={twice!r}"
    )


# ---------------------------------------------------------------------------
# Property 2: Education normalization idempotence
# Validates: Requirements 2.2
# ---------------------------------------------------------------------------

@given(st.sampled_from(list(EDUCATION_NORMALIZATION.keys())))
@settings(max_examples=100)
def test_property2_normalize_education_idempotence(alias):
    """
    **Validates: Requirements 2.2**

    For any known education alias, applying normalize_education twice must
    produce the same result as applying it once.
    """
    once = normalize_education(alias)
    twice = normalize_education(once)
    assert twice == once, (
        f"normalize_education is not idempotent for alias '{alias}': "
        f"first={once!r}, second={twice!r}"
    )


# ---------------------------------------------------------------------------
# Property 3: Specialization normalization idempotence
# Validates: Requirements 2.3
# ---------------------------------------------------------------------------

@given(st.sampled_from(list(SPECIALIZATION_NORMALIZATION.keys())))
@settings(max_examples=100)
def test_property3_normalize_specialization_idempotence(alias):
    """
    **Validates: Requirements 2.3**

    For any known specialization alias, applying normalize_specialization
    twice must produce the same result as applying it once.
    """
    once = normalize_specialization(alias)
    twice = normalize_specialization(once)
    assert twice == once, (
        f"normalize_specialization is not idempotent for alias '{alias}': "
        f"first={once!r}, second={twice!r}"
    )


# ---------------------------------------------------------------------------
# Property 4: Career normalization idempotence
# Validates: Requirements 2.4
# ---------------------------------------------------------------------------

@given(st.sampled_from(list(CAREER_NORMALIZATION.keys())))
@settings(max_examples=100)
def test_property4_normalize_career_idempotence(alias):
    """
    **Validates: Requirements 2.4**

    For any known career alias, applying normalize_career twice must
    produce the same result as applying it once.
    """
    once = normalize_career(alias)
    twice = normalize_career(once)
    assert twice == once, (
        f"normalize_career is not idempotent for alias '{alias}': "
        f"first={once!r}, second={twice!r}"
    )


# ---------------------------------------------------------------------------
# Property 5: Skill list deduplication and sorting
# Validates: Requirements 2.5
# ---------------------------------------------------------------------------

@given(st.lists(st.sampled_from(list(SKILL_ALIASES.keys())), min_size=1))
@settings(max_examples=200)
def test_property5_normalize_skills_list_dedup_and_sorted(skill_aliases):
    """
    **Validates: Requirements 2.5**

    For any non-empty list of skill alias strings (including duplicates),
    normalize_skills_list must return a list that:
    - has no duplicate elements, and
    - is sorted in ascending order.
    """
    result = normalize_skills_list(skill_aliases)

    # No duplicates
    assert len(result) == len(set(result)), (
        f"normalize_skills_list returned duplicates for input {skill_aliases!r}: "
        f"result={result!r}"
    )

    # Sorted ascending
    assert result == sorted(result), (
        f"normalize_skills_list result is not sorted for input {skill_aliases!r}: "
        f"result={result!r}"
    )

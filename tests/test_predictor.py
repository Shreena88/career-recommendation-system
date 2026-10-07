"""
Property-based tests for MLPredictor.predict_top_k (Properties 6 and 7).

**Validates: Requirements 3.3, 3.4**

Tests are written with the `hypothesis` library.  MLPredictor is loaded once
at module level (artifacts are expensive to deserialize) and reused across all
test invocations.
"""

import os
import sys

# Ensure AI-Career-Recommendation/ is on the path so that utils and backend
# packages are importable regardless of where pytest is invoked from.
_TESTS_DIR = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_TESTS_DIR, ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

from hypothesis import given, settings
import hypothesis.strategies as st

from backend.services.predictor import MLPredictor

# ---------------------------------------------------------------------------
# Module-level singleton — load artifacts once for all tests
# ---------------------------------------------------------------------------

_MODELS_DIR = os.path.join(_PROJECT_ROOT, "models")
_PREDICTOR = MLPredictor(_MODELS_DIR)
_PREDICTOR.load_artifacts()

# Fixed valid input as specified in task 6.4
_FIXED_EDUCATION = "Bachelor"
_FIXED_SPECIALIZATION = "Computer Science"
_FIXED_SKILLS = ["Python", "SQL"]


# ---------------------------------------------------------------------------
# Property 6: predict_top_k result ordering
# Validates: Requirement 3.3
# ---------------------------------------------------------------------------

@given(st.integers(min_value=1, max_value=10))
@settings(max_examples=50, deadline=None)
def test_property6_predict_top_k_ordering(k):
    """
    **Validates: Requirements 3.3**

    For any k in [1, 10], predict_top_k with fixed valid input must return
    a list of (career, probability) tuples whose probabilities are
    non-increasing (sorted in descending order).
    """
    result = _PREDICTOR.predict_top_k(
        _FIXED_EDUCATION,
        _FIXED_SPECIALIZATION,
        _FIXED_SKILLS,
        k=k,
    )

    probabilities = [prob for _career, prob in result]

    for i in range(len(probabilities) - 1):
        assert probabilities[i] >= probabilities[i + 1], (
            f"predict_top_k result is not sorted descending for k={k}: "
            f"probabilities[{i}]={probabilities[i]:.6f} < "
            f"probabilities[{i+1}]={probabilities[i+1]:.6f}. "
            f"Full result: {result}"
        )


# ---------------------------------------------------------------------------
# Property 7: predict_top_k result count bound
# Validates: Requirement 3.4
# ---------------------------------------------------------------------------

@given(st.integers(min_value=1, max_value=20))
@settings(max_examples=50, deadline=None)
def test_property7_predict_top_k_count_bound(k):
    """
    **Validates: Requirements 3.4**

    For any k in [1, 20], predict_top_k must return at most k results.
    The result length may be less than k when the model has fewer than k
    distinct career classes.
    """
    result = _PREDICTOR.predict_top_k(
        _FIXED_EDUCATION,
        _FIXED_SPECIALIZATION,
        _FIXED_SKILLS,
        k=k,
    )

    assert len(result) <= k, (
        f"predict_top_k returned {len(result)} results for k={k}, "
        f"which exceeds the requested bound."
    )

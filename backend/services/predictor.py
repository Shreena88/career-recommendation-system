"""
MLPredictor — minimal stub for property-based testing (task 6.4).

A lightweight implementation that loads the saved ML artifacts and exposes
`predict_top_k`.  Task 9.1 will expand this into the full production class.

The `MultiLabelBinarizerTransformer` wrapper must be importable when the
joblib file is deserialized, because the artifact was originally pickled with
that class in scope.
"""

import os
import sys

# Ensure project root (AI-Career-Recommendation/) is on sys.path so that
# utils.preprocessing can always be imported, regardless of where Python is
# invoked from.
_HERE = os.path.dirname(os.path.abspath(__file__))
_PROJECT_ROOT = os.path.abspath(os.path.join(_HERE, "..", ".."))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

import joblib
import pandas as pd
import numpy as np
from sklearn.base import BaseEstimator, TransformerMixin
from sklearn.preprocessing import MultiLabelBinarizer

from utils.preprocessing import (
    normalize_education,
    normalize_specialization,
    normalize_skills_list,
)


# ---------------------------------------------------------------------------
# Custom transformer — must be importable for joblib deserialization
# ---------------------------------------------------------------------------

class MultiLabelBinarizerTransformer(BaseEstimator, TransformerMixin):
    """Wrap MultiLabelBinarizer for use inside a ColumnTransformer."""

    def __init__(self):
        self.mlb = MultiLabelBinarizer()

    def fit(self, X, y=None):
        self.mlb.fit(X)
        return self

    def transform(self, X, y=None):
        return self.mlb.transform(X)


# ---------------------------------------------------------------------------
# MLPredictor
# ---------------------------------------------------------------------------

class MLPredictor:
    """
    Loads saved ML artifacts and provides career probability predictions.

    Parameters
    ----------
    model_dir : str
        Path to the directory containing career_model.joblib,
        preprocessor.joblib, and label_encoder.joblib.
    """

    def __init__(self, model_dir: str = "models/") -> None:
        self.model_dir = model_dir
        self._model = None
        self._preprocessor = None
        self._label_encoder = None

    # ------------------------------------------------------------------
    # Artifact management
    # ------------------------------------------------------------------

    def load_artifacts(self) -> None:
        """
        Load career_model.joblib, preprocessor.joblib, label_encoder.joblib.

        The training script (04_training.py) ran as ``__main__``, so joblib
        pickled ``MultiLabelBinarizerTransformer`` under ``__main__``.  We
        inject the class into ``sys.modules['__main__']`` before loading so
        that pickle's ``find_class`` lookup succeeds.

        Raises
        ------
        FileNotFoundError
            If any of the three artifact files cannot be found.
        """
        model_path = os.path.join(self.model_dir, "career_model.joblib")
        prep_path = os.path.join(self.model_dir, "preprocessor.joblib")
        le_path = os.path.join(self.model_dir, "label_encoder.joblib")

        for path in (model_path, prep_path, le_path):
            if not os.path.exists(path):
                raise FileNotFoundError(
                    f"Required ML artifact not found: {path}"
                )

        # Inject the transformer class into __main__ so joblib can unpickle
        # the artifact that was saved while running the training script as
        # __main__.
        import sys as _sys
        _main = _sys.modules.get("__main__")
        if _main is not None and not hasattr(_main, "MultiLabelBinarizerTransformer"):
            _main.MultiLabelBinarizerTransformer = MultiLabelBinarizerTransformer

        self._model = joblib.load(model_path)
        self._preprocessor = joblib.load(prep_path)
        self._label_encoder = joblib.load(le_path)

    # ------------------------------------------------------------------
    # Input normalization
    # ------------------------------------------------------------------

    def normalize_input(
        self,
        education: str,
        specialization: str,
        skills: list[str],
    ) -> dict:
        """
        Apply preprocessing normalization to raw user input.

        Returns
        -------
        dict
            Keys: ``education``, ``specialization``, ``skills``.
        """
        return {
            "education": normalize_education(education),
            "specialization": normalize_specialization(specialization),
            "skills": normalize_skills_list(skills),
        }

    # ------------------------------------------------------------------
    # Prediction
    # ------------------------------------------------------------------

    def predict_top_k(
        self,
        education: str,
        specialization: str,
        skills: list[str],
        k: int = 10,
    ) -> list[tuple[str, float]]:
        """
        Return the top-*k* career predictions with their model probabilities.

        Preconditions
        -------------
        - ``load_artifacts()`` has been called successfully.
        - ``k >= 1``

        Postconditions
        --------------
        - The returned list is sorted by probability in **descending** order
          (Requirement 3.3).
        - ``len(result) <= k`` (Requirement 3.4).

        Parameters
        ----------
        education : str
        specialization : str
        skills : list[str]
        k : int

        Returns
        -------
        list[tuple[str, float]]
            Each tuple is ``(career_label, model_probability)``.
        """
        if self._model is None or self._label_encoder is None:
            raise RuntimeError(
                "Artifacts not loaded. Call load_artifacts() first."
            )

        normalized = self.normalize_input(education, specialization, skills)

        # Build a single-row DataFrame matching the training feature layout.
        row = pd.DataFrame([{
            "Education Level": normalized["education"],
            "Specialization": normalized["specialization"],
            "Skills": normalized["skills"],
        }])

        proba = self._model.predict_proba(row)[0]  # shape: (n_classes,)

        # Pair probabilities with class labels and sort descending.
        pairs = list(zip(self._label_encoder.classes_, proba.tolist()))
        pairs.sort(key=lambda x: x[1], reverse=True)

        return pairs[:k]

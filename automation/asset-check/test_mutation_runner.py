"""A pre-existing test failure must never turn every mutation green."""
import contextlib
import io
import types
import unittest
from pathlib import Path
from unittest.mock import patch

import mutate_bot


def exercise(module):
    for baseline, expected in ((False, 2), (True, 0)):
        with patch.object(module, "run_tests", return_value=baseline) as run:
            with patch.object(module, "MUTANTS", []), contextlib.redirect_stdout(io.StringIO()):
                actual = module.main()
            assert actual == expected, "mutation verdict concealed baseline failure"
            run.assert_called_once_with(module.HERE)


class MutationRunnerSafety(unittest.TestCase):
    def test_baseline_is_required_before_fault_injection(self):
        exercise(mutate_bot)

    def test_three_baseline_bypasses_are_caught(self):
        source = Path(mutate_bot.__file__).read_text("utf-8")
        needle = "if not run_tests(HERE):"
        self.assertIn(needle, source)
        for replacement in ("if False:", "if True:",
                            'if not run_tests(HERE) and HERE.name != "asset-check":'):
            with self.subTest(replacement=replacement):
                module = types.ModuleType("mutant_runner")
                module.__file__ = mutate_bot.__file__
                exec(compile(source.replace(needle, replacement, 1), module.__file__, "exec"), module.__dict__)
                with self.assertRaises(AssertionError):
                    exercise(module)


if __name__ == "__main__":
    unittest.main()

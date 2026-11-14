"""Archive ingestion regressions; no browser, network or privileged symlinks required."""
import contextlib
import io
import stat
import tempfile
import types
import unittest
import warnings
import zipfile
from pathlib import Path
from unittest.mock import patch

import check_pack as cp


def exercise(module):
    with tempfile.TemporaryDirectory() as folder:
        base = Path(folder)
        counter = 0

        def archive(entries, filename=None):
            nonlocal counter
            counter += 1
            src = base / (filename or f"pack-{counter}.zip")
            with warnings.catch_warnings():
                warnings.simplefilter("ignore", UserWarning)
                with zipfile.ZipFile(src, "w", compression=zipfile.ZIP_DEFLATED) as z:
                    for name, data in entries:
                        z.writestr(name, data)
            target = base / f"extract-{counter}"
            target.mkdir()
            return src, target

        def rejected(entries):
            src, target = archive(entries)
            try:
                module.extract_pack(src, target)
            except ValueError:
                assert not list(target.iterdir()), "invalid ZIP was partly extracted"
                return
            raise AssertionError("unsafe ZIP accepted: " + repr(entries))

        for name in ("../escape.txt", "..\\escape.txt", "/absolute.txt", "C:/drive.txt",
                     "C:relative.txt", "folder/../escape.txt", "name. /data", "x//data"):
            rejected([("first.txt", "must not be written"), (name, "unsafe")])
        rejected([("A.txt", "one"), ("a.txt", "two")])
        link = zipfile.ZipInfo("linked")
        link.create_system = 3
        link.external_attr = (stat.S_IFLNK | 0o777) << 16
        rejected([(link, "../outside")])

        src, target = archive([("big.txt", "x" * 64)])
        with patch.object(module, "ZIP_MAX_BYTES", 32):
            try:
                module.extract_pack(src, target)
            except ValueError:
                pass
            else:
                raise AssertionError("oversized expanded ZIP accepted")
        assert not list(target.iterdir()), "budget failure extracted files"
        src, target = archive([("a.txt", "a"), ("b.txt", "b")])
        with patch.object(module, "ZIP_MAX_FILES", 1):
            try:
                module.extract_pack(src, target)
            except ValueError:
                pass
            else:
                raise AssertionError("too many ZIP entries accepted")

        for filename in ("pack.zip", "different.ZIP"):
            src, target = archive([("wrapper/pack.json", '{}'), ("wrapper/sub/data.txt", "kept")], filename)
            result = module.extract_pack(src, target)
            assert result == target / "wrapper", "wrapper directory not selected"
            assert (result / "sub/data.txt").read_text() == "kept", "valid archive was not extracted"


class ZipSafety(unittest.TestCase):
    def test_archive_paths_budgets_duplicates_and_valid_nested_pack(self):
        exercise(cp)

    def test_cli_bad_zip_and_cleanup(self):
        with tempfile.TemporaryDirectory() as folder:
            src = Path(folder) / "broken.ZIP"
            src.write_bytes(b"not an archive")
            with contextlib.redirect_stderr(io.StringIO()):
                self.assertEqual(cp.main([str(src)]), 2)
                self.assertEqual(cp.main([str(src.with_name("missing.zip"))]), 2)
            with zipfile.ZipFile(src, "w") as z:
                z.writestr("pack.json", '{}')
            extracted = []

            def report(root, out, strict):
                extracted.append(root)
                self.assertTrue((root / "pack.json").is_file())
                self.assertEqual(out, "reports")
                self.assertTrue(strict)
                return 1

            with patch.object(cp, "report_pack", side_effect=report):
                self.assertEqual(cp.main([str(src), "--out", "reports", "--strict"]), 1)
            self.assertFalse(extracted[0].exists(), "temporary extraction directory leaked")

    def test_three_fault_injections(self):
        source = Path(cp.__file__).read_text("utf-8")
        mutations = [
            ("no-budget", "if len(members) > ZIP_MAX_FILES or sum(m.file_size for m in members) > ZIP_MAX_BYTES:",
             "if False:"),
            ("unsafe-path-skipped", 'raise ValueError("Unsafe ZIP member: " + member.filename)', "continue"),
            ("known-filename-deception", "with zipfile.ZipFile(archive) as z:",
             'if archive.name == "pack.zip":\n        return target\n    with zipfile.ZipFile(archive) as z:')
        ]
        for name, old, new in mutations:
            with self.subTest(mutation=name):
                self.assertIn(old, source)
                module = types.ModuleType("mutant_check_pack")
                module.__file__ = cp.__file__
                exec(compile(source.replace(old, new, 1), cp.__file__, "exec"), module.__dict__)
                with self.assertRaises(AssertionError, msg="mutation survived: " + name):
                    exercise(module)


if __name__ == "__main__":
    unittest.main()

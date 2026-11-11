#!/usr/bin/env python3
"""Enumerate first-party resources referenced by a published HTML page."""
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urlunsplit


class AssetParser(HTMLParser):
    def __init__(self, page_url):
        super().__init__(convert_charrefs=True)
        self.page = urlsplit(page_url)
        self.base = page_url
        self.resources = set()
        self.in_style = False

    def add(self, value):
        value = value.strip()
        if not value or value.startswith(("#", "data:", "blob:", "javascript:")):
            return
        target = urlsplit(urljoin(self.base, value))
        if target.scheme != "https" or target.netloc != self.page.netloc:
            return
        if not target.path.startswith("/meta6-lab/"):
            return
        self.resources.add(urlunsplit((target.scheme, target.netloc, target.path, target.query, "")))

    def add_srcset(self, value):
        for entry in value.split(","):
            parts = entry.strip().split()
            if parts:
                self.add(parts[0])

    def add_css(self, value):
        for match in re.finditer(r"url\(\s*(['\"]?)(.*?)\1\s*\)", value, re.I):
            self.add(match.group(2))
        for match in re.finditer(r"@import\s+['\"]([^'\"]+)['\"]", value, re.I):
            self.add(match.group(1))

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "base" and attrs.get("href"):
            self.base = urljoin(self.base, attrs["href"])
        if tag == "script" and attrs.get("src"):
            self.add(attrs["src"])
        if tag == "link" and attrs.get("href"):
            rel = set((attrs.get("rel") or "").lower().split())
            if rel & {"stylesheet", "icon", "manifest", "modulepreload", "preload", "apple-touch-icon"}:
                self.add(attrs["href"])
        if tag in {"img", "source", "audio", "video", "track", "embed", "input"}:
            if attrs.get("src"):
                self.add(attrs["src"])
            if attrs.get("srcset"):
                self.add_srcset(attrs["srcset"])
            if tag == "video" and attrs.get("poster"):
                self.add(attrs["poster"])
        if tag == "object" and attrs.get("data"):
            self.add(attrs["data"])
        if attrs.get("style"):
            self.add_css(attrs["style"])
        if tag == "style":
            self.in_style = True

    def handle_endtag(self, tag):
        if tag == "style":
            self.in_style = False

    def handle_data(self, data):
        if self.in_style:
            self.add_css(data)


def extract_resources(html, page_url):
    parser = AssetParser(page_url)
    parser.feed(html)
    return sorted(parser.resources)


def main():
    page_url, page_file = sys.argv[1:3]
    html = Path(page_file).read_text(encoding="utf-8", errors="replace")
    print("\n".join(extract_resources(html, page_url)))


if __name__ == "__main__":
    main()

#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
CSS·JS 캐시 갱신용 스크립트

브라우저는 파일 이름이 같으면 예전 것을 그대로 씁니다(GitHub Pages 기본 10분).
그래서 CSS/JS를 고쳐도 반영이 안 되거나, 더 나쁘게는
새 HTML + 옛 JS 조합으로 기능이 죽은 것처럼 보입니다.

이 스크립트는 각 파일 내용의 해시를 구해 index.html 의 참조 주소에 붙입니다.
    assets/js/main.js  →  assets/js/main.js?v=8f2a1c
내용이 바뀌면 해시도 바뀌므로 브라우저가 반드시 새로 받아갑니다.
내용이 그대로면 해시도 그대로라 불필요한 재다운로드는 없습니다.

사용법:  python bump-assets.py     (커밋 전에 실행)
"""
import hashlib
import io
import os
import re
import sys

BASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "docs")
HTML = os.path.join(BASE, "index.html")
TARGETS = ["assets/css/style.css", "assets/js/site-config.js", "assets/js/main.js"]


def short_hash(path):
    with open(path, "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()[:8]


def main():
    if not os.path.isfile(HTML):
        print("index.html 을 찾을 수 없습니다: %s" % HTML)
        return 1

    html = io.open(HTML, encoding="utf-8").read()
    before = html
    changed = []

    for rel in TARGETS:
        full = os.path.join(BASE, rel.replace("/", os.sep))
        if not os.path.isfile(full):
            print("건너뜀 (파일 없음): %s" % rel)
            continue

        h = short_hash(full)
        # 기존 ?v=... 유무와 관계없이 새 해시로 교체
        pattern = re.compile(r'(["\'])' + re.escape(rel) + r'(?:\?v=[0-9a-f]+)?\1')
        new_ref = r'\g<1>' + rel + '?v=' + h + r'\g<1>'
        html, n = pattern.subn(new_ref, html)
        if n:
            changed.append("%s?v=%s (%d곳)" % (rel, h, n))
        else:
            print("참조를 찾지 못함: %s" % rel)

    if html != before:
        io.open(HTML, "w", encoding="utf-8").write(html)
        print("갱신 완료")
        for c in changed:
            print("  - %s" % c)
    else:
        print("변경 없음 (이미 최신)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

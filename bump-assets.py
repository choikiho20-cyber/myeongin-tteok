#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
CSS·JS 캐시 갱신용 스크립트

브라우저는 파일 이름이 같으면 예전 것을 그대로 씁니다(GitHub Pages 기본 10분).
그래서 CSS/JS를 고쳐도 반영이 안 되거나, 더 나쁘게는
새 HTML + 옛 JS 조합으로 기능이 죽은 것처럼 보입니다.

이 스크립트는 각 파일 내용의 해시를 구해 HTML 의 참조 주소에 붙입니다.
    assets/js/main.js  →  assets/js/main.js?v=8f2a1c
내용이 바뀌면 해시도 바뀌므로 브라우저가 반드시 새로 받아갑니다.
내용이 그대로면 해시도 그대로라 불필요한 재다운로드는 없습니다.

⚠️ 이 장치로도 못 막는 구멍이 하나 있습니다.
   HTML 자체도 10분 캐시됩니다. HTML 이 옛것이면 옛 ?v= 값을 읽으므로
   결국 옛 CSS/JS 를 씁니다. 배포 직후 본인이 확인할 때는
   반드시 강력 새로고침(Ctrl+Shift+R) 이나 시크릿 창을 쓰세요.

대상: 저장소 안의 모든 .html (posts/ 포함) × assets 안의 모든 .css/.js

사용법:  python bump-assets.py     (커밋 전에 실행)
"""
import hashlib
import io
import os
import re
import sys

BASE = os.path.dirname(os.path.abspath(__file__))
SKIP_DIRS = {".git", "node_modules", "_backup"}


def short_hash(path):
    with open(path, "rb") as f:
        return hashlib.sha1(f.read()).hexdigest()[:8]


def find(root, exts):
    out = []
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for fn in filenames:
            if os.path.splitext(fn)[1].lower() in exts:
                full = os.path.join(dirpath, fn)
                out.append(os.path.relpath(full, root).replace(os.sep, "/"))
    return sorted(out)


def main():
    htmls = find(BASE, {".html"})
    assets = [a for a in find(os.path.join(BASE, "assets"), {".css", ".js"})]
    assets = ["assets/" + a for a in assets]

    if not htmls:
        print("html 파일을 찾지 못했습니다.")
        return 1

    hashes = {}
    for rel in assets:
        full = os.path.join(BASE, rel.replace("/", os.sep))
        hashes[rel] = short_hash(full)

    total = 0
    touched = []
    for hrel in htmls:
        hpath = os.path.join(BASE, hrel.replace("/", os.sep))
        html = io.open(hpath, encoding="utf-8").read()
        before = html
        hits = []

        # posts/1.html 처럼 하위 폴더면 ../ 접두사도 함께 본다
        depth = hrel.count("/")
        prefixes = [""] + ["../" * i for i in range(1, depth + 1)]

        for rel, h in hashes.items():
            for pre in prefixes:
                ref = pre + rel
                pattern = re.compile(
                    r'(["\'])' + re.escape(ref) + r'(?:\?v=[0-9a-f]+)?\1')
                new_ref = r'\g<1>' + ref + '?v=' + h + r'\g<1>'
                html, n = pattern.subn(new_ref, html)
                if n:
                    hits.append("%s?v=%s (%d)" % (ref, h, n))
                    total += n

        if html != before:
            io.open(hpath, "w", encoding="utf-8").write(html)
            touched.append((hrel, hits))

    if touched:
        print("갱신 완료: %d개 파일, %d곳" % (len(touched), total))
        for hrel, hits in touched:
            print("  %s" % hrel)
            for x in hits:
                print("     - %s" % x)
    else:
        print("변경 없음 (이미 최신)")
    return 0


if __name__ == "__main__":
    sys.exit(main())

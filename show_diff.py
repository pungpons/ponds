import sys

with open("full_diff.txt", "r", encoding="utf-8") as f:
    for line in f:
        if line.startswith("-") or line.startswith("+"):
            print(line[:150] + ("..." if len(line) > 150 else ""))

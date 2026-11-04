with open("src/app/api/line/route.ts", "r") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if ".replace(/@管理助手/g, '')" in line:
            for j in range(max(0, i-5), min(len(lines), i+30)):
                print(f"{j+1}: {lines[j].rstrip()}")

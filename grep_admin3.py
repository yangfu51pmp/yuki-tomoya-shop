with open("src/app/api/line/route.ts", "r") as f:
    lines = f.readlines()
    for i, line in enumerate(lines):
        if "isAdminMention" in line:
            for j in range(max(0, i+30), min(len(lines), i+150)):
                if "清理空間" in lines[j] or "清除商品" in lines[j] or "修改製片" in lines[j] or "清除快取" in lines[j] or "管理助手" in lines[j] or "isAdminCommand" in lines[j]:
                    print(f"{j+1}: {lines[j].rstrip()}")

import os
import glob
import re

for file in glob.glob("backend/Database/*_dal.py"):
    with open(file, "r") as f:
        content = f.read()
    
    # 1. Add contextlib import if not present
    if "from contextlib import asynccontextmanager" not in content:
        content = "from contextlib import asynccontextmanager\n" + content
    
    # 2. Add @asynccontextmanager decorator and change return to yield
    content = re.sub(r'(async def get_\w+_dal\s*\(.*?\)\s*(?:->\s*\w+\s*)?:)', r'@asynccontextmanager\n\1', content)
    content = re.sub(r'(\s+async with async_session\(\) as \w+:\n\s+)return', r'\1yield', content)
    
    with open(file, "w") as f:
        f.write(content)

print("DAL files fixed!")

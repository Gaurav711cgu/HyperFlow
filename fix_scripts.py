import re
import glob

def fix_jsx_scripts(content):
    # Remove script tags entirely
    content = re.sub(r'<script.*?</script>', '', content, flags=re.DOTALL)
    
    # Remove some common SVG inline problems if any
    content = re.sub(r'xmlns:xlink="[^"]*"', '', content)
    
    return content

files = glob.glob('frontend/src/components/*.jsx')
for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    new_content = fix_jsx_scripts(content)
    
    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Fixed scripts in {file}")


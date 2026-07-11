import os
import re
import glob

def fix_jsx(content):
    # Fix HTML comments
    content = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', content, flags=re.DOTALL)
    
    # Fix inline styles (very basic, assuming simple strings like style="background-image: url('...');")
    # This might be tricky, so we'll just remove or fix the most common ones.
    # We can try a regex for style="..."
    def style_replacer(match):
        style_str = match.group(1)
        # Convert "key: value; key2: value2" to "{ key: 'value', key2: 'value2' }"
        style_dict = {}
        for item in style_str.split(';'):
            if ':' in item:
                k, v = item.split(':', 1)
                k = k.strip()
                v = v.strip()
                # camelCase keys
                k = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
                # handle quotes in values
                if v.startswith("'") and v.endswith("'"):
                    pass # keep as is
                else:
                    # replace double quotes with single if any, or escape
                    v = v.replace("'", "\\'")
                    v = f"'{v}'"
                style_dict[k] = v
        
        style_obj = ", ".join([f"{k}: {v}" for k, v in style_dict.items()])
        return f"style={{{{{style_obj}}}}}"

    content = re.sub(r'style="([^"]*)"', style_replacer, content)
    
    return content

files = glob.glob('frontend/src/components/*.jsx')
for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    new_content = fix_jsx(content)
    
    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Fixed {file}")


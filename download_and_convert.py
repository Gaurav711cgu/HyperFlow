import json
import os
import subprocess
import re

with open('/Users/gauravkumarnayak/.gemini/antigravity/brain/20e5f71a-b0c3-43f3-af46-407db61a59a4/.system_generated/steps/5612/output.txt', 'r') as f:
    data = json.load(f)

screen_list = data.get('screens', data) if isinstance(data, dict) else data

# Mapping from logical screen to a file name
components = {
    '15fe519fad424137b0a6209f5bfd909e': 'ChatbotHelp',
    'b80240103a57414b8a0b31818a40e153': 'FinancialOpsAdmin',
    'eae14a2376a94c24a53da472528e122c': 'GrowthAnalyticsAdmin',
    '4625a48a7aee42eb8c1bf789b999884c': 'FleetLogisticsAdmin',
    'f0df7dfa879f45a090fc680c1ecebb13': 'MerchantStockAdmin',
    '1e63f4f8ce534d289d11e517456a143c': 'HelpSupport',
    '688fcbc0d63f4f5c8a1142d7dbd9c3a3': 'RefundStatus'
}

def fix_jsx(html):
    # Very basic regexes to fix class -> className and self closing tags
    jsx = html
    jsx = jsx.replace('class=', 'className=')
    jsx = jsx.replace('for=', 'htmlFor=')
    jsx = jsx.replace('stroke-width=', 'strokeWidth=')
    jsx = jsx.replace('stroke-linecap=', 'strokeLinecap=')
    jsx = jsx.replace('stroke-linejoin=', 'strokeLinejoin=')
    jsx = jsx.replace('fill-rule=', 'fillRule=')
    jsx = jsx.replace('clip-rule=', 'clipRule=')
    jsx = jsx.replace('tabindex=', 'tabIndex=')
    
    # Self closing tags
    for tag in ['img', 'input', 'br', 'hr']:
        jsx = re.sub(r'(<'+tag+r'\b[^>]*)(?<!/)>', r'\1 />', jsx)
        
    # Remove script tags entirely
    jsx = re.sub(r'<script.*?</script>', '', jsx, flags=re.DOTALL)
    
    # Remove some common SVG inline problems if any
    jsx = re.sub(r'xmlns:xlink="[^"]*"', '', jsx)
    
    def style_replacer(match):
        style_str = match.group(1)
        style_dict = {}
        for item in style_str.split(';'):
            if ':' in item:
                k, v = item.split(':', 1)
                k = k.strip()
                v = v.strip()
                k = re.sub(r'-([a-z])', lambda m: m.group(1).upper(), k)
                if v.startswith("'") and v.endswith("'"):
                    pass
                else:
                    v = v.replace("'", "\\'")
                    v = f"'{v}'"
                style_dict[k] = v
        style_obj = ", ".join([f"{k}: {v}" for k, v in style_dict.items()])
        return f"style={{{{{style_obj}}}}}"

    jsx = re.sub(r'style="([^"]*)"', style_replacer, jsx)
    
    # fix HTML comments
    jsx = re.sub(r'<!--(.*?)-->', r'{/*\1*/}', jsx, flags=re.DOTALL)
    
    return jsx

for s in screen_list:
    s_id = s['name'].split('/')[-1]
    if s_id in components:
        download_url = s.get('htmlCode', {}).get('downloadUrl')
        if download_url:
            comp_name = components[s_id]
            print(f"Downloading {comp_name}...")
            # Download HTML
            result = subprocess.run(['curl', '-sSL', download_url], capture_output=True, text=True)
            if result.returncode == 0:
                html = result.stdout
                body_match = re.search(r'<body[^>]*>(.*)</body>', html, re.DOTALL)
                if body_match:
                    body = body_match.group(1)
                    jsx_content = fix_jsx(body)
                    react_code = f"import React from 'react';\n\nconst {comp_name} = () => {{\n  return (\n    <>\n{jsx_content}\n    </>\n  );\n}};\n\nexport default {comp_name};\n"
                    with open(f"frontend/src/components/{comp_name}.jsx", 'w') as f:
                        f.write(react_code)
                    print(f"Generated {comp_name}.jsx")
            else:
                print(f"Failed to download {comp_name}")

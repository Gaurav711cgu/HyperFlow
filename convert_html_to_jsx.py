import os
import re

def html_to_jsx(html):
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
        
    return jsx

folders = [
    ("district_auth_portal_desktop", "AuthPortal"),
    ("discovery_hub_desktop", "DiscoveryHub"),
    ("secure_payment_invoice_authentic_brand_logos", "CartCheckout"),
    ("behrouz_biryani_detail_desktop", "RestaurantDetail"),
    ("real_time_tracking_desktop", "RealTimeTracking"),
    ("loyalty_analytics_desktop", "LoyaltyAnalytics"),
    ("ai_commerce_agent_desktop", "AICommerceAgent")
]

for folder, component in folders:
    path = f"stitch_district_obsidian_ui_spec/{folder}/code.html"
    if not os.path.exists(path):
        print(f"Skipping {path}")
        continue
    with open(path, 'r') as f:
        content = f.read()
    
    # Extract body content
    body_match = re.search(r'<body[^>]*>(.*)</body>', content, re.DOTALL)
    if body_match:
        body = body_match.group(1)
        # Convert HTML to JSX
        jsx_content = html_to_jsx(body)
        
        # Create React Component wrapper
        react_code = f"""import React from 'react';

const {component} = () => {{
  return (
    <>
{jsx_content}
    </>
  );
}};

export default {component};
"""
        with open(f"frontend/src/components/{component}.jsx", 'w') as f:
            f.write(react_code)
        print(f"Converted {component}")
    else:
        print(f"No body found in {path}")

import json, urllib.request
base='http://127.0.0.1:8000'
email='qa_api_20260809@example.com'
req=urllib.request.Request(f'{base}/api/auth/signup', data=json.dumps({'name':'QA API User','email':email,'password':'Password123','confirmPassword':'Password123'}).encode(), headers={'Content-Type':'application/json'}, method='POST')
with urllib.request.urlopen(req, timeout=20) as resp:
    print('SIGNUP', resp.status, resp.read().decode())
req=urllib.request.Request(f'{base}/api/auth/login', data=json.dumps({'email':email,'password':'Password123'}).encode(), headers={'Content-Type':'application/json'}, method='POST')
with urllib.request.urlopen(req, timeout=20) as resp:
    body=resp.read().decode(); print('LOGIN', resp.status, body)
    token=json.loads(body)['token']
req=urllib.request.Request(f'{base}/api/auth/me', headers={'Authorization': f'Bearer {token}'}, method='GET')
with urllib.request.urlopen(req, timeout=20) as resp:
    print('ME', resp.status, resp.read().decode())

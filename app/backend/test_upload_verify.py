import json, urllib.request, urllib.error
BASE = 'http://127.0.0.1:8000'

def request(path, method='GET', data=None, headers=None):
    headers = headers or {}
    req = urllib.request.Request(BASE + path, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.status, resp.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return None, str(e)

print('ROOT', request('/'))

signup = {'name': 'Test User', 'email': 'testuser@example.com', 'password': 'Password123', 'confirmPassword': 'Password123'}
print('SIGNUP', request('/api/auth/signup', 'POST', data=json.dumps(signup).encode('utf-8'), headers={'Content-Type': 'application/json'}))
status, body = request('/api/auth/login', 'POST', data=json.dumps({'email': 'testuser@example.com', 'password': 'Password123'}).encode('utf-8'), headers={'Content-Type': 'application/json'})
print('LOGIN', status, body)
if status != 200:
    raise SystemExit(1)
login = json.loads(body)

headers = {'Authorization': f"Bearer {login['token']}"}
print('GET DOCS', request('/api/documents', 'GET', headers=headers))

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
parts = []
parts.append('--' + boundary)
parts.append('Content-Disposition: form-data; name="category"')
parts.append('')
parts.append('General')
parts.append('--' + boundary)
parts.append('Content-Disposition: form-data; name="file"; filename="test_upload.txt"')
parts.append('Content-Type: text/plain')
parts.append('')
parts.append('hello from upload')
parts.append('--' + boundary + '--')
parts.append('')
body = '\r\n'.join(parts).encode('utf-8')
headers = {'Authorization': f"Bearer {login['token']}", 'Content-Type': f'multipart/form-data; boundary={boundary}', 'Content-Length': str(len(body))}
print('UPLOAD', request('/api/documents', 'POST', data=body, headers=headers))

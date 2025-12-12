// components/CookieTest.tsx
'use client';

import { useState } from 'react';

export default function CookieTest() {
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCookies = async () => {
    addLog('🧪 Starting cookie test...');
    
    try {
      // Test login
      addLog('📤 Attempting login...');
      const loginResponse = await fetch('http://127.0.0.1:8000/api/auth/login/finish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'test_user',
          credential: {} // Replace with actual credential
        })
      });

      addLog(`📥 Login response status: ${loginResponse.status}`);
      
      // Check response headers
      const setCookieHeader = loginResponse.headers.get('set-cookie');
      addLog(`🍪 Set-Cookie header: ${setCookieHeader ? 'Present ✅' : 'Missing ❌'}`);
      
      // Check if cookies exist in browser (won't show HttpOnly cookies)
      const allCookies = document.cookie;
      addLog(`🍪 Document.cookie: ${allCookies || '(empty - HttpOnly cookies are hidden)'}`);
      
      // Make a test request to see if cookie is sent
      addLog('📤 Testing if cookie is sent with next request...');
      const testResponse = await fetch('http://127.0.0.1:8000/api/polls', {
        method: 'GET',
        credentials: 'include',
      });
      
      addLog(`📥 Test request status: ${testResponse.status}`);
      
      if (testResponse.status === 401) {
        addLog('❌ Cookie NOT being sent or invalid!');
      } else if (testResponse.ok) {
        addLog('✅ Cookie is being sent successfully!');
      }
      
    } catch (error) {
      addLog(`❌ Error: ${error}`);
    }
  };

  const checkCookiesInDevTools = () => {
    addLog('📋 To check cookies manually:');
    addLog('1. Open DevTools (F12)');
    addLog('2. Go to Application tab (Chrome) or Storage tab (Firefox)');
    addLog('3. Click on Cookies → http://127.0.0.1:8000');
    addLog('4. Look for "session_token" cookie');
    addLog('');
    addLog('📋 To check if cookie is sent with requests:');
    addLog('1. Open DevTools → Network tab');
    addLog('2. Make a request to your API');
    addLog('3. Click on the request');
    addLog('4. Look for "Cookie: session_token=..." in Request Headers');
  };

  const clearLogs = () => setLogs([]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🍪 Cookie Authentication Test</h1>
      
      <div className="space-x-2 mb-4">
        <button
          onClick={testCookies}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Run Cookie Test
        </button>
        
        <button
          onClick={checkCookiesInDevTools}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Show DevTools Instructions
        </button>
        
        <button
          onClick={clearLogs}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear Logs
        </button>
      </div>

      <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto">
        <h2 className="font-semibold mb-2">Test Logs:</h2>
        {logs.length === 0 ? (
          <p className="text-gray-500">No logs yet. Click "Run Cookie Test" to start.</p>
        ) : (
          <ul className="space-y-1 font-mono text-sm">
            {logs.map((log, i) => (
              <li key={i} className="text-gray-800">{log}</li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-semibold mb-2">⚠️ Important Notes:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li><code>document.cookie</code> won't show HttpOnly cookies (this is normal and good for security)</li>
          <li>Check DevTools → Application → Cookies to see the actual cookie</li>
          <li>Check DevTools → Network → Request Headers to verify cookie is being sent</li>
          <li>If cookie exists in DevTools but not sent in requests, check CORS configuration</li>
        </ul>
      </div>
    </div>
  );
}
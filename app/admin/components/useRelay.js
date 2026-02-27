import { useCallback } from 'react';

export default function useRelay(token) {
  const call = useCallback(async (path, opts = {}) => {
    const method = opts.method || 'GET';
    const url = `/api/admin/relay?path=${encodeURIComponent(path)}`;
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['x-admin-token'] = token;

    const res = await fetch(url, {
      method,
      headers,
      ...(opts.body ? { body: JSON.stringify(opts.body) } : {}),
    });

    const text = await res.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || `${method} ${path} failed` };
    }

    if (!res.ok) throw new Error(data.error || `${method} ${path} failed`);
    return data;
  }, [token]);
  return call;
}

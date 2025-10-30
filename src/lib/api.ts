import { SESSION_ID } from "./config";
import { v4 as uuidv4 } from 'uuid';


export async function handlePostRequestWithEventStream(url: string | URL, data: string, callback: Function) {
    let sessionId = sessionStorage.getItem(SESSION_ID);
    if (!sessionId) {
        sessionId = uuidv4();
        sessionStorage.setItem(SESSION_ID, sessionId);
    }
    const body = {
        chatId: sessionId,
        message: data,
    };
    let response;
    try {
        response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        console.log('Response:', response);
    } catch (error) {
        console.error('Error:', error);
        callback(ReceiveState.error, 'Failed to connect to the server.')
        return;
    }
    // If HTTP status is not OK (e.g., 404), surface as error
    if (!response.ok) {
        const ct = response.headers.get('content-type') || '';
        let msg = '';
        try {
            if (ct.includes('application/json')) {
                const json = await response.json();
                msg = (json && (json.message || json.error)) || `HTTP ${response.status}: ${response.statusText}`;
            } else {
                const text = await response.text();
                msg = text || `HTTP ${response.status}: ${response.statusText}`;
            }
        } catch (_) {
            msg = `HTTP ${response.status}: ${response.statusText}`;
        }
        callback(ReceiveState.error, msg);
        return;
    }

    // Expect text/event-stream for SSE; otherwise treat as non-stream response and surface as error
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/event-stream')) {
        try {
            if (contentType.includes('application/json')) {
                const json = await response.json();
                const code = json?.code;
                const message = json?.message || 'Unexpected non-stream response.';
                // If server uses business code, treat non-success as error
                if (typeof code === 'number' && code >= 400) {
                    callback(ReceiveState.error, message);
                } else {
                    callback(ReceiveState.error, message);
                }
            } else {
                const text = await response.text();
                callback(ReceiveState.error, text || 'Unexpected non-stream response.');
            }
        } catch (_) {
            callback(ReceiveState.error, 'Failed to parse non-stream response.');
        }
        return;
    }
    if (!response.body) {
        callback(ReceiveState.error, 'Empty response.')
        return;
    }

    let reader: ReadableStreamDefaultReader<Uint8Array> = response.body.getReader();
    const textDecoder = new TextDecoder();
    let chatSessionId = '';
    // Maintain a buffer to avoid cutting lines across chunks
    let sseBuffer = '';
    let currentEvent: 'message' | 'end' | 'error' | null = null;
    const decodeEscapes = (s: string) => s.replace(/\\n/g, '\n');

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const content = textDecoder.decode(value, { stream: true });
        if (!content) continue;

        // Normalize CRLF and append to buffer
        sseBuffer += content.replace(/\r\n/g, '\n');

        // Process complete lines; keep the last partial line in buffer
        const lines = sseBuffer.split('\n');
        sseBuffer = lines.pop() ?? '';

        let textAcc = '';
        let isErrorAcc = false;

        for (const lineRaw of lines) {
            const line = lineRaw; // preserve spaces and literal escapes

            if (line.startsWith('event:')) {
                const evt = line.slice('event:'.length).trim();
                if (evt === 'message') currentEvent = 'message';
                else if (evt === 'end') currentEvent = 'end';
                else if (evt === 'error') currentEvent = 'error';
                else currentEvent = null;
                continue;
            }

            if (line.startsWith('data:')) {
                const data = line.slice('data:'.length); // do not trim; preserve spaces and escapes
                if (currentEvent === 'message') {
                    // Append token content; empty data lines become newline
                    if (data.length === 0) textAcc += '\n';
                    else textAcc += decodeEscapes(data);
                } else if (currentEvent === 'end') {
                    chatSessionId = data.trim();
                } else if (currentEvent === 'error') {
                    isErrorAcc = true;
                    if (data.length === 0) textAcc += '\n';
                    else textAcc += decodeEscapes(data);
                }
            }
            // Ignore other lines; they might be comments or unsupported fields
        }

        if (textAcc) {
            callback(isErrorAcc ? ReceiveState.error : ReceiveState.update, textAcc);
        }
    }
    // Flush any remaining buffer lines after stream ends
    if (sseBuffer) {
        const lines = sseBuffer.split('\n');
        let textAcc = '';
        let isErrorAcc = false;
        const decodeEscapes = (s: string) => s.replace(/\\n/g, '\n');
        for (const lineRaw of lines) {
            const line = lineRaw;
            if (line.startsWith('event:')) {
                const evt = line.slice('event:'.length).trim();
                if (evt === 'message') currentEvent = 'message';
                else if (evt === 'end') currentEvent = 'end';
                else if (evt === 'error') currentEvent = 'error';
                else currentEvent = null;
                continue;
            }
            if (line.startsWith('data:')) {
                const data = line.slice('data:'.length);
                if (currentEvent === 'message') {
                    if (data.length === 0) textAcc += '\n';
                    else textAcc += decodeEscapes(data);
                } else if (currentEvent === 'end') {
                    chatSessionId = data.trim();
                } else if (currentEvent === 'error') {
                    isErrorAcc = true;
                    if (data.length === 0) textAcc += '\n';
                    else textAcc += decodeEscapes(data);
                }
            }
        }
        if (textAcc) {
            callback(isErrorAcc ? ReceiveState.error : ReceiveState.update, textAcc);
        }
    }
    sessionStorage.setItem(SESSION_ID, chatSessionId);
    callback(ReceiveState.complete)
}

export enum ReceiveState {
    update,
    complete,
    error
}
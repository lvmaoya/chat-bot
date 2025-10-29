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
    } catch (error) {
        callback(ReceiveState.error, 'Failed to connect to the server.')
        return;
    }

    if (!response.body) {
        callback(ReceiveState.error, 'Empty response.')
        return;
    }

    let reader: ReadableStreamDefaultReader<Uint8Array> = response.body.getReader();
    const textDecoder = new TextDecoder();
    let chatSessionId = '';
    while (true) {
        const { value, done } = await reader.read();

        if (done) {
            break;
        }

        const content = textDecoder.decode(value);
        if (content) {
            try {
                const { text, sessionId, isError } = defaultProcessChunk(content);
                if (sessionId) chatSessionId = sessionId;
                if (text) {
                    callback(isError ? ReceiveState.error : ReceiveState.update, text);
                }
            } catch (error) {
                callback(ReceiveState.error, "Failed to parse response.")
            }

        }
    }
   sessionStorage.setItem(SESSION_ID, chatSessionId);
    callback(ReceiveState.complete)
}
function defaultProcessChunk(chunks: string): { text: string; sessionId: string; isError: boolean } {
    let result = '';
    let sessionId = '';
    let isError = false;

    // Split by lines and parse simple SSE format:
    // event:message\n data:...\n [data:...] ...
    // event:end\n data:<chatId>
    const lines = chunks.split('\n');
    let currentEvent: 'message' | 'end' | 'error' | null = null;
    const decodeEscapes = (s: string) => s.replace(/\\n/g, '\n');

    for (let i = 0; i < lines.length; i++) {
        const lineRaw = lines[i] ?? '';
        const line = lineRaw; // preserve trailing spaces and literal escape sequences

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
                // Append content; empty data lines become newline; convert literal \n to real newline
                if (data.length === 0) result += '\n';
                else result += decodeEscapes(data);
            } else if (currentEvent === 'end') {
                sessionId = data.trim();
            } else if (currentEvent === 'error') {
                isError = true;
                if (data.length === 0) result += '\n';
                else result += decodeEscapes(data);
            }
        }
    }

    return { text: result, sessionId, isError };
}


export enum ReceiveState {
    update,
    complete,
    error
}
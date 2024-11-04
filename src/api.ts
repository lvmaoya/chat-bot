import { SESSION_ID, USER_ID } from "./config";
import { v4 as uuidv4 } from 'uuid';


export async function handlePostRequestWithEventStream(url: string | URL, data: String, callback: Function) {
    let userId = localStorage.getItem(USER_ID);
    if (!userId) {
        userId = uuidv4();
        localStorage.setItem(USER_ID, userId!);
    }
    const body = {
        sessionId: sessionStorage.getItem(SESSION_ID),
        prompt: data,
        referer: window.location.href,
        clientId: userId
    };
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    if (response.status !== 200) {
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
                const [text, sessionId] = defaultProcessChunk(content);
                chatSessionId = sessionId
                callback(ReceiveState.update, text)
            } catch (error) {
                callback(ReceiveState.error, "Failed to parse response.")
            }

        }
    }
    localStorage.setItem(SESSION_ID, chatSessionId);
    callback(ReceiveState.complete)
}
function defaultProcessChunk(chunks: string) {
    let result = '';
    let sessionId = '';
    chunks.split("\nid").forEach(chunk => {
        let data: any = chunk.split('HTTP_STATUS/200\ndata:')[1];
        try {
            data = JSON.parse(data);
            sessionId = data.output.session_id;
            result += data.output.text || '';
        } catch (e) {
            throw (e);
        }
    });
    return [result, sessionId];
}


export enum ReceiveState {
    update,
    complete,
    error
}
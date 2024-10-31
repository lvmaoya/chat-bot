import { StreamSend, StreamingAdapterObserver } from '@nlux/react';
import { SetStateAction } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { USER_ID } from '../config/cacheKey';

type StopFunction = () => void;
let reader: ReadableStreamDefaultReader<Uint8Array>;

function defaultProcessChunk(chunks: string) {
    console.log("chunks-------" + chunks);

    let result = '';
    let sessionId = '';
    chunks.split("\nid").forEach(chunk => {
        let data: any = chunk.split('HTTP_STATUS/200\ndata:')[1];
        if (data === undefined) {
            let str = chunks.match(/"text": "(.*?)"/);
            if (!str) {
                str = [''];
            } else {
                str = [str[1]];
            }
            return [str[0] ?? result, sessionId];
        }
        
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
export const createSend = function (setStopFunctionVisible: { (value: SetStateAction<boolean>): void }): [StreamSend, StopFunction] {

    const stopGenerating: StopFunction = () => {
        reader && reader.cancel();
    };


    return [async (
        prompt: string,
        observer: StreamingAdapterObserver,
    ) => {
        if (window.CHATBOT_CONFIG.dataProcessor?.rewritePrompt) {
            prompt = window.CHATBOT_CONFIG.dataProcessor.rewritePrompt(prompt);
        }
        let userId = localStorage.getItem(USER_ID);
        if (!userId) {
            userId = uuidv4();
            localStorage.setItem(USER_ID, userId);
        }
        const body = {
            sessionId: sessionStorage.getItem('chatSessionId'),
            prompt,
            referer: window.location.href,
            clientId: userId
        };
        const response = await fetch(window.CHATBOT_CONFIG.endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (response.status !== 200) {
            observer.error(new Error('Failed to connect to the server'));
            return;
        }

        if (!response.body) {
            return;
        }

        reader = response.body.getReader();
        const textDecoder = new TextDecoder();
        var sessionIdCache = '';
        while (true) {
            const { value, done } = await reader.read();
            if (!done) {
                setStopFunctionVisible(true);
            }
            if (done) {
                break;
            }

            const content = textDecoder.decode(value);

            if (content) {
                try {
                    const [text, sessionId] = defaultProcessChunk(content);
                    sessionIdCache = sessionId;
                    text && observer.next(text);
                } catch (e) {
                    console.warn('Parse content failed: ' + content, e);
                    observer.error(new Error('Parse content failed'));
                }
            }
        }
        sessionIdCache ?? sessionStorage.setItem('chatSessionId', sessionIdCache);
        setStopFunctionVisible(false);
        observer.complete();
    }, stopGenerating];
}

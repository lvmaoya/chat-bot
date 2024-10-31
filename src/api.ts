export function handlePostRequestWithEventStream(url: string | URL, data: any) {
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.body) {
            return;
        }
        const reader = response.body.getReader();
        
        const decoder = new TextDecoder();
        let buffer = '';
        
        
        reader.read().then(function processText({ done, value }) {
            if (done) {
                console.log('Stream complete');
                return;
            }
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop();
            
            lines.forEach(line => {
                console.log('Received message:', line);
                // 处理接收到的数据
            });
            
            return reader.read().then(processText);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}
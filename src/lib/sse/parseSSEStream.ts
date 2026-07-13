export interface ParsedSSEEvent {
  event: string;
  data: string;
}

/**
 * Parses a real SSE wire-format stream (event:/data: blocks terminated by a
 * blank line). The only platform-specific part of the chat flow is obtaining
 * the ReadableStream from fetch()'s response.body — this function itself
 * never needs to change across web/React Native.
 */
export async function* parseSSEStream(body: ReadableStream<Uint8Array>): AsyncGenerator<ParsedSSEEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let boundary: number;
    while ((boundary = buffer.indexOf('\n\n')) !== -1) {
      const rawEvent = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);

      let event = 'message';
      const dataLines: string[] = [];
      for (const line of rawEvent.split('\n')) {
        if (line.startsWith('event:')) {
          event = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          dataLines.push(line.slice(5).trim());
        }
      }
      if (dataLines.length > 0) {
        yield { event, data: dataLines.join('\n') };
      }
    }
  }
}

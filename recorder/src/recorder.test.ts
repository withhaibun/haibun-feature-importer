import LoggerWebSocketsClient from '@haibun/context/build/websocket-client/LoggerWebSocketsClient';
import { record } from './recorder';

const onmessage = (message: MessageEvent) => {
    console.log('🤑->>', message);
}
describe('recorder', () => {
    it('should record', (done) => {
        const loggerWebSocketsClient = new LoggerWebSocketsClient(3939, { onmessage });
        const promise = record('http://localhost:3939', ['test']);
        promise.then((res) => {
            expect(res.ok).toBe(true);
            done();
        });
    });
});

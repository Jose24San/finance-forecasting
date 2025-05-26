import { apiClients } from './api-clients.js';

describe('apiClients', () => {
  it('should work', () => {
    expect(apiClients()).toEqual('api-clients');
  });
});

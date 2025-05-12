import axios from 'axios';
import { expect } from 'chai';
import { describe, it } from 'mocha';

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

describe('Hello world', () => {
  it('should pass this example test', async () => {
    const response = await axios.get(BASE_URL);
    expect(response.data).to.be.eq('Hello, World!');
  });
});

import similarity from './src/plugins/similarity.js';

// Test helper function
const createMockContext = (text) => ({
  text,
  sendMessage: (msg) => console.log('Response:', msg)
});

const createMockHandler = (label) => (ctx, matchedText, score) => {
  console.log(`${label}: Matched "${matchedText}" with ${(score * 100).toFixed(1)}% similarity`);
  return { success: true, score };
};

console.log('=== Testing Similarity Plugin ===\n');

// Test 1: Basic string pattern matching
console.log('Test 1: Basic string pattern (threshold: 0.8)');
const plugin1 = similarity({ threshold: 0.8, caseInsensitive: true });
const matcher1 = plugin1.plugin(createMockContext('hello'), 'message');
matcher1('hello', createMockHandler('Test 1a'));
matcher1('helo', createMockHandler('Test 1b'));
matcher1('hey', createMockHandler('Test 1c'));
console.log('');

// Test 2: Object pattern with value and threshold override
console.log('Test 2: Object pattern with threshold override (base: 0.8, override: 0.95)');
const plugin2 = similarity({ threshold: 0.8, caseInsensitive: true });
const matcher2 = plugin2.plugin(createMockContext('hello'), 'message');
matcher2({ value: 'hello', threshold: 0.95 }, createMockHandler('Test 2a (exact)'));
matcher2({ value: 'helo', threshold: 0.95 }, createMockHandler('Test 2b (high threshold)'));
matcher2({ value: 'helo', threshold: 0.8 }, createMockHandler('Test 2c (low threshold)'));
console.log('');

// Test 3: Object pattern with caseInsensitive override
console.log('Test 3: caseInsensitive override (base: true, override: false)');
const plugin3 = similarity({ threshold: 0.8, caseInsensitive: true });
const matcher3 = plugin3.plugin(createMockContext('Hello'), 'message');
matcher3('hello', createMockHandler('Test 3a (case insensitive from init)'));
matcher3({ value: 'hello', caseInsensitive: false }, createMockHandler('Test 3b (case sensitive override)'));
matcher3({ value: 'Hello', caseInsensitive: false }, createMockHandler('Test 3c (exact case match)'));
console.log('');

// Test 4: Multiple option overrides
console.log('Test 4: Multiple option overrides');
const plugin4 = similarity({ threshold: 0.75, caseInsensitive: true });
const matcher4 = plugin4.plugin(createMockContext('Password'), 'message');
matcher4({ value: 'password', threshold: 0.95, caseInsensitive: false }, createMockHandler('Test 4a'));
matcher4({ value: 'password', threshold: 0.7, caseInsensitive: true }, createMockHandler('Test 4b'));
console.log('');

// Test 5: Trim option from initialization
console.log('Test 5: Trim option (trim: true)');
const plugin5 = similarity({ threshold: 0.8, trim: true });
const matcher5 = plugin5.plugin(createMockContext('  hello  '), 'message');
matcher5('hello', createMockHandler('Test 5a (trimmed text matches)'));
console.log('');

// Test 6: No trim option
console.log('Test 6: No trim (trim: false)');
const plugin6 = similarity({ threshold: 0.8, trim: false });
const matcher6 = plugin6.plugin(createMockContext('  hello  '), 'message');
matcher6('  hello  ', createMockHandler('Test 6a (exact with spaces)'));
matcher6('hello', createMockHandler('Test 6b (without spaces - should not match well)'));
console.log('');

console.log('=== All tests completed ===');

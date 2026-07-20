import { describe, it, expect } from 'vitest';
import { withThousands } from './format';

describe('withThousands', () => {
  it('adds commas to $ figures >= 1000', () => {
    expect(withThousands('NOI: $2148K')).toBe('NOI: $2,148K');
    expect(withThousands('$1188K vs. $1188K')).toBe('$1,188K vs. $1,188K');
  });
  it('leaves figures under 1000 unchanged', () => {
    expect(withThousands('$960K and $325K')).toBe('$960K and $325K');
  });
  it('does not touch integer part < 1000 of decimals', () => {
    expect(withThousands('$27.3M / $6.92M')).toBe('$27.3M / $6.92M');
  });
  it('leaves already comma-formatted values alone', () => {
    expect(withThousands('$1,350 to $1,475/unit')).toBe('$1,350 to $1,475/unit');
  });
  it('does not comma-fy years or non-$ numbers', () => {
    expect(withThousands('by 2029, over 1200 units')).toBe('by 2029, over 1200 units');
  });
  it('handles millions with large integer part', () => {
    expect(withThousands('$1234567')).toBe('$1,234,567');
  });
});

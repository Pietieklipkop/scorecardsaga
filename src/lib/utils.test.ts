import { describe, it, expect } from 'vitest';
import { formatScore, timeStringToHundredths } from './utils';

describe('formatScore', () => {
  it('should format a positive score into ss.mm format', () => {
    expect(formatScore(2345)).toBe('23.45');
  });

  it('should handle a score of 0', () => {
    expect(formatScore(0)).toBe('00.00');
  });

  it('should handle a score less than 100 (hundredths)', () => {
    expect(formatScore(99)).toBe('00.99');
  });

  it('should handle a score with 0 hundredths', () => {
    expect(formatScore(1200)).toBe('12.00');
  });

  it('should return "00.00" for a negative score', () => {
    expect(formatScore(-10)).toBe('00.00');
  });
});

describe('timeStringToHundredths', () => {
  it('should convert a "ssmm" string to hundredths of a second', () => {
    expect(timeStringToHundredths('2345')).toBe(2345);
  });

  it('should handle a "0" string', () => {
    expect(timeStringToHundredths('0')).toBe(0);
  });

  it('should handle a string with less than 4 characters by padding', () => {
    expect(timeStringToHundredths('1')).toBe(1);
    expect(timeStringToHundredths('59')).toBe(59);
    expect(timeStringToHundredths('101')).toBe(101);
    expect(timeStringToHundredths('0101')).toBe(101);
  });
});

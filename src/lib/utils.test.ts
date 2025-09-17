import { describe, it, expect } from 'vitest';
import { formatScore, timeStringToHundredths } from './utils';

describe('formatScore', () => {
  it('should format a positive score into mm:ss:hh format', () => {
    expect(formatScore(12345)).toBe('02:03:45');
  });

  it('should handle a score of 0', () => {
    expect(formatScore(0)).toBe('00:00:00');
  });

  it('should handle a score less than 100 (hundredths)', () => {
    expect(formatScore(99)).toBe('00:00:99');
  });

  it('should handle a score that is a multiple of 6000', () => {
    expect(formatScore(12000)).toBe('02:00:00');
  });

  it('should return "00:00:00" for a negative score', () => {
    expect(formatScore(-10)).toBe('00:00:00');
  });
});

describe('timeStringToHundredths', () => {
  it('should convert a "mmsshh" string to hundredths of a second', () => {
    expect(timeStringToHundredths('020345')).toBe(12345);
  });

  it('should handle a "0" string', () => {
    expect(timeStringToHundredths('0')).toBe(0);
  });

  it('should handle a string with less than 6 characters', () => {
    expect(timeStringToHundredths('1')).toBe(1);
    expect(timeStringToHundredths('59')).toBe(59);
    expect(timeStringToHundredths('100')).toBe(100);
    expect(timeStringToHundredths('010101')).toBe(6101);
  });
});

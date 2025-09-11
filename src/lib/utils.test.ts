import { describe, it, expect } from 'vitest';
import { formatScore, timeStringToSeconds } from './utils';

describe('formatScore', () => {
  it('should format a positive score into mm:ss format', () => {
    expect(formatScore(123)).toBe('02:03');
  });

  it('should handle a score of 0', () => {
    expect(formatScore(0)).toBe('00:00');
  });

  it('should handle a score less than 60', () => {
    expect(formatScore(59)).toBe('00:59');
  });

  it('should handle a score that is a multiple of 60', () => {
    expect(formatScore(120)).toBe('02:00');
  });

  it('should return "00:00" for a negative score', () => {
    expect(formatScore(-10)).toBe('00:00');
  });
});

describe('timeStringToSeconds', () => {
  it('should convert a "mmss" string to seconds', () => {
    expect(timeStringToSeconds('0203')).toBe(123);
  });

  it('should handle a "0" string', () => {
    expect(timeStringToSeconds('0')).toBe(0);
  });

  it('should handle a string with less than 4 characters', () => {
    expect(timeStringToSeconds('1')).toBe(1);
    expect(timeStringToSeconds('59')).toBe(59);
    expect(timeStringToSeconds('100')).toBe(60);
  });
});

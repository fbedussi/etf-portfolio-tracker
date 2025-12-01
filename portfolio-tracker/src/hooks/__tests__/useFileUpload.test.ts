import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFileUpload } from '../useFileUpload';
import { fileService } from '@/services/fileService';

// Mock fileService
vi.mock('@/services/fileService', () => ({
  fileService: {
    parsePortfolioFile: vi.fn(),
    validateAssetCategories: vi.fn(),
  },
}));

describe('useFileUpload', () => {
  const mockPortfolio = { assets: [] };
  const mockFile = new File(['portfolio'], 'portfolio.yaml', { type: 'text/yaml' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uploads and parses a valid file', async () => {
    (fileService.parsePortfolioFile as jest.Mock).mockResolvedValueOnce(mockPortfolio);
    (fileService.validateAssetCategories as jest.Mock).mockImplementationOnce(() => {});
    const { result } = renderHook(() => useFileUpload());

    await act(async () => {
      await result.current.uploadFile(mockFile);
    });

    expect(fileService.parsePortfolioFile).toHaveBeenCalledWith(mockFile);
    expect(fileService.validateAssetCategories).toHaveBeenCalledWith(mockPortfolio);
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('handles file parsing error', async () => {
    const error = new Error('Invalid YAML');
    (fileService.parsePortfolioFile as jest.Mock).mockRejectedValueOnce(error);
    const { result } = renderHook(() => useFileUpload());

    await act(async () => {
      await result.current.uploadFile(mockFile);
    });

    expect(result.current.error).toEqual(error);
    expect(result.current.isLoading).toBe(false);
  });

  it('clears error state', async () => {
    const error = new Error('Invalid YAML');
    (fileService.parsePortfolioFile as jest.Mock).mockRejectedValueOnce(error);
    const { result } = renderHook(() => useFileUpload());

    await act(async () => {
      await result.current.uploadFile(mockFile);
    });
    expect(result.current.error).toEqual(error);

    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });
});

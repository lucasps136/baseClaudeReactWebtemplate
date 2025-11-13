/**
 * Test Templates for Modular Architecture
 *
 * Reusable test templates for components, hooks, and services
 * Following Testing Library best practices and SOLID principles
 */

// ============================================================================
// COMPONENT TEST TEMPLATE
// ============================================================================

export const componentTestTemplate = `import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  // Setup and teardown
  beforeEach(() => {
    // Reset any mocks or state before each test
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // Rendering tests
  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<ComponentName />)
      expect(screen.getByRole('...')).toBeInTheDocument()
    })

    it('should render with required props', () => {
      const props = {
        // Add required props
      }
      render(<ComponentName {...props} />)
      expect(screen.getByText('...')).toBeInTheDocument()
    })

    it('should not render when condition is false', () => {
      render(<ComponentName show={false} />)
      expect(screen.queryByRole('...')).not.toBeInTheDocument()
    })
  })

  // Interaction tests
  describe('User Interactions', () => {
    it('should handle click events', () => {
      const handleClick = jest.fn()
      render(<ComponentName onClick={handleClick} />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should update input value on change', () => {
      const handleChange = jest.fn()
      render(<ComponentName onChange={handleChange} />)

      const input = screen.getByRole('textbox')
      fireEvent.change(input, { target: { value: 'test' } })

      expect(handleChange).toHaveBeenCalledWith('test')
    })
  })

  // State tests
  describe('State Management', () => {
    it('should update state on user action', async () => {
      render(<ComponentName />)

      const button = screen.getByRole('button')
      fireEvent.click(button)

      await waitFor(() => {
        expect(screen.getByText('Updated State')).toBeInTheDocument()
      })
    })
  })

  // Async tests
  describe('Async Operations', () => {
    it('should show loading state', () => {
      render(<ComponentName isLoading={true} />)
      expect(screen.getByText(/loading/i)).toBeInTheDocument()
    })

    it('should show error state', () => {
      const error = 'Something went wrong'
      render(<ComponentName error={error} />)
      expect(screen.getByText(error)).toBeInTheDocument()
    })

    it('should handle async data fetching', async () => {
      render(<ComponentName />)

      await waitFor(() => {
        expect(screen.getByText('Data loaded')).toBeInTheDocument()
      })
    })
  })

  // Accessibility tests
  describe('Accessibility', () => {
    it('should have proper aria labels', () => {
      render(<ComponentName />)
      const element = screen.getByRole('button', { name: /submit/i })
      expect(element).toHaveAttribute('aria-label', 'Submit form')
    })

    it('should be keyboard accessible', () => {
      render(<ComponentName />)
      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })
  })
})
`;

// ============================================================================
// HOOK TEST TEMPLATE
// ============================================================================

export const hookTestTemplate = `import { renderHook, act, waitFor } from '@testing-library/react'
import { useCustomHook } from './useCustomHook'

describe('useCustomHook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // Basic functionality tests
  describe('Basic Functionality', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useCustomHook())

      expect(result.current.value).toBe(null)
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('should initialize with provided options', () => {
      const options = { initialValue: 'test' }
      const { result } = renderHook(() => useCustomHook(options))

      expect(result.current.value).toBe('test')
    })
  })

  // State updates tests
  describe('State Updates', () => {
    it('should update state when action is called', () => {
      const { result } = renderHook(() => useCustomHook())

      act(() => {
        result.current.setValue('new value')
      })

      expect(result.current.value).toBe('new value')
    })

    it('should handle multiple state updates', () => {
      const { result } = renderHook(() => useCustomHook())

      act(() => {
        result.current.setValue('value 1')
      })
      expect(result.current.value).toBe('value 1')

      act(() => {
        result.current.setValue('value 2')
      })
      expect(result.current.value).toBe('value 2')
    })
  })

  // Async operations tests
  describe('Async Operations', () => {
    it('should handle async data fetching', async () => {
      const { result } = renderHook(() => useCustomHook())

      act(() => {
        result.current.fetchData()
      })

      expect(result.current.isLoading).toBe(true)

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.value).toBeDefined()
      })
    })

    it('should handle errors in async operations', async () => {
      const { result } = renderHook(() => useCustomHook())

      act(() => {
        result.current.fetchData('invalid-id')
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
        expect(result.current.error).toBeTruthy()
      })
    })
  })

  // Cleanup tests
  describe('Cleanup', () => {
    it('should cleanup on unmount', () => {
      const cleanup = jest.fn()
      const { unmount } = renderHook(() => useCustomHook({ onCleanup: cleanup }))

      unmount()

      expect(cleanup).toHaveBeenCalledTimes(1)
    })

    it('should cancel pending requests on unmount', () => {
      const { result, unmount } = renderHook(() => useCustomHook())

      act(() => {
        result.current.fetchData()
      })

      unmount()

      // Verify no state updates after unmount
      expect(result.current.isLoading).toBe(true) // Should remain in loading state
    })
  })

  // Dependency tests
  describe('Dependencies', () => {
    it('should update when dependencies change', () => {
      const { result, rerender } = renderHook(
        ({ dep }) => useCustomHook(dep),
        { initialProps: { dep: 'initial' } }
      )

      expect(result.current.value).toBe('initial')

      rerender({ dep: 'updated' })

      expect(result.current.value).toBe('updated')
    })
  })
})
`;

// ============================================================================
// SERVICE/STORE TEST TEMPLATE
// ============================================================================

export const serviceTestTemplate = `import { CustomService } from './custom.service'

// Mock dependencies
jest.mock('../repository/custom.repository', () => ({
  CustomRepository: jest.fn().mockImplementation(() => ({
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}))

describe('CustomService', () => {
  let service: CustomService
  let mockRepository: jest.Mocked<any>

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks()

    // Create fresh instances
    service = new CustomService()
    mockRepository = (service as any).repository
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  // Constructor tests
  describe('Constructor', () => {
    it('should initialize with dependencies', () => {
      expect(service).toBeInstanceOf(CustomService)
      expect(mockRepository).toBeDefined()
    })
  })

  // Read operations tests
  describe('Read Operations', () => {
    it('should get item by id successfully', async () => {
      const mockItem = { id: '1', name: 'Test Item' }
      mockRepository.findById.mockResolvedValue(mockItem)

      const result = await service.getById('1')

      expect(mockRepository.findById).toHaveBeenCalledWith('1')
      expect(result).toEqual(mockItem)
    })

    it('should return null when item not found', async () => {
      mockRepository.findById.mockResolvedValue(null)

      const result = await service.getById('nonexistent')

      expect(result).toBeNull()
    })

    it('should get all items with filters', async () => {
      const mockItems = [
        { id: '1', name: 'Item 1' },
        { id: '2', name: 'Item 2' },
      ]
      mockRepository.findAll.mockResolvedValue(mockItems)

      const filters = { limit: 10, offset: 0 }
      const result = await service.getAll(filters)

      expect(mockRepository.findAll).toHaveBeenCalledWith(filters)
      expect(result).toEqual(mockItems)
    })
  })

  // Create operations tests
  describe('Create Operations', () => {
    it('should create item successfully', async () => {
      const newItem = { name: 'New Item' }
      const createdItem = { id: '1', ...newItem }
      mockRepository.create.mockResolvedValue(createdItem)

      const result = await service.create(newItem)

      expect(mockRepository.create).toHaveBeenCalledWith(newItem)
      expect(result).toEqual(createdItem)
    })

    it('should validate data before creating', async () => {
      const invalidItem = { name: '' }

      await expect(service.create(invalidItem)).rejects.toThrow('Validation failed')
      expect(mockRepository.create).not.toHaveBeenCalled()
    })
  })

  // Update operations tests
  describe('Update Operations', () => {
    it('should update item successfully', async () => {
      const updates = { name: 'Updated Name' }
      const updatedItem = { id: '1', ...updates }
      mockRepository.update.mockResolvedValue(updatedItem)

      const result = await service.update('1', updates)

      expect(mockRepository.update).toHaveBeenCalledWith('1', updates)
      expect(result).toEqual(updatedItem)
    })

    it('should throw error when updating nonexistent item', async () => {
      mockRepository.update.mockResolvedValue(null)

      await expect(service.update('nonexistent', {})).rejects.toThrow('Item not found')
    })
  })

  // Delete operations tests
  describe('Delete Operations', () => {
    it('should delete item successfully', async () => {
      mockRepository.delete.mockResolvedValue(true)

      const result = await service.delete('1')

      expect(mockRepository.delete).toHaveBeenCalledWith('1')
      expect(result).toBe(true)
    })

    it('should return false when deleting nonexistent item', async () => {
      mockRepository.delete.mockResolvedValue(false)

      const result = await service.delete('nonexistent')

      expect(result).toBe(false)
    })
  })

  // Error handling tests
  describe('Error Handling', () => {
    it('should handle repository errors gracefully', async () => {
      mockRepository.findById.mockRejectedValue(new Error('Database error'))

      await expect(service.getById('1')).rejects.toThrow('Database error')
    })

    it('should throw specific error for validation failures', async () => {
      const invalidData = { name: '' }

      await expect(service.create(invalidData)).rejects.toThrow('Validation failed')
    })
  })

  // Business logic tests
  describe('Business Logic', () => {
    it('should apply business rules correctly', async () => {
      const data = { status: 'pending' }

      const result = await service.processItem(data)

      expect(result.status).toBe('processed')
    })

    it('should enforce business constraints', async () => {
      const invalidData = { amount: -100 }

      await expect(service.processItem(invalidData)).rejects.toThrow(
        'Amount must be positive'
      )
    })
  })
})
`;

// ============================================================================
// ZUSTAND STORE TEST TEMPLATE
// ============================================================================

export const storeTestTemplate = `import { renderHook, act } from '@testing-library/react'
import { useCustomStore } from './custom.store'

describe('useCustomStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    const { result } = renderHook(() => useCustomStore())
    act(() => {
      result.current.reset()
    })
  })

  // Initial state tests
  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useCustomStore())

      expect(result.current.items).toEqual([])
      expect(result.current.isLoading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  // State mutations tests
  describe('State Mutations', () => {
    it('should add item to store', () => {
      const { result } = renderHook(() => useCustomStore())
      const newItem = { id: '1', name: 'Test Item' }

      act(() => {
        result.current.addItem(newItem)
      })

      expect(result.current.items).toContainEqual(newItem)
    })

    it('should update existing item', () => {
      const { result } = renderHook(() => useCustomStore())
      const item = { id: '1', name: 'Original' }

      act(() => {
        result.current.addItem(item)
      })

      act(() => {
        result.current.updateItem('1', { name: 'Updated' })
      })

      expect(result.current.items[0].name).toBe('Updated')
    })

    it('should remove item from store', () => {
      const { result } = renderHook(() => useCustomStore())
      const item = { id: '1', name: 'Test' }

      act(() => {
        result.current.addItem(item)
      })

      expect(result.current.items).toHaveLength(1)

      act(() => {
        result.current.removeItem('1')
      })

      expect(result.current.items).toHaveLength(0)
    })
  })

  // Loading state tests
  describe('Loading State', () => {
    it('should set loading state', () => {
      const { result } = renderHook(() => useCustomStore())

      act(() => {
        result.current.setLoading(true)
      })

      expect(result.current.isLoading).toBe(true)
    })
  })

  // Error state tests
  describe('Error State', () => {
    it('should set error state', () => {
      const { result } = renderHook(() => useCustomStore())
      const error = 'Something went wrong'

      act(() => {
        result.current.setError(error)
      })

      expect(result.current.error).toBe(error)
    })

    it('should clear error on successful operation', () => {
      const { result } = renderHook(() => useCustomStore())

      act(() => {
        result.current.setError('Error')
      })

      expect(result.current.error).toBe('Error')

      act(() => {
        result.current.addItem({ id: '1', name: 'Test' })
      })

      expect(result.current.error).toBeNull()
    })
  })

  // Reset tests
  describe('Reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useCustomStore())

      act(() => {
        result.current.addItem({ id: '1', name: 'Test' })
        result.current.setError('Error')
      })

      expect(result.current.items).toHaveLength(1)
      expect(result.current.error).toBe('Error')

      act(() => {
        result.current.reset()
      })

      expect(result.current.items).toEqual([])
      expect(result.current.error).toBeNull()
    })
  })
})
`;

// ============================================================================
// MOCK EXAMPLES
// ============================================================================

export const mockExamples = `
// ============================================================================
// Common Mock Patterns
// ============================================================================

// Mock fetch/API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: 'mocked data' }),
  })
) as jest.Mock

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock as any

// Mock Supabase client
jest.mock('@/utils/supabase', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(() => Promise.resolve({ data: {}, error: null })),
    })),
  })),
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Zustand store
jest.mock('../stores/user.store', () => ({
  useUserStore: jest.fn(() => ({
    currentUser: null,
    isLoading: false,
    error: null,
    setCurrentUser: jest.fn(),
    setLoading: jest.fn(),
    setError: jest.fn(),
  })),
}))
`;

export default {
  componentTestTemplate,
  hookTestTemplate,
  serviceTestTemplate,
  storeTestTemplate,
  mockExamples,
};

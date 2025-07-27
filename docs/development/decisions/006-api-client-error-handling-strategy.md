# ADR-006: API Client and Error Handling Strategy

## Status
**Accepted** - *2024-12-19*

## Context

The MLOps platform frontend requires robust communication with the backend API, including:
- HTTP client configuration and interceptors
- Authentication token management
- Automatic token refresh mechanism
- Comprehensive error handling
- Request/response transformation
- Loading state management
- Retry logic for failed requests
- Type-safe API interactions

We needed to establish a consistent pattern for API communication that handles authentication, errors, and provides a good developer experience.

## Decision

We have decided to implement an **Axios-based API client** with comprehensive interceptors and error handling:

### HTTP Client Strategy
- **Axios** as the primary HTTP client library
- **Request/Response interceptors** for cross-cutting concerns
- **Automatic token attachment** for authenticated requests
- **Centralized error handling** with consistent patterns
- **TypeScript integration** for type-safe API calls

### Authentication Integration
- **Automatic token refresh** when access tokens expire
- **Request queuing** during token refresh to prevent race conditions
- **Logout on refresh failure** for security
- **Secure token storage** management

### Error Handling Strategy
- **Centralized error processing** in response interceptors
- **User-friendly error messages** with fallbacks
- **Network error detection** and appropriate messaging
- **Validation error handling** with field-specific feedback
- **Global error state management**

### Request Management
- **Timeout configuration** for all requests
- **Retry logic** for transient failures
- **Request cancellation** support
- **Loading state integration** with UI components

## Rationale

### Why Axios over Fetch API?
1. **Interceptors**: Built-in request/response interceptor support
2. **Error Handling**: Better error handling out of the box
3. **Request/Response Transformation**: Automatic JSON parsing
4. **Timeout Support**: Built-in timeout configuration
5. **Request Cancellation**: AbortController integration
6. **Browser Compatibility**: Better support for older browsers

### Why Automatic Token Refresh?
1. **User Experience**: Seamless authentication without interruption
2. **Security**: Short-lived access tokens reduce exposure
3. **Reliability**: Prevents authentication errors during long sessions
4. **Scalability**: Reduces server load from frequent logins

### Why Centralized Error Handling?
1. **Consistency**: Uniform error handling across the application
2. **Maintainability**: Single place to update error logic
3. **User Experience**: Consistent error messaging
4. **Debugging**: Centralized logging and error tracking

## Implementation Details

### API Client Configuration
```typescript
// lib/api-client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Request Interceptor
```typescript
// Automatic token attachment
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
```

### Response Interceptor with Token Refresh
```typescript
// Automatic token refresh and error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        await refreshToken();
        const newToken = getAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### Error Processing
```typescript
// Centralized error processing
export const processApiError = (error: AxiosError): ApiError => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      type: 'server',
      status,
      message: data.message || 'Server error occurred',
      details: data.details || null,
    };
  } else if (error.request) {
    // Network error
    return {
      type: 'network',
      message: 'Network error. Please check your connection.',
    };
  } else {
    // Request setup error
    return {
      type: 'client',
      message: 'Request configuration error',
    };
  }
};
```

### Type-Safe API Functions
```typescript
// Type-safe API function example
export const authApi = {
  login: (credentials: LoginCredentials): Promise<AuthResponse> =>
    apiClient.post('/api/v1/auth/login', credentials).then(res => res.data),
    
  register: (userData: RegisterData): Promise<AuthResponse> =>
    apiClient.post('/api/v1/auth/register', userData).then(res => res.data),
    
  refreshToken: (): Promise<TokenResponse> =>
    apiClient.post('/api/v1/auth/refresh').then(res => res.data),
    
  logout: (): Promise<void> =>
    apiClient.post('/api/v1/auth/logout').then(() => undefined),
};
```

## Configuration Details

### Timeout Strategy
- **Default timeout**: 10 seconds for most requests
- **Upload timeout**: 60 seconds for file uploads
- **Long-running operations**: 120 seconds for model training

### Retry Logic
- **Transient errors**: Automatic retry with exponential backoff
- **Network errors**: Up to 3 retries
- **Server errors (5xx)**: Up to 2 retries
- **Client errors (4xx)**: No automatic retry

### Request Queuing
- **Token refresh**: Queue requests during token refresh
- **Maximum queue size**: 50 requests
- **Queue timeout**: 30 seconds

## Error Types and Handling

### Network Errors
- **Connection timeout**: User-friendly message with retry option
- **No internet**: Offline detection and appropriate messaging
- **DNS errors**: Network troubleshooting guidance

### Authentication Errors
- **401 Unauthorized**: Automatic token refresh attempt
- **403 Forbidden**: Clear permission error message
- **Token expired**: Seamless refresh or redirect to login

### Validation Errors
- **400 Bad Request**: Field-specific error display
- **422 Unprocessable Entity**: Form validation error mapping
- **Detailed error messages**: Server-provided field errors

### Server Errors
- **500 Internal Server Error**: Generic error with support contact
- **503 Service Unavailable**: Maintenance mode messaging
- **Rate limiting**: Retry after specified delay

## Consequences

### Positive
- **Seamless authentication** with automatic token refresh
- **Consistent error handling** across the application
- **Type safety** for all API interactions
- **Good user experience** with appropriate error messages
- **Developer productivity** with reusable API functions
- **Reliability** with retry logic and timeout handling

### Negative
- **Bundle size increase** with Axios dependency
- **Complexity** in token refresh logic
- **Potential race conditions** during concurrent requests
- **Memory usage** for request queuing

### Performance Considerations
- **Request deduplication** for identical concurrent requests
- **Response caching** for frequently accessed data
- **Optimistic updates** for better perceived performance
- **Request cancellation** for navigation changes

## Alternatives Considered

### 1. Native Fetch API
- **Pros**: No additional dependencies, modern browser support
- **Cons**: More boilerplate, no built-in interceptors
- **Decision**: Axios provides better developer experience

### 2. SWR or React Query
- **Pros**: Built-in caching, background refetching
- **Cons**: Additional complexity, different paradigm
- **Future consideration**: May integrate for data fetching

### 3. GraphQL with Apollo Client
- **Pros**: Efficient data fetching, strong typing
- **Cons**: Backend changes required, learning curve
- **Decision**: REST API aligns with current backend

### 4. Custom Fetch Wrapper
- **Pros**: Minimal dependencies, full control
- **Cons**: Reinventing the wheel, maintenance overhead
- **Decision**: Axios is battle-tested and feature-rich

## Implementation Status

### ✅ Completed
- Axios client configuration with interceptors
- Automatic token attachment and refresh
- Centralized error handling and processing
- Type-safe API function definitions
- Authentication API integration
- Request timeout and retry logic
- Error message standardization

### 🔄 In Progress
- Request deduplication implementation
- Advanced retry strategies
- Offline detection and handling

### 📋 Planned
- Response caching for static data
- Request/response logging for debugging
- API performance monitoring
- Request cancellation for route changes
- Background sync for offline operations
- Rate limiting handling improvements

## Best Practices Established

### API Function Design
1. **Type Safety**: All functions have proper TypeScript types
2. **Error Handling**: Consistent error processing
3. **Documentation**: Clear JSDoc comments for all functions
4. **Testing**: Unit tests for critical API functions

### Error Handling
1. **User-Friendly Messages**: Avoid technical jargon
2. **Actionable Feedback**: Provide clear next steps
3. **Graceful Degradation**: Fallback for failed requests
4. **Logging**: Comprehensive error logging for debugging

### Security
1. **Token Security**: Secure storage and transmission
2. **Request Validation**: Client-side validation before requests
3. **Error Information**: Don't expose sensitive data in errors
4. **HTTPS Only**: Enforce secure connections

## Related ADRs
- [ADR-001: Project Structure](./001-project-structure.md)
- [ADR-004: Authentication Strategy](./004-authentication-authorization-strategy.md)
- [ADR-005: Frontend Architecture](./005-frontend-state-management-ui-architecture.md)

## References
- [Axios Documentation](https://axios-http.com/docs/intro)
- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Error Handling Best Practices](https://blog.logrocket.com/error-handling-react-applications/)
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App';
import { AuthProvider } from '../src/context/AuthContext';
import { resetOptionsCache } from '../src/hooks/useOptions';
import { apiMock } from './apiMock';
import { options, user } from './fixtures';

export { apiMock } from './apiMock';
export { options, registration, user } from './fixtures';

export function resetApiMocks() {
  Object.values(apiMock).forEach((fn) => fn.mockReset());
  apiMock.getOptions.mockResolvedValue(options);
  resetOptionsCache();
}

/** Renders the whole app at a route. Pass loggedIn=true to simulate a stored, valid token. */
export function renderApp(path = '/', { loggedIn = false }: { loggedIn?: boolean } = {}) {
  if (loggedIn) {
    localStorage.setItem('can_token', 'test-token');
    apiMock.getMe.mockResolvedValue({ user });
  }
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './redux/store';

test('shows an empty interaction form until assistant data is returned', () => {
  render(
    <Provider store={store}>
      <App />
    </Provider>
  );

  expect(screen.getByText(/Materials Shared \/ Samples Distributed/i)).toBeInTheDocument();
  expect(screen.queryByText(/OncoBoost Phase III PDF, product brochure/i)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /submit interaction/i })).toBeInTheDocument();
});

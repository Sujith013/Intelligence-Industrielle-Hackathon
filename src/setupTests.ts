// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock Google Maps API Call
Object.defineProperty(window, 'google', {
  value: {
    maps: {
      Map: jest.fn(),
      Marker: jest.fn(),
    },
  },
});

process.env.REACT_APP_GOOGLE_MAPS_API_KEY = 'test-api-key';
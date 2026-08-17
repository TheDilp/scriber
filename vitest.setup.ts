import "@testing-library/jest-dom";

// @floating-ui/react (used by Tooltip, Dropdown, Select, etc.) relies on ResizeObserver,
// and calls `new ResizeObserver(...)`, so this must be a constructible class rather than
// a mocked arrow function.
global.ResizeObserver = class {
  disconnect() {}
  observe() {}
  unobserve() {}
};

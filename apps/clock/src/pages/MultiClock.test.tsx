import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import MultiClock from './MultiClock';
vi.mock('@/hooks/useTallyConnect', () => ({ useTallyConnect: () => ({ isAuthenticated: true, isConnected: false, status: {} }) }));
vi.mock('@/components/clock/AuthPanel', () => ({ default: () => null }));
vi.mock('@/components/clock/LoginForm', () => ({ default: () => null }));
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-07T12:00:00Z'));
  const store = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (k: string) => store.get(k) ?? null, setItem: (k: string,v: string) => store.set(k,v) });
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
  // Avoid external sync; absolute target still follows the local wall clock.
  vi.stubGlobal('fetch', vi.fn(() => new Promise(() => {})));
  localStorage.setItem('broadcast-multi-layout', 'featured');
  localStorage.setItem('broadcast-multi-clocks', JSON.stringify(['countup','countdown','countto','countup','countup'].map((mode,i) => ({
    id: String(i), mode, clockName: `Timer ${i}`, clockColor:'#ef4444', fontName:'dseg7', timezone:'local', showSeconds:true,
    countdownFrom:300, countToTarget: Date.now()+3600000,
  }))));
});
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it('retains real timer state across repeated feature swaps, layouts, hidden cells and clock jumps', async () => {
  const view = render(<MemoryRouter><MultiClock /></MemoryRouter>);
  await act(async () => {});
  const cell = (id: number) => view.container.querySelector(`[data-clock-id="${id}"]`) as HTMLElement;
  const original = Array.from({length:5},(_,i)=>cell(i));
  for (const id of [0,1,3,4]) fireEvent.click(within(cell(id)).getByRole('button',{name:'Start timer'}));
  act(() => vi.advanceTimersByTime(2100));
  fireEvent.click(within(cell(3)).getByRole('button',{name:'Pause timer'}));
  const pausedText=cell(3).firstElementChild?.textContent;
  const targetText=cell(2).firstElementChild?.textContent;
  for (let i=0;i<12;i++) fireEvent.click(cell(i%5));
  for (let i=0;i<5;i++) expect(cell(i)).toBe(original[i]);
  expect(within(cell(3)).getByRole('button',{name:'Start timer'})).toBeInTheDocument();
  // Make id4 overflow in the four-cell layout and verify it is still running on return.
  for (const id of [4,3,2,1,0]) fireEvent.click(cell(id));
  fireEvent.click(screen.getByRole('button',{name:'2×2 Grid'}));
  expect(cell(4).style.display).toBe('none');
  act(() => { vi.setSystemTime(new Date('2026-10-08T12:00:00Z')); vi.advanceTimersByTime(2000); });
  fireEvent.click(screen.getByRole('button',{name:'Featured'}));
  for (const id of [0,1,4]) expect(within(cell(id)).getByRole('button',{name:'Pause timer'})).toBeInTheDocument();
  expect(cell(3).firstElementChild?.textContent).toBe(pausedText);
  expect(cell(2).firstElementChild?.textContent).not.toBe(targetText);
  expect(within(cell(0)).getByText(/^00:04\./)).toBeInTheDocument();
  expect(within(cell(1)).getByText(/^04:55\./)).toBeInTheDocument();
  expect(within(cell(4)).getByText(/^00:04\./)).toBeInTheDocument();
  act(() => { vi.setSystemTime(new Date('2026-10-06T12:00:00Z')); vi.advanceTimersByTime(1000); });
  expect(within(cell(0)).getByText(/^00:05\./)).toBeInTheDocument();
  fireEvent.click(within(cell(0)).getByRole('button',{name:'Reset timer'}));
  expect(within(cell(0)).getByText('00:00.00')).toBeInTheDocument();
  view.unmount();
  render(<MemoryRouter><MultiClock /></MemoryRouter>);
  await act(async () => {});
  expect(screen.getAllByRole('button',{name:'Start timer'})).toHaveLength(4);
});

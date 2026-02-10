import { setupWorker } from 'msw/browser';
import { noteReadHandler, noteWriteHandler } from './noteHandler';
import { categoryReadHandler, categoryWriteHandler } from './categoryHandler';

export const worker = setupWorker(
  ...noteReadHandler,
  ...noteWriteHandler,
  ...categoryReadHandler,
  ...categoryWriteHandler,
);

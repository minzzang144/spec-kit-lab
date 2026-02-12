import { setupWorker } from 'msw/browser';

// Entity handlers (GET)
import { noteEntityHandler } from '#/Entities/Note/__Mock__/Handler';
import { categoryEntityHandler } from '#/Entities/Category/__Mock__/Handler';

// Feature handlers (POST/PUT/DELETE)
import { noteWriteFeatureHandler } from '#/Features/NoteWrite/__Mock__/Handler';
import { categoryWriteFeatureHandler } from '#/Features/CategoryWrite/__Mock__/Handler';

export const worker = setupWorker(
  // Entity (읽기)
  ...noteEntityHandler,
  ...categoryEntityHandler,
  // Feature (쓰기)
  ...noteWriteFeatureHandler,
  ...categoryWriteFeatureHandler,
);

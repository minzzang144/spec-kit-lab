import { setupWorker } from 'msw/browser';

// Entity handlers (GET)
import { noteEntityHandler } from '#/Entities/Note/__Mock__';
import { categoryEntityHandler } from '#/Entities/Category/__Mock__';

// Feature handlers (POST/PUT/DELETE)
import { noteWriteFeatureHandler } from '#/Features/NoteWrite/__Mock__';
import { categoryWriteFeatureHandler } from '#/Features/CategoryWrite/__Mock__';

export const worker = setupWorker(
  // Entity (읽기)
  ...noteEntityHandler,
  ...categoryEntityHandler,
  // Feature (쓰기)
  ...noteWriteFeatureHandler,
  ...categoryWriteFeatureHandler,
);

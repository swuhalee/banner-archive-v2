import { images } from '../lib/db/schema';

type ImageInsert = typeof images.$inferInsert;

// Create: id, createdAt는 자동 생성되므로 제외
export type CreateImageInput = Omit<ImageInsert, 'id' | 'createdAt'>;



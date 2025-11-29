/**
 * Query Optimization Utilities
 *
 * Performance utilities for optimizing database queries
 * Designed to handle millions of users efficiently
 */

import { SelectQueryBuilder, FindManyOptions, FindOptionsWhere } from 'typeorm';

/**
 * Optimized Pagination Interface
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

/**
 * Apply cursor-based pagination (more efficient for large datasets)
 */
export function applyCursorPagination<T>(
  qb: SelectQueryBuilder<T>,
  cursorField: string,
  cursorValue?: string | number,
  limit: number = 20
): SelectQueryBuilder<T> {
  if (cursorValue) {
    qb.where(`${qb.alias}.${cursorField} > :cursor`, { cursor: cursorValue });
  }

  return qb
    .orderBy(`${qb.alias}.${cursorField}`, 'ASC')
    .limit(limit + 1); // Fetch one extra to check if there's more data
}

/**
 * Apply offset-based pagination with optimizations
 */
export function applyOffsetPagination<T>(
  qb: SelectQueryBuilder<T>,
  page: number = 1,
  limit: number = 20,
  maxLimit: number = 100
): SelectQueryBuilder<T> {
  // Enforce limits
  const safeLimit = Math.min(Math.max(1, limit), maxLimit);
  const safePage = Math.max(1, page);
  const offset = (safePage - 1) * safeLimit;

  return qb.skip(offset).take(safeLimit);
}

/**
 * Get paginated results with metadata
 */
export async function getPaginatedResults<T>(
  qb: SelectQueryBuilder<T>,
  page: number = 1,
  limit: number = 20
): Promise<PaginationResult<T>> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.max(1, Math.min(limit, 100));

  // Use getManyAndCount for efficiency (single query)
  const [data, totalItems] = await qb
    .skip((safePage - 1) * safeLimit)
    .take(safeLimit)
    .getManyAndCount();

  const totalPages = Math.ceil(totalItems / safeLimit);

  return {
    data,
    pagination: {
      currentPage: safePage,
      pageSize: safeLimit,
      totalPages,
      totalItems,
      hasNext: safePage < totalPages,
      hasPrevious: safePage > 1,
    },
  };
}

/**
 * Optimize query by selecting specific fields only
 */
export function selectFields<T>(
  qb: SelectQueryBuilder<T>,
  fields: string[]
): SelectQueryBuilder<T> {
  const alias = qb.alias;
  const selectFields = fields.map(field => `${alias}.${field}`);
  return qb.select(selectFields);
}

/**
 * Add date range filter (optimized for indexed date columns)
 */
export function addDateRangeFilter<T>(
  qb: SelectQueryBuilder<T>,
  fieldName: string,
  startDate?: Date,
  endDate?: Date
): SelectQueryBuilder<T> {
  const alias = qb.alias;

  if (startDate) {
    qb.andWhere(`${alias}.${fieldName} >= :startDate`, { startDate });
  }

  if (endDate) {
    qb.andWhere(`${alias}.${fieldName} <= :endDate`, { endDate });
  }

  return qb;
}

/**
 * Batch process large result sets to avoid memory issues
 */
export async function* batchProcess<T>(
  qb: SelectQueryBuilder<T>,
  batchSize: number = 1000
): AsyncGenerator<T[], void, unknown> {
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const batch = await qb
      .skip(offset)
      .take(batchSize)
      .getMany();

    if (batch.length === 0) {
      hasMore = false;
    } else {
      yield batch;
      offset += batchSize;

      // Stop if we got less than batchSize (last batch)
      if (batch.length < batchSize) {
        hasMore = false;
      }
    }
  }
}

/**
 * Optimize JOIN queries by using left join with select
 */
export function optimizedLeftJoin<T>(
  qb: SelectQueryBuilder<T>,
  relation: string,
  alias: string,
  selectFields?: string[]
): SelectQueryBuilder<T> {
  qb.leftJoin(`${qb.alias}.${relation}`, alias);

  if (selectFields && selectFields.length > 0) {
    selectFields.forEach(field => {
      qb.addSelect(`${alias}.${field}`);
    });
  } else {
    qb.addSelect(alias);
  }

  return qb;
}

/**
 * Add search filter with index optimization
 */
export function addSearchFilter<T>(
  qb: SelectQueryBuilder<T>,
  searchFields: string[],
  searchTerm: string
): SelectQueryBuilder<T> {
  if (!searchTerm || searchTerm.trim() === '') {
    return qb;
  }

  const alias = qb.alias;
  const conditions = searchFields
    .map((field, index) => `LOWER(${alias}.${field}) LIKE :search${index}`)
    .join(' OR ');

  const parameters: Record<string, string> = {};
  searchFields.forEach((_, index) => {
    parameters[`search${index}`] = `%${searchTerm.toLowerCase()}%`;
  });

  qb.andWhere(`(${conditions})`, parameters);

  return qb;
}

/**
 * Build efficient COUNT query (without loading all data)
 */
export async function getOptimizedCount<T>(
  qb: SelectQueryBuilder<T>
): Promise<number> {
  // Use raw count for better performance
  const result = await qb
    .select('COUNT(*)', 'count')
    .getRawOne();

  return parseInt(result.count, 10);
}

/**
 * Cache query results (simple in-memory cache)
 */
const queryCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getCachedQuery<T>(
  cacheKey: string,
  queryFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const cached = queryCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data as T;
  }

  const data = await queryFn();
  queryCache.set(cacheKey, { data, timestamp: Date.now() });

  // Clean old cache entries
  if (queryCache.size > 1000) {
    const now = Date.now();
    for (const [key, value] of queryCache.entries()) {
      if (now - value.timestamp > ttl) {
        queryCache.delete(key);
      }
    }
  }

  return data;
}

/**
 * Clear query cache
 */
export function clearQueryCache(pattern?: string): void {
  if (pattern) {
    for (const key of queryCache.keys()) {
      if (key.includes(pattern)) {
        queryCache.delete(key);
      }
    }
  } else {
    queryCache.clear();
  }
}

/**
 * Build optimized find options with common patterns
 */
export function buildOptimizedFindOptions<T>(options: {
  where?: FindOptionsWhere<T> | FindOptionsWhere<T>[];
  relations?: string[];
  order?: { [key: string]: 'ASC' | 'DESC' };
  page?: number;
  limit?: number;
  select?: (keyof T)[];
  cache?: boolean | number;
}): FindManyOptions<T> {
  const { where, relations, order, page = 1, limit = 20, select, cache } = options;

  const findOptions: FindManyOptions<T> = {};

  if (where) findOptions.where = where;
  if (relations) findOptions.relations = relations;
  if (order) findOptions.order = order;
  if (select) findOptions.select = select as any;

  // Pagination
  const safeLimit = Math.min(Math.max(1, limit), 100);
  const safePage = Math.max(1, page);
  findOptions.skip = (safePage - 1) * safeLimit;
  findOptions.take = safeLimit;

  // Caching
  if (cache) {
    findOptions.cache = typeof cache === 'number' ? cache : 60000; // 1 minute default
  }

  return findOptions;
}

/**
 * Analyze query performance (development only)
 */
export async function analyzeQuery<T>(
  qb: SelectQueryBuilder<T>
): Promise<{ query: string; parameters: any; executionTime: number }> {
  const startTime = Date.now();
  const query = qb.getQuery();
  const parameters = qb.getParameters();

  await qb.getMany(); // Execute query

  const executionTime = Date.now() - startTime;

  console.log('Query Analysis:');
  console.log('SQL:', query);
  console.log('Parameters:', parameters);
  console.log(`Execution Time: ${executionTime}ms`);

  return { query, parameters, executionTime };
}

/**
 * Bulk insert optimization (batch inserts)
 */
export async function bulkInsert<T>(
  repository: any,
  entities: T[],
  chunkSize: number = 500
): Promise<void> {
  for (let i = 0; i < entities.length; i += chunkSize) {
    const chunk = entities.slice(i, i + chunkSize);
    await repository.insert(chunk);
  }
}

/**
 * Bulk update optimization
 */
export async function bulkUpdate<T>(
  repository: any,
  updates: Array<{ id: string | number; data: Partial<T> }>,
  chunkSize: number = 500
): Promise<void> {
  for (let i = 0; i < updates.length; i += chunkSize) {
    const chunk = updates.slice(i, i + chunkSize);

    await Promise.all(
      chunk.map(update =>
        repository.update(update.id, update.data)
      )
    );
  }
}

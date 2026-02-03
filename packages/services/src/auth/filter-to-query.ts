/**
 * Filter to Query Converter
 * 
 * Converts Directus-style JSONB filters to Supabase PostgREST query filters.
 * This allows permission filters to be applied at the database level.
 * 
 * Supports:
 * - Equality: _eq, _neq
 * - Comparison: _lt, _lte, _gt, _gte
 * - Containment: _in, _nin, _contains, _ncontains
 * - Null checks: _null, _nnull, _empty, _nempty
 * - String matching: _starts_with, _ends_with, _nstarts_with, _nends_with
 * - Range: _between, _nbetween
 * - Logical: _and, _or
 * - Dynamic values: $CURRENT_USER, $CURRENT_ROLE
 * 
 * @module @microbuild/services/auth/filter-to-query
 */

export type FilterObject = Record<string, unknown>;

/**
 * Query builder interface compatible with Supabase client
 */
export interface QueryBuilder {
  eq: (field: string, value: unknown) => QueryBuilder;
  neq: (field: string, value: unknown) => QueryBuilder;
  gt: (field: string, value: unknown) => QueryBuilder;
  gte: (field: string, value: unknown) => QueryBuilder;
  lt: (field: string, value: unknown) => QueryBuilder;
  lte: (field: string, value: unknown) => QueryBuilder;
  in: (field: string, values: unknown[]) => QueryBuilder;
  like: (field: string, pattern: string) => QueryBuilder;
  ilike: (field: string, pattern: string) => QueryBuilder;
  is: (field: string, value: null) => QueryBuilder;
  or: (filters: string) => QueryBuilder;
  filter: (field: string, operator: string, value: unknown) => QueryBuilder;
  not: (field: string, operator: string, value: unknown) => QueryBuilder;
}

/**
 * Supported filter operators
 */
export const FILTER_OPERATORS = {
  // Equality
  _eq: 'eq',
  _neq: 'neq',
  // Comparison
  _lt: 'lt',
  _lte: 'lte',
  _gt: 'gt',
  _gte: 'gte',
  // Containment
  _in: 'in',
  _nin: 'not.in',
  _contains: 'cs',
  _ncontains: 'not.cs',
  // Null checks
  _null: 'is',
  _nnull: 'not.is',
  // String matching (PostgREST uses LIKE)
  _starts_with: 'like',
  _nstarts_with: 'not.like',
  _ends_with: 'like',
  _nends_with: 'not.like',
  _icontains: 'ilike',
  // Empty checks
  _empty: 'is',
  _nempty: 'not.is',
} as const;

/**
 * Resolve dynamic values in filter
 * 
 * @param filter - Filter object with potential dynamic values
 * @param userId - Current user ID
 * @param roleId - Current user's role ID
 * @returns Filter with dynamic values resolved
 */
export function resolveFilterDynamicValues(
  filter: FilterObject,
  userId: string,
  roleId?: string | null
): FilterObject {
  const resolved = JSON.parse(JSON.stringify(filter));
  
  function replaceValues(obj: Record<string, unknown>): void {
    for (const key in obj) {
      const value = obj[key];
      
      if (value === '$CURRENT_USER') {
        obj[key] = userId;
      } else if (value === '$CURRENT_ROLE') {
        obj[key] = roleId ?? null;
      } else if (typeof value === 'object' && value !== null) {
        replaceValues(value as Record<string, unknown>);
      }
    }
  }
  
  replaceValues(resolved);
  return resolved;
}

/**
 * Apply a Directus-style filter to a Supabase query builder
 * 
 * @param query - Supabase query builder
 * @param filter - Filter object (Directus format)
 * @returns Modified query builder
 * 
 * @example
 * ```typescript
 * let query = supabase.from('directus_users').select('*');
 * query = applyFilterToQuery(query, { status: { _eq: 'active' } });
 * const { data } = await query;
 * ```
 */
export function applyFilterToQuery<T extends QueryBuilder>(
  query: T,
  filter: FilterObject | null | undefined
): T {
  if (!filter || Object.keys(filter).length === 0) {
    return query;
  }

  return applyFilter(query, filter);
}

/**
 * Recursively apply filter conditions
 */
export function applyFilter<T extends QueryBuilder>(
  query: T,
  filter: FilterObject
): T {
  for (const [key, value] of Object.entries(filter)) {
    // Handle logical operators
    if (key === '_and') {
      query = applyAndConditions(query, value as FilterObject[]);
      continue;
    }

    if (key === '_or') {
      query = applyOrConditions(query, value as FilterObject[]);
      continue;
    }

    // Handle field operators
    if (typeof value === 'object' && value !== null) {
      query = applyFieldOperators(query, key, value as FilterObject);
    } else {
      // Direct equality (shorthand)
      query = query.eq(key, value) as T;
    }
  }

  return query;
}

/**
 * Apply AND conditions
 */
function applyAndConditions<T extends QueryBuilder>(
  query: T,
  conditions: FilterObject[]
): T {
  // In PostgREST, multiple filters are AND by default
  // So we just apply each condition sequentially
  for (const condition of conditions) {
    // Check if this condition contains nested _or operator
    if ('_or' in condition) {
      query = applyOrConditions(query, condition._or as FilterObject[]);
      continue;
    }

    // Check if this condition contains nested _and operator
    if ('_and' in condition) {
      query = applyAndConditions(query, condition._and as FilterObject[]);
      continue;
    }

    // Apply field conditions
    for (const [field, operators] of Object.entries(condition)) {
      if (typeof operators === 'object' && operators !== null) {
        query = applyFieldOperators(query, field, operators as FilterObject);
      } else {
        query = query.eq(field, operators) as T;
      }
    }
  }

  return query;
}

/**
 * Apply OR conditions using PostgREST or() filter
 */
function applyOrConditions<T extends QueryBuilder>(
  query: T,
  conditions: FilterObject[]
): T {
  // Build OR filter string for PostgREST
  const orParts = conditions.map((condition) => buildOrPart(condition));
  const validParts = orParts.filter((part) => part !== '');

  if (validParts.length > 0) {
    query = query.or(validParts.join(',')) as T;
  }

  return query;
}

/**
 * Build a single OR condition part as PostgREST filter string
 */
function buildOrPart(condition: FilterObject): string {
  const parts: string[] = [];

  for (const [field, operators] of Object.entries(condition)) {
    // Handle nested logical operators
    if (field === '_and') {
      // Nested AND in OR - wrap in parentheses
      const andParts = (operators as FilterObject[])
        .map((c) => buildOrPart(c))
        .filter((p) => p !== '');
      if (andParts.length > 0) {
        parts.push(`and(${andParts.join(',')})`);
      }
      continue;
    }

    if (field === '_or') {
      // Nested OR in OR - flatten
      const orParts = (operators as FilterObject[])
        .map((c) => buildOrPart(c))
        .filter((p) => p !== '');
      if (orParts.length > 0) {
        parts.push(`or(${orParts.join(',')})`);
      }
      continue;
    }

    if (typeof operators === 'object' && operators !== null) {
      for (const [op, value] of Object.entries(operators as FilterObject)) {
        const filterStr = buildOperatorFilter(field, op, value);
        if (filterStr) {
          parts.push(filterStr);
        }
      }
    } else {
      // Direct equality
      parts.push(`${field}.eq.${operators}`);
    }
  }

  return parts.join(',');
}

/**
 * Build PostgREST filter string for an operator
 */
function buildOperatorFilter(
  field: string,
  operator: string,
  value: unknown
): string {
  switch (operator) {
    case '_eq':
      return `${field}.eq.${value}`;
    case '_neq':
      return `${field}.neq.${value}`;
    case '_gt':
      return `${field}.gt.${value}`;
    case '_gte':
      return `${field}.gte.${value}`;
    case '_lt':
      return `${field}.lt.${value}`;
    case '_lte':
      return `${field}.lte.${value}`;
    case '_in':
      if (Array.isArray(value)) {
        return `${field}.in.(${value.join(',')})`;
      }
      return '';
    case '_nin':
      if (Array.isArray(value)) {
        return `${field}.not.in.(${value.join(',')})`;
      }
      return '';
    case '_null':
      return value === true ? `${field}.is.null` : `${field}.not.is.null`;
    case '_nnull':
      return value === true ? `${field}.not.is.null` : `${field}.is.null`;
    case '_contains':
      return `${field}.cs.{${value}}`;
    case '_ncontains':
      return `${field}.not.cs.{${value}}`;
    case '_starts_with':
      return `${field}.like.${value}%`;
    case '_nstarts_with':
      return `${field}.not.like.${value}%`;
    case '_ends_with':
      return `${field}.like.%${value}`;
    case '_nends_with':
      return `${field}.not.like.%${value}`;
    case '_icontains':
      return `${field}.ilike.%${value}%`;
    case '_empty':
      return value === true ? `${field}.is.null` : `${field}.not.is.null`;
    case '_nempty':
      return value === true ? `${field}.not.is.null` : `${field}.is.null`;
    case '_between':
      if (Array.isArray(value) && value.length === 2) {
        return `and(${field}.gte.${value[0]},${field}.lte.${value[1]})`;
      }
      return '';
    case '_nbetween':
      if (Array.isArray(value) && value.length === 2) {
        return `or(${field}.lt.${value[0]},${field}.gt.${value[1]})`;
      }
      return '';
    default:
      console.warn(`Unknown filter operator: ${operator}`);
      return '';
  }
}

/**
 * Apply field operators to query
 */
export function applyFieldOperators<T extends QueryBuilder>(
  query: T,
  field: string,
  operators: FilterObject
): T {
  for (const [operator, value] of Object.entries(operators)) {
    switch (operator) {
      case '_eq':
        query = query.eq(field, value) as T;
        break;
      case '_neq':
        query = query.neq(field, value) as T;
        break;
      case '_gt':
        query = query.gt(field, value) as T;
        break;
      case '_gte':
        query = query.gte(field, value) as T;
        break;
      case '_lt':
        query = query.lt(field, value) as T;
        break;
      case '_lte':
        query = query.lte(field, value) as T;
        break;
      case '_in':
        if (Array.isArray(value)) {
          query = query.in(field, value) as T;
        }
        break;
      case '_nin':
        if (Array.isArray(value)) {
          query = query.not(field, 'in', `(${value.join(',')})`) as T;
        }
        break;
      case '_null':
        if (value === true) {
          query = query.is(field, null) as T;
        } else {
          query = query.not(field, 'is', null) as T;
        }
        break;
      case '_nnull':
        if (value === true) {
          query = query.not(field, 'is', null) as T;
        } else {
          query = query.is(field, null) as T;
        }
        break;
      case '_contains':
        query = query.filter(field, 'cs', `{${value}}`) as T;
        break;
      case '_ncontains':
        query = query.not(field, 'cs', `{${value}}`) as T;
        break;
      case '_starts_with':
        query = query.like(field, `${value}%`) as T;
        break;
      case '_nstarts_with':
        query = query.not(field, 'like', `${value}%`) as T;
        break;
      case '_ends_with':
        query = query.like(field, `%${value}`) as T;
        break;
      case '_nends_with':
        query = query.not(field, 'like', `%${value}`) as T;
        break;
      case '_icontains':
        query = query.ilike(field, `%${value}%`) as T;
        break;
      case '_empty':
        if (value === true) {
          query = query.is(field, null) as T;
        } else {
          query = query.not(field, 'is', null) as T;
        }
        break;
      case '_nempty':
        if (value === true) {
          query = query.not(field, 'is', null) as T;
        } else {
          query = query.is(field, null) as T;
        }
        break;
      case '_between':
        if (Array.isArray(value) && value.length === 2) {
          query = query.gte(field, value[0]) as T;
          query = query.lte(field, value[1]) as T;
        }
        break;
      case '_nbetween':
        if (Array.isArray(value) && value.length === 2) {
          // Outside the range: less than min OR greater than max
          query = query.or(`${field}.lt.${value[0]},${field}.gt.${value[1]}`) as T;
        }
        break;
      default:
        console.warn(`Unknown filter operator: ${operator}`);
    }
  }

  return query;
}

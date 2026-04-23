'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROUTE_SOURCES = [
  { mountPath: '/api/v1/auth', file: '../src/auth/auth.routes.js', tag: 'Auth' },
  { mountPath: '/api/v1/users', file: '../src/User/user.route.js', tag: 'Users' },
  { mountPath: '/api/v1/staff', file: '../src/Staff/staff.routes.js', tag: 'Staff' },
];

const ENDPOINT_OVERRIDES = {
  '/api/v1/auth/profile': {
    put: {
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string', minLength: 2, maxLength: 25 },
                surname: { type: 'string', minLength: 2, maxLength: 25 },
                phone: { type: 'string', pattern: '^\\d{8}$' },
                profilePicture: { type: 'string' },
              },
            },
          },
        },
      },
    },
    delete: {
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                confirmacion: { type: 'boolean', description: 'Debe ser true para permitir eliminacion.' },
                motivo: { type: 'string', maxLength: 200 },
              },
              required: ['confirmacion'],
            },
          },
        },
      },
    },
  },
  '/api/v1/auth/profile/by-id': {
    post: {
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                userId: { type: 'string' },
              },
              required: ['userId'],
            },
          },
        },
      },
    },
  },
  '/api/v1/coupons/validate': {
    post: {
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                codigo: { type: 'string' },
                montoTotal: { type: 'number', minimum: 0 },
                restaurantID: { type: 'string', pattern: '^[0-9a-fA-F]{24}$' },
              },
              required: ['codigo', 'montoTotal'],
            },
          },
        },
      },
    },
  },
  '/api/v1/notifications/emit-test': {
    post: {
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                targetType: {
                  type: 'string',
                  enum: ['restaurant', 'client', 'broadcast'],
                  default: 'restaurant',
                },
                targetId: { type: 'string' },
                event: { type: 'string', default: 'test-notification' },
                type: { type: 'string', default: 'TEST_NOTIFICATION' },
                message: { type: 'string', default: 'Notificacion de prueba' },
                data: { type: 'object' },
              },
            },
          },
        },
      },
    },
  },
};

const stripJsComments = (text) => {
  return text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/\s\/\/.*$/gm, '');
};

const normalizePath = (mountPath, endpointPath) => {
  const joined = `${mountPath}/${endpointPath}`
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .replace(/\/:(\w+)/g, '/{$1}');

  return joined || '/';
};

const toSummary = (method, fullPath) => {
  const cleanPath = fullPath.replace('/api/v1/', '').replace(/\/{/g, '/:');
  return `${method.toUpperCase()} ${cleanPath}`;
};

const validatorCache = new Map();

const safeReadFile = (absoluteFilePath) => {
  if (!fs.existsSync(absoluteFilePath)) {
    return '';
  }
  return fs.readFileSync(absoluteFilePath, 'utf8');
};

const findClosingToken = (text, startIndex, openChar, closeChar) => {
  let depth = 0;
  let quote = null;
  let escaped = false;

  for (let i = startIndex; i < text.length; i += 1) {
    const char = text[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === '\'' || char === '`') {
      quote = char;
      continue;
    }

    if (char === openChar) {
      depth += 1;
      continue;
    }

    if (char === closeChar) {
      depth -= 1;
      if (depth === 0) {
        return i;
      }
    }
  }

  return -1;
};

const splitTopLevelArgs = (rawArgs) => {
  const args = [];
  let current = '';
  let quote = null;
  let escaped = false;
  let parenDepth = 0;
  let braceDepth = 0;
  let bracketDepth = 0;

  for (let i = 0; i < rawArgs.length; i += 1) {
    const char = rawArgs[i];

    if (quote) {
      current += char;
      if (escaped) {
        escaped = false;
      } else if (char === '\\') {
        escaped = true;
      } else if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === '"' || char === '\'' || char === '`') {
      quote = char;
      current += char;
      continue;
    }

    if (char === '(') parenDepth += 1;
    if (char === ')') parenDepth -= 1;
    if (char === '{') braceDepth += 1;
    if (char === '}') braceDepth -= 1;
    if (char === '[') bracketDepth += 1;
    if (char === ']') bracketDepth -= 1;

    if (char === ',' && parenDepth === 0 && braceDepth === 0 && bracketDepth === 0) {
      if (current.trim()) {
        args.push(current.trim());
      }
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    args.push(current.trim());
  }

  return args;
};

const extractImportsMap = (routeFileContent, routeAbsoluteFilePath) => {
  const importsMap = new Map();
  const importPattern = /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"];/g;
  let match;

  while ((match = importPattern.exec(routeFileContent)) !== null) {
    const specifiers = match[1].trim();
    const source = match[2].trim();

    if (!specifiers.startsWith('{') || !source.startsWith('.')) {
      continue;
    }

    const resolvedPath = path.resolve(path.dirname(routeAbsoluteFilePath), source);
    const filePath = resolvedPath.endsWith('.js') ? resolvedPath : `${resolvedPath}.js`;
    const named = specifiers
      .replace(/^\{/, '')
      .replace(/\}$/, '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    named.forEach((name) => {
      const symbol = name.includes(' as ') ? name.split(' as ')[1].trim() : name;
      importsMap.set(symbol, filePath);
    });
  }

  return importsMap;
};

const inferFieldSchema = (chainSnippet) => {
  const schema = { type: 'string' };

  if (/\.isArray\s*\(/.test(chainSnippet)) {
    schema.type = 'array';
    schema.items = { type: 'string' };
  } else if (/\.isInt\s*\(/.test(chainSnippet)) {
    schema.type = 'integer';
  } else if (/\.isFloat\s*\(/.test(chainSnippet)) {
    schema.type = 'number';
  } else if (/\.isBoolean\s*\(/.test(chainSnippet)) {
    schema.type = 'boolean';
  }

  if (/\.isEmail\s*\(/.test(chainSnippet)) {
    schema.format = 'email';
  }

  if (/\.isISO8601\s*\(/.test(chainSnippet)) {
    schema.format = 'date-time';
  }

  if (/\.isMongoId\s*\(/.test(chainSnippet)) {
    schema.pattern = '^[0-9a-fA-F]{24}$';
  }

  const enumMatch = chainSnippet.match(/\.isIn\s*\(\s*\[([\s\S]*?)\]\s*\)/);
  if (enumMatch) {
    const values = [...enumMatch[1].matchAll(/['"`]([^'"`]+)['"`]/g)].map((item) => item[1]);
    if (values.length > 0) {
      schema.enum = values;
    }
  }

  const isLengthMatch = chainSnippet.match(/\.isLength\s*\(\s*\{([\s\S]*?)\}\s*\)/);
  if (isLengthMatch) {
    const min = isLengthMatch[1].match(/min\s*:\s*(\d+)/);
    const max = isLengthMatch[1].match(/max\s*:\s*(\d+)/);
    if (min) schema.minLength = Number(min[1]);
    if (max) schema.maxLength = Number(max[1]);
  }

  const numericRangeMatch = chainSnippet.match(/\.(?:isInt|isFloat)\s*\(\s*\{([\s\S]*?)\}\s*\)/);
  if (numericRangeMatch) {
    const min = numericRangeMatch[1].match(/min\s*:\s*(-?\d+(?:\.\d+)?)/);
    const max = numericRangeMatch[1].match(/max\s*:\s*(-?\d+(?:\.\d+)?)/);
    if (min) schema.minimum = Number(min[1]);
    if (max) schema.maximum = Number(max[1]);
  }

  const regexMatch = chainSnippet.match(/\.matches\s*\(\s*\/((?:\\\/|[^/])+)\//);
  if (regexMatch) {
    schema.pattern = regexMatch[1].replaceAll('\\/', '/');
  }

  const messageMatch = chainSnippet.match(/\.withMessage\s*\(\s*['"`]([\s\S]*?)['"`]\s*\)/);
  if (messageMatch) {
    schema.description = messageMatch[1].trim();
  }

  return schema;
};

const extractValidationDefinitionsFromSnippet = (snippet) => {
  const entries = [];
  const matcher = /(check|body|param|query)\s*\(/g;
  const starts = [];
  let found;

  while ((found = matcher.exec(snippet)) !== null) {
    starts.push({ index: found.index, kind: found[1] });
  }

  starts.forEach((start, idx) => {
    const end = idx + 1 < starts.length ? starts[idx + 1].index : snippet.length;
    const chain = snippet.slice(start.index, end);
    const fieldMatch = chain.match(/^(?:check|body|param|query)\s*\(\s*['"`]([^'"`]+)['"`]/);

    if (!fieldMatch) {
      return;
    }

    const fieldName = fieldMatch[1];
    const location = start.kind === 'check' || start.kind === 'body' ? 'body' : start.kind;
    const optional = /\.optional\s*\(/.test(chain) || /\.optional\s*\./.test(chain);
    const schema = inferFieldSchema(chain);

    entries.push({
      fieldName,
      location,
      required: !optional,
      schema,
    });
  });

  return entries;
};

const parseExportedValidators = (validatorAbsolutePath) => {
  if (validatorCache.has(validatorAbsolutePath)) {
    return validatorCache.get(validatorAbsolutePath);
  }

  const source = safeReadFile(validatorAbsolutePath);
  const validatorMap = new Map();
  const exportPattern = /export\s+const\s+(\w+)\s*=\s*\[([\s\S]*?)\n\];/g;
  let match;

  while ((match = exportPattern.exec(source)) !== null) {
    const validatorName = match[1];
    const block = match[2] || '';
    validatorMap.set(validatorName, extractValidationDefinitionsFromSnippet(block));
  }

  validatorCache.set(validatorAbsolutePath, validatorMap);
  return validatorMap;
};

const extractRouteDefinitions = (routeFileContent) => {
  const source = stripJsComments(routeFileContent);
  const routes = [];
  const routeMatcher = /router\.(get|post|put|delete|patch)\s*\(/g;
  let match;

  while ((match = routeMatcher.exec(source)) !== null) {
    const method = match[1].toLowerCase();
    const openParenIndex = source.indexOf('(', match.index);
    const closeParenIndex = findClosingToken(source, openParenIndex, '(', ')');

    if (closeParenIndex < 0) {
      continue;
    }

    const args = splitTopLevelArgs(source.slice(openParenIndex + 1, closeParenIndex));
    if (args.length === 0) {
      continue;
    }

    const pathMatch = args[0].match(/^['"`]([^'"`]+)['"`]$/);
    if (!pathMatch) {
      continue;
    }

    routes.push({
      method,
      routePath: pathMatch[1],
      middlewares: args.slice(1),
    });
  }

  return routes;
};

const addBodyFieldSchema = (rootSchema, fieldPath, fieldSchema, requiredTopLevel) => {
  const segments = fieldPath.split('.');
  let cursor = rootSchema;

  for (let i = 0; i < segments.length; i += 1) {
    const segment = segments[i];
    const isLast = i === segments.length - 1;

    if (segment === '*') {
      if (!cursor.type) {
        cursor.type = 'array';
      }
      if (!cursor.items) {
        cursor.items = { type: 'object', properties: {} };
      }
      cursor = cursor.items;
      continue;
    }

    if (!cursor.type) {
      cursor.type = 'object';
    }
    if (!cursor.properties) {
      cursor.properties = {};
    }

    if (isLast) {
      cursor.properties[segment] = { ...fieldSchema };
      if (requiredTopLevel && i === 0) {
        if (!rootSchema.required) {
          rootSchema.required = [];
        }
        if (!rootSchema.required.includes(segment)) {
          rootSchema.required.push(segment);
        }
      }
      return;
    }

    const next = segments[i + 1];

    if (!cursor.properties[segment]) {
      if (next === '*') {
        cursor.properties[segment] = {
          type: 'array',
          items: { type: 'object', properties: {} },
        };
      } else {
        cursor.properties[segment] = { type: 'object', properties: {} };
      }
    }

    cursor = cursor.properties[segment];
  }
};

const buildRequestBodySchema = (bodyEntries) => {
  if (bodyEntries.length === 0) {
    return null;
  }

  const schema = { type: 'object', properties: {} };
  bodyEntries.forEach((entry) => {
    addBodyFieldSchema(schema, entry.fieldName, entry.schema, entry.required);
  });

  return {
    required: bodyEntries.some((entry) => entry.required),
    content: {
      'application/json': {
        schema,
      },
    },
  };
};

const buildParameters = (entries, fullPath) => {
  const params = [];
  const seen = new Set();

  entries
    .filter((entry) => entry.location === 'param' || entry.location === 'query')
    .forEach((entry) => {
      const key = `${entry.location}:${entry.fieldName}`;
      if (seen.has(key)) {
        return;
      }
      seen.add(key);
      params.push({
        name: entry.fieldName,
        in: entry.location,
        required: entry.location === 'param' ? true : entry.required,
        schema: {
          ...entry.schema,
          description: undefined,
        },
        description: entry.schema.description,
      });
    });

  const pathParams = [...fullPath.matchAll(/\{(\w+)\}/g)].map((item) => item[1]);
  pathParams.forEach((paramName) => {
    const key = `param:${paramName}`;
    if (seen.has(key)) {
      return;
    }
    params.push({
      name: paramName,
      in: 'path',
      required: true,
      schema: { type: 'string' },
      description: `Parametro de ruta ${paramName}`,
    });
    seen.add(key);
  });

  return params;
};

const collectEndpointValidationEntries = (routeDef, importsMap, routeAbsoluteFilePath) => {
  const entries = [];

  routeDef.middlewares.forEach((middlewareExpr) => {
    const cleanMiddlewareExpr = stripJsComments(middlewareExpr).trim();
    entries.push(...extractValidationDefinitionsFromSnippet(cleanMiddlewareExpr));

    const symbolMatch = cleanMiddlewareExpr.match(/^([A-Za-z_$][\w$]*)$/);
    if (!symbolMatch) {
      return;
    }

    const symbol = symbolMatch[1];
    if (!/^(validate|validar)/i.test(symbol)) {
      return;
    }

    const importFilePath = importsMap.get(symbol);
    if (!importFilePath) {
      return;
    }

    const absolute = path.resolve(path.dirname(routeAbsoluteFilePath), importFilePath);
    const normalizedAbsolute = absolute.endsWith('.js') ? absolute : `${absolute}.js`;
    const exportedValidators = parseExportedValidators(normalizedAbsolute);

    if (exportedValidators.has(symbol)) {
      entries.push(...(exportedValidators.get(symbol) || []));
    }
  });

  return entries;
};

const endpointNeedsAuth = (routeDef, fullPath) => {
  if (fullPath === '/api/v1/health') {
    return false;
  }

  return routeDef.middlewares.some((middlewareExpr) => {
    return /\bautenticar\b/.test(middlewareExpr) || /\bvalidateJWT\b/.test(middlewareExpr);
  });
};

const extractFileEndpoints = (absoluteFilePath, mountPath) => {
  const content = safeReadFile(absoluteFilePath);
  const importsMap = extractImportsMap(content, absoluteFilePath);
  const routeDefinitions = extractRouteDefinitions(content);

  return routeDefinitions.map((routeDef) => {
    const fullPath = normalizePath(mountPath, routeDef.routePath);
    const validationEntries = collectEndpointValidationEntries(routeDef, importsMap, absoluteFilePath);
    const parameters = buildParameters(validationEntries, fullPath);
    const bodyEntries = validationEntries.filter((entry) => entry.location === 'body');

    return {
      ...routeDef,
      fullPath,
      parameters,
      requestBody: buildRequestBodySchema(bodyEntries),
      needsAuth: endpointNeedsAuth(routeDef, fullPath),
    };
  });
};

const defaultResponses = {
  200: { description: 'Operacion exitosa' },
  400: { description: 'Solicitud invalida' },
  401: { description: 'No autorizado' },
  500: { description: 'Error interno del servidor' },
};

const withCleanObject = (obj) => {
  const cleaned = {};
  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  });
  return cleaned;
};

const addHealthEndpointIfMissing = (paths) => {
  if (paths['/api/v1/health']) {
    return;
  }

  paths['/api/v1/health'] = {
    get: {
      tags: ['System'],
      summary: 'GET health',
      responses: {
        200: { description: 'Servicio activo' },
      },
    },
  };
};

const buildPathOperations = () => {
  const paths = {};

  ROUTE_SOURCES.forEach(({ mountPath, file, tag }) => {
    const absoluteFilePath = path.resolve(__dirname, file);
    const endpoints = extractFileEndpoints(absoluteFilePath, mountPath);

    endpoints.forEach((endpoint) => {
      if (!paths[endpoint.fullPath]) {
        paths[endpoint.fullPath] = {};
      }

      paths[endpoint.fullPath][endpoint.method] = withCleanObject({
        tags: [tag],
        summary: toSummary(endpoint.method, endpoint.fullPath),
        parameters: endpoint.parameters.length > 0 ? endpoint.parameters : undefined,
        requestBody: endpoint.requestBody,
        responses: defaultResponses,
        security: endpoint.needsAuth ? [{ bearerAuth: [] }] : undefined,
      });
    });
  });

  addHealthEndpointIfMissing(paths);

  Object.entries(ENDPOINT_OVERRIDES).forEach(([endpointPath, operations]) => {
    if (!paths[endpointPath]) {
      paths[endpointPath] = {};
    }

    Object.entries(operations).forEach(([method, override]) => {
      if (!paths[endpointPath][method]) {
        return;
      }

      paths[endpointPath][method] = {
        ...paths[endpointPath][method],
        ...override,
      };
    });
  });

  return paths;
};

const buildOpenApiSpec = () => {
  const serverUrl = process.env.SWAGGER_SERVER_URL || `http://localhost:${process.env.PORT || 3006}`;
  const paths = buildPathOperations();
  const tags = Array.from(
    new Set(
      Object.values(paths).flatMap((pathOperations) =>
        Object.values(pathOperations).flatMap((operation) => operation.tags || [])
      )
    )
  ).map((name) => ({ name }));

  return {
    openapi: '3.0.3',
    info: {
      title: 'GastroFlow API - Postgres',
      version: '1.0.0',
      description: 'Documentacion generada automaticamente para todos los controladores.',
    },
    servers: [
      {
        url: serverUrl,
        description: 'Servidor local',
      },
    ],
    tags,
    paths,
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  };
};

const SWAGGER_DOC_TARGETS = {
  mongo: process.env.SWAGGER_MONGO_DOC_URL || 'http://localhost:3006/api-docs-json',
  postgres:
    process.env.SWAGGER_POSTGRES_DOC_URL || 'http://localhost:3007/api-docs-json',
};

const SWAGGER_TOPBAR_URLS = [
  {
    url: '/swagger/specs/mongo',
    name: 'Mongo',
  },
  {
    url: '/swagger/specs/postgres',
    name: 'Postgres',
  },
];

const defaultTopbarNameByPort = {
  3006: 'Mongo',
  3007: 'Postgres',
};

const SWAGGER_ALLOWED_ORIGINS = new Set([
  'http://localhost:3006',
  'http://localhost:3007',
]);

const applySwaggerCors = (req, res) => {
  const origin = req.headers.origin;
  if (origin && SWAGGER_ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
};

const proxySwaggerSpec = async (targetUrl, req, res) => {
  applySwaggerCors(req, res);

  const response = await fetch(targetUrl, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  const responseBody = await response.text();
  const contentType = response.headers.get('content-type') || 'application/json; charset=utf-8';

  res.status(response.status);
  res.setHeader('Content-Type', contentType);
  return res.send(responseBody);
};

const renderSwaggerInitializer = (primaryName) => {
  const urls = JSON.stringify(SWAGGER_TOPBAR_URLS);
  const safePrimaryName = JSON.stringify(primaryName);

  return `window.onload = function() {
  window.ui = SwaggerUIBundle({
    urls: ${urls},
    "urls.primaryName": ${safePrimaryName},
    dom_id: '#swagger-ui',
    deepLinking: true,
    persistAuthorization: true,
    displayRequestDuration: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  });
};`;
};

export const setupSwagger = (app) => {
  app.options('/api-docs-json', (req, res) => {
    applySwaggerCors(req, res);
    return res.sendStatus(204);
  });

  app.get('/api-docs-json', (req, res) => {
    applySwaggerCors(req, res);
    return res.status(200).json(buildOpenApiSpec());
  });

  app.get('/swagger/specs/mongo', async (req, res) => {
    try {
      return await proxySwaggerSpec(SWAGGER_DOC_TARGETS.mongo, req, res);
    } catch (error) {
      return res.status(502).json({
        error: 'No se pudo cargar la especificacion Mongo',
        details: error.message,
      });
    }
  });

  app.get('/swagger/specs/postgres', async (req, res) => {
    try {
      return await proxySwaggerSpec(SWAGGER_DOC_TARGETS.postgres, req, res);
    } catch (error) {
      return res.status(502).json({
        error: 'No se pudo cargar la especificacion Postgres',
        details: error.message,
      });
    }
  });

  app.get('/swagger/swagger-initializer.js', (req, res) => {
    const currentPort = Number(process.env.PORT || 3006);
    const defaultTopbarName =
      defaultTopbarNameByPort[currentPort] || SWAGGER_TOPBAR_URLS[0].name;

    res.type('application/javascript');
    return res.send(renderSwaggerInitializer(defaultTopbarName));
  });

  const swaggerUiHandler = (req, res, next) => {
    const currentPort = Number(process.env.PORT || 3006);
    const defaultTopbarName =
      defaultTopbarNameByPort[currentPort] || SWAGGER_TOPBAR_URLS[0].name;

    return swaggerUi.setup(null, {
      explorer: true,
      swaggerOptions: {
        urls: SWAGGER_TOPBAR_URLS,
        'urls.primaryName': defaultTopbarName,
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    })(req, res, next);
  };

  app.get('/swagger', swaggerUiHandler);
  app.get('/swagger/', swaggerUiHandler);
  app.use('/swagger', swaggerUi.serve);
};

export const getSwaggerSpec = () => buildOpenApiSpec();

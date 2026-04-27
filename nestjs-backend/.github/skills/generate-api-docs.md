# Skill: generate-api-docs

## Description

This skill helps GitHub Copilot automatically generate and maintain **Swagger/OpenAPI documentation** for NestJS controllers and DTOs. It adds `@ApiOperation`, `@ApiResponse`, `@ApiProperty`, and `@ApiBearerAuth` decorators to the appropriate files, and ensures the Swagger module is correctly bootstrapped in `main.ts`.

---

## When to Use This Skill

Trigger this skill when asked to:
- "Generate API docs for `<module>`"
- "Add Swagger decorators to `<controller or DTO>`"
- "Document all endpoints in `<module>`"
- "Set up Swagger for this project"

---

## Instructions

### Step 1 — Install dependencies (if missing)

Run the supporting script to ensure Swagger packages are installed:

```bash
bash .github/skills/scripts/setup-swagger.sh
```

---

### Step 2 — Bootstrap Swagger in `main.ts`

Check if `src/main.ts` already sets up Swagger. If not, add the following inside the `bootstrap()` function, **after** `app` is created and **before** `app.listen()`:

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder()
  .setTitle('NestJS API')
  .setDescription('Auto-generated API documentation')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api/docs', app, document);
```

---

### Step 3 — Decorate Controllers

For every `@Controller` class, apply decorators to each route method:

| Decorator | Purpose |
|---|---|
| `@ApiOperation({ summary: '...' })` | Short description of the endpoint |
| `@ApiResponse({ status: 200, description: '...' })` | Success response |
| `@ApiResponse({ status: 400, description: 'Bad Request' })` | Validation error |
| `@ApiResponse({ status: 401, description: 'Unauthorized' })` | Auth failure (for guarded routes) |
| `@ApiBearerAuth()` | Mark endpoint as JWT-protected |

**Example — before:**
```typescript
@Get()
findAll() {
  return this.activitiesService.findAll();
}
```

**Example — after:**
```typescript
@Get()
@ApiOperation({ summary: 'Retrieve all activities' })
@ApiResponse({ status: 200, description: 'List of all activities returned successfully.' })
@ApiResponse({ status: 401, description: 'Unauthorized.' })
@ApiBearerAuth()
findAll() {
  return this.activitiesService.findAll();
}
```

---

### Step 4 — Decorate DTOs

For every field in a DTO class, add `@ApiProperty`:

**Example — before:**
```typescript
export class CreateActivityDto {
  name: string;
  description?: string;
  date: Date;
}
```

**Example — after:**
```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateActivityDto {
  @ApiProperty({ example: 'Morning Run', description: 'Name of the activity' })
  name: string;

  @ApiProperty({ example: 'A 5km morning run', description: 'Optional description', required: false })
  description?: string;

  @ApiProperty({ example: '2026-04-24T07:00:00.000Z', description: 'Scheduled date of the activity' })
  date: Date;
}
```

---

### Step 5 — Verify

After making changes, confirm Swagger UI is accessible by running the dev server:

```bash
bash .github/skills/scripts/setup-swagger.sh --verify
```

Then open: `http://localhost:3000/api/docs`

---

## Files Typically Modified

| File | Change |
|---|---|
| `src/main.ts` | Add Swagger bootstrap code |
| `src/*/  *.controller.ts` | Add `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth` |
| `src/*/dto/*.dto.ts` | Add `@ApiProperty` to every field |
| `package.json` | Add `@nestjs/swagger` and `swagger-ui-express` if missing |

---

## Rules

- Do **not** alter method logic — only add decorators and imports.
- Do **not** duplicate decorators if they already exist — check before adding.
- Always add `import { ApiProperty } from '@nestjs/swagger'` at the top of DTO files.
- Always add required swagger imports at the top of controller files.
- Flag any endpoint with no clear purpose using `// TODO: clarify endpoint behavior`.

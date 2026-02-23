# TypeScript-Specific Clean Code Guidelines

This document covers TypeScript-specific patterns and best practices that complement the [unified clean code guide](./clean-code-unified.md).

## Type System Best Practices

### Always specify types for better refactoring

**Bad:**
```typescript
function travelToTexas(vehicle) {
  if (vehicle instanceof Bicycle) {
    vehicle.pedal(currentLocation, new Location('texas'));
  } else if (vehicle instanceof Car) {
    vehicle.drive(currentLocation, new Location('texas'));
  }
}
```

**Good:**
```typescript
type Vehicle = Bicycle | Car;

function travelToTexas(vehicle: Vehicle) {
  vehicle.move(currentLocation, new Location('texas'));
}
```

### Use enum to document intent

**Bad:**
```typescript
const GENRE = {
  ROMANTIC: 'romantic',
  DRAMA: 'drama',
  COMEDY: 'comedy',
};

projector.configureFilm(GENRE.COMEDY);
```

**Good:**
```typescript
enum GENRE {
  ROMANTIC,
  DRAMA,
  COMEDY,
}

projector.configureFilm(GENRE.COMEDY);
```

## Interface and Type Design

### type vs. interface

Use `type` for unions and intersections. Use `interface` for extends and implements.

**Bad:**
```typescript
interface EmailConfig {
  // ...
}
interface DbConfig {
  // ...
}
interface Config {
  // ...
}

type Shape = {
  // ...
}
```

**Good:**
```typescript
type EmailConfig = {
  // ...
}
type DbConfig = {
  // ...
}
type Config = EmailConfig | DbConfig;

interface Shape {
  // ...
}
class Circle implements Shape {
  // ...
}
```

## Class Design

### Make objects have private/protected members

**Bad:**
```typescript
class Circle {
  radius: number;

  constructor(radius: number) {
    this.radius = radius;
  }

  perimeter() {
    return 2 * Math.PI * this.radius;
  }
}
```

**Good:**
```typescript
class Circle {
  constructor(private readonly radius: number) {}

  perimeter() {
    return 2 * Math.PI * this.radius;
  }

  surface() {
    return Math.PI * this.radius * this.radius;
  }
}
```

## Immutability

### Prefer immutability with readonly

**Bad:**
```typescript
interface Config {
  host: string;
  port: string;
  db: string;
}
```

**Good:**
```typescript
interface Config {
  readonly host: string;
  readonly port: string;
  readonly db: string;
}
```

### Use ReadonlyArray for arrays

**Bad:**
```typescript
const array: number[] = [1, 3, 5];
array.push(100); // array will be updated
```

**Good:**
```typescript
const array: ReadonlyArray<number> = [1, 3, 5];
array.push(100); // error
```

### Prefer const assertions

**Bad:**
```typescript
const config = {
  hello: 'world'
};
config.hello = 'world'; // value can be changed

const array = [1, 3, 5];
array[0] = 10; // value can be changed
```

**Good:**
```typescript
const config = {
  hello: 'world'
} as const;
config.hello = 'world'; // error

const array = [1, 3, 5] as const;
array[0] = 10; // error
```

## Generic Design

### Use meaningful generic constraint names

**Bad:**
```typescript
function between<T>(a1: T, a2: T, a3: T): boolean {
  return a2 <= a1 && a1 <= a3;
}
```

**Good:**
```typescript
function between<T>(value: T, left: T, right: T): boolean {
  return left <= value && value <= right;
}
```

## Import Organization

### Organize imports with proper groupings

Import statements should be alphabetized and grouped:

**Bad:**
```typescript
import { TypeDefinition } from '../types/typeDefinition';
import { AttributeTypes } from '../model/attribute';
import { Customer, Credentials } from '../model/types';
import fs from 'fs';
import { ConfigPlugin } from './plugins/config/configPlugin';
import { BindingScopeEnum, Container } from 'inversify';
import 'reflect-metadata';
```

**Good:**
```typescript
import 'reflect-metadata';

import fs from 'fs';
import { BindingScopeEnum, Container } from 'inversify';

import { AttributeTypes } from '../model/attribute';
import { TypeDefinition } from '../types/typeDefinition';
import type { Customer, Credentials } from '../model/types';

import { ConfigPlugin } from './plugins/config/configPlugin';
```

### Use import type for types only

**Good:**
```typescript
import type { User } from './types';
import { getUserData } from './api';
```

### Use TypeScript aliases

Create prettier imports by defining paths in `tsconfig.json`:

**Bad:**
```typescript
import { UserService } from '../../../services/UserService';
```

**Good:**
```typescript
import { UserService } from '@services/UserService';
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@services/*": ["services/*"]
    }
  }
}
```

## Function Design

### Use object parameters with destructuring

**Bad:**
```typescript
function createMenu(title: string, body: string, buttonText: string, cancellable: boolean) {
  // ...
}
createMenu('Foo', 'Bar', 'Baz', true);
```

**Good:**
```typescript
type MenuOptions = {
  title: string;
  body: string;
  buttonText: string;
  cancellable: boolean;
};

function createMenu(options: MenuOptions) {
  // ...
}

createMenu({
  title: 'Foo',
  body: 'Bar',
  buttonText: 'Baz',
  cancellable: true
});
```

### Use destructuring with default values

**Bad:**
```typescript
type MenuConfig = { title?: string, body?: string, buttonText?: string, cancellable?: boolean };

function createMenu(config: MenuConfig) {
  config.title = config.title || 'Foo';
  config.body = config.body || 'Bar';
  config.buttonText = config.buttonText || 'Baz';
  config.cancellable = config.cancellable !== undefined ? config.cancellable : true;
}
```

**Good:**
```typescript
type MenuConfig = { title?: string, body?: string, buttonText?: string, cancellable?: boolean };

function createMenu({ title = 'Foo', body = 'Bar', buttonText = 'Baz', cancellable = true }: MenuConfig) {
  // ...
}
```

## Error Handling

### Always use Error for throwing or rejecting

**Bad:**
```typescript
function calculateTotal(items: Item[]): number {
  throw 'Not implemented.';
}

function get(): Promise<Item[]> {
  return Promise.reject('Not implemented.');
}
```

**Good:**
```typescript
function calculateTotal(items: Item[]): number {
  throw new Error('Not implemented.');
}

async function get(): Promise<Item[]> {
  throw new Error('Not implemented.');
}
```

### Use Result types for better error handling

**Good:**
```typescript
type Result<R> = { isError: false, value: R };
type Failure<E> = { isError: true, error: E };
type Failable<R, E> = Result<R> | Failure<E>;

function calculateTotal(items: Item[]): Failable<number, 'empty'> {
  if (items.length === 0) {
    return { isError: true, error: 'empty' };
  }
  // ...
  return { isError: false, value: 42 };
}
```

## Async/Await Best Practices

### Async/Await are cleaner than Promises

**Bad:**
```typescript
import { get } from 'request';
import { writeFile } from 'fs';
import { promisify } from 'util';

const write = util.promisify(writeFile);

function downloadPage(url: string, saveTo: string): Promise<string> {
  return get(url).then(response => write(saveTo, response));
}
```

**Good:**
```typescript
import { get } from 'request';
import { writeFile } from 'fs';
import { promisify } from 'util';

const write = promisify(writeFile);

async function downloadPage(url: string): Promise<string> {
  const response = await get(url);
  return response;
}

// Usage
try {
  const content = await downloadPage('https://example.com');
  await write('article.html', content);
} catch (error) {
  console.error(error);
}
```

## Generators and Iterators

### Use iterators and generators for streams

**Bad:**
```typescript
function fibonacci(n: number): number[] {
  if (n === 1) return [0];
  if (n === 2) return [0, 1];

  const items: number[] = [0, 1];
  while (items.length < n) {
    items.push(items[items.length - 2] + items[items.length - 1]);
  }
  return items;
}
```

**Good:**
```typescript
function* fibonacci(): IterableIterator<number> {
  let [a, b] = [0, 1];

  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function print(n: number) {
  let i = 0;
  for (const fib of fibonacci()) {
    if (i++ === n) break;
    console.log(fib);
  }
}
```

## Capitalization Conventions

- Use `PascalCase` for class, interface, type and namespace names
- Use `camelCase` for variables, functions and class members
- Use `SCREAMING_SNAKE_CASE` for constants

**Good:**
```typescript
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;

type Animal = { /* ... */ };
type Container = { /* ... */ };

interface User {
  readonly name: string;
  readonly email: string;
}

class UserService {
  private readonly users: User[] = [];

  getUser(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }
}
```
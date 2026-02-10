# JavaScript-Specific Clean Code Guidelines

This document covers JavaScript-specific patterns and best practices that complement the [unified clean code guide](./clean-code-unified.md).

## ES6+ Modern JavaScript

### Use const and let instead of var

**Bad:**
```javascript
var name = 'Ryan';
var age = 30;

if (condition) {
  var temp = name + age;
}
```

**Good:**
```javascript
const name = 'Ryan';
const age = 30;

if (condition) {
  const temp = name + age;
}
```

### Use template literals for string concatenation

**Bad:**
```javascript
function greeting(name) {
  return 'Hello, ' + name + '! Welcome to our site.';
}
```

**Good:**
```javascript
function greeting(name) {
  return `Hello, ${name}! Welcome to our site.`;
}
```

### Use destructuring assignment

**Bad:**
```javascript
const user = {
  name: 'John',
  email: 'john@example.com',
  age: 30
};

const name = user.name;
const email = user.email;
```

**Good:**
```javascript
const user = {
  name: 'John',
  email: 'john@example.com',
  age: 30
};

const { name, email } = user;
```

### Use spread operator instead of Object.assign

**Bad:**
```javascript
const original = { a: 1, b: 2 };
const copy = Object.assign({}, original, { c: 3 });
```

**Good:**
```javascript
const original = { a: 1, b: 2 };
const copy = { ...original, c: 3 };
```

### Use default parameters

**Bad:**
```javascript
function createMicrobrewery(name) {
  const breweryName = name || "Hipster Brew Co.";
  // ...
}
```

**Good:**
```javascript
function createMicrobrewery(name = "Hipster Brew Co.") {
  // ...
}
```

## Array Methods and Functional Programming

### Use array methods instead of loops

**Bad:**
```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = [];

for (let i = 0; i < numbers.length; i++) {
  doubled.push(numbers[i] * 2);
}
```

**Good:**
```javascript
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(num => num * 2);
```

### Chain array methods for complex operations

**Good:**
```javascript
const users = [
  { name: 'John', age: 25, active: true },
  { name: 'Jane', age: 30, active: false },
  { name: 'Bob', age: 35, active: true }
];

const activeUserNames = users
  .filter(user => user.active)
  .map(user => user.name)
  .sort();
```

## Object Patterns

### Use object shorthand

**Bad:**
```javascript
const name = 'John';
const age = 30;

const user = {
  name: name,
  age: age,
  greet: function() {
    return 'Hello!';
  }
};
```

**Good:**
```javascript
const name = 'John';
const age = 30;

const user = {
  name,
  age,
  greet() {
    return 'Hello!';
  }
};
```

### Use computed property names

**Bad:**
```javascript
const prefix = 'user';
const obj = {};
obj[prefix + 'Name'] = 'John';
obj[prefix + 'Age'] = 30;
```

**Good:**
```javascript
const prefix = 'user';
const obj = {
  [`${prefix}Name`]: 'John',
  [`${prefix}Age`]: 30
};
```

## Module Patterns

### Use ES6 modules

**Bad:**
```javascript
// math.js
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

module.exports = { add, multiply };
```

**Good:**
```javascript
// math.js
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// Usage
import { add, multiply } from './math.js';
```

### Use named exports over default exports for utilities

**Bad:**
```javascript
export default {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b
};
```

**Good:**
```javascript
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
```

## Error Handling

### Use Error objects, not strings

**Bad:**
```javascript
throw 'Something went wrong';
throw 404;
```

**Good:**
```javascript
throw new Error('Something went wrong');
throw new Error('Resource not found');
```

### Handle both sync and async errors

**Bad:**
```javascript
function riskyFunction() {
  if (Math.random() > 0.5) {
    throw new Error('Random error');
  }
  return 'Success';
}

riskyFunction(); // Might throw unhandled error
```

**Good:**
```javascript
function riskyFunction() {
  try {
    if (Math.random() > 0.5) {
      throw new Error('Random error');
    }
    return 'Success';
  } catch (error) {
    console.error('Function failed:', error.message);
    throw error; // Re-throw if needed
  }
}
```

## Closure Patterns

### Use closures for data privacy

**Bad:**
```javascript
function BankAccount() {
  this.balance = 0;
}

BankAccount.prototype.deposit = function(amount) {
  this.balance += amount;
};

const account = new BankAccount();
account.balance = 1000000; // Direct access!
```

**Good:**
```javascript
function createBankAccount() {
  let balance = 0; // Private

  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    getBalance() {
      return balance;
    }
  };
}

const account = createBankAccount();
// balance is not directly accessible
```

## This Binding

### Use arrow functions to preserve this context

**Bad:**
```javascript
class Timer {
  constructor() {
    this.seconds = 0;
  }

  start() {
    setInterval(function() {
      this.seconds++; // `this` is not the Timer instance
    }, 1000);
  }
}
```

**Good:**
```javascript
class Timer {
  constructor() {
    this.seconds = 0;
  }

  start() {
    setInterval(() => {
      this.seconds++; // `this` is correctly bound
    }, 1000);
  }
}
```

## Type Checking in JavaScript

### Avoid explicit type checking when possible

**Bad:**
```javascript
function combine(val1, val2) {
  if (
    (typeof val1 === "number" && typeof val2 === "number") ||
    (typeof val1 === "string" && typeof val2 === "string")
  ) {
    return val1 + val2;
  }
  throw new Error("Must be of type String or Number");
}
```

**Good:**
```javascript
function combine(val1, val2) {
  return val1 + val2; // Let JavaScript handle coercion or fail naturally
}
```

### Use duck typing effectively

**Bad:**
```javascript
function processVehicle(vehicle) {
  if (vehicle instanceof Car) {
    vehicle.drive();
  } else if (vehicle instanceof Bicycle) {
    vehicle.pedal();
  } else {
    throw new Error('Unknown vehicle type');
  }
}
```

**Good:**
```javascript
function processVehicle(vehicle) {
  if (typeof vehicle.move === 'function') {
    vehicle.move();
  } else {
    throw new Error('Vehicle must have a move method');
  }
}
```

## Performance Considerations

### Avoid creating functions in loops

**Bad:**
```javascript
for (let i = 0; i < items.length; i++) {
  items[i].addEventListener('click', function(e) {
    handleClick(e, i);
  });
}
```

**Good:**
```javascript
function createClickHandler(index) {
  return function(e) {
    handleClick(e, index);
  };
}

for (let i = 0; i < items.length; i++) {
  items[i].addEventListener('click', createClickHandler(i));
}

// Or with arrow function
items.forEach((item, index) => {
  item.addEventListener('click', (e) => handleClick(e, index));
});
```

### Use efficient array methods

**Bad:**
```javascript
const users = [...]; // large array
let activeUser;

for (let i = 0; i < users.length; i++) {
  if (users[i].active && users[i].role === 'admin') {
    activeUser = users[i];
    break;
  }
}
```

**Good:**
```javascript
const users = [...]; // large array

const activeUser = users.find(user =>
  user.active && user.role === 'admin'
);
```

## Async Patterns

### Prefer async/await over Promise chains

**Bad:**
```javascript
function processData(url) {
  return fetch(url)
    .then(response => response.json())
    .then(data => {
      return processUserData(data);
    })
    .then(processedData => {
      return saveToDatabase(processedData);
    })
    .catch(error => {
      console.error('Processing failed:', error);
      throw error;
    });
}
```

**Good:**
```javascript
async function processData(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    const processedData = await processUserData(data);
    const result = await saveToDatabase(processedData);
    return result;
  } catch (error) {
    console.error('Processing failed:', error);
    throw error;
  }
}
```

### Handle Promise.all for parallel operations

**Bad:**
```javascript
async function fetchAllData() {
  const users = await fetchUsers();
  const posts = await fetchPosts();
  const comments = await fetchComments();

  return { users, posts, comments };
}
```

**Good:**
```javascript
async function fetchAllData() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments()
  ]);

  return { users, posts, comments };
}
```

## Browser-Specific Patterns

### Use feature detection, not browser detection

**Bad:**
```javascript
if (navigator.userAgent.indexOf('Chrome') > -1) {
  // Chrome-specific code
}
```

**Good:**
```javascript
if ('serviceWorker' in navigator) {
  // Service worker is supported
}

if (typeof Storage !== 'undefined') {
  // localStorage is supported
}
```

### Debounce expensive operations

**Good:**
```javascript
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

const expensiveOperation = debounce((query) => {
  // API call or heavy computation
}, 300);

searchInput.addEventListener('input', (e) => {
  expensiveOperation(e.target.value);
});
```
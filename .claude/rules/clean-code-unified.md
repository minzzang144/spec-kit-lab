# Clean Code - Unified Guide

Software engineering principles from Robert C. Martin's *Clean Code*, adapted for modern development. This guide focuses on producing readable, reusable, and refactorable software.

## Table of Contents

1. [Variables](#variables)
2. [Functions](#functions)
3. [Objects and Data Structures](#objects-and-data-structures)
4. [Classes](#classes)
5. [SOLID](#solid)
6. [Testing](#testing)
7. [Concurrency](#concurrency)
8. [Error Handling](#error-handling)
9. [Formatting](#formatting)
10. [Comments](#comments)

## Variables

### Use meaningful and pronounceable variable names

**Bad:**
```javascript
const yyyymmdstr = moment().format("YYYY/MM/DD");
const u = getUser();
```

**Good:**
```javascript
const currentDate = moment().format("YYYY/MM/DD");
const user = getUser();
```

### Use the same vocabulary for the same type of variable

**Bad:**
```javascript
getUserInfo();
getClientData();
getCustomerRecord();
```

**Good:**
```javascript
getUser();
```

### Use searchable names

Avoid magic numbers and strings. Use named constants.

**Bad:**
```javascript
setTimeout(blastOff, 86400000);
```

**Good:**
```javascript
const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
setTimeout(blastOff, MILLISECONDS_PER_DAY);
```

### Use explanatory variables

**Bad:**
```javascript
const address = "One Infinite Loop, Cupertino 95014";
const cityZipCodeRegex = /^[^,\\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
saveCityZipCode(
  address.match(cityZipCodeRegex)[1],
  address.match(cityZipCodeRegex)[2]
);
```

**Good:**
```javascript
const address = "One Infinite Loop, Cupertino 95014";
const cityZipCodeRegex = /^[^,\\]+[,\\\s]+(.+?)\s*(\d{5})?$/;
const [_, city, zipCode] = address.match(cityZipCodeRegex) || [];
saveCityZipCode(city, zipCode);
```

### Avoid mental mapping

Explicit is better than implicit.

**Bad:**
```javascript
const locations = ["Austin", "New York", "San Francisco"];
locations.forEach(l => {
  dispatch(l);  // What is `l`?
});
```

**Good:**
```javascript
const locations = ["Austin", "New York", "San Francisco"];
locations.forEach(location => {
  dispatch(location);
});
```

### Don't add unneeded context

**Bad:**
```javascript
const Car = {
  carMake: "Honda",
  carModel: "Accord",
  carColor: "Blue"
};
```

**Good:**
```javascript
const Car = {
  make: "Honda",
  model: "Accord",
  color: "Blue"
};
```

## Functions

### Function arguments (2 or fewer ideally)

Limit parameters for easier testing. Use objects for multiple arguments.

**Bad:**
```javascript
function createMenu(title, body, buttonText, cancellable) {
  // ...
}
createMenu("Foo", "Bar", "Baz", true);
```

**Good:**
```javascript
function createMenu({ title, body, buttonText, cancellable }) {
  // ...
}
createMenu({
  title: "Foo",
  body: "Bar",
  buttonText: "Baz",
  cancellable: true
});
```

### Functions should do one thing

Most important rule in software engineering.

**Bad:**
```javascript
function emailClients(clients) {
  clients.forEach(client => {
    const clientRecord = database.lookup(client);
    if (clientRecord.isActive()) {
      email(client);
    }
  });
}
```

**Good:**
```javascript
function emailActiveClients(clients) {
  clients.filter(isActiveClient).forEach(email);
}

function isActiveClient(client) {
  const clientRecord = database.lookup(client);
  return clientRecord.isActive();
}
```

### Function names should say what they do

**Bad:**
```javascript
function addToDate(date, month) {
  // ...
}
const date = new Date();
addToDate(date, 1); // What is added?
```

**Good:**
```javascript
function addMonthToDate(date, month) {
  // ...
}
const date = new Date();
addMonthToDate(date, 1);
```

### Functions should only be one level of abstraction

**Bad:**
```javascript
function parseCode(code) {
  const REGEXES = [/* ... */];
  const statements = code.split(" ");
  const tokens = [];

  REGEXES.forEach(regex => {
    statements.forEach(statement => {
      // ...
    });
  });

  const ast = [];
  tokens.forEach(token => {
    // lex...
  });

  ast.forEach(node => {
    // parse...
  });
}
```

**Good:**
```javascript
function parseCode(code) {
  const tokens = tokenize(code);
  const syntaxTree = parse(tokens);
  syntaxTree.forEach(node => {
    // parse...
  });
}

function tokenize(code) { /* ... */ }
function parse(tokens) { /* ... */ }
```

### Remove duplicate code

**Bad:**
```javascript
function showDeveloperList(developers) {
  developers.forEach(developer => {
    const expectedSalary = developer.calculateExpectedSalary();
    const experience = developer.getExperience();
    const githubLink = developer.getGithubLink();
    const data = { expectedSalary, experience, githubLink };
    render(data);
  });
}

function showManagerList(managers) {
  managers.forEach(manager => {
    const expectedSalary = manager.calculateExpectedSalary();
    const experience = manager.getExperience();
    const portfolio = manager.getMBAProjects();
    const data = { expectedSalary, experience, portfolio };
    render(data);
  });
}
```

**Good:**
```javascript
function showEmployeeList(employees) {
  employees.forEach(employee => {
    const expectedSalary = employee.calculateExpectedSalary();
    const experience = employee.getExperience();
    const data = { expectedSalary, experience };

    switch (employee.type) {
      case "manager":
        data.portfolio = employee.getMBAProjects();
        break;
      case "developer":
        data.githubLink = employee.getGithubLink();
        break;
    }
    render(data);
  });
}
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

### Don't use flags as function parameters

**Bad:**
```javascript
function createFile(name, temp) {
  if (temp) {
    fs.create(`./temp/${name}`);
  } else {
    fs.create(name);
  }
}
```

**Good:**
```javascript
function createFile(name) {
  fs.create(name);
}

function createTempFile(name) {
  createFile(`./temp/${name}`);
}
```

### Avoid side effects

**Bad:**
```javascript
let name = "Ryan McDermott";
function splitIntoFirstAndLastName() {
  name = name.split(" ");
}
splitIntoFirstAndLastName();
console.log(name); // ['Ryan', 'McDermott'] - Unexpected!
```

**Good:**
```javascript
function splitIntoFirstAndLastName(name) {
  return name.split(" ");
}
const name = "Ryan McDermott";
const newName = splitIntoFirstAndLastName(name);
console.log(name); // 'Ryan McDermott'
console.log(newName); // ['Ryan', 'McDermott']
```

### Favor functional programming

**Bad:**
```javascript
const programmerOutput = [
  { name: "Uncle Bobby", linesOfCode: 500 },
  { name: "Suzie Q", linesOfCode: 1500 }
];

let totalOutput = 0;
for (let i = 0; i < programmerOutput.length; i++) {
  totalOutput += programmerOutput[i].linesOfCode;
}
```

**Good:**
```javascript
const programmerOutput = [
  { name: "Uncle Bobby", linesOfCode: 500 },
  { name: "Suzie Q", linesOfCode: 1500 }
];

const totalOutput = programmerOutput.reduce(
  (totalLines, output) => totalLines + output.linesOfCode, 0
);
```

## Objects and Data Structures

### Use getters and setters

**Bad:**
```javascript
const account = makeBankAccount();
account.balance = 100;
```

**Good:**
```javascript
function makeBankAccount() {
  let balance = 0;

  function getBalance() {
    return balance;
  }

  function setBalance(amount) {
    // validate before updating
    balance = amount;
  }

  return { getBalance, setBalance };
}

const account = makeBankAccount();
account.setBalance(100);
```

### Make objects have private members

Use closures or classes with private fields.

**Bad:**
```javascript
const Employee = function(name) {
  this.name = name;
};
const employee = new Employee("John Doe");
delete employee.name; // Can delete!
```

**Good:**
```javascript
function makeEmployee(name) {
  return {
    getName() { return name; }
  };
}
const employee = makeEmployee("John Doe");
// name is protected
```

## Classes

### Prefer ES6 classes over ES5 functions

**Bad:**
```javascript
const Animal = function(age) {
  if (!(this instanceof Animal)) {
    throw new Error("Instantiate Animal with `new`");
  }
  this.age = age;
};
Animal.prototype.move = function move() {};
```

**Good:**
```javascript
class Animal {
  constructor(age) {
    this.age = age;
  }
  move() { /* ... */ }
}
```

### Use method chaining

**Bad:**
```javascript
class Car {
  setMake(make) { this.make = make; }
  setModel(model) { this.model = model; }
  save() { console.log(this.make, this.model); }
}

const car = new Car();
car.setMake("Ford");
car.setModel("F-150");
car.save();
```

**Good:**
```javascript
class Car {
  setMake(make) { this.make = make; return this; }
  setModel(model) { this.model = model; return this; }
  save() { console.log(this.make, this.model); return this; }
}

const car = new Car()
  .setMake("Ford")
  .setModel("F-150")
  .save();
```

### Prefer composition over inheritance

**Bad:**
```javascript
class Employee {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }
}

class EmployeeTaxData extends Employee {
  constructor(ssn, salary) {
    super();
    this.ssn = ssn;
    this.salary = salary;
  }
}
```

**Good:**
```javascript
class EmployeeTaxData {
  constructor(ssn, salary) {
    this.ssn = ssn;
    this.salary = salary;
  }
}

class Employee {
  constructor(name, email) {
    this.name = name;
    this.email = email;
  }

  setTaxData(ssn, salary) {
    this.taxData = new EmployeeTaxData(ssn, salary);
  }
}
```

## SOLID

### Single Responsibility Principle (SRP)

A class should have only one reason to change.

**Bad:**
```javascript
class UserSettings {
  constructor(user) {
    this.user = user;
  }

  changeSettings(settings) {
    if (this.verifyCredentials()) {
      // ...
    }
  }

  verifyCredentials() {
    // ...
  }
}
```

**Good:**
```javascript
class UserAuth {
  constructor(user) { this.user = user; }
  verifyCredentials() { /* ... */ }
}

class UserSettings {
  constructor(user) {
    this.user = user;
    this.auth = new UserAuth(user);
  }

  changeSettings(settings) {
    if (this.auth.verifyCredentials()) {
      // ...
    }
  }
}
```

### Open/Closed Principle (OCP)

Software entities should be open for extension, closed for modification.

**Bad:**
```javascript
class HttpRequester {
  constructor(adapter) {
    this.adapter = adapter;
  }

  fetch(url) {
    if (this.adapter.name === "ajaxAdapter") {
      return makeAjaxCall(url);
    } else if (this.adapter.name === "nodeAdapter") {
      return makeHttpCall(url);
    }
  }
}
```

**Good:**
```javascript
class HttpRequester {
  constructor(adapter) {
    this.adapter = adapter;
  }

  fetch(url) {
    return this.adapter.request(url);
  }
}

class AjaxAdapter {
  request(url) { /* ... */ }
}

class NodeAdapter {
  request(url) { /* ... */ }
}
```

### Liskov Substitution Principle (LSP)

Objects of a superclass should be replaceable with objects of a subclass.

**Bad:**
```javascript
class Rectangle {
  constructor() {
    this.width = 0;
    this.height = 0;
  }

  setWidth(width) { this.width = width; }
  setHeight(height) { this.height = height; }
  getArea() { return this.width * this.height; }
}

class Square extends Rectangle {
  setWidth(width) {
    this.width = width;
    this.height = width;
  }
  setHeight(height) {
    this.width = height;
    this.height = height;
  }
}
```

**Good:**
```javascript
class Shape {
  setColor(color) { /* ... */ }
  render(area) { /* ... */ }
}

class Rectangle extends Shape {
  constructor(width, height) {
    super();
    this.width = width;
    this.height = height;
  }
  getArea() { return this.width * this.height; }
}

class Square extends Shape {
  constructor(length) {
    super();
    this.length = length;
  }
  getArea() { return this.length * this.length; }
}
```

### Interface Segregation Principle (ISP)

Clients should not depend on interfaces they don't use.

**Bad:**
```javascript
class DOMTraverser {
  constructor(settings) {
    this.settings = settings;
    this.settings.animationModule.setup(); // Force all clients to provide
  }
}
```

**Good:**
```javascript
class DOMTraverser {
  constructor(settings) {
    this.settings = settings;
    this.options = settings.options;
    this.setupOptions();
  }

  setupOptions() {
    if (this.options.animationModule) {
      this.options.animationModule.setup();
    }
  }
}
```

### Dependency Inversion Principle (DIP)

High-level modules should not depend on low-level modules.

**Bad:**
```javascript
class InventoryTracker {
  constructor(items) {
    this.items = items;
    this.requester = new InventoryRequester(); // Direct dependency
  }
}
```

**Good:**
```javascript
class InventoryTracker {
  constructor(items, requester) {
    this.items = items;
    this.requester = requester; // Injected dependency
  }
}
```

## Testing

### Single concept per test

**Bad:**
```javascript
describe("MomentJS", () => {
  it("handles date boundaries", () => {
    let date = new MomentJS("1/1/2015");
    date.addDays(30);
    assert.equal("1/31/2015", date);

    date = new MomentJS("2/1/2016");
    date.addDays(28);
    assert.equal("02/29/2016", date);
  });
});
```

**Good:**
```javascript
describe("MomentJS", () => {
  it("handles 30-day months", () => {
    const date = new MomentJS("1/1/2015");
    date.addDays(30);
    assert.equal("1/31/2015", date);
  });

  it("handles leap year", () => {
    const date = new MomentJS("2/1/2016");
    date.addDays(28);
    assert.equal("02/29/2016", date);
  });
});
```

## Concurrency

### Use Promises, not callbacks

**Bad:**
```javascript
import { get } from "request";
get("https://example.com", (requestErr, response, body) => {
  if (requestErr) {
    console.error(requestErr);
  } else {
    writeFile("article.html", body, writeErr => {
      if (writeErr) {
        console.error(writeErr);
      }
    });
  }
});
```

**Good:**
```javascript
import { get } from "request-promise";
get("https://example.com")
  .then(body => writeFile("article.html", body))
  .then(() => console.log("File written"))
  .catch(err => console.error(err));
```

### Async/Await are cleaner than Promises

**Good:**
```javascript
async function getCleanCodeArticle() {
  try {
    const body = await get("https://example.com");
    await writeFile("article.html", body);
    console.log("File written");
  } catch (err) {
    console.error(err);
  }
}
```

## Error Handling

### Don't ignore caught errors

**Bad:**
```javascript
try {
  functionThatMightThrow();
} catch (error) {
  console.log(error);
}
```

**Good:**
```javascript
try {
  functionThatMightThrow();
} catch (error) {
  console.error(error);
  notifyUserOfError(error);
  reportErrorToService(error);
}
```

### Always use Error for throwing

**Bad:**
```javascript
function calculateTotal(items) {
  throw 'Not implemented.';
}
```

**Good:**
```javascript
function calculateTotal(items) {
  throw new Error('Not implemented.');
}
```

## Formatting

### Use consistent capitalization

**Bad:**
```javascript
const DAYS_IN_WEEK = 7;
const daysInMonth = 30;
const songs = ["Back In Black"];
const Artists = ["ACDC"];
function eraseDatabase() {}
function restore_database() {}
class animal {}
class Alpaca {}
```

**Good:**
```javascript
const DAYS_IN_WEEK = 7;
const DAYS_IN_MONTH = 30;
const SONGS = ["Back In Black"];
const ARTISTS = ["ACDC"];
function eraseDatabase() {}
function restoreDatabase() {}
class Animal {}
class Alpaca {}
```

### Function callers and callees should be close

Keep related functions close in the source file.

## Comments

### Only comment business logic complexity

**Bad:**
```javascript
function hashIt(data) {
  // The hash
  let hash = 0;
  // Length of string
  const length = data.length;
  // Loop through every character
  for (let i = 0; i < length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash &= hash;
  }
}
```

**Good:**
```javascript
function hashIt(data) {
  let hash = 0;
  const length = data.length;

  for (let i = 0; i < length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    // Convert to 32-bit integer
    hash &= hash;
  }
}
```

### Don't leave commented out code

Use version control instead.

### Don't have journal comments

**Bad:**
```javascript
/**
 * 2016-12-20: Removed monads (RM)
 * 2016-10-01: Improved using monads (JP)
 */
function combine(a, b) {
  return a + b;
}
```

**Good:**
```javascript
function combine(a, b) {
  return a + b;
}
```

### TODO comments are acceptable

**Good:**
```javascript
function getActiveSubscriptions() {
  // TODO: ensure `dueDate` is indexed.
  return db.subscriptions.find({ dueDate: { $lte: new Date() } });
}
```

---

For language-specific features and advanced patterns, see:
- [TypeScript Specifics](./typescript-specifics.md)
- [JavaScript Specifics](./javascript-specifics.md)
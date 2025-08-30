# Coding Assignment

A company ‘MediaNow’ is selling packages - Basic, Plus, and Premium. The price for each package is updated regularly and a pricing log is kept for all packages. The company is doing well and the feature requests are pouring in! Help us by implementing the following two feature requests made by our coworkers.

## Feature request 1: Municipalities
The company pricing expert wants to start segmenting our package prices based on the municipality the package is sold in. In other words, a package should be able to have different prices depending on a municipality. The current code doesn't really support this well (on purpose) and some structural changes are needed. We still want to have our pricing log, but now with the added municipalities.

Look into the pending test in `tests/services/package.spec.ts` for guidance and make all the tests pass.

## Feature request 2: Pricing history
An accounting department needs information on price changes that happened for the package basic in 2023. This kind of request will happen frequently, so we need a simple way to fetch pricing history, given a package, a year and optionally a municipality.

Look into the pending tests in `tests/services/price.spec.ts` for guidance and make all the tests pass.

## Starting out
**NOTE: In this assignment we assume you are comfortable with developing Node.js (with Express) applications, as well as any kind of ORM (we are using Sequelize in this example).**

We have set up a minimal Node.js app with some opinionated file structure (with routes, controllers, models and services), as well as some tests in Jest. Running the test command should make all tests pass after you finish your assignment:

```sh
# Run npm install to install all necessary packages for development
$ npm install
# The test command will set up an in-memory SQLite DB.
$ npm run test
**.......*

Finished in 0.02163 seconds (files took 0.7978 seconds to load)
10 examples, 0 failures, 3 pending
```
If all the initially pending tests pass, then you have completed the assignment.

To develop locally with hot reloading, run the following command:
```sh
$ npm run dev
```

Both test and dev commands will spin up a new in-memory SQLite DB each time you run them. The dev command will additionally seed with some initial data (`db/seed.ts`).

## A few notes about the assignment

We would like you to model the product domain (it doesn’t have to be perfect) and update the application to enable the two features.
Think through your solution and implement it based on the instructions and your own thoughts. Spend at most 3 hours on the assignment. It's not worth more of your time (or ours).

- Complete the assignment by passing all tests, having no pending tests
- Write code as if it was to be delivered to production
- Use version control (Git preferably) and commit frequently
- Set your own scope and make your own prioritizations for the challenge
- You don't need to spend any time on deployment/ops solutions, e.g. using Docker
- No HTTP requests are needed anywhere
- The routes and controllers are there to help you test, feel free to add any that you feel are necessary
- The assignment can (and should) be completed without the need of any more external packages
- Code styling is not mandatory but greatly appreciated :)

## If things go wrong
Let us know if something doesn't seem right. We might have missed something. Don't panic! 💚

## Follow-up
Send us the code when you are done, preferably hosted on a service such as GitHub, Bitbucket, or Gitlab. We will review your solution in a follow-up interview where we will go through and discuss the different aspects of the application, for example:
- Application structure
- Data integrity
- Testing
- Design choices and their advantages and disadvantages
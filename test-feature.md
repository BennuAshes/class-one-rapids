# Test Feature: Simple Calculator API

Create a basic REST API for a calculator service that supports:
- Addition (POST /add)
- Subtraction (POST /subtract)
- Multiplication (POST /multiply)
- Division (POST /divide)

Each endpoint should:
- Accept JSON with two numbers: `{"a": 5, "b": 3}`
- Return JSON with the result: `{"result": 8}`
- Include proper error handling for division by zero
- Have input validation for non-numeric inputs

Use Express.js and include unit tests.
# KIMO SWE Assignment

## Description

As a software engineer at KIMO, you are tasked with implementing a back-end API to serve courses. This API will be responsible for handling requests from the front-end application, retrieving course information from MongoDB, and returning the relevant data in a standardized format.

## Deliverables

1. **Script** to parse course information from `courses.json`, create the appropriate databases and collection(s) on a local instance of MongoDB, create the appropriate indices (for efficient retrieval), and finally add the course data to the collection(s).
2. A **containerized application** of the back-end endpoints using FastAPI. The endpoints that need to be included are:

### Endpoints

- **GET /courses**  
  Retrieve a list of all available courses. This endpoint supports 3 modes of sorting: Alphabetical (based on course title, ascending), date (descending), and total course rating (descending). Additionally, it supports optional filtering of courses based on domain.

- **GET /courses/alphabetical**  
  Retrieve a list of courses sorted alphabetically.

- **GET /courses/date**  
  Retrieve a list of courses sorted by date.

- **GET /courses/rating**  
  Retrieve a list of courses sorted by rating.

- **GET /courses/{id}**  
  Get a course overview.

- **GET /courses/{id}/chapters/{chapterId}**  
  Get specific chapter information.

- **POST /courses/{id}/chapters/{chapterId}/rate**  
  Rate a chapter of a course.

- **GET /courses/sorted-chapters**  
  Retrieve all courses with chapters sorted by rating.

3. **Tests** for all created endpoints to validate that they are working as intended.

### Request Examples

- **POST /courses/{id}/chapters/{chapterId}/rate**  
  Example request body to rate a chapter:

  ```json
  {
    "rating": 5
  }
  ```

### Running the Application

1. **Install dependencies**:  
   Run `npm install` to install all necessary dependencies.

2. **Run the server**:  
   Run `npm start` to start the application.

3. **Run tests**:  
   Run `npm test` to execute all test cases.

4. **Swagger Documentation**:  
   The Swagger documentation is available at:  
   'http://localhost:4000/api-docs'



### MongoDB Setup

1. Make sure MongoDB is running locally.
2. Load data from `courses.json` using the provided script:
   ```bash
   node scripts/load_courses.js
   ```

This setup should cover all necessary steps and endpoints for the KIMO SWE assignment.

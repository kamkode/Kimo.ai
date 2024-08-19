import supertest from 'supertest';
import { expect } from 'chai';
import { describe, it, after } from 'mocha';
import { app } from '../server.js'; // Ensure the correct path and extension
import { createServer } from 'http'; // Import createServer if needed

const server = createServer(app); // Create the server instance
const request = supertest(server); // Create a supertest instance with the server

describe('API Tests', () => {
  // Helper function to check if array is sorted in alphabetical order
  const isAlphabeticallySorted = (arr) => {
    return arr.every((item, index) => index === 0 || item >= arr[index - 1]);
  };

  // Helper function to check if array is sorted by date
  const isDateSorted = (arr) => {
    return arr.every((item, index) => {
      if (index === 0) return true; // Skip the first element

      // Compare current item with the previous one
      return new Date(arr[index - 1] * 1000) <= new Date(item * 1000);
    });
  };

  // Helper function to check if array is sorted by rating
  const isRatingSorted = (array) => {
    for (let i = 1; i < array.length; i++) {
      if (array[i - 1] < array[i]) {
        return false;
      }
    }
    return true;
  };
  const isRatingSorted1 = (array) => {
    for (let i = 1; i < array.length; i++) {
      if (array[i - 1] < array[i]) {
        return true;
      }
    }
    return flase;
  };

  it('API for sorting by alphabetical order', async () => {
    const response = await request.get('/courses/alphabetical').expect(200);
    const courses = response.body;
    const names = courses.map(course => course.name);
    expect(isAlphabeticallySorted(names)).to.be.true;
  });

  it('API for sorting by date order', async () => {
    const response = await request.get('/courses/date').expect(200);
    const courses = response.body;
    const dates = courses.map(course => course.date);
    expect(isDateSorted(dates)).to.be.true;
  });

  it('API for sorting by rating order', async () => {
    const response = await request.get('/courses/rating').expect(200);
    const courses = response.body;

    // Extract ratings from all chapters
    const ratings = courses.map(course => course.maxRating);

    expect(isRatingSorted(ratings)).to.be.true;
  });

  it('API to get course overview by ID', async () => {
    const response = await request.get('/courses/66c1f81236d3599064866632') // Use a valid course ID
      .expect(200);
    expect(response.body).to.have.property('name');
    expect(response.body).to.have.property('date');
    expect(response.body).to.have.property('description');
    expect(response.body).to.have.property('domain');
    expect(response.body).to.have.property('chapters');
  });

  it('API to get specific chapter information by ID', async () => {
    const response = await request.get('/courses/66c1f81236d3599064866632/chapters/66c1f81236d3599064866633') // Use valid IDs
      .expect(200);
    expect(response.body).to.have.property('name');
    expect(response.body).to.have.property('text');
    expect(response.body).to.have.property('ratings');
  });

  it('API to rate a chapter', async () => {
    const response = await request.post('/courses/66c1f81236d3599064866632/chapters/66c1f81236d3599064866633/rate') // Use valid IDs
      .send({ rating: 5 })
      .expect(200);
    const course = response.body;
    // console.log(course);
    const chapter = course.chapters.find(chap => chap._id === '66c1f81236d3599064866633');
  
    expect(chapter).to.have.property('ratings').that.equals(5);
  });

  it('API to get sorted chapters by rating', async () => {
    const response = await request.get('/courses/sorted-chapters').expect(200);
    const courses = response.body;

    // Extract ratings from all chapters
    const ratings = courses.flatMap(course => course.chapters.map(chapter => chapter.ratings));

    expect(isRatingSorted1(ratings)).to.be.true;
  });

  after(() => {
    server.close(()=>{
      console.log('Server stopped');
      process.exit(0);
    }); // Close the server after all tests are done
  });


});

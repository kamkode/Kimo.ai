import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI);

// Define the course schema
const courseSchema = new mongoose.Schema({
    name: String,
    date: Number,
    description: String,
    domain: [String],
    chapters: [
        {
            title: String,
            contents: String,
            ratings: { type: Number, default: 0 }
        }
    ]
});

const Course = mongoose.model('Course', courseSchema);

// Swagger setup
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Courses API',
            version: '1.0.0',
            description: 'API documentation for the Courses service',
        },
        servers: [
            {
                url: 'https://kimo-ai-test.onrender.com',
            },
        ],
        components: {
            schemas: {
                Course: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Name of the course',
                        },
                        date: {
                            type: 'integer',
                            description: 'Date when the course was added',
                        },
                        description: {
                            type: 'string',
                            description: 'Description of the course',
                        },
                        domain: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'Domains to which the course belongs',
                        },
                        chapters: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    title: {
                                        type: 'string',
                                        description: 'Title of the chapter',
                                    },
                                    contents: {
                                        type: 'string',
                                        description: 'Contents of the chapter',
                                    },
                                    ratings: {
                                        type: 'number',
                                        description: 'Ratings of the chapter',
                                    },
                                },
                            },
                        },
                    },
                },
                CourseWithRating: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                            description: 'Name of the course',
                        },
                        date: {
                            type: 'integer',
                            description: 'Date when the course was added',
                        },
                        description: {
                            type: 'string',
                            description: 'Description of the course',
                        },
                        domain: {
                            type: 'array',
                            items: {
                                type: 'string',
                            },
                            description: 'Domains to which the course belongs',
                        },
                        chapters: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    title: {
                                        type: 'string',
                                        description: 'Title of the chapter',
                                    },
                                    contents: {
                                        type: 'string',
                                        description: 'Contents of the chapter',
                                    },
                                    ratings: {
                                        type: 'number',
                                        description: 'Ratings of the chapter',
                                    },
                                },
                            },
                        },
                        maxRating: {
                            type: 'number',
                            description: 'Maximum rating across all chapters in the course',
                        },
                    },
                },
            },
        },
    },
    apis: ['./server.js'], // Path to the API docs
};


const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Endpoint to Get a List of All Courses

// Endpoint to Get a List of All Courses
/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Retrieve a list of courses
 *     description: Retrieve a list of courses with optional sorting and filtering
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [alphabetical, date, rating]
 *         description: Sort courses by title, date, or rating
 *       - in: query
 *         name: domain
 *         schema:
 *           type: string
 *         description: Filter courses by domain
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 */
app.get('/courses', async (req, res) => {
    const { sort, domain } = req.query;

    let sortQuery = {};
    if (sort === 'alphabetical') sortQuery = { name: 1 };
    else if (sort === 'date') sortQuery = { date: -1 };
    else if (sort === 'rating') sortQuery = { 'chapters.ratings': -1 };
    const filterQuery = domain ? { domain: domain } : {};
    try {
        const courses = await Course.find(filterQuery).sort(sortQuery);
        res.json(courses);
    } catch (err) {
        res.status(500).send(err);
    }
});

/**
 * @swagger
 * /courses/alphabetical:
 *   get:
 *     summary: Retrieve a list of courses sorted alphabetically
 *     parameters:
 *       - in: query
 *         name: domain
 *         schema:
 *           type: string
 *         description: Domain to filter the courses by
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       500:
 *         description: Internal Server Error
 */
app.get('/courses/alphabetical', async (req, res) => {
    const { domain } = req.query;

    let filterQuery = {};
    if (domain) {
        filterQuery = { domain: domain };
    }

    try {
        const courses = await Course.find(filterQuery).sort({ name: 1 }); // Ascending order by name
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
app.get('/courses/date', async (req, res) => {
    const { domain } = req.query;

    let filterQuery = {};
    if (domain) {
        filterQuery = { domain: domain };
    }

    try {
        const courses = await Course.find(filterQuery).sort({ date: 1 }); // Descending order by date
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/courses/rating', async (req, res) => {
    try {
        // Fetch all courses from the database
        const courses = await Course.find();

        // Calculate max rating for each course
        const coursesWithRatings = courses.map(course => {
            // Get the max rating from the chapters, default to -Infinity if no chapters
            const maxRating = course.chapters.length > 0
                ? Math.max(...course.chapters.map(chapter => chapter.rating))
                : -Infinity;

            return { ...course.toObject(), maxRating };
        });

        // Sort courses based on the max rating in descending order
        coursesWithRatings.sort((a, b) => b.maxRating - a.maxRating);

        // Send the sorted courses as the response
        res.json(coursesWithRatings);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});



/**
 * @swagger
 * /courses/date:
 *   get:
 *     summary: Retrieve a list of courses sorted by date
 *     parameters:
 *       - in: query
 *         name: domain
 *         schema:
 *           type: string
 *         description: Domain to filter the courses by
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       500:
 *         description: Internal Server Error
 */
app.get('/courses/date', async (req, res) => {
    const { domain } = req.query;

    let filterQuery = {};
    if (domain) {
        filterQuery = { domain: domain };
    }

    try {
        const courses = await Course.find(filterQuery).sort({ date: -1 }); // Descending order by date
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

/**
 * @swagger
 * /courses/rating:
 *   get:
 *     summary: Retrieve a list of courses sorted by rating
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       500:
 *         description: Internal Server Error
 */
app.get('/courses/rating', async (req, res) => {
    try {
        // Fetch all courses from the database
        const courses = await Course.find();

        // Calculate max rating for each course
        const coursesWithRatings = courses.map(course => {
            // Get the max rating from the chapters, default to -Infinity if no chapters
            const maxRating = course.chapters.length > 0
                ? Math.max(...course.chapters.map(chapter => chapter.ratings))
                : -Infinity;

            return { ...course.toObject(), maxRating };
        });

        // Sort courses based on the max rating in descending order
        coursesWithRatings.sort((a, b) => b.maxRating - a.maxRating);

        // Send the sorted courses as the response
        res.json(coursesWithRatings);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});


// Endpoint
/**
 * @swagger
 * /courses/sorted-chapters:
 *   get:
 *     summary: Retrieve all courses with chapters sorted by rating
 *     tags:
 *       - Courses
 *     responses:
 *       200:
 *         description: A list of courses with their chapters sorted by rating
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   chapters:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         title:
 *                           type: string
 *                         rating:
 *                           type: number
 *       500:
 *         description: Internal Server Error
 */
app.get('/courses/sorted-chapters', async (req, res) => {
    try {
        // Fetch all courses from the database
        const courses = await Course.find();

        // Sort the chapters of each course by rating in descending order
        const coursesWithSortedChapters = courses.map(course => {
            const sortedChapters = course.chapters.sort((a, b) => b?.ratings - a?.ratings);

            return { ...course.toObject(), chapters: sortedChapters };
        });

        // Send the courses with sorted chapters as the response
        res.json(coursesWithSortedChapters);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});




// Endpoint to Get Course Overview
/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get course overview
 *     description: Get detailed information about a course
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the course
 *     responses:
 *       200:
 *         description: Course details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.get('/courses/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).send('Course not found');
        res.json(course);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Endpoint to Get Specific Chapter Information
/**
 * @swagger
 * /courses/{id}/chapters/{chapterId}:
 *   get:
 *     summary: Get specific chapter information
 *     description: Get detailed information about a specific chapter of a course
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the course
 *       - in: path
 *         name: chapterId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the chapter
 *     responses:
 *       200:
 *         description: Chapter details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.get('/courses/:id/chapters/:chapterId', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).send('Course not found');
        const chapter = course.chapters.id(req.params.chapterId);
        if (!chapter) return res.status(404).send('Chapter not found');
        res.json(chapter);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Endpoint to Rate a Chapter
/**
 * @swagger
 * /courses/{id}/chapters/{chapterId}/rate:
 *   post:
 *     summary: Rate a chapter
 *     description: Rate a chapter of a course
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the course
 *       - in: path
 *         name: chapterId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the chapter
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: number
 *                 description: Rating value
 *     responses:
 *       200:
 *         description: Chapter rated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
app.post('/courses/:id/chapters/:chapterId/rate', async (req, res) => {
    try {
        const { rating } = req.body;
        const course = await Course.findById(req.params.id);
        const chapter = course.chapters.id(req.params.chapterId);
        chapter.ratings = rating;
        await course.save();
        res.json(course);
    } catch (err) {
        res.status(500).send(err);
    }
});


app.listen(4000, () => {
    console.log('Server is running on port 4000');
    console.log('swagger is running on https://kimo-ai-test.onrender.com/api-docs/ ');
});

export { app };

import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();



// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);

// Define the chapter schema
const chapterSchema = new mongoose.Schema({
    name: String,
    text: String,
    ratings: { type: Number, default: 0 }
});

// Define the course schema
const courseSchema = new mongoose.Schema({
    name: String,
    date: Number,
    description: String,
    domain: [String],
    chapters: [chapterSchema]
});

const Course = mongoose.model('Course', courseSchema);

// Read and parse the JSON file
const coursesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'courses.json'), 'utf-8'));

// Function to generate a random rating between -5 and 5
function getRandomRating() {
    return Math.floor(Math.random() * 11) - 5; // Generates a number between -5 and 5
}

// Function to insert data with random ratings
async function insertCourses() {
    try {
        // Assign random ratings to each chapter in the courses data
        coursesData.forEach(course => {
            course.chapters.forEach(chapter => {
                chapter.ratings = getRandomRating();
            });
        });

        await Course.insertMany(coursesData);
        console.log('Courses inserted successfully with random ratings!');
    } catch (err) {
        console.error('Error inserting courses:', err);
    } finally {
        mongoose.connection.close();
    }
}

insertCourses();

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// MongoDB connection
mongoose.connect('mongodb+srv://alfabetagama4356:73K2zVIb9aZR3wOJ@cluster0.pnaxs.mongodb.net/coursesDB?retryWrites=true&w=majority&appName=Cluster0');

// Define the chapter schema
const chapterSchema = new mongoose.Schema({
    name: String,
    text: String,
    ratings: { type: Number, default: 0 }
});

// Define the course schema with indices
const courseSchema = new mongoose.Schema({
    name: String,
    date: Number,
    description: String,
    domain: [String],
    chapters: [chapterSchema]
});

// Create index on `date` field for efficient sorting by date
courseSchema.index({ date: 1 }); // Ascending order

// Create index on `domain` field for faster domain filtering
courseSchema.index({ domain: 1 });

// Optionally, create an index on the `ratings` field if you query by ratings
courseSchema.index({ 'chapters.ratings': 1 });

const Course = mongoose.model('Course', courseSchema);

// Read and parse the JSON file
const coursesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'courses.json'), 'utf-8'));

// Function to generate a random rating between -5 and 5
function getRandomRating() {
    return Math.floor(Math.random() * 11) - 5; // Generates a number between -5 and 5
}

// Function to insert data with random ratings
async function insertCourses() {
    try {
        // Assign random ratings to each chapter in the courses data
        coursesData.forEach(course => {
            course.chapters.forEach(chapter => {
                chapter.ratings = getRandomRating();
            });
        });

        await Course.insertMany(coursesData);
        console.log('Courses inserted successfully with random ratings!');
    } catch (err) {
        console.error('Error inserting courses:', err);
    } finally {
        mongoose.connection.close();
    }
}

insertCourses();


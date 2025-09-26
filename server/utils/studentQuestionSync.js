const Question = require('../models/Question');
const User = require('../models/User');
const StudentQuestion = require('../models/StudentQuestion');

/**
 * Create StudentQuestion records for a new user with all active questions
 */
exports.createStudentQuestionsForNewUser = async (userId) => {
  try {
    console.log(`Creating student questions for new user: ${userId}`);
    
    // Get all active questions
    const activeQuestions = await Question.find({ isActive: true }).select('_id');
    
    if (activeQuestions.length === 0) {
      console.log('No active questions found to sync');
      return { success: true, created: 0 };
    }
    
    // Create StudentQuestion records for each active question
    const studentQuestions = activeQuestions.map(question => ({
      student: userId,
      question: question._id,
      status: 'not_attempted'
    }));
    
    // Use insertMany with ordered: false to ignore duplicates
    const result = await StudentQuestion.insertMany(studentQuestions, { 
      ordered: false 
    }).catch(error => {
      // Filter out duplicate key errors (E11000)
      if (error.code === 11000) {
        console.log('Some student questions already exist, continuing...');
        return [];
      }
      throw error;
    });
    
    console.log(`Created ${result.length} student question records for user ${userId}`);
    return { success: true, created: result.length };
    
  } catch (error) {
    console.error('Error creating student questions for new user:', error);
    throw error;
  }
};

/**
 * Create StudentQuestion records for a new question with all existing students
 */
exports.createStudentQuestionForNewQuestion = async (questionId) => {
  try {
    console.log(`Creating student question records for new question: ${questionId}`);
    
    // Get all users with role 'student'
    const students = await User.find({ role: 'student' }).select('_id');
    
    if (students.length === 0) {
      console.log('No students found to sync');
      return { success: true, created: 0 };
    }
    
    // Create StudentQuestion records for each student
    const studentQuestions = students.map(student => ({
      student: student._id,
      question: questionId,
      status: 'not_attempted'
    }));
    
    // Use insertMany with ordered: false to ignore duplicates
    const result = await StudentQuestion.insertMany(studentQuestions, { 
      ordered: false 
    }).catch(error => {
      // Filter out duplicate key errors (E11000)
      if (error.code === 11000) {
        console.log('Some student questions already exist, continuing...');
        return [];
      }
      throw error;
    });
    
    console.log(`Created ${result.length} student question records for question ${questionId}`);
    return { success: true, created: result.length };
    
  } catch (error) {
    console.error('Error creating student questions for new question:', error);
    throw error;
  }
};

/**
 * Remove StudentQuestion records when a question is deactivated
 */
exports.removeStudentQuestionsForDeactivatedQuestion = async (questionId) => {
  try {
    console.log(`Removing student question records for deactivated question: ${questionId}`);
    
    const result = await StudentQuestion.deleteMany({ question: questionId });
    
    console.log(`Removed ${result.deletedCount} student question records for question ${questionId}`);
    return { success: true, deleted: result.deletedCount };
    
  } catch (error) {
    console.error('Error removing student questions for deactivated question:', error);
    throw error;
  }
};

/**
 * Sync all existing students with all active questions (bulk operation)
 */
exports.syncAllStudentQuestions = async () => {
  try {
    console.log('Starting bulk sync of all student questions...');
    
    const activeQuestions = await Question.find({ isActive: true }).select('_id');
    const students = await User.find({ role: 'student' }).select('_id');
    
    console.log(`Found ${activeQuestions.length} active questions and ${students.length} students`);
    
    if (activeQuestions.length === 0 || students.length === 0) {
      console.log('No questions or students to sync');
      return { success: true, created: 0 };
    }
    
    // Create all possible combinations
    const allCombinations = [];
    students.forEach(student => {
      activeQuestions.forEach(question => {
        allCombinations.push({
          student: student._id,
          question: question._id,
          status: 'not_attempted'
        });
      });
    });
    
    console.log(`Attempting to create ${allCombinations.length} student question records...`);
    
    // Use insertMany with ordered: false to ignore duplicates
    const result = await StudentQuestion.insertMany(allCombinations, { 
      ordered: false 
    }).catch(error => {
      // Filter out duplicate key errors (E11000)
      if (error.code === 11000) {
        console.log('Many student questions already exist, continuing...');
        return [];
      }
      throw error;
    });
    
    console.log(`Bulk sync completed. Created ${result.length} new student question records`);
    return { success: true, created: result.length };
    
  } catch (error) {
    console.error('Error in bulk sync of student questions:', error);
    throw error;
  }
};
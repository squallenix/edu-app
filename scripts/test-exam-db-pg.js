require('dotenv/config');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not set in environment. Cannot run test script.');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  const teacherEmail = 'teacher-test@edu.local';
  const studentEmail = 'student-test@edu.local';

  try {
    // Clean up existing test data
    await pool.query('DELETE FROM "EnrolledExam" WHERE title LIKE $1', ['Test Exam%']);
    await pool.query('DELETE FROM "Question" WHERE content LIKE $1', ['Q1?%']);
    await pool.query('DELETE FROM "Exam" WHERE title LIKE $1', ['Test Exam%']);
    await pool.query('DELETE FROM "Teacher" WHERE email = $1', [teacherEmail]);
    await pool.query('DELETE FROM "Student" WHERE email = $1', [studentEmail]);
  } catch (e) {
    // ignore
  }

  try {
    const teacherId = crypto.randomUUID();
    const studentId = crypto.randomUUID();

    const teacherPassword = await bcrypt.hash('password', 10);
    const studentPassword = await bcrypt.hash('password', 10);

    await pool.query(
      'INSERT INTO "Teacher" (id, email, password, name, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,NOW(),NOW())',
      [teacherId, teacherEmail, teacherPassword, 'Test Teacher']
    );

    await pool.query(
      'INSERT INTO "Student" (id, email, password, name, "createdAt", "updatedAt") VALUES ($1,$2,$3,$4,NOW(),NOW())',
      [studentId, studentEmail, studentPassword, 'Test Student']
    );

    const examId = crypto.randomUUID();
    const title = 'Test Exam for Access Flow';
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await pool.query(
      "INSERT INTO \"Exam\" (id, title, description, \"dueDate\", time, duration, \"createdAt\", \"updatedAt\", \"status\", \"createdById\") VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW(),'DRAFT',$7)",
      [examId, title, 'Subject: Testing', dueDate, '12:00:00', 30, teacherId]
    );

    // Questions
    const q1 = crypto.randomUUID();
    const q2 = crypto.randomUUID();

    await pool.query(
      'INSERT INTO "Question" (id, type, content, options, answer, "order", "examId") VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [q1, 'multiple_choice', 'Q1?', JSON.stringify(['A','B','C']), 'A', 1, examId]
    );

    await pool.query(
      'INSERT INTO "Question" (id, type, content, options, answer, "order", "examId") VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [q2, 'multiple_choice', 'Q2?', JSON.stringify(['A','B','C']), 'B', 2, examId]
    );

    // Enrollment pending
    const enrollmentId = crypto.randomUUID();
    await pool.query(
      'INSERT INTO "EnrolledExam" (id, title, "studentId", "examId", score, status, "enrolledAt") VALUES ($1,$2,$3,$4,$5,$6,NOW())',
      [enrollmentId, title, studentId, examId, null, 'pending']
    );

    console.log('Seeded test data:');
    console.log('Teacher:', { id: teacherId, email: teacherEmail, password: 'password' });
    console.log('Student:', { id: studentId, email: studentEmail, password: 'password' });
    console.log('Exam:', { id: examId, title });
    console.log('Enrollment:', { id: enrollmentId, status: 'pending' });

    // Fetch teacher view
    const res = await pool.query(
      'SELECT e.id as exam_id, e.title as exam_title, en.id as enroll_id, en.status, s.email as student_email FROM "Exam" e LEFT JOIN "EnrolledExam" en ON en."examId" = e.id LEFT JOIN "Student" s ON s.id = en."studentId" WHERE e."createdById" = $1',
      [teacherId]
    );

    console.log('\nTeacher view preview:');
    for (const row of res.rows) {
      console.log(`Exam: ${row.exam_title} (${row.exam_id}) - Enrollment: ${row.enroll_id} student=${row.student_email} status=${row.status}`);
    }

  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();

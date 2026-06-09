const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Use test emails — change if already present
  const teacherEmail = 'teacher-test@edu.local';
  const studentEmail = 'student-test@edu.local';

  // Clean up existing test data if present
  await prisma.enrolledExam.deleteMany({ where: { OR: [{ student: { email: studentEmail } }, { exam: { createdBy: { email: teacherEmail } } }] } }).catch(() => {});

  await prisma.exam.deleteMany({ where: { createdBy: { email: teacherEmail } } }).catch(() => {});
  await prisma.teacher.deleteMany({ where: { email: teacherEmail } }).catch(() => {});
  await prisma.student.deleteMany({ where: { email: studentEmail } }).catch(() => {});

  const teacherPassword = await bcrypt.hash('password', 10);
  const teacher = await prisma.teacher.create({
    data: {
      email: teacherEmail,
      name: 'Test Teacher',
      password: teacherPassword,
    },
  });

  const studentPassword = await bcrypt.hash('password', 10);
  const student = await prisma.student.create({
    data: {
      email: studentEmail,
      name: 'Test Student',
      password: studentPassword,
    },
  });

  const exam = await prisma.exam.create({
    data: {
      title: 'Test Exam for Access Flow',
      description: 'Subject: Testing',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      time: new Date(),
      duration: 30,
      createdById: teacher.id,
      questions: {
        create: [
          { type: 'multiple_choice', content: 'Q1?', options: JSON.stringify(['A','B','C']), answer: 'A', order: 1 },
          { type: 'multiple_choice', content: 'Q2?', options: JSON.stringify(['A','B','C']), answer: 'B', order: 2 },
        ],
      },
    },
    include: { questions: true },
  });

  // Simulate student request (pending enrollment)
  const enrollment = await prisma.enrolledExam.create({
    data: {
      title: exam.title,
      studentId: student.id,
      examId: exam.id,
      status: 'pending',
    },
  });

  console.log('Seeded test data:');
  console.log('Teacher:', { id: teacher.id, email: teacher.email, password: 'password' });
  console.log('Student:', { id: student.id, email: student.email, password: 'password' });
  console.log('Exam:', { id: exam.id, title: exam.title });
  console.log('Enrollment:', { id: enrollment.id, status: enrollment.status });

  // Fetch teacher view to confirm pending
  const teacherView = await prisma.teacher.findUnique({
    where: { id: teacher.id },
    include: {
      createdExams: {
        include: { enrollments: { include: { student: true } }, questions: true },
      },
    },
  });

  console.log('\nTeacher view preview:');
  for (const e of teacherView.createdExams) {
    console.log(`Exam: ${e.title} (${e.id})`);
    for (const en of e.enrollments) {
      console.log(` - Enrollment: student=${en.student.email} status=${en.status} enrolledAt=${en.enrolledAt}`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

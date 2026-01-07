import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('Starting database seed...');

  // Clear existing data
  await prisma.feedback.deleteMany();
  await prisma.weeklyCheckin.deleteMany();
  await prisma.progress.deleteMany();
  await prisma.roadmapModule.deleteMany();
  await prisma.roadmap.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.skillDependency.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.onboardingResponse.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared existing data');

  // Seed Skills for Backend Dev → ML Engineer path
  const pythonBasics = await prisma.skill.create({
    data: {
      name: 'Python for ML',
      slug: 'python-ml',
      description: 'Python fundamentals for machine learning including NumPy, Pandas, and data manipulation',
      phase: 'foundation',
      estimatedHours: 8,
      isOptional: false,
      sequenceOrder: 1,
    },
  });

  const mathFoundations = await prisma.skill.create({
    data: {
      name: 'Math Foundations',
      slug: 'math-foundations',
      description: 'Linear algebra, calculus, and statistics fundamentals for ML',
      phase: 'foundation',
      estimatedHours: 12,
      isOptional: false,
      sequenceOrder: 2,
    },
  });

  const dataPreprocessing = await prisma.skill.create({
    data: {
      name: 'Data Preprocessing',
      slug: 'data-preprocessing',
      description: 'Data cleaning, feature engineering, and preprocessing techniques',
      phase: 'foundation',
      estimatedHours: 6,
      isOptional: false,
      sequenceOrder: 3,
    },
  });

  const mlAlgorithms = await prisma.skill.create({
    data: {
      name: 'ML Algorithms',
      slug: 'ml-algorithms',
      description: 'Core machine learning algorithms: regression, classification, clustering',
      phase: 'intermediate',
      estimatedHours: 15,
      isOptional: false,
      sequenceOrder: 4,
    },
  });

  const deepLearning = await prisma.skill.create({
    data: {
      name: 'Deep Learning Fundamentals',
      slug: 'deep-learning-fundamentals',
      description: 'Neural networks, backpropagation, and deep learning basics',
      phase: 'intermediate',
      estimatedHours: 20,
      isOptional: false,
      sequenceOrder: 5,
    },
  });

  const modelDeployment = await prisma.skill.create({
    data: {
      name: 'Model Deployment',
      slug: 'model-deployment',
      description: 'MLOps, model serving, and production deployment',
      phase: 'advanced',
      estimatedHours: 10,
      isOptional: false,
      sequenceOrder: 6,
    },
  });

  console.log('Created skills');

  // Create skill dependencies
  await prisma.skillDependency.createMany({
    data: [
      { skillId: dataPreprocessing.id, dependsOnId: pythonBasics.id, isHard: true },
      { skillId: mlAlgorithms.id, dependsOnId: mathFoundations.id, isHard: true },
      { skillId: mlAlgorithms.id, dependsOnId: dataPreprocessing.id, isHard: true },
      { skillId: deepLearning.id, dependsOnId: mlAlgorithms.id, isHard: true },
      { skillId: modelDeployment.id, dependsOnId: deepLearning.id, isHard: false },
    ],
  });

  console.log('Created skill dependencies');

  // Create resources for skills
  await prisma.resource.createMany({
    data: [
      // Python for ML
      {
        skillId: pythonBasics.id,
        title: 'Python for Data Science - freeCodeCamp',
        url: 'https://www.freecodecamp.org/learn/data-analysis-with-python/',
        type: 'course',
        provider: 'freeCodeCamp',
        durationMinutes: 300,
        isFree: true,
        quality: 5,
      },
      {
        skillId: pythonBasics.id,
        title: 'NumPy Quickstart Tutorial',
        url: 'https://numpy.org/doc/stable/user/quickstart.html',
        type: 'documentation',
        provider: 'NumPy',
        durationMinutes: 60,
        isFree: true,
        quality: 4,
      },
      // Math Foundations
      {
        skillId: mathFoundations.id,
        title: 'Khan Academy - Linear Algebra',
        url: 'https://www.khanacademy.org/math/linear-algebra',
        type: 'course',
        provider: 'Khan Academy',
        durationMinutes: 600,
        isFree: true,
        quality: 5,
      },
      {
        skillId: mathFoundations.id,
        title: '3Blue1Brown - Essence of Linear Algebra',
        url: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
        type: 'video',
        provider: 'YouTube',
        durationMinutes: 180,
        isFree: true,
        quality: 5,
      },
      // ML Algorithms
      {
        skillId: mlAlgorithms.id,
        title: 'Scikit-learn Tutorial',
        url: 'https://scikit-learn.org/stable/tutorial/index.html',
        type: 'documentation',
        provider: 'Scikit-learn',
        durationMinutes: 240,
        isFree: true,
        quality: 5,
      },
      // Deep Learning
      {
        skillId: deepLearning.id,
        title: 'Deep Learning Specialization - Andrew Ng',
        url: 'https://www.coursera.org/specializations/deep-learning',
        type: 'course',
        provider: 'Coursera',
        durationMinutes: 4800,
        isFree: false,
        quality: 5,
      },
    ],
  });

  console.log('Created resources');

  // Create a test user (for development)
  // Password: test123456
  const bcrypt = await import('bcrypt');
  const passwordHash = await bcrypt.default.hash('test123456', 10);
  
  const testUser = await prisma.user.create({
    data: {
      email: 'test@example.com',
      passwordHash,
      name: 'Test User',
      trialStartDate: new Date(),
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      emailVerified: true,
    },
  });

  // Create subscription for test user
  await prisma.subscription.create({
    data: {
      userId: testUser.id,
      status: 'trialing',
      plan: 'free',
    },
  });

  console.log('Created test user');

  // Create a roadmap for test user
  const roadmap = await prisma.roadmap.create({
    data: {
      userId: testUser.id,
      title: 'Backend Developer to ML Engineer',
      description: 'Transition from backend development to machine learning engineering',
      sourceRole: 'Backend Developer',
      targetRole: 'ML Engineer',
      totalEstimatedHours: 71,
      isActive: true,
    },
  });

  // Create roadmap modules
  const skills = [pythonBasics, mathFoundations, dataPreprocessing, mlAlgorithms, deepLearning, modelDeployment];

  for (const skill of skills) {
    await prisma.roadmapModule.create({
      data: {
        roadmapId: roadmap.id,
        skillId: skill.id,
        phase: skill.phase,
        sequenceOrder: skill.sequenceOrder,
        isLocked: skill.sequenceOrder > 1,
      },
    });
  }

  console.log('Created roadmap and modules');

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'IELTS Buddy API',
    version: '1.0.0',
    description: 'Backend API for IELTS Buddy authentication, mock attempts, practice tests, AI feedback previews, onboarding survey, and history.',
  },
  servers: [
    { url: 'https://ielts-jt4m.onrender.com/api', description: 'Production API' },
    { url: 'http://localhost:5000/api', description: 'Local development API' },
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Onboarding' },
    { name: 'Attempts' },
    { name: 'Practice Tests' },
    { name: 'AI Feedback' },
    { name: 'History' },
    { name: 'Admin' },
    { name: 'Content' },
    { name: 'Writing' },
    { name: 'Speaking' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the token returned by /auth/login or /auth/register.',
      },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: { error: { type: 'string' } },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/User' },
        },
      },
      PracticeTest: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          section: { type: 'string', enum: ['reading', 'listening', 'writing', 'speaking'] },
          title: { type: 'string' },
          description: { type: 'string' },
          difficulty: { type: 'string', enum: ['Beginner', 'Intermediate', 'Advanced'] },
          duration_minutes: { type: 'integer' },
          question_types: { type: 'array', items: { type: 'string' } },
          status: { type: 'string', enum: ['not_started', 'in_progress', 'completed'] },
          latest_band: { type: 'number', nullable: true },
          content: { type: 'object', additionalProperties: true },
        },
      },
      Attempt: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          section: { type: 'string', enum: ['reading', 'listening', 'writing', 'speaking', 'full'] },
          status: { type: 'string', enum: ['in_progress', 'completed'] },
          started_at: { type: 'string', format: 'date-time' },
          completed_at: { type: 'string', format: 'date-time', nullable: true },
          time_taken_seconds: { type: 'integer', nullable: true },
          total_score: { type: 'number', nullable: true },
          band_score: { type: 'number', nullable: true },
        },
      },
      Criterion: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          band: { type: 'number' },
          feedback: { type: 'string' },
        },
      },
      Feedback: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          test_id: { type: 'string' },
          test_title: { type: 'string' },
          section: { type: 'string', enum: ['writing', 'speaking'] },
          overall_band: { type: 'number' },
          criteria: { type: 'array', items: { $ref: '#/components/schemas/Criterion' } },
          strengths: { type: 'array', items: { type: 'string' } },
          improvements: { type: 'array', items: { type: 'string' } },
          summary: { type: 'string' },
        },
      },
      Survey: {
        type: 'object',
        properties: {
          user_id: { type: 'string' },
          current_band: { type: 'number', nullable: true },
          target_band: { type: 'number', nullable: true },
          weak_sections: { type: 'array', items: { type: 'string', enum: ['reading', 'listening', 'writing', 'speaking'] } },
          exam_date: { type: 'string', format: 'date', nullable: true },
          study_hours: { type: 'integer', nullable: true },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        security: [],
        summary: 'Health check',
        responses: { 200: { description: 'API is running' } },
      },
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        security: [],
        summary: 'Create an account',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string' }, email: { type: 'string', format: 'email' }, password: { type: 'string', minLength: 6 } } } } },
        },
        responses: { 201: { description: 'Registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } }, 409: { description: 'Email exists' } },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        security: [],
        summary: 'Log in',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', required: ['email', 'password'], properties: { email: { type: 'string', format: 'email' }, password: { type: 'string' } } } } },
        },
        responses: { 200: { description: 'Logged in', content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } } }, 401: { description: 'Invalid credentials' } },
      },
    },
    '/auth/me': {
      get: { tags: ['Auth'], summary: 'Get current user', responses: { 200: { description: 'Current user' }, 401: { description: 'Unauthorized' } } },
    },
    '/onboarding-survey': {
      post: {
        tags: ['Onboarding'],
        summary: 'Create or update onboarding survey',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { current_band: { type: 'number', example: 5.5 }, target_band: { type: 'number', example: 7 }, weak_sections: { type: 'array', items: { type: 'string' }, example: ['writing', 'speaking'] }, exam_date: { type: 'string', format: 'date' }, study_hours: { type: 'integer', example: 8 } } } } },
        },
        responses: { 201: { description: 'Survey saved', content: { 'application/json': { schema: { type: 'object', properties: { survey: { $ref: '#/components/schemas/Survey' } } } } } } },
      },
    },
    '/onboarding-survey/{userId}': {
      get: {
        tags: ['Onboarding'],
        summary: 'Get onboarding survey by user id',
        parameters: [{ name: 'userId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Survey result' }, 403: { description: 'Forbidden' } },
      },
    },
    '/attempts': {
      get: {
        tags: ['Attempts'],
        summary: 'List exam attempts for current user',
        responses: { 200: { description: 'Attempts', content: { 'application/json': { schema: { type: 'object', properties: { attempts: { type: 'array', items: { $ref: '#/components/schemas/Attempt' } } } } } } } },
      },
      post: {
        tags: ['Attempts'],
        summary: 'Start an exam attempt',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['section'], properties: { section: { type: 'string', enum: ['reading', 'listening', 'writing', 'speaking', 'full'], example: 'full' } } } } } },
        responses: { 201: { description: 'Attempt started' } },
      },
    },
    '/attempts/{id}': {
      get: {
        tags: ['Attempts'],
        summary: 'Get attempt details, answers, and mock writing/speaking feedback',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Attempt details' }, 404: { description: 'Attempt not found' } },
      },
      delete: {
        tags: ['Attempts'],
        summary: 'Delete or abandon an attempt',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Attempt deleted' } },
      },
    },
    '/attempts/{id}/answers': {
      post: {
        tags: ['Attempts'],
        summary: 'Save answers for an attempt',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { oneOf: [{ type: 'object', properties: { question_id: { type: 'string' }, user_answer: { type: 'string' } } }, { type: 'array', items: { type: 'object', properties: { question_id: { type: 'string' }, user_answer: { type: 'string' } } } }] } } } },
        responses: { 200: { description: 'Answers saved' } },
      },
    },
    '/attempts/{id}/complete': {
      post: {
        tags: ['Attempts'],
        summary: 'Complete attempt and calculate score',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { time_taken_seconds: { type: 'integer', example: 3600 } } } } } },
        responses: { 200: { description: 'Exam completed' } },
      },
    },
    '/practice-tests': {
      get: {
        tags: ['Practice Tests'],
        summary: 'List practice tests',
        parameters: [
          { name: 'section', in: 'query', schema: { type: 'string' } },
          { name: 'difficulty', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Practice tests', content: { 'application/json': { schema: { type: 'object', properties: { tests: { type: 'array', items: { $ref: '#/components/schemas/PracticeTest' } } } } } } } },
      },
      post: {
        tags: ['Practice Tests'],
        summary: 'Create practice test',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PracticeTest' } } } },
        responses: { 201: { description: 'Practice test created' } },
      },
    },
    '/practice-tests/section/{section}': {
      get: {
        tags: ['Practice Tests'],
        summary: 'List practice tests by section',
        parameters: [{ name: 'section', in: 'path', required: true, schema: { type: 'string', enum: ['reading', 'listening', 'writing', 'speaking'] } }],
        responses: { 200: { description: 'Practice tests' } },
      },
    },
    '/practice-tests/{id}': {
      get: { tags: ['Practice Tests'], summary: 'Get practice test', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Practice test' } } },
      put: { tags: ['Practice Tests'], summary: 'Update practice test or current-user progress', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { $ref: '#/components/schemas/PracticeTest' } } } }, responses: { 200: { description: 'Practice test updated' } } },
      delete: { tags: ['Practice Tests'], summary: 'Delete practice test', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Practice test deleted' } } },
    },
    '/ai-check/writing': {
      post: {
        tags: ['AI Feedback'],
        summary: 'Generate fake AI writing feedback for a practice test',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['test_id', 'response'], properties: { test_id: { type: 'string', example: 'writing-task2-technology' }, response: { type: 'string' }, essay_text: { type: 'string' } } } } } },
        responses: { 201: { description: 'Feedback generated' } },
      },
    },
    '/ai-check/speaking': {
      post: {
        tags: ['AI Feedback'],
        summary: 'Generate fake AI speaking feedback for a practice test',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['test_id', 'response'], properties: { test_id: { type: 'string', example: 'speaking-public-transport' }, response: { type: 'string' }, transcript: { type: 'string' } } } } } },
        responses: { 201: { description: 'Feedback generated' } },
      },
    },
    '/ai-feedback': {
      get: { tags: ['AI Feedback'], summary: 'List current-user AI feedback', responses: { 200: { description: 'Feedback list' } } },
    },
    '/ai-feedback/test/{testId}': {
      get: { tags: ['AI Feedback'], summary: 'List feedback for a practice test', parameters: [{ name: 'testId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Feedback list' } } },
    },
    '/ai-feedback/{id}': {
      get: { tags: ['AI Feedback'], summary: 'Get AI feedback by id', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Feedback' } } },
    },
    '/history': {
      get: {
        tags: ['History'],
        summary: 'List unified mock and practice history',
        parameters: [
          { name: 'section', in: 'query', schema: { type: 'string', enum: ['all', 'reading', 'listening', 'writing', 'speaking', 'mock'] } },
          { name: 'status', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['newest', 'oldest', 'highest', 'lowest'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'History feed' } },
      },
    },
    '/admin/summary': {
      get: {
        tags: ['Admin'],
        summary: 'Get admin dashboard counts and difficult question types',
        responses: { 200: { description: 'Admin summary' }, 403: { description: 'Admin access required' } },
      },
    },
    '/admin/practice-tests': {
      get: {
        tags: ['Admin'],
        summary: 'List all practice tests, including drafts',
        parameters: [
          { name: 'section', in: 'query', schema: { type: 'string', enum: ['reading', 'listening', 'writing', 'speaking'] } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
        ],
        responses: { 200: { description: 'Practice tests' }, 403: { description: 'Admin access required' } },
      },
      post: {
        tags: ['Admin'],
        summary: 'Create a practice test',
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PracticeTest' } } } },
        responses: { 201: { description: 'Practice test created' }, 403: { description: 'Admin access required' } },
      },
    },
    '/admin/practice-tests/{id}': {
      put: {
        tags: ['Admin'],
        summary: 'Update a practice test',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/PracticeTest' } } } },
        responses: { 200: { description: 'Practice test updated' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Delete a practice test',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Practice test deleted' }, 404: { description: 'Not found' } },
      },
    },
    '/admin/practice-tests/{id}/publish': {
      patch: {
        tags: ['Admin'],
        summary: 'Publish or unpublish a practice test',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { published: { type: 'boolean' } } } } } },
        responses: { 200: { description: 'Publish state updated' }, 404: { description: 'Not found' } },
      },
    },
    '/admin/practice-tests/{id}/audio': {
      post: {
        tags: ['Admin'],
        summary: 'Upload listening audio for a practice test',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: { type: 'object', required: ['audio'], properties: { audio: { type: 'string', format: 'binary' } } },
            },
          },
        },
        responses: { 200: { description: 'Audio uploaded' }, 400: { description: 'Audio file required' } },
      },
    },
    '/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'List registered users with progress summary',
        parameters: [{ name: 'search', in: 'query', schema: { type: 'string' } }],
        responses: { 200: { description: 'Users' }, 403: { description: 'Admin access required' } },
      },
    },
    '/admin/users/{id}': {
      patch: {
        tags: ['Admin'],
        summary: 'Update user role or status',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { role: { type: 'string', enum: ['user', 'admin'] }, status: { type: 'string', enum: ['active', 'banned'] } } } } } },
        responses: { 200: { description: 'User updated' }, 404: { description: 'Not found' } },
      },
      delete: {
        tags: ['Admin'],
        summary: 'Delete a user account',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'User deleted' }, 400: { description: 'Cannot delete yourself' } },
      },
    },
    '/admin/users/{id}/attempts': {
      delete: {
        tags: ['Admin'],
        summary: 'Reset attempts, practice progress, and AI feedback for a user',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Attempts reset' }, 404: { description: 'Not found' } },
      },
    },
    '/passages': {
      get: { tags: ['Content'], summary: 'List passages by section', parameters: [{ name: 'section', in: 'query', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Passages' } } },
    },
    '/passages/{id}': {
      get: { tags: ['Content'], summary: 'Get passage by id', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Passage' } } },
    },
    '/questions': {
      get: { tags: ['Content'], summary: 'List questions, optionally by section', parameters: [{ name: 'section', in: 'query', schema: { type: 'string' } }], responses: { 200: { description: 'Questions' } } },
      post: { tags: ['Content'], summary: 'Create question', responses: { 201: { description: 'Created' } } },
    },
    '/questions/{id}': {
      get: { tags: ['Content'], summary: 'Get question', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Question' } } },
      put: { tags: ['Content'], summary: 'Update question', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Updated' } } },
      delete: { tags: ['Content'], summary: 'Delete question', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Deleted' } } },
    },
    '/writing': {
      get: { tags: ['Writing'], summary: 'List writing submissions', responses: { 200: { description: 'Submissions' } } },
      post: { tags: ['Writing'], summary: 'Submit writing essay for mock attempt', requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { attempt_id: { type: 'string' }, question_id: { type: 'string' }, essay_text: { type: 'string' }, task_type: { type: 'string', enum: ['task1', 'task2'] } } } } } }, responses: { 201: { description: 'Writing submitted' } } },
    },
    '/writing/{id}': {
      get: { tags: ['Writing'], summary: 'Get writing submission', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Submission' } } },
    },
    '/writing/{id}/score': {
      patch: { tags: ['Writing'], summary: 'Update writing score and feedback', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { score: { type: 'number' }, feedback: { type: 'string' } } } } } }, responses: { 200: { description: 'Updated' } } },
    },
    '/speaking': {
      get: { tags: ['Speaking'], summary: 'List speaking submissions', responses: { 200: { description: 'Submissions' } } },
      post: {
        tags: ['Speaking'],
        summary: 'Upload speaking audio for a mock attempt',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['attempt_id', 'part_index', 'audio'],
                properties: {
                  attempt_id: { type: 'string' },
                  passage_id: { type: 'string' },
                  part_index: { type: 'integer' },
                  audio: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: { 201: { description: 'Speaking submitted' } },
      },
    },
  },
};

module.exports = openApiDocument;

const readingTopics = [
  ['urban-wildlife', 'Urban Wildlife and Adaptation', 'How animals adjust their behaviour to thrive in modern cities.'],
  ['sleep-science', 'The Science of Better Sleep', 'Research into circadian rhythms, light exposure, and memory.'],
  ['ocean-mapping', 'Mapping the Deep Ocean', 'New technology is revealing the least explored parts of Earth.'],
  ['public-libraries', 'The Changing Role of Public Libraries', 'Why libraries are becoming community and digital learning hubs.'],
  ['vertical-forests', 'Can Buildings Become Forests?', 'An examination of high-rise architecture covered in living plants.'],
  ['electric-cars', 'The Electric Car Transition', 'How battery innovation is changing transport and city planning.'],
  ['ancient-navigation', 'Ancient Navigation Methods', 'How early travellers crossed oceans without modern instruments.'],
  ['memory-palaces', 'Memory Palaces and Learning', 'A look at spatial memory techniques in education.'],
  ['food-security', 'Global Food Security', 'The pressures shaping farming, logistics, and nutrition.'],
  ['digital-museums', 'Digital Museums', 'How cultural institutions are preserving access online.'],
  ['renewable-grids', 'Renewable Energy Grids', 'The challenge of balancing supply and demand.'],
  ['language-change', 'Why Languages Change', 'How migration, media, and technology shape vocabulary.'],
  ['medical-robots', 'Robots in Medicine', 'The promise and limits of surgical automation.'],
  ['urban-heat', 'Urban Heat Islands', 'Why cities get hotter and how planners respond.'],
  ['polar-research', 'Polar Climate Research', 'What ice cores reveal about environmental history.'],
];

const listeningTopics = [
  ['library-tour', 'University Library Orientation', 'A librarian explains facilities, borrowing rules, and study spaces.'],
  ['city-bikes', 'City Bicycle Membership', 'A customer asks about plans, stations, and safety requirements.'],
  ['field-research', 'Planning a Geography Field Trip', 'Two students organise equipment and divide their research tasks.'],
  ['museum-talk', 'Museum Conservation Talk', 'A curator discusses how fragile historical objects are protected.'],
  ['workplace-study', 'Lecture on Flexible Working', 'An academic lecture about productivity and remote work patterns.'],
  ['student-housing', 'Student Housing Enquiry', 'A student compares rooms, deposits, and contract dates.'],
  ['sports-centre', 'Sports Centre Membership', 'A receptionist describes facilities, fees, and classes.'],
  ['volunteer-programme', 'Volunteer Programme Briefing', 'A coordinator explains training and weekly duties.'],
  ['botany-seminar', 'Botany Seminar', 'A lecture about plant communication and forest ecosystems.'],
  ['airport-transfer', 'Airport Transfer Booking', 'A traveller confirms times, luggage, and pickup points.'],
  ['film-club', 'Film Club Planning', 'Students discuss venue choices and publicity.'],
  ['market-research', 'Market Research Interview', 'A researcher asks about shopping preferences.'],
  ['history-lecture', 'History of Printing', 'A lecture on printing technology and public literacy.'],
  ['recycling-scheme', 'Local Recycling Scheme', 'A council officer explains new collection rules.'],
  ['biology-lab', 'Biology Lab Safety', 'A supervisor outlines equipment and procedures.'],
];

const writingTopics = [
  ['task1-transport', 'Transport Use by Age Group', 'Summarise a bar chart comparing transport choices across age groups.', 'task1'],
  ['task1-water', 'Household Water Consumption', 'Describe changes shown in two pie charts from 2000 and 2025.', 'task1'],
  ['task1-campus', 'University Campus Redevelopment', 'Compare two maps showing a campus before and after redevelopment.', 'task1'],
  ['task1-tourism', 'International Tourism Figures', 'Summarise a line graph showing tourist arrivals in four countries.', 'task1'],
  ['task1-energy', 'Sources of Household Energy', 'Describe a stacked bar chart showing changes in energy sources.', 'task1'],
  ['task1-library', 'Library Visits by Purpose', 'Summarise a table about why different age groups visit libraries.', 'task1'],
  ['task1-recycling', 'Recycling Rates in Five Cities', 'Compare recycling rates across cities over a decade.', 'task1'],
  ['task1-online-sales', 'Online Retail Sales', 'Describe a graph of online sales by product category.', 'task1'],
  ['task2-cities', 'Living in Large Cities', 'Discuss whether the benefits of living in major cities outweigh the disadvantages.', 'task2'],
  ['task2-technology', 'Technology in the Classroom', 'Discuss both views on replacing printed textbooks with digital devices.', 'task2'],
  ['task2-environment', 'Individual Environmental Action', 'Evaluate whether individuals or governments should bear more responsibility.', 'task2'],
  ['task2-work-life', 'Work-Life Balance', 'Discuss whether employers should support shorter working weeks.', 'task2'],
  ['task2-university', 'University Education', 'Consider whether universities should focus more on employability skills.', 'task2'],
  ['task2-advertising', 'Advertising and Children', 'Discuss whether advertising aimed at children should be restricted.', 'task2'],
  ['task2-tourism', 'International Tourism', 'Evaluate whether tourism brings more benefits or problems to local communities.', 'task2'],
  ['task2-public-transport', 'Public Transport Investment', 'Discuss whether governments should prioritise public transport over roads.', 'task2'],
  ['task2-remote-work', 'Remote Work', 'Consider whether working from home improves productivity and wellbeing.', 'task2'],
  ['task2-art-funding', 'Funding the Arts', 'Discuss whether public money should support museums, theatre, and music.', 'task2'],
  ['task2-health', 'Preventive Healthcare', 'Evaluate whether governments should spend more on prevention than treatment.', 'task2'],
  ['task2-ai', 'Artificial Intelligence', 'Discuss whether artificial intelligence will create more opportunities than risks.', 'task2'],
];

const speakingTopics = [
  ['home-town', 'Your Home Town', 'Answer familiar questions about where you live and what has changed.', 1],
  ['daily-routine', 'Daily Routines', 'Talk about your schedule, habits, and preferred time of day.', 1],
  ['food', 'Food and Cooking', 'Discuss meals, restaurants, and cooking habits.', 1],
  ['study', 'Work or Study', 'Talk about your current work or studies and future plans.', 1],
  ['useful-object', 'A Useful Object', 'Describe an object you use often and explain why it matters.', 2],
  ['memorable-journey', 'A Memorable Journey', 'Describe a journey that was especially meaningful to you.', 2],
  ['skilled-person', 'A Skilled Person', 'Describe someone whose practical or creative skill you admire.', 2],
  ['public-place', 'A Public Place', 'Describe a public place you enjoy visiting.', 2],
  ['good-news', 'Good News You Received', 'Describe a piece of good news and how you reacted.', 2],
  ['book', 'A Book You Enjoyed', 'Describe a book or story that affected you.', 2],
  ['public-transport', 'The Future of Public Transport', 'Discuss investment, access, and changing travel habits.', 3],
  ['education', 'How Education Should Change', 'Discuss practical skills, assessment, and lifelong learning.', 3],
  ['tourism', 'Tourism and Local Communities', 'Explore the economic and cultural effects of international tourism.', 3],
  ['environment', 'Environmental Responsibility', 'Discuss how individuals, companies, and governments should respond.', 3],
  ['technology', 'Technology and Communication', 'Discuss whether digital tools improve relationships.', 3],
  ['work', 'The Future of Work', 'Discuss automation, remote work, and career preparation.', 3],
  ['health', 'Public Health', 'Discuss prevention, lifestyle, and government campaigns.', 3],
  ['media', 'News and Media', 'Discuss trust, online information, and responsible reporting.', 3],
  ['shopping', 'Consumer Behaviour', 'Discuss advertising, online shopping, and sustainability.', 3],
  ['community', 'Community Life', 'Discuss what makes neighbourhoods successful.', 3],
];

const difficulties = ['Beginner', 'Intermediate', 'Advanced'];

function makeReading([slug, title, description], index) {
  return {
    id: `reading-${slug}`, section: 'reading', title, description, difficulty: difficulties[index % 3], duration_minutes: 18 + (index % 4) * 2, question_types: index % 2 ? ['Sentence completion', 'Multiple choice'] : ['Matching headings', 'True / False / Not Given'],
    content: {
      passage: `${title} is an IELTS-style reading passage with seven short paragraphs. It introduces the topic, presents contrasting research findings, considers practical examples, and concludes with future implications. Learners should identify main ideas, distinguish claims from evidence, and locate precise details.`,
      questions: [
        { number: 1, text: 'Which paragraph introduces the central issue?', options: ['A', 'B', 'C', 'D'] },
        { number: 2, text: 'The author presents one research finding as fully proven.', options: ['True', 'False', 'Not Given'] },
        { number: 3, text: 'Complete the sentence with no more than two words.', answer_hint: 'Use no more than two words.' },
      ],
    },
  };
}

function makeListening([slug, title, description], index) {
  return {
    id: `listening-${slug}`, section: 'listening', title, description, difficulty: difficulties[index % 3], duration_minutes: 12 + (index % 5) * 2, question_types: index % 2 ? ['Form completion', 'Short answer'] : ['Note completion', 'Multiple choice'],
    content: {
      audio_url: '/uploads/listening/ielts-listening-test.wav',
      transcript_preview: `${title}: an IELTS-style recording containing names, times, locations, and contrasting viewpoints.`,
      questions: [
        { number: 1, text: 'Complete the first detail from the recording.', answer_hint: 'One word and/or a number.' },
        { number: 2, text: 'Why does the speaker recommend the service?', options: ['A. Cost', 'B. Convenience', 'C. Availability'] },
        { number: 3, text: 'What time does the activity finish?', answer_hint: 'Write a time.' },
      ],
    },
  };
}

function makeWriting([slug, title, description, taskType], index) {
  const prompt = taskType === 'task1'
    ? `${description} Summarise the information by selecting and reporting the main features, and make comparisons where relevant.`
    : `${description} Give reasons for your answer and include relevant examples from your own knowledge or experience.`;
  return {
    id: `writing-${slug}`, section: 'writing', title, description, difficulty: difficulties[index % 3], duration_minutes: taskType === 'task1' ? 20 : 40, question_types: taskType === 'task1' ? ['Academic Task 1'] : ['Essay prompt'],
    content: { task_type: taskType, prompt, minimum_words: taskType === 'task1' ? 150 : 250 },
  };
}

function makeSpeaking([slug, title, description, part], index) {
  return {
    id: `speaking-${slug}`, section: 'speaking', title, description, difficulty: difficulties[index % 3], duration_minutes: part === 1 ? 5 : part === 2 ? 4 : 6, question_types: [`Part ${part}`],
    content: {
      speaking_part: part,
      preparation_time_seconds: part === 2 ? 60 : 0,
      speaking_time_seconds: part === 2 ? 120 : 90,
      prompts: part === 1
        ? [`Tell me about ${title.toLowerCase()}.`, 'Has your opinion about this changed over time?', 'Why is this topic important to you?']
        : part === 2
          ? [`Describe ${title.toLowerCase()}.`, 'You should say what it was, when it happened, who was involved, and explain why it was memorable.']
          : [`Why is ${title.toLowerCase()} important today?`, 'What might change in the future?', 'Who should be responsible for those changes?'],
    },
  };
}

const mockTests = Array.from({ length: 10 }, (_, index) => ({
  id: `mock-test-${index + 1}`,
  title: `Full Mock Test ${index + 1}`,
  description: `Complete IELTS Academic simulation with Reading, Listening, Writing, and Speaking sections.`,
  difficulty: difficulties[index % 3],
  duration_minutes: 165,
  sections: ['reading', 'listening', 'writing', 'speaking'],
}));

module.exports = {
  practiceTests: [
    ...readingTopics.map(makeReading),
    ...listeningTopics.map(makeListening),
    ...writingTopics.map(makeWriting),
    ...speakingTopics.map(makeSpeaking),
  ],
  mockTests,
};

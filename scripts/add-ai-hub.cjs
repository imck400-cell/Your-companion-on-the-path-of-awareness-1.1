const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, query, where, getDocs, doc, updateDoc } = require('firebase/firestore');
const cfg = require('../firebase-applet-config.json');

const app = initializeApp(cfg);
const db = getFirestore(app, cfg.firestoreDatabaseId);

const sections = [
  {
    id: 'edu',
    title: 'الذكاء الاصطناعي في التعليم (المعلم والمدرب الرقمي)',
    enTitle: 'AI in Education (Teacher & Digital Trainer)',
    keyword: 'education',
    items: [
      ['الذكاء الاصطناعي في التعليم: رؤية مستقبلية.', 'AI in Education: A Future Vision'],
      ['تصميم خطص الدروس اليومية باستخدام AI.', 'Designing Daily Lesson Plans using AI'],
      ['صناعة الاختبارات التفاعلية وتصحيحها آلياً.', 'Creating Interactive Tests and Automatic Grading'],
      ['هندسة الأوامر (Prompts) المتقدمة للمعلمين.', 'Advanced Prompt Engineering for Teachers'],
      ['إنشاء المحتوى التعليمي البصري (Infographics).', 'Creating Visual Educational Content (Infographics)'],
      ['تحويل المناهج الورقية إلى حقائب رقمية ذكية.', 'Converting Paper Curricula into Smart Digital Packages'],
      ['المعلم المساعد: كيف تدير وقتك بذكاء؟', 'Assistant Teacher: How to Manage Your Time Smartly?'],
      ['استراتيجيات التعلم الشخصي (Personalized Learning).', 'Personalized Learning Strategies'],
      ['توظيف الـ Chatbots في دعم الطلاب.', 'Employing Chatbots in Student Support'],
      ['تصميم القصص التعليمية التفاعلية بالذكاء الاصطناعي.', 'Designing Interactive Educational Stories with AI'],
      ['تقنيات الواقع المعزز (AR) والذكاء الاصطناعي في الفصل.', 'AR and AI Technologies in the Classroom'],
      ['مهارات البحث الأكاديمي الرقمي الموثق.', 'Documented Digital Academic Research Skills'],
      ['استخدام AI في تبسيط العلوم المعقدة.', 'Using AI to Simplify Complex Sciences'],
      ['إعداد الحقائب التدريبية للمدربين المحترفين.', 'Preparing Training Packages for Professional Trainers'],
      ['تقييم أداء الطلاب وتحليل الفجوات التعليمية.', 'Evaluating Student Performance and Analyzing Educational Gaps'],
      ['تصميم العروض التقديمية الإبداعية بضغطة زر.', 'Designing Creative Presentations with One Click'],
      ['الذكاء الاصطناعي لذوي الاحتياجات الخاصة.', 'AI for People with Special Needs'],
      ['فن الإلقاء والتدريب في القاعات الافتراضية الذكية.', 'Art of Public Speaking and Training in Smart Virtual Rooms'],
      ['إنشاء المختبرات العلمية الافتراضية.', 'Creating Virtual Science Laboratories'],
      ['إدارة الصف وضبط السلوك باستخدام أدوات تقنية.', 'Classroom Management and Behavior Control using Tech Tools'],
      ['صناعة الألعاب التعليمية (Gamification).', 'Educational Games Creation (Gamification)'],
      ['تحليل البيانات التربوية لاتخاذ القرارات.', 'Analyzing Educational Data for Decision Making'],
      ['مهارات التلخيص الذكي للمراجع الضخمة.', 'Smart Summarization Skills for Large References'],
      ['دمج أدوات Google AI في العملية التعليمية.', 'Integrating Google AI Tools into the Educational Process'],
      ['تطوير مهارات التفكير النقدي في عصر الذكاء الاصطناعي.', 'Developing Critical Thinking Skills in the AI Era'],
      ['تصميم بيئات التعلم المدمج (Blended Learning).', 'Designing Blended Learning Environments'],
      ['الإشراف التربوي الرقمي وأتمتة التقارير.', 'Digital Educational Supervision and Report Automation'],
      ['بناء المنصات التعليمية البسيطة بدون برمجة.', 'Building Simple Educational Platforms without Programming'],
      ['مهارات التواصل مع أولياء الأمور عبر الوسائط الذكية.', 'Communication Skills with Parents via Smart Media'],
      ['أخلاقيات الذكاء الاصطناعي في المؤسسات التعليمية.', 'AI Ethics in Educational Institutions']
    ]
  },
  {
    id: 'mgmt',
    title: 'الإدارة والقيادة المؤسسية الذكية',
    enTitle: 'Smart Corporate Management & Leadership',
    keyword: 'management',
    items: [
      ['القيادة التنفيذية في عصر الذكاء الاصطناعي.', 'Executive Leadership in the AI Era'],
      ['أتمتة العمليات الإدارية (RPA) للمبتدئين.', 'Administrative Process Automation (RPA) for Beginners'],
      ['التخطيط الاستراتيجي المستند إلى البيانات.', 'Data-Driven Strategic Planning'],
      ['إدارة المشاريع باستخدام مساعدي AI.', 'Project Management using AI Assistants'],
      ['الذكاء الاصطناعي في إدارة الموارد البشرية.', 'AI in Human Resources Management'],
      ['صياغة السياسات المؤسسية لاستخدام التكنولوجيا.', 'Formulating Institutional Policies for Tech Use'],
      ['تحليل المخاطر والتنبؤ بالأزمات الإدارية.', 'Risk Analysis and Predicting Administrative Crises'],
      ['الاجتماعات الذكية: التوثيق والتحليل الآلي.', 'Smart Meetings: Automated Documentation and Analysis'],
      ['مهارات التفاوض الإداري بمساعدة المحاكاة الذكية.', 'Administrative Negotiation Skills with Smart Simulation'],
      ['إدارة التغيير الرقمي في المؤسسات التقليدية.', 'Digital Change Management in Traditional Institutions'],
      ['هندسة الأوامر للمديرين والقياديين.', 'Prompt Engineering for Managers and Leaders'],
      ['بناء فرق العمل الهجينة (بشر + روبوتات).', 'Building Hybrid Teams (Humans + Robots)'],
      ['الرقابة والتقييم المؤسسي الذكي.', 'Smart Institutional Monitoring and Evaluation'],
      ['التوظيف الذكي واختيار الكفاءات بالخوارزميات.', 'Smart Recruitment and Talent Selection by Algorithms'],
      ['إدارة سلاسل الإمداد والخدمات اللوجستية.', 'Supply Chain and Logistics Management'],
      ['تطوير الثقافة التنظيمية الرقمية.', 'Developing Digital Organizational Culture'],
      ['كتابة التقارير والمخاطبات الرسمية الاحترافية.', 'Writing Professional Reports and Official Correspondence'],
      ['أمن المعلومات والخصوصية للإداريين.', 'Information Security and Privacy for Administrators'],
      ['حل المشكلات الإدارية المعقدة باستخدام AI.', 'Solving Complex Administrative Problems using AI'],
      ['تحليل المنافسين ومراقبة السوق ذكياً.', 'Smart Competitor Analysis and Market Monitoring'],
      ['الإبداع المؤسسي وتوليد الأفكار الابتكارية.', 'Institutional Creativity and Generating Innovative Ideas'],
      ['الإدارة المالية الذكية وتقليل الهدر.', 'Smart Financial Management and Reducing Waste'],
      ['تصميم الهياكل التنظيمية المرنة.', 'Designing Flexible Organizational Structures'],
      ['ذكاء الأعمال (Business Intelligence) للمديرين.', 'Business Intelligence for Managers'],
      ['إدارة المعرفة والأرشفة الرقمية الذكية.', 'Smart Knowledge Management and Archiving'],
      ['القيادة عن بُعد باستخدام الأدوات الذكية.', 'Remote Leadership using Smart Tools'],
      ['مهارات عرض البيانات (Data Visualization) للقيادات.', 'Data Visualization Skills for Leaders'],
      ['تحسين تجربة الموظف عبر تطبيقات AI.', 'Improving Employee Experience via AI Apps'],
      ['القوانين والتشريعات المنظمة للذكاء الاصطناعي.', 'Laws and Regulations Organizing AI'],
      ['استشراف المستقبل المؤسسي: أدوات ومنهجيات.', 'Forecasting Institutional Future: Tools and Methodologies']
    ]
  },
  {
    id: 'mkt',
    title: 'التسويق الرقمي وصناعة المحتوى الإبداعي',
    enTitle: 'Digital Marketing & Creative Content',
    keyword: 'marketing',
    items: [
      ['التسويق بالذكاء الاصطناعي: خارطة الطريق.', 'AI Marketing: The Roadmap'],
      ['هندسة الأوامر (Prompts) للمسوقين وصناع المحتوى.', 'Prompt Engineering for Marketers and Content Creators'],
      ['صناعة المحتوى المكتوب (Copywriting) بذكاء.', 'Smart Copywriting'],
      ['تصميم الصور الاحترافية (Midjourney & DALL-E).', 'Professional Image Design (Midjourney & DALL-E)'],
      ['إنتاج الفيديو التسويقي بالذكاء الاصطناعي.', 'AI Marketing Video Production'],
      ['إدارة حملات التواصل الاجتماعي المؤتمتة.', 'Automated Social Media Campaign Management'],
      ['تحسين محركات البحث (SEO) عبر أدوات AI.', 'SEO Optimization via AI Tools'],
      ['بناء العلامة التجارية الشخصية (Personal Branding).', 'Personal Branding'],
      ['تحليل سلوك المستهلك وتوقع الرغبات.', 'Consumer Behavior Analysis and Predicting Desires'],
      ['تصميم الشعارات والهويات البصرية الذكية.', 'Smart Logo and Visual Identity Design'],
      ['صناعة البودكاست وتعديل الصوت بالذكاء الاصطناعي.', 'Podcast Creation and AI Audio Editing'],
      ['كتابة سيناريوهات الفيديوهات التسويقية.', 'Writing Marketing Video Scripts'],
      ['إطلاق الإعلانات الممولة وتحسين نتائجها آلياً.', 'Launching Sponsored Ads and Automated Optimization'],
      ['فن الـ Storytelling في المحتوى الرقمي.', 'Art of Storytelling in Digital Content'],
      ['البريد الإلكتروني التسويقي والردود الذكية.', 'Marketing Email and Smart Replies'],
      ['بناء المساعدين الافتراضيين لخدمة العملاء.', 'Building Virtual Assistants for Customer Service'],
      ['تحليل البيانات التسويقية (Google Analytics 4 & AI).', 'Marketing Data Analysis (GA4 & AI)'],
      ['تصميم المواقع التعريفية (Landing Pages) بالذكاء الاصطناعي.', 'Designing Landing Pages with AI'],
      ['صناعة الشخصيات الافتراضية (Digital Avatars).', 'Digital Avatars Creation'],
      ['التسويق عبر المؤثرين الافتراضيين.', 'Marketing via Virtual Influencers'],
      ['استراتيجيات الانتشار الفيروسي للمحتوى.', 'Viral Content Strategies'],
      ['إدارة السمعة الرقمية ومراقبة العلامة التجارية.', 'Digital Reputation Management and Brand Monitoring'],
      ['تصميم الإعلانات الصورية لوسائل التواصل.', 'Designing Visual Ads for Social Media'],
      ['تحويل النصوص إلى تعليق صوتي احترافي (VO).', 'Converting Text to Professional Voiceover (VO)'],
      ['تنظيم الفعاليات والمؤتمرات الافتراضية الذكية.', 'Organizing Smart Virtual Events and Conferences'],
      ['مهارات البيع والإقناع بمساعدة الذكاء الاصطناعي.', 'Sales and Persuasion Skills with AI Help'],
      ['تحليل تريندات السوق العالمية لحظياً.', 'Real-time Global Market Trend Analysis'],
      ['أتمتة خدمة ما بعد البيع.', 'After-Sales Service Automation'],
      ['كتابة المحتوى الإبداعي للمدونات.', 'Creative Content Writing for Blogs'],
      ['قياس العائد على الاستثمار (ROI) في التسويق الذكي.', 'Measuring ROI in Smart Marketing']
    ]
  },
  {
    id: 'dev',
    title: 'تطوير البرمجيات والحلول التقنية (No-Code & Low-Code)',
    enTitle: 'Software Development & Tech Solutions',
    keyword: 'coding',
    items: [
      ['مقدمة في برمجة الذكاء الاصطناعي للمبتدئين.', 'Introduction to AI Programming for Beginners'],
      ['بناء التطبيقات بدون كود (No-Code Revolution).', 'Building Apps without Code (No-Code Revolution)'],
      ['تطوير تطبيقات الويب باستخدام Google AI Studio.', 'Web App Development using Google AI Studio'],
      ['الربط البرمجي عبر الـ APIs (OpenAI, Gemini).', 'API Integration (OpenAI, Gemini)'],
      ['بناء نماذج لغة خاصة لمؤسستك.', 'Building Custom Language Models for Your Organization'],
      ['تطوير تطبيقات "رفيق" (Custom GPTs).', 'Developing Custom GPTs'],
      ['مقدمة في لغة بايثون للذكاء الاصطناعي.', 'Introduction to Python for AI'],
      ['تحليل البيانات الضخمة للمبرمجين.', 'Big Data Analysis for Programmers'],
      ['أمن التطبيقات الذكية وحمايتها من الاختراق.', 'Smart App Security and Protection'],
      ['تصميم واجهات المستخدم (UI/UX) بالذكاء الاصطناعي.', 'UI/UX Design with AI'],
      ['اختبار البرمجيات الآلي (Automated Testing).', 'Automated Software Testing'],
      ['إدارة قواعد البيانات الذكية.', 'Smart Database Management'],
      ['الحوسبة السحابية (Cloud) وتطبيقات AI.', 'Cloud Computing and AI Apps'],
      ['بناء بوتات التليجرام والواتساب المتقدمة.', 'Building Advanced Telegram and WhatsApp Bots'],
      ['علم البيانات للمهندسين والمطورين.', 'Data Science for Engineers and Developers'],
      ['تعلم الآلة (Machine Learning) من الصفر.', 'Machine Learning from Scratch'],
      ['الشبكات العصبية والذكاء الاصطناعي العميق.', 'Neural Networks and Deep AI'],
      ['تطوير الألعاب باستخدام الذكاء الاصطناعي.', 'Game Development using AI'],
      ['معالجة اللغات الطبيعية (NLP) للمطورين.', 'Natural Language Processing (NLP) for Developers'],
      ['رؤية الحاسوب (Computer Vision) وتطبيقاتها.', 'Computer Vision and Its Applications'],
      ['تحسين الأكواد البرمجية (Code Refactoring) بـ AI.', 'Code Refactoring with AI'],
      ['بناء أنظمة التوصية الذكية.', 'Building Smart Recommendation Systems'],
      ['إنترنت الأشياء (IoT) والذكاء الاصطناعي.', 'Internet of Things (IoT) and AI'],
      ['تقنيات البلوكشين والذكاء الاصطناعي.', 'Blockchain and AI Technologies'],
      ['تطوير المساعدات الصوتية (Alexa & Google Assistant).', 'Voice Assistant Development (Alexa & Google Assistant)'],
      ['النشر والاستضافة (Deployment) على Vercel وRender.', 'Deployment on Vercel and Render'],
      ['إدارة الإصدارات (Git) بمساعدة الذكاء الاصطناعي.', 'Version Control (Git) with AI Help'],
      ['بناء أدوات تحليل النصوص والوثائق.', 'Building Text and Document Analysis Tools'],
      ['برمجة الروبوتات البسيطة.', 'Simple Robot Programming'],
      ['هندسة البرمجيات في عصر الذكاء الاصطناعي التوليدي.', 'Software Engineering in the Generative AI Era']
    ]
  },
  {
    id: 'res',
    title: 'مهارات البحث العلمي والأكاديمي الرقمي',
    enTitle: 'Scientific & Academic Research Skills',
    keyword: 'research',
    items: [
      ['منهجية البحث العلمي في عصر AI.', 'Scientific Research Methodology in the AI Era'],
      ['استخدام الأدوات الذكية في مراجعة الدراسات السابقة.', 'Using Smart Tools in Literature Review'],
      ['كتابة المقترحات البحثية (Research Proposals).', 'Writing Research Proposals'],
      ['إدارة المراجع والاستشهادات آلياً.', 'Automated Reference and Citation Management'],
      ['التحليل الإحصائي للبيانات باستخدام AI.', 'Statistical Data Analysis using AI'],
      ['كشف الانتحال الأدبي والأكاديمي.', 'Plagiarism Detection'],
      ['فن صياغة التساؤلات والفرضيات البحثية.', 'Art of Formulating Research Questions and Hypotheses'],
      ['ترجمة الأبحاث العلمية بدقة واحترافية.', 'Accurate and Professional Research Translation'],
      ['تصميم الاستبيانات الذكية وتحليل نتائجها.', 'Designing Smart Surveys and Analyzing Results'],
      ['مهارات النشر العلمي في المجلات العالمية.', 'Scientific Publishing Skills in Global Journals'],
      ['تلخيص الكتب والأطروحات الضخمة.', 'Summarizing Large Books and Theses'],
      ['بناء الخرائط الذهنية البحثية.', 'Building Research Mind Maps'],
      ['استخدام نماذج اللغة في تدقيق اللغة العربية.', 'Using Language Models for Arabic Proofreading'],
      ['تحليل المخطوطات والوثائق التاريخية بالـ AI.', 'Analyzing Manuscripts and Historical Documents with AI'],
      ['تنظيم المكتبة الرقمية الشخصية للباحث.', 'Organizing the Researcher\'s Personal Digital Library'],
      ['مهارات العرض والمناقشة للأطروحات العلمية.', 'Presentation and Discussion Skills for Theses'],
      ['تحويل البحث إلى محتوى رقمي (مقال/فيديو).', 'Converting Research into Digital Content (Article/Video)'],
      ['البحث عن المصادر والمراجع النادرة.', 'Searching for Rare Sources and References'],
      ['أخلاقيات الاقتباس العلمي الرقمي.', 'Ethics of Digital Scientific Citation'],
      ['تصميم الجداول والرسوم البيانية العلمية.', 'Designing Scientific Tables and Graphs'],
      ['مهارات القراءة السريعة والتحليل الذكي للنصوص.', 'Speed Reading and Smart Text Analysis Skills'],
      ['توثيق المراجع بنظام APA وMLA آلياً.', 'Automated APA and MLA Citation'],
      ['بناء شبكة علاقات أكاديمية عبر الإنترنت.', 'Building an Academic Network Online'],
      ['التفكير المنظومي في البحث العلمي.', 'Systemic Thinking in Scientific Research'],
      ['استخدام الـ AI في العلوم الإنسانية والاجتماعية.', 'Using AI in Humanities and Social Sciences'],
      ['مهارات النقد العلمي للأبحاث المنشورة.', 'Scientific Criticism Skills for Published Research'],
      ['كتابة السيرة الذاتية الأكاديمية (Academic CV).', 'Writing an Academic CV'],
      ['البحث عن المنح الدراسية والتمويل البحثي.', 'Searching for Scholarships and Research Funding'],
      ['أتمتة الملاحظات الميدانية في البحوث النوعية.', 'Automating Field Notes in Qualitative Research'],
      ['مستقبل البحث العلمي في ظل الذكاء الاصطناعي.', 'The Future of Scientific Research under AI']
    ]
  },
  {
    id: 'youth',
    title: 'الطلاب والشباب (مهارات المستقبل)',
    enTitle: 'Students & Youth (Future Skills)',
    keyword: 'youth',
    items: [
      ['دليلك الشامل لاستخدام الذكاء الاصطناعي في الدراسة.', 'Your Comprehensive Guide to Using AI in Study'],
      ['كيف تذاكر بذكاء وليس بجهد؟', 'How to Study Smartly, Not Hardly?'],
      ['مهارات التعلم الذاتي عبر الإنترنت.', 'Self-Learning Skills Online'],
      ['التخطيط للمستقبل المهني والجامعي.', 'Career and University Future Planning'],
      ['تعلم اللغات الأجنبية مع المعلم الافتراضي.', 'Learning Foreign Languages with a Virtual Teacher'],
      ['الذكاء الاصطناعي لتطوير مهارات الكتابة الإبداعية.', 'AI for Developing Creative Writing Skills'],
      ['أساسيات البرمجة للطلاب (بدون تعقيد).', 'Programming Basics for Students (Simplified)'],
      ['صناعة المحتوى الهادف على تيك توك واليوتيوب.', 'Creating Purposeful Content on TikTok and YouTube'],
      ['إدارة الوقت والتركيز في عصر المشتتات.', 'Time Management and Focus in the Era of Distractions'],
      ['التحضير للاختبارات الدولية (TOEFL/IELTS) بـ AI.', 'Preparing for International Tests (TOEFL/IELTS) with AI'],
      ['مهارات حل المشكلات والتفكير المنطقي.', 'Problem Solving and Logical Thinking Skills'],
      ['بناء مشروعك الصغير الأول باستخدام AI.', 'Building Your First Small Project using AI'],
      ['مهارات العمل الحر (Freelancing) للطلاب.', 'Freelancing Skills for Students'],
      ['الثقافة المالية والادخار للشباب.', 'Financial Literacy and Saving for Youth'],
      ['الذكاء العاطفي والاجتماعي في العالم الرقمي.', 'Emotional and Social Intelligence in the Digital World'],
      ['فن الإلقاء والخطابة أمام الجمهور.', 'Art of Public Speaking and Oratory'],
      ['الأمن الرقمي وحماية الخصوصية الشخصية.', 'Digital Security and Personal Privacy Protection'],
      ['تصميم العروض التقديمية المدرسية المبهرة.', 'Designing Impressive School Presentations'],
      ['العمل التطوعي الرقمي.', 'Digital Volunteer Work'],
      ['مهارات القيادة الشبابية.', 'Youth Leadership Skills'],
      ['اكتشاف المواهب وتطويرها بالوسائل الذكية.', 'Discovering and Developing Talents with Smart Means'],
      ['استخدام الخرائط الذهنية في المراجعة النهائية.', 'Using Mind Maps in Final Revision'],
      ['الصحة النفسية والتعامل مع ضغوط الدراسة.', 'Mental Health and Dealing with Study Pressure'],
      ['القراءة الذكية والتلخيص للكتب الخارجية.', 'Smart Reading and Summarizing External Books'],
      ['بناء الهوية الرقمية الإيجابية.', 'Building a Positive Digital Identity'],
      ['أساسيات التصميم الجرافيكي للطلاب.', 'Graphic Design Basics for Students'],
      ['البحث عن التدريب الصيفي والفرص المهنية.', 'Searching for Summer Internships and Career Opportunities'],
      ['مهارات العمل ضمن فريق افتراضي.', 'Virtual Teamwork Skills'],
      ['الذكاء الاصطناعي في خدمة المجتمع.', 'AI in Service of the Community'],
      ['كيف تصبح متعلماً مدى الحياة (Life-long Learner).', 'How to Become a Life-long Learner']
    ]
  },
  {
    id: 'arabic',
    title: 'الذكاء الاصطناعي في اللغة العربية والخط العربي',
    enTitle: 'AI in Arabic Language & Calligraphy',
    keyword: 'calligraphy',
    items: [
      ['معالجة اللغة العربية آلياً (Arabic NLP).', 'Arabic Natural Language Processing (NLP)'],
      ['بناء نماذج لغوية متخصصة في النصوص العربية.', 'Building Specialized Language Models for Arabic Texts'],
      ['التدقيق اللغوي والنحوي باستخدام الذكاء الاصطناعي.', 'Linguistic and Grammatical Proofreading using AI'],
      ['فن الخط العربي الرقمي (Naskh, Ruq\'ah).', 'Digital Arabic Calligraphy Art (Naskh, Ruq\'ah)'],
      ['تصميم الخطوط الطباعية باستخدام AI.', 'Typographic Font Design using AI'],
      ['تحليل النصوص الأدبية والشعرية بذكاء.', 'Smart Analysis of Literary and Poetic Texts'],
      ['ترجمة المصطلحات التقنية إلى العربية بدقة.', 'Accurate Translation of Tech Terms into Arabic'],
      ['بناء تطبيقات لتعليم اللغة العربية لغير الناطقين بها.', 'Building Apps for Teaching Arabic to Non-Native Speakers'],
      ['رقمنة المخطوطات العربية القديمة.', 'Digitizing Ancient Arabic Manuscripts'],
      ['الذكاء الاصطناعي في خدمة القرآن الكريم وعلومه.', 'AI in Service of the Holy Quran and Its Sciences'],
      ['صناعة المحتوى العربي الثقافي المتطور.', 'Creating Advanced Arabic Cultural Content'],
      ['مهارات الكتابة الأكاديمية باللغة العربية.', 'Academic Writing Skills in Arabic'],
      ['فن الرسم بالكلمات (Typography) والذكاء الاصطناعي.', 'Typography Art and AI'],
      ['تحويل الصوت العربي إلى نص (Speech-to-Text).', 'Arabic Speech-to-Text Conversion'],
      ['تطوير أنظمة التحدث بالعربية الفصحى.', 'Developing Modern Standard Arabic Speech Systems'],
      ['البحث في القواميس والمعاجم العربية الرقمية.', 'Searching Digital Arabic Dictionaries and Lexicons'],
      ['تلخيص المقالات العربية الطويلة.', 'Summarizing Long Arabic Articles'],
      ['إحياء التراث العربي عبر التقنيات الذكية.', 'Reviving Arabic Heritage via Smart Technologies'],
      ['تصميم الكتب والمجلات العربية آلياً.', 'Automated Arabic Book and Magazine Design'],
      ['تحليل المحتوى العربي على منصات التواصل.', 'Analyzing Arabic Content on Social Platforms'],
      ['الذكاء الاصطناعي في الترجمة الفورية للعربية.', 'AI in Instant Translation for Arabic'],
      ['صناعة الإعلانات باللغة العربية الفصحى والعامية.', 'Creating Ads in MSA and Colloquial Arabic'],
      ['مهارات الخطابة باللغة العربية بمساعدة AI.', 'Arabic Public Speaking Skills with AI Help'],
      ['التصحيف الرقمي وتحقيق النصوص.', 'Digital Editing and Text Verification'],
      ['بناء الألعاب اللغوية العربية للطلاب.', 'Building Arabic Linguistic Games for Students'],
      ['تعريب البرمجيات والأدوات العالمية.', 'Arabization of Global Software and Tools'],
      ['حماية اللغة العربية في الفضاء الرقمي.', 'Protecting the Arabic Language in Digital Space'],
      ['الذكاء الاصطناعي وتدريس البلاغة والنقد.', 'AI and Teaching Rhetoric and Criticism'],
      ['تقنيات التعرف على الكتابة اليدوية العربية.', 'Arabic Handwriting Recognition Technologies'],
      ['مستقبل اللغة العربية في ظل الذكاء الاصطناعي.', 'The Future of Arabic Language under AI']
    ]
  },
  {
    id: 'life',
    title: 'المهارات الحياتية والإنتاجية الشخصية',
    enTitle: 'Life Skills & Personal Productivity',
    keyword: 'productivity',
    items: [
      ['تنظيم الحياة الشخصية باستخدام مساعدي AI.', 'Organizing Personal Life using AI Assistants'],
      ['بناء نظام الإنتاجية القصوى (Second Brain).', 'Building a Maximum Productivity System (Second Brain)'],
      ['مهارات التركيز العميق في عصر التنبيهات.', 'Deep Focus Skills in the Era of Notifications'],
      ['التخطيط المالي الشخصي والاستثمار الذكي.', 'Personal Financial Planning and Smart Investment'],
      ['الصحة واللياقة البدنية بمساعدة تطبيقات AI.', 'Health and Fitness with AI Apps'],
      ['تنظيم الوجبات الغذائية والطبخ بذكاء.', 'Smart Meal Planning and Cooking'],
      ['مهارات القراءة السريعة والاستيعاب القوي.', 'Speed Reading and Strong Comprehension Skills'],
      ['تعلم الهوايات الجديدة (رسم، عزف، لغات) بـ AI.', 'Learning New Hobbies with AI'],
      ['إدارة التوتر والرفاهية النفسية الرقمية.', 'Stress Management and Digital Mental Wellbeing'],
      ['تنظيم المهام اليومية (To-Do Lists) آلياً.', 'Automated Daily Task Organization (To-Do Lists)'],
      ['فن التواصل الفعال والذكاء الاجتماعي.', 'Art of Effective Communication and Social Intelligence'],
      ['التخطيط للسفر والرحلات باستخدام AI.', 'Travel Planning using AI'],
      ['مهارات التفاوض في الحياة اليومية.', 'Negotiation Skills in Daily Life'],
      ['الذكاء الاصطناعي في الديكور وتصميم المنزل.', 'AI in Decor and Home Design'],
      ['حماية العائلة والأطفال في الفضاء الرقمي.', 'Protecting Family and Children in Digital Space'],
      ['البحث عن الوظائف وتطوير السيرة الذاتية (Resume).', 'Job Searching and Resume Development'],
      ['الاستعداد للمقابلات الشخصية (Mock Interviews).', 'Preparing for Interviews (Mock Interviews)'],
      ['مهارات العمل عن بُعد من المنزل.', 'Remote Work Skills from Home'],
      ['التوازن بين الحياة والعمل في العصر الرقمي.', 'Work-Life Balance in the Digital Age'],
      ['التفكير الإبداعي وحل المشكلات الشخصية.', 'Creative Thinking and Personal Problem Solving'],
      ['أتمتة المنزل الذكي (Smart Home) للمبتدئين.', 'Smart Home Automation for Beginners'],
      ['التصوير الفوتوغرافي ومعالجة الصور بـ AI.', 'Photography and AI Image Processing'],
      ['كتابة اليوميات والمذكرات الشخصية بذكاء.', 'Smart Journaling and Personal Memoirs'],
      ['مهارات التسوق الذكي وتوفير المال.', 'Smart Shopping and Money Saving Skills'],
      ['تنظيم الملفات والصور الرقمية للأبد.', 'Organizing Digital Files and Photos Forever'],
      ['تعلم الإسعافات الأولية عبر المحاكاة الذكية.', 'Learning First Aid via Smart Simulation'],
      ['تنمية الروح القيادية الشخصية.', 'Developing Personal Leadership Spirit'],
      ['فن الاتيكيت الرقمي والتواصل المهني.', 'Digital Etiquette and Professional Communication'],
      ['إدارة الأزمات الشخصية والتعافي.', 'Personal Crisis Management and Recovery'],
      ['فلسفة الحياة في عصر الآلة.', 'Philosophy of Life in the Machine Era']
    ]
  },
  {
    id: 'health',
    title: 'الذكاء الاصطناعي في القطاع الصحي والاجتماعي',
    enTitle: 'AI in Health & Social Sector',
    keyword: 'health',
    items: [
      ['مقدمة في الذكاء الاصطناعي الصحي.', 'Introduction to Health AI'],
      ['تطبيقات AI في التشخيص الطبي الأولي.', 'AI Apps in Initial Medical Diagnosis'],
      ['إدارة السجلات الصحية الإلكترونية.', 'Electronic Health Records Management'],
      ['الذكاء الاصطناعي في الصيدلة وصناعة الأدوية.', 'AI in Pharmacy and Drug Industry'],
      ['التمريض الرقمي والمتابعة الذكية للمرضى.', 'Digital Nursing and Smart Patient Monitoring'],
      ['الصحة النفسية وتطبيقات الدعم المعنوي.', 'Mental Health and Moral Support Apps'],
      ['تحليل البيانات الطبية والبحث الصحي.', 'Medical Data Analysis and Health Research'],
      ['الروبوتات في العمليات الجراحية (نظرة عامة).', 'Robotics in Surgery (Overview)'],
      ['الأخلاقيات الطبية في عصر الذكاء الاصطناعي.', 'Medical Ethics in the AI Era'],
      ['الابتكار في الرعاية الصحية المنزلية.', 'Innovation in Home Healthcare'],
      ['التوعية المجتمعية عبر المنصات الذكية.', 'Community Awareness via Smart Platforms'],
      ['العمل الاجتماعي الرقمي ودعم الفئات الضعيفة.', 'Digital Social Work and Supporting Vulnerable Groups'],
      ['التنبؤ بالأوبئة والأمراض المعدية.', 'Predicting Epidemics and Infectious Diseases'],
      ['تقنيات المساعدة لكبار السن.', 'Assistive Technologies for the Elderly'],
      ['الذكاء الاصطناعي في الإغاثة والأزمات الإنسانية.', 'AI in Relief and Humanitarian Crises'],
      ['إدارة المؤسسات غير الربحية بذكاء.', 'Smart Non-Profit Management'],
      ['تحليل الظواهر الاجتماعية باستخدام AI.', 'Social Phenomena Analysis using AI'],
      ['تصميم الحملات الصحية التوعوية.', 'Designing Health Awareness Campaigns'],
      ['مهارات الإرشاد الأسري الرقمي.', 'Digital Family Counseling Skills'],
      ['الأمن الغذائي وتطبيقات الزراعة الذكية.', 'Food Security and Smart Agriculture Apps'],
      ['الاستدامة البيئية والذكاء الاصطناعي.', 'Environmental Sustainability and AI'],
      ['التطوع الرقمي في المبادرات الاجتماعية.', 'Digital Volunteering in Social Initiatives'],
      ['تحسين جودة الحياة في المدن الذكية.', 'Improving Quality of Life in Smart Cities'],
      ['حقوق الإنسان في ظل خوارزميات التمييز.', 'Human Rights under Discriminatory Algorithms'],
      ['مكافحة الفقر عبر حلول تقنية مبتكرة.', 'Fighting Poverty via Innovative Tech Solutions'],
      ['الذكاء الاصطناعي في التعليم المجتمعي.', 'AI in Community Education'],
      ['تمكين المرأة في القطاع التقني.', 'Empowering Women in the Tech Sector'],
      ['إدارة الأوقاف والمشاريع الخيرية ذكياً.', 'Smart Endowment and Charity Project Management'],
      ['بناء المجتمعات الرقمية الآمنة.', 'Building Safe Digital Communities'],
      ['مستقبل العمل الاجتماعي في عصر الذكاء الاصطناعي.', 'The Future of Social Work in the AI Era']
    ]
  },
  {
    id: 'sec',
    title: 'الأمن السيبراني والقانون وأخلاقيات AI',
    enTitle: 'Cybersecurity, Law & AI Ethics',
    keyword: 'security',
    items: [
      ['أساسيات الأمن السيبراني للجميع.', 'Cybersecurity Basics for Everyone'],
      ['كيف يحميك الذكاء الاصطناعي من الاحتيال؟', 'How AI Protects You from Fraud?'],
      ['التزييف العميق (Deepfake): كشفه والوقاية منه.', 'Deepfake: Detection and Prevention'],
      ['حماية البيانات الشخصية والخصوصية الرقمية.', 'Personal Data Protection and Digital Privacy'],
      ['أمن المؤسسات في عصر الذكاء الاصطناعي التوليدي.', 'Institutional Security in the Generative AI Era'],
      ['الهجمات الإلكترونية المدعومة بـ AI وكيفية صدها.', 'AI-Powered Cyber Attacks and Defense'],
      ['القوانين المنظمة للذكاء الاصطناعي حول العالم.', 'Laws Organizing AI Around the World'],
      ['الملكية الفكرية للمحتوى المولد بالذكاء الاصطناعي.', 'Intellectual Property of AI-Generated Content'],
      ['أخلاقيات البرمجة والخوارزميات غير المتحيزة.', 'Programming Ethics and Unbiased Algorithms'],
      ['الجرائم المستحدثة في عصر التكنولوجيا.', 'Modern Crimes in the Tech Era'],
      ['الطب الشرعي الرقمي والتحقيق في الجرائم.', 'Digital Forensics and Crime Investigation'],
      ['تأمين المساعدات المنزلية والأجهزة الذكية.', 'Securing Home Assistants and Smart Devices'],
      ['مهارات التشفير وحماية المراسلات.', 'Encryption Skills and Message Protection'],
      ['التعامل القانوني مع عقود البرمجيات الذكية.', 'Legal Handling of Smart Software Contracts'],
      ['المسؤولية المدنية والجنائية للروبوتات.', 'Civil and Criminal Liability of Robots'],
      ['التوعية الأمنية للموظفين (Security Awareness).', 'Security Awareness for Employees'],
      ['حماية الأطفال من المحتوى غير اللائق آلياً.', 'Automated Protection of Children from Inappropriate Content'],
      ['التدقيق الأمني على أنظمة الذكاء الاصطناعي.', 'Security Auditing of AI Systems'],
      ['المواطنة الرقمية الصالحة.', 'Good Digital Citizenship'],
      ['الحوكمة الرقمية والامتثال القانوني.', 'Digital Governance and Legal Compliance'],
      ['إدارة الهوية الرقمية والوصول (IAM).', 'Identity and Access Management (IAM)'],
      ['القرصنة الأخلاقية (Ethical Hacking) بـ AI.', 'Ethical Hacking with AI'],
      ['حماية الأسرار التجارية في عصر الدردشة الآلية.', 'Protecting Trade Secrets in the Chatbot Era'],
      ['التوقيع الإلكتروني والتوثيق الرقمي.', 'Electronic Signature and Digital Documentation'],
      ['سياسات الاستخدام العادل للتكنولوجيا في العمل.', 'Fair Tech Use Policies at Work'],
      ['استرداد البيانات والتعافي من الكوارث الرقمية.', 'Data Recovery and Digital Disaster Recovery'],
      ['التهديدات السيبرانية في القطاع التعليمي.', 'Cyber Threats in the Educational Sector'],
      ['القانون الدولي والحروب السيبرانية.', 'International Law and Cyber Wars'],
      ['بناء استراتيجية وطنية للأمن الذكي.', 'Building a National Strategy for Smart Security'],
      ['الإنسان ضد الآلة: التحديات الحقوقية المستقبلية.', 'Human vs. Machine: Future Rights Challenges']
    ]
  }
];

async function main() {
  console.log('Adding AI Hub to Firestore...');
  
  const hubItems = [];
  const groups = [];
  let itemCounter = 1;
  
  const techImages = [
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e', // Robot
    'https://images.unsplash.com/photo-1518770660439-4636190af475', // Circuit
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b', // Code/Cyber
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa', // Network
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1', // Laptop
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', // Robot arm
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31', // Lab
    'https://images.unsplash.com/photo-1531482615713-2afd69097998', // Code
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31', // Server
    'https://images.unsplash.com/photo-1677442136019-21780ecad995'  // AI Abstract
  ];

  for (let sIdx = 0; sIdx < sections.length; sIdx++) {
    const section = sections[sIdx];
    groups.push({
      id: section.id,
      title: { ar: section.title, en: section.enTitle }
    });

    for (let iIdx = 0; iIdx < section.items.length; iIdx++) {
      const [arTitle, enTitle] = section.items[iIdx];
      const imageIndex = (itemCounter) % techImages.length;
      
      hubItems.push({
        id: `ai-topic-${itemCounter}`,
        groupId: section.id,
        title: { ar: arTitle, en: enTitle },
        content: { ar: `محتوى تفصيلي حول: ${arTitle}`, en: `Detailed content about: ${enTitle}` },
        image: `${techImages[imageIndex]}?auto=format&fit=crop&q=80&w=800`
      });
      itemCounter++;
    }
  }

  const aiHub = {
    slug: 'ai-companion',
    category: 'hubs',
    title: { ar: 'رفيق الذكاء الاصطناعي', en: 'AI Companion' },
    description: { ar: 'دليلك الشامل لتوظيف تقنيات الذكاء الاصطناعي في مختلف مجالات الحياة والعمل', en: 'Your comprehensive guide to employing AI technologies in various fields of life and work' },
    icon: 'Cpu',
    order: -1,
    groups: groups,
    items: hubItems,
    updatedAt: new Date().toISOString()
  };

  const q = query(collection(db, 'pages'), where('slug', '==', 'ai-companion'));
  const snapshot = await getDocs(q);
  
  if (!snapshot.empty) {
    console.log('AI Hub already exists. Updating...');
    const docRef = doc(db, 'pages', snapshot.docs[0].id);
    await updateDoc(docRef, aiHub);
  } else {
    await addDoc(collection(db, 'pages'), aiHub);
  }
  console.log('\n✅ AI Hub added/updated successfully with 300 items and 10 groups!');
}

main().catch(console.error);


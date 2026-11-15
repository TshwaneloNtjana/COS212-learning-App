<div align="center">

# 🌳 MainFrame

### An interactive pre-lecture tutor for binary search trees and breadth-first search

*Built for COS 212 – Data Structures and Algorithms, University of Pretoria*

![Nuxt](https://img.shields.io/badge/Nuxt-4-00DC82?logo=nuxt&logoColor=white)
![Vue](https://img.shields.io/badge/Vue-3-4FC08D?logo=vuedotjs&logoColor=white)
![Vuetify](https://img.shields.io/badge/Vuetify-3-1867C0?logo=vuetify&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Status](https://img.shields.io/badge/status-prototype-F2B807)

[**Live demo**](#) · [Features](#-features) · [Getting started](#-getting-started) · [Project structure](#-project-structure) · [Team](#-team)

</div>

---

## 📖 About

**MainFrame** gives COS 212 students a tutor-style session *before* their lecture on trees. It assumes no prior knowledge. Students learn what a tree and a binary search tree (BST) are, search a BST themselves, then step through **breadth-first search (BFS)** and watch the queue change at every step.

Each lesson ends with practice problems and a short practice quiz. Every quiz attempt is saved, so students can review their answers or retake a quiz. Anything still unclear goes into their notes to bring to the lecture.

The project was built for the **COS 750 – Educational Software Development** examination, 2026.

<!-- Replace with a real screenshot or GIF: save it to docs/screenshots/ and update the path -->
<div align="center">
  <img src="docs/screenshots/home.png" alt="MainFrame dashboard showing the next lesson, progress and recent quiz attempts" width="800">
</div>

## ✨ Features

The app has five sections, all reachable from the side menu.

| | Section | What the student does |
| --- | --- | --- |
| 🏠 | **Dashboard** | Sees the next lesson to study, lessons completed, quiz scores, recent attempts and open notes |
| 📚 | **Lessons** | Works through three lessons: *What is a tree?*, *Binary search trees* and *Breadth-first search (BFS)* |
| ✅ | **Quizzes** | Sees every quiz in one place, filters them, reviews past attempts question by question, and retakes any quiz |
| 📋 | **Summary** | Reads the key points and terms from every lesson, plus a step-by-step BFS cheat sheet; can print it or save it as a PDF |
| 📝 | **Notes** | Writes down questions for class, tags them by lesson, ticks them off once answered, and copies or downloads them |

**Inside each lesson:**

- **Theory** in short sections with diagrams, tips and real-world examples.
- **BST search playground:** type a value and see every comparison (go left, go right, found) highlighted on the tree.
- **BFS stepper:** step forwards and backwards through breadth-first search, with the live queue, the visit order and the matching line of pseudocode.
- **Practice problems:** graded Basic, Easy and Medium; students write an answer, then reveal the solution with the tree drawn.
- **Practice quiz:** multiple-choice and "tap the nodes in order" questions, with an explanation for every answer. The pass mark is 70%.
- **Videos and resources:** YouTube explainers, coding problems on GeeksforGeeks and further reading.

A **final check** across all three lessons unlocks once every lesson's practice quiz has been attempted.

**Accessibility:** works on phones from 360 px wide, supports keyboard navigation and screen-reader labels, and shows tree node states with shape as well as colour. **Privacy:** no sign-in and no personal data collected; progress and notes stay in the browser's local storage.

## 🎓 Curriculum alignment

MainFrame covers these core topics from the ACM/IEEE **CS2023** Algorithmic Foundations knowledge area:

- **AL-Foundational 9:** Trees (binary, n-ary and search trees)
- **AL-Foundational 11c:** Breadth-first tree search
- **AL-Complexity:** How tree balance affects the efficiency of BST operations

## 🛠 Tech stack

| Layer | Tools |
| --- | --- |
| Framework | [Nuxt 4](https://nuxt.com) (SPA mode, `ssr: false`) · [Vue 3](https://vuejs.org) · TypeScript |
| UI components | [Vuetify 3](https://vuetifyjs.com) via `vuetify-nuxt-module` · Material Design Icons |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) for layout and custom visuals (tree, queue, pseudocode) |
| Content | Lessons and quizzes stored as JSON in `app/data/` |
| State | Nuxt `useState` + `localStorage` (`useProgress` composable) |
| Hosting | GitHub Pages (static files from `npm run generate`) |

## 🚀 Getting started

**Requirements:** [Node.js](https://nodejs.org) 20 or later (check with `node -v`).

```bash
# 1. Clone the repository
git clone https://github.com/TshwaneloNtjana/COS212-learning-App.git
cd COS212-learning-App

# 2. Install dependencies
npm install

# 3. Start the dev server at http://localhost:3000
npm run dev
```

### Other scripts

| Command | What it does |
| --- | --- |
| `npm run build` | Builds the app for production |
| `npm run generate` | Builds a static site for GitHub Pages (output in `.output/public`) |
| `npm run preview` | Previews the production build locally |
| `npx nuxi typecheck` | Checks the types of every `.ts` and `.vue` file |

## 📁 Project structure

```
app/
├── app.vue                     # Root: wraps every page in the layout
├── assets/css/main.css         # Tailwind imports and MainFrame colours
├── components/
│   ├── TreeDiagram.vue         # Draws any BST; shows current / waiting / visited nodes
│   ├── TraversalStepper.vue    # BFS stepper: queue, visit order, pseudocode
│   ├── BstSearch.vue           # BST search playground
│   ├── LessonBlock.vue         # Renders one content block from lessons.json
│   ├── PracticeProblem.vue     # Self-check problem with a reveal-answer button
│   ├── QuizRunner.vue          # Shows a quiz, checks answers, saves the attempt
│   ├── VideoCard.vue           # YouTube video that loads only when pressed
│   └── ResourceList.vue        # External links (practice problems, further reading)
├── composables/
│   ├── useContent.ts           # Loads lessons and quizzes from the JSON files
│   └── useProgress.ts          # Lessons visited, quiz attempts and notes (saved locally)
├── data/
│   ├── lessons.json            # 3 lessons: sections, problems, videos, resources, summary
│   └── quizzes.json            # 5 quizzes, 22 questions
├── layouts/
│   └── default.vue             # Yellow app bar and side menu
├── pages/
│   ├── index.vue               # Dashboard
│   ├── lessons/
│   │   ├── index.vue           # Redirects to the next unfinished lesson
│   │   └── [slug].vue          # One lesson: /lessons/trees, /lessons/bst, /lessons/bfs
│   ├── quizzes/
│   │   ├── index.vue           # All quizzes, attempt history and review
│   │   └── [id].vue            # Take or retake one quiz (e.g. /quizzes/final)
│   ├── summary.vue             # Summary of all lessons + BFS cheat sheet
│   └── notes.vue               # Questions for class
├── types/
│   └── content.ts              # TypeScript types for lessons, quizzes and problems
└── utils/
    ├── bst.ts                  # Build, lay out and search a BST; trace BFS step by step
    └── format.ts               # Date and time formatting
nuxt.config.ts                  # Vuetify theme, Tailwind plugin, SPA mode
```

### Adding or changing content

Lessons and quizzes are plain JSON, so content can change without touching any Vue code:

- **New lesson section, problem, video or link:** edit `app/data/lessons.json`.
- **New quiz question:** edit `app/data/quizzes.json`. For "tap in order" questions, the answer must be the tree's BFS order.

Tree answers (BFS orders, search paths, heights) are calculated by `app/utils/bst.ts`, so the stepper, problems, quizzes and cheat sheet always agree with the tree.

## 📄 Documentation

The design rationale behind MainFrame is documented in two companion documents, submitted on ClickUP:

- **Software Engineering document:** Agile Scrum approach, requirements, architecture, implementation and testing
- **Instructional Design document:** instructional design model, learning objectives, learning theories, motivation and assessment design

## 👥 Team

**Group:** MainFrame

| Name | Role | GitHub |
| --- | --- | --- |
| Melisa Ledwaba | Developer | [@Melissa941](https://github.com/Melissa941) |
| Tamsanqa Thwala | Developer | [@Tamsanqa743](https://github.com/Tamsanqa743) |
| Matlotlo Maphalela | Developer | [@mjmaphalela](https://github.com/mjmaphalela) |
| Lesedi Lebopa | Developer | [@username](https://github.com/) |
| Tshwanelo Ntjana | Developer | [@TshwaneloNtjana](https://github.com/TshwaneloNtjana) |

## 🤖 Use of generative AI

Generative AI (Claude, by Anthropic) assisted with planning documents, UI designs and parts of the code. All AI output was reviewed and edited by the team. Prompts and details are listed in the Instructional Design document, as the COS 750 specification requires.

## 🙏 Learning resources

Videos and practice problems linked inside the lessons belong to their creators: Hello Byte, Michael Sambol, Reducible and ByteQuest on YouTube, and [GeeksforGeeks](https://www.geeksforgeeks.org/dsa/binary-search-tree-data-structure/).

## 📜 Licence

Created for academic purposes at the University of Pretoria, Department of Computer Science. Not for commercial use.

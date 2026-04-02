// CHILD APP INTEGRATION EXAMPLES
//
// EmotionCheck.tsx
// import { saveEmotionCheck } from '../lib/parentSync';
// await saveEmotionCheck('child-1', selectedEmotion, selectedReason, severity);
//
// Learning / Game completion
// import { logProgress } from '../lib/parentSync';
// await logProgress({
//   childId: 'child-1',
//   category: 'learning',
//   activity: 'math',
//   score: correctAnswers,
//   total: totalQuestions,
//   level: selectedLevel,
//   details: 'Math session complete',
// });
//
// Level locking
// import { useParentControls } from '../hooks/useParentControls';
// const { controls } = useParentControls('child-1');
// const maxMathLevel = controls.mathMaxLevel;

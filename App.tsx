import React, { useState, useEffect } from 'react';
import { router } from './routes';
import { App as CapacitorApp } from '@capacitor/app';
import { ProfilePhoto } from './components/ProfilePhoto';
import { RouterProvider, useNavigate } from 'react-router';
import { TaskCard } from './components/TaskCard';
import { AppIconImage, Home } from './components/CustomIcon';
import { remoteImages } from '../assets/imageSources';
import { LoadingScreen } from './components/LoadingScreen';
import { useParentControls } from './hooks/useParentControls';
import {
  pauseEverything,
  pauseForBackground,
  resumeAfterBackground,
  setGlobalAudioMuted,
} from './utils/audioManager';
import { setEffectsVolume, setMusicVolume, setSoundMuted } from './utils/sound';

function LockOverlay({ reason }: { reason?: string }) {
  return (
    <div className="fixed inset-0 z-[100] bg-gradient-to-b from-red-100 via-orange-100 to-yellow-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-[2rem] bg-white shadow-2xl p-8 text-center border-4 border-red-200">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-4xl font-bold text-red-700 mb-3">AutiApp Locked</h1>
        <p className="text-xl text-gray-700 mb-4">A parent has temporarily paused the app.</p>
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-lg text-red-800">
          {reason || 'Please ask your parent to unlock the app.'}
        </div>
      </div>
    </div>
  );
}

function getLinkedChildId() {
  return (
    localStorage.getItem('linkedChildId') ||
    localStorage.getItem('childId') ||
    localStorage.getItem('autiappChildId') ||
    ''
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [linkedChildId, setLinkedChildId] = useState(getLinkedChildId());
  const { controls } = useParentControls(linkedChildId || undefined);

  useEffect(() => {
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, 1800);

    const removeTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    const syncLinkedChild = () => setLinkedChildId(getLinkedChildId());
    window.addEventListener('storage', syncLinkedChild);
    window.addEventListener('focus', syncLinkedChild);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
      window.removeEventListener('storage', syncLinkedChild);
      window.removeEventListener('focus', syncLinkedChild);
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        pauseForBackground();
      } else {
        resumeAfterBackground();
      }
    };

    const handleBlur = () => {
      pauseForBackground();
    };

    const handleFocus = () => {
      resumeAfterBackground();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    let appStateCleanup: (() => void) | undefined;

    CapacitorApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        resumeAfterBackground();
      } else {
        pauseForBackground();
      }
    }).then((listener) => {
      appStateCleanup = () => {
        listener.remove();
      };
    }).catch(() => {
      // ignore if unavailable
    });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      appStateCleanup?.();
    };
  }, []);

  useEffect(() => {
    const stopOnPageHide = () => {
      pauseEverything(false);
    };

    window.addEventListener('pagehide', stopOnPageHide);
    return () => window.removeEventListener('pagehide', stopOnPageHide);
  }, []);

  useEffect(() => {
    if (!linkedChildId) {
      setSoundMuted(false);
      setGlobalAudioMuted(false);
      setMusicVolume(0.35);
      setEffectsVolume(0.75);
      return;
    }

    if (controls.soundMode === 'silent') {
      setSoundMuted(true);
      setGlobalAudioMuted(true);
      pauseEverything(true);
      return;
    }

    setSoundMuted(false);
    setGlobalAudioMuted(false);

    if (controls.soundMode === 'middle') {
      setMusicVolume(0.12);
      setEffectsVolume(0.35);
    } else {
      setMusicVolume(0.35);
      setEffectsVolume(0.75);
    }
  }, [controls.soundMode, linkedChildId]);

  useEffect(() => {
    if (linkedChildId && controls.locked) {
      pauseEverything(true);
    }
  }, [controls.locked, linkedChildId]);

  return (
    <>
      {isLoading && (
        <div
          className={`transition-opacity duration-700 ${
            fadeOut ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <LoadingScreen />
        </div>
      )}

      <div
        className={`transition-opacity duration-700 ${
          isLoading ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <RouterProvider router={router} />
      </div>

      {linkedChildId && controls.locked && !isLoading && <LockOverlay reason={controls.lockReason} />}
    </>
  );
}

export function HomePage() {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [showCelebrationSettings, setShowCelebrationSettings] = useState(false);
  const [holdActive, setHoldActive] = useState(false);
  const navigate = useNavigate();
  let holdTimer: number | null = null;

  const startSettingsHold = () => {
    setHoldActive(true);
    holdTimer = window.setTimeout(() => {
      setShowCelebrationSettings(true);
      setHoldActive(false);
    }, 900);
  };

  const stopSettingsHold = () => {
    setHoldActive(false);
    if (holdTimer) {
      window.clearTimeout(holdTimer);
      holdTimer = null;
    }
  };

  const setCelebrationMode = (mode: 'full' | 'middle' | 'silent') => {
    localStorage.setItem('celebrationMode', mode);
    setShowCelebrationSettings(false);
  };

  const morningTasks = [
    { id: 1, imageUrl: remoteImages.wakeUp, title: 'Wake Up', color: 'bg-yellow-100', link: '/task/wake-up' },
    { id: 2, imageUrl: remoteImages.brushTeeth, title: 'Brush Teeth', color: 'bg-blue-100', link: '/task/brush-teeth' },
    { id: 3, imageUrl: remoteImages.getDressed, title: 'Get Dressed', color: 'bg-green-100', link: '/task/get-dressed' },
    { id: 4, imageUrl: remoteImages.eatBreakfast, title: 'Eat Breakfast', color: 'bg-yellow-100', link: '/task/eat-breakfast' },
    { id: 5, imageUrl: remoteImages.goToSchool, title: 'Go to School', color: 'bg-purple-100', link: '/task/go-to-school' }
  ];

  const schoolTasks = [
    { id: 28, imageUrl: remoteImages.arriveSchool, title: 'Arrive at School', color: 'bg-blue-100', link: '/task/arrive-school' },
    { id: 29, imageUrl: remoteImages.morningCircle, title: 'Morning Circle', color: 'bg-yellow-100', link: '/task/morning-circle' },
    { id: 30, imageUrl: remoteImages.classwork, title: 'Classwork', color: 'bg-green-100', link: '/task/classwork' },
    { id: 31, imageUrl: remoteImages.schoolSnack, title: 'Snack Time', color: 'bg-pink-100', link: '/task/school-snack' },
    { id: 32, imageUrl: remoteImages.recess, title: 'Recess', color: 'bg-green-100', link: '/task/recess' },
    { id: 33, imageUrl: remoteImages.afternoonLessons, title: 'Afternoon Lessons', color: 'bg-purple-100', link: '/task/afternoon-lessons' },
    { id: 34, imageUrl: remoteImages.packUpSchool, title: 'Pack Up', color: 'bg-blue-100', link: '/task/pack-up-school' }
  ];

  const choresTasks = [
    { id: 6, imageUrl: remoteImages.washHands, title: 'Wash Hands', color: 'bg-blue-100', link: '/task/wash-hands' },
    { id: 7, imageUrl: remoteImages.eatLunch, title: 'Eat Lunch', color: 'bg-green-100', link: '/task/eat-lunch' },
    { id: 35, imageUrl: remoteImages.putPlateSink, title: 'Put Plate in Sink', color: 'bg-yellow-100', link: '/task/put-plate-sink' },
    { id: 36, imageUrl: remoteImages.putToysAway, title: 'Put Toys Away', color: 'bg-pink-100', link: '/task/put-toys-away' },
    { id: 37, imageUrl: remoteImages.makeBed, title: 'Make Bed', color: 'bg-purple-100', link: '/task/make-bed' },
    { id: 38, imageUrl: remoteImages.feedPet, title: 'Feed Pet', color: 'bg-green-100', link: '/task/feed-pet' },
    { id: 39, imageUrl: remoteImages.waterPlants, title: 'Water Plants', color: 'bg-blue-100', link: '/task/water-plants' }
  ];

  const afternoonTasks = [
    { id: 8, imageUrl: remoteImages.doHomework, title: 'Do Homework', color: 'bg-blue-100', link: '/task/do-homework' },
    { id: 9, imageUrl: remoteImages.packSnack, title: 'Pack Snack', color: 'bg-yellow-100', link: '/task/pack-snack' },
    { id: 10, imageUrl: remoteImages.playTime, title: 'Play Time', color: 'bg-green-100', link: '/task/play-time' },
    { id: 40, imageUrl: remoteImages.putClothesHamper, title: 'Put Clothes in Hamper', color: 'bg-pink-100', link: '/task/put-clothes-hamper' },
    { id: 41, imageUrl: remoteImages.helpSetTable, title: 'Help Set Table', color: 'bg-purple-100', link: '/task/help-set-table' }
  ];

  const eveningTasks = [
    { id: 11, imageUrl: remoteImages.eatDinner, title: 'Eat Dinner', color: 'bg-orange-100', link: '/task/eat-dinner' },
    { id: 12, imageUrl: remoteImages.bathTime, title: 'Bath Time', color: 'bg-blue-100', link: '/task/bath-time' },
    { id: 13, imageUrl: remoteImages.readBook, title: 'Read a Book', color: 'bg-yellow-100', link: '/task/read-book' },
    { id: 14, imageUrl: remoteImages.bedtime, title: 'Bedtime', color: 'bg-purple-100', link: '/task/bedtime' }
  ];

  const therapyTasks = [
    { id: 16, imageUrl: remoteImages.speechTherapy, title: 'Speech Therapy', color: 'bg-pink-100', link: '/task/speech-therapy' },
    { id: 17, imageUrl: remoteImages.occupationalTherapy, title: 'Occupational Therapy', color: 'bg-yellow-100', link: '/task/occupational-therapy' },
    { id: 18, imageUrl: remoteImages.physicalTherapy, title: 'Physical Therapy', color: 'bg-green-100', link: '/task/physical-therapy' },
    { id: 19, imageUrl: remoteImages.behavioralTherapy, title: 'Behavioral Therapy', color: 'bg-blue-100', link: '/task/behavioral-therapy' },
    { id: 20, imageUrl: remoteImages.sensoryTherapy, title: 'Sensory Integration', color: 'bg-purple-100', link: '/task/sensory-therapy' }
  ];

  const sickTasks = [
    { id: 21, imageUrl: remoteImages.feelUnwell, title: 'Feel Unwell', color: 'bg-red-100', link: '/task/feel-unwell' },
    { id: 22, imageUrl: remoteImages.tellAdult, title: 'Tell an Adult', color: 'bg-orange-100', link: '/task/tell-adult' },
    { id: 23, imageUrl: remoteImages.takeTemperature, title: 'Take Temperature', color: 'bg-yellow-100', link: '/task/take-temperature' },
    { id: 24, imageUrl: remoteImages.restInBed, title: 'Rest in Bed', color: 'bg-purple-100', link: '/task/rest-in-bed' },
    { id: 25, imageUrl: remoteImages.takeMedicine, title: 'Take Medicine', color: 'bg-pink-100', link: '/task/take-medicine' },
    { id: 26, imageUrl: remoteImages.drinkWater, title: 'Drink Water', color: 'bg-blue-100', link: '/task/drink-water' },
    { id: 27, imageUrl: remoteImages.goToDoctor, title: 'Go to Doctor', color: 'bg-green-100', link: '/task/go-to-doctor' }
  ];

  const emotionTasks = [
    { id: 35, imageUrl: remoteImages.emotionCheck, title: 'How I Feel Today', color: 'bg-pink-100', link: '/task/emotion-check' }
  ];

  const toggleCategory = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };

  const CategorySection = ({ title, iconName, tasks, categoryKey, color }: any) => {
    const isExpanded = expandedCategory === categoryKey;

    return (
      <div className="mb-6">
        <button
          onClick={() => toggleCategory(categoryKey)}
          className={`w-full ${color} rounded-3xl p-6 shadow-lg transition-all active:scale-95 mb-4`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <AppIconImage name={iconName} size={56} className="shrink-0" alt={title} />
              <h2 className="text-4xl text-gray-800 font-bold">{title}</h2>
            </div>
            <AppIconImage
              name="arrowDown"
              size={40}
              className="transition-transform"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              alt={isExpanded ? 'Collapse' : 'Expand'}
            />
          </div>
        </button>

        {isExpanded && (
          <div className="space-y-4 animate-slide-down">
            {tasks.map((task: any) => (
              <TaskCard
                key={task.id}
                imageUrl={task.imageUrl}
                title={task.title}
                color={task.color}
                link={task.link}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 px-6 pt-28 pb-24">
      <div className="max-w-md mx-auto">
        <div className="fixed top-6 left-6 z-50">
          <button
            onClick={() => navigate('/')}
            className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all active:scale-95 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center"
            aria-label="Back to title screen"
          >
            <Home size={32} className="text-white" />
          </button>
        </div>

        <div className="fixed top-6 right-6 z-50">
          <button
            onMouseDown={startSettingsHold}
            onMouseUp={stopSettingsHold}
            onMouseLeave={stopSettingsHold}
            onTouchStart={startSettingsHold}
            onTouchEnd={stopSettingsHold}
            className={`w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all bg-white/95 backdrop-blur flex items-center justify-center ${
              holdActive ? 'scale-110 ring-4 ring-purple-300' : 'active:scale-95'
            }`}
            aria-label="Hold for celebration settings"
          >
            <span className="text-3xl">⚙️</span>
          </button>
        </div>

        {showCelebrationSettings && (
          <div className="fixed inset-0 z-[70] bg-black/25 flex items-center justify-center px-6">
            <div className="w-full max-w-md rounded-[2rem] bg-white shadow-2xl p-6 text-center">
              <div className="text-5xl mb-2">⚙️</div>
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Celebration Settings</h2>
              <p className="text-xl text-gray-600 mb-6">Choose how big the task celebration feels</p>

              <div className="space-y-4">
                <button
                  onClick={() => setCelebrationMode('full')}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white text-3xl py-5 rounded-3xl shadow-lg"
                >
                  🎉 Full
                </button>
                <button
                  onClick={() => setCelebrationMode('middle')}
                  className="w-full bg-gradient-to-r from-blue-400 to-cyan-500 text-white text-3xl py-5 rounded-3xl shadow-lg"
                >
                  😊 Middle
                </button>
                <button
                  onClick={() => setCelebrationMode('silent')}
                  className="w-full bg-gradient-to-r from-gray-400 to-slate-500 text-white text-3xl py-5 rounded-3xl shadow-lg"
                >
                  🔇 Silent
                </button>
                <button
                  onClick={() => setShowCelebrationSettings(false)}
                  className="w-full bg-white border border-gray-200 text-gray-700 text-2xl py-4 rounded-3xl shadow-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <ProfilePhoto />

        <div className="mb-10 text-center">
          <h1
            className="text-6xl mb-3 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
            style={{ fontFamily: "'Fredoka', sans-serif", fontWeight: 700 }}
          >
            Daily Routines
          </h1>
        </div>

        <CategorySection title="Morning" iconName="morning" tasks={morningTasks} categoryKey="morning" color="bg-yellow-200" />
        <CategorySection title="School" iconName="school" tasks={schoolTasks} categoryKey="school" color="bg-blue-200" />
        <CategorySection title="Afternoon" iconName="afternoon" tasks={afternoonTasks} categoryKey="afternoon" color="bg-green-200" />
        <CategorySection title="Chores" iconName="chores" tasks={choresTasks} categoryKey="chores" color="bg-orange-200" />
        <CategorySection title="Evening" iconName="evening" tasks={eveningTasks} categoryKey="evening" color="bg-purple-200" />
        <CategorySection title="Therapy" iconName="therapy" tasks={therapyTasks} categoryKey="therapy" color="bg-teal-200" />
        <CategorySection title="When I'm Sick" iconName="sick" tasks={sickTasks} categoryKey="sick" color="bg-red-200" />
        <CategorySection title="Emotions" iconName="emotions" tasks={emotionTasks} categoryKey="emotions" color="bg-pink-200" />
      </div>
    </div>
  );
}

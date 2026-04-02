import { createBrowserRouter } from "react-router";
import { HomePage } from "./App";
import { RootLayout } from "./components/RootLayout";
import { ChildAccessScreen } from "./components/ChildAccessScreen";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { WakeUpTask } from "./components/WakeUpTask";
import { BrushTeethTask } from "./components/BrushTeethTask";
import { GetDressedTask } from "./components/GetDressedTask";
import { EatBreakfastTask } from "./components/EatBreakfastTask";
import { GoToSchoolTask } from "./components/GoToSchoolTask";
import { ArriveSchoolTask } from "./components/ArriveSchoolTask";
import { MorningCircleTask } from "./components/MorningCircleTask";
import { ClassworkTask } from "./components/ClassworkTask";
import { SchoolSnackTask } from "./components/SchoolSnackTask";
import { RecessTask } from "./components/RecessTask";
import { AfternoonLessonsTask } from "./components/AfternoonLessonsTask";
import { PackUpSchoolTask } from "./components/PackUpSchoolTask";
import { WashHandsTask } from "./components/WashHandsTask";
import { EatLunchTask } from "./components/EatLunchTask";
import { DoHomeworkTask } from "./components/DoHomeworkTask";
import { PackSnackTask } from "./components/PackSnackTask";
import { PlayTimeTask } from "./components/PlayTimeTask";
import { PutPlateSinkTask } from "./components/PutPlateSinkTask";
import { PutToysAwayTask } from "./components/PutToysAwayTask";
import { MakeBedTask } from "./components/MakeBedTask";
import { FeedPetTask } from "./components/FeedPetTask";
import { WaterPlantsTask } from "./components/WaterPlantsTask";
import { PutClothesHamperTask } from "./components/PutClothesHamperTask";
import { HelpSetTableTask } from "./components/HelpSetTableTask";
import { EatDinnerTask } from "./components/EatDinnerTask";
import { BathTimeTask } from "./components/BathTimeTask";
import { ReadBookTask } from "./components/ReadBookTask";
import { BedtimeTask } from "./components/BedtimeTask";
import { SpeechTherapyTask } from "./components/SpeechTherapyTask";
import { OccupationalTherapyTask } from "./components/OccupationalTherapyTask";
import { PhysicalTherapyTask } from "./components/PhysicalTherapyTask";
import { BehavioralTherapyTask } from "./components/BehavioralTherapyTask";
import { SensoryTherapyTask } from "./components/SensoryTherapyTask";
import { FeelUnwellTask } from "./components/FeelUnwellTask";
import { TellAdultTask } from "./components/TellAdultTask";
import { TakeTemperatureTask } from "./components/TakeTemperatureTask";
import { RestInBedTask } from "./components/RestInBedTask";
import { TakeMedicineTask } from "./components/TakeMedicineTask";
import { DrinkWaterTask } from "./components/DrinkWaterTask";
import { GoToDoctorTask } from "./components/GoToDoctorTask";
import { GamesPage } from "./components/GamesPage";
import { PuzzleGame } from "./components/PuzzleGame";
import { MemoryGame } from "./components/MemoryGame";
import { ColorMatchGame } from "./components/ColorMatchGame";
import { ShapeSortGame } from "./components/ShapeSortGame";
import { CountingGame } from "./components/CountingGame";
import { PatternGame } from "./components/PatternGame";
import { GamesLayout } from "./components/GamesLayout";
import { EmotionCheck } from "./components/EmotionCheck";
import { AcademicsPage } from "./components/AcademicsPage";
import { MathGame } from "./components/MathGame";
import { EnglishGame } from "./components/EnglishGame";
import { SpellingGame } from "./components/SpellingGame";
import { SafetySituationsGame } from "./components/SafetySituationsGame";
import { BooksPage } from "./components/BooksPage";
import { BookReader } from "./components/BookReader";
import { CartoonsPage } from "./components/CartoonsPage";
import { RewardScreen } from "./components/RewardScreen";
import { TryAgainScreen } from "./components/TryAgainScreen";

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    children: [
      {
        path: "/",
        Component: ChildAccessScreen,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/home",
        Component: HomePage,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/wake-up",
        Component: WakeUpTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/brush-teeth",
        Component: BrushTeethTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/get-dressed",
        Component: GetDressedTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/eat-breakfast",
        Component: EatBreakfastTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/go-to-school",
        Component: GoToSchoolTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/arrive-school",
        Component: ArriveSchoolTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/morning-circle",
        Component: MorningCircleTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/classwork",
        Component: ClassworkTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/school-snack",
        Component: SchoolSnackTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/recess",
        Component: RecessTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/afternoon-lessons",
        Component: AfternoonLessonsTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/pack-up-school",
        Component: PackUpSchoolTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/wash-hands",
        Component: WashHandsTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/eat-lunch",
        Component: EatLunchTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/do-homework",
        Component: DoHomeworkTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/pack-snack",
        Component: PackSnackTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/play-time",
        Component: PlayTimeTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/put-plate-sink",
        Component: PutPlateSinkTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/put-toys-away",
        Component: PutToysAwayTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/make-bed",
        Component: MakeBedTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/feed-pet",
        Component: FeedPetTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/water-plants",
        Component: WaterPlantsTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/put-clothes-hamper",
        Component: PutClothesHamperTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/help-set-table",
        Component: HelpSetTableTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/eat-dinner",
        Component: EatDinnerTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/bath-time",
        Component: BathTimeTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/read-book",
        Component: ReadBookTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/bedtime",
        Component: BedtimeTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/speech-therapy",
        Component: SpeechTherapyTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/occupational-therapy",
        Component: OccupationalTherapyTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/physical-therapy",
        Component: PhysicalTherapyTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/behavioral-therapy",
        Component: BehavioralTherapyTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/sensory-therapy",
        Component: SensoryTherapyTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/feel-unwell",
        Component: FeelUnwellTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/tell-adult",
        Component: TellAdultTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/take-temperature",
        Component: TakeTemperatureTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/rest-in-bed",
        Component: RestInBedTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/take-medicine",
        Component: TakeMedicineTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/drink-water",
        Component: DrinkWaterTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/go-to-doctor",
        Component: GoToDoctorTask,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/task/emotion-check",
        Component: EmotionCheck,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/academics",
        Component: AcademicsPage,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/academics/math",
        Component: MathGame,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/academics/english",
        Component: EnglishGame,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/academics/spelling",
        Component: SpellingGame,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/academics/safety",
        Component: SafetySituationsGame,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/books",
        Component: BooksPage,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/book-reader",
        Component: BookReader,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/cartoons",
        Component: CartoonsPage,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/rewards",
        Component: RewardScreen,
        ErrorBoundary: ErrorBoundary,
      },
      {
        path: "/try-again",
        Component: TryAgainScreen,
        ErrorBoundary: ErrorBoundary,
      },
      {
        Component: GamesLayout,
        ErrorBoundary: ErrorBoundary,
        children: [
          {
            path: "/games",
            Component: GamesPage,
          },
          {
            path: "/game/puzzle",
            Component: PuzzleGame,
          },
          {
            path: "/game/memory",
            Component: MemoryGame,
          },
          {
            path: "/game/colors",
            Component: ColorMatchGame,
          },
          {
            path: "/game/shapes",
            Component: ShapeSortGame,
          },
          {
            path: "/game/counting",
            Component: CountingGame,
          },
          {
            path: "/game/patterns",
            Component: PatternGame,
          },
        ],
      },
    ],
  },
]);

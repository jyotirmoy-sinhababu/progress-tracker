'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Inter } from 'next/font/google';

// Icons
import {
  Bell,
  Settings,
  User,
  Moon,
  Droplets,
  Smartphone,
  X,
  Plus,
  ChevronRight,
  Award,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react';

const inter = Inter({ subsets: ['latin'] });

// Define types for our data structures
interface DayData {
  day: string;
  date: string;
  value: number;
  fullDate?: Date;
  displayDate?: string;
  isToday?: boolean;
}

interface Habit {
  id: number;
  name: string;
  iconName: string;
  target: number;
  unit: string;
  color: string;
  streak: number;
  data: DayData[];
  completed: boolean;
}

interface NewHabit {
  name: string;
  iconName: string;
  target: number;
  unit: string;
  color: string;
}

interface UserSettings {
  name: string;
  email: string;
  notifications: boolean;
  darkMode: boolean;
  reminderTime: string;
}

export default function HabitTracker() {
  // State for modal visibility
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // State for active tab
  const [activeTab, setActiveTab] = useState('dashboard');

  // Helper function to render icon by name
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Moon':
        return <Moon className='w-5 h-5' />;
      case 'Droplets':
        return <Droplets className='w-5 h-5' />;
      case 'Smartphone':
        return <Smartphone className='w-5 h-5' />;
      case 'Info':
        return <Info className='w-5 h-5' />;
      default:
        return <Info className='w-5 h-5' />;
    }
  };

  // Helper function to get the current week days
  const getCurrentWeekDays = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    // Format date as "MMM D" (e.g., "Jan 15")
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    };

    // Get the current day of the week (0-6)
    const currentDay = today.getDay();

    // Calculate the date of the most recent Sunday (start of week)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - currentDay);

    // Generate array of dates for the week
    return Array(7)
      .fill(0)
      .map((_, i) => {
        const date = new Date(startOfWeek);
        date.setDate(startOfWeek.getDate() + i);

        // Check if this is today
        const isToday = date.toDateString() === today.toDateString();

        return {
          day: days[date.getDay()],
          date: date.toISOString().split('T')[0], // YYYY-MM-DD format
          fullDate: date,
          displayDate: formatDate(date),
          isToday,
        };
      });
  };

  // State for habits data
  const [habits, setHabits] = useState<Habit[]>(() => {
    const weekDays = getCurrentWeekDays();

    return [
      {
        id: 1,
        name: 'Sleep',
        iconName: 'Moon',
        target: 8,
        unit: 'hours',
        color: '#8884d8',
        streak: 5,
        data: weekDays.map((day) => ({
          day: day.day,
          date: day.date,
          value: Math.floor(Math.random() * 3) + 6, // Random value between 6-9 for demo
          displayDate: day.displayDate,
          isToday: day.isToday,
        })),
        completed: true,
      },
      {
        id: 2,
        name: 'Water',
        iconName: 'Droplets',
        target: 8,
        unit: 'glasses',
        color: '#82ca9d',
        streak: 3,
        data: weekDays.map((day) => ({
          day: day.day,
          date: day.date,
          value: Math.floor(Math.random() * 4) + 5, // Random value between 5-8 for demo
          displayDate: day.displayDate,
          isToday: day.isToday,
        })),
        completed: false,
      },
      {
        id: 3,
        name: 'Screen Time',
        iconName: 'Smartphone',
        target: 2,
        unit: 'hours',
        color: '#ffc658',
        streak: 0,
        data: weekDays.map((day) => ({
          day: day.day,
          date: day.date,
          value: Math.floor(Math.random() * 3) + 1.5, // Random value between 1.5-4.5 for demo
          displayDate: day.displayDate,
          isToday: day.isToday,
        })),
        completed: false,
      },
    ];
  });

  // State for new habit form
  const [newHabit, setNewHabit] = useState<NewHabit>({
    name: '',
    iconName: 'Info',
    target: 1,
    unit: 'times',
    color: '#8884d8',
  });

  // State for today's check-in values
  const [checkInValues, setCheckInValues] = useState<Record<number, number>>(
    {}
  );

  // State for user settings
  const [settings, setSettings] = useState<UserSettings>({
    name: 'Alex Johnson',
    email: 'alex@example.com',
    notifications: true,
    darkMode: false,
    reminderTime: '20:00',
  });

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedHabits = localStorage.getItem('habits');
    const savedSettings = localStorage.getItem('settings');
    const savedCheckIns = localStorage.getItem('checkInValues');

    if (savedHabits) {
      const parsedHabits = JSON.parse(savedHabits);
      setHabits(parsedHabits);

      // Initialize checkInValues with today's values
      const initialCheckInValues: Record<number, number> = {};
      parsedHabits.forEach((habit: Habit) => {
        const todayData = habit.data.find((day) => day.isToday);
        if (todayData) {
          initialCheckInValues[habit.id] = todayData.value;
        }
      });

      if (savedCheckIns) {
        setCheckInValues({
          ...initialCheckInValues,
          ...JSON.parse(savedCheckIns),
        });
      } else {
        setCheckInValues(initialCheckInValues);
      }
    }

    if (savedSettings) setSettings(JSON.parse(savedSettings));

    // Show reminder modal if there are uncompleted habits and it's past 8 PM
    const currentHour = new Date().getHours();
    const hasUncompletedHabits = habits.some((habit) => !habit.completed);
    if (currentHour >= 20 && hasUncompletedHabits && settings.notifications) {
      setShowReminderModal(true);
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
    localStorage.setItem('settings', JSON.stringify(settings));
    localStorage.setItem('checkInValues', JSON.stringify(checkInValues));
  }, [habits, settings, checkInValues]);

  // Handle habit check-in
  const handleCheckIn = (id: number, value: number) => {
    const updatedValues = { ...checkInValues, [id]: value };
    setCheckInValues(updatedValues);

    // Update habits data with new check-in
    const updatedHabits = habits.map((habit) => {
      if (habit.id === id) {
        // Find today's data point
        const todayIndex = habit.data.findIndex((day) => day.isToday);
        if (todayIndex === -1) return habit; // No today found, return unchanged

        const completed = value >= habit.target;
        const newStreak = completed ? habit.streak + 1 : 0;

        // Update today's data point specifically
        const newData = [...habit.data];
        newData[todayIndex] = { ...newData[todayIndex], value };

        return {
          ...habit,
          data: newData,
          completed,
          streak: newStreak,
        };
      }
      return habit;
    });

    setHabits(updatedHabits);
  };

  // Handle adding a new habit
  const handleAddHabit = () => {
    if (!newHabit.name) return;

    const weekDays = getCurrentWeekDays();
    const newHabitData = weekDays.map((day) => ({
      day: day.day,
      date: day.date,
      value: 0,
      displayDate: day.displayDate,
      isToday: day.isToday,
    }));

    const newHabitItem: Habit = {
      id: Date.now(),
      name: newHabit.name,
      iconName: newHabit.iconName,
      target: newHabit.target,
      unit: newHabit.unit,
      color: newHabit.color,
      streak: 0,
      data: newHabitData,
      completed: false,
    };

    setHabits([...habits, newHabitItem]);
    setNewHabit({
      name: '',
      iconName: 'Info',
      target: 1,
      unit: 'times',
      color: '#8884d8',
    });
    setShowAddHabitModal(false);
  };

  // Calculate overall progress
  const calculateProgress = () => {
    const totalHabits = habits.length;
    const completedHabits = habits.filter((habit) => habit.completed).length;
    return totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;
  };

  // Get the longest streak
  const getLongestStreak = () => {
    return habits.reduce((max, habit) => Math.max(max, habit.streak), 0);
  };

  // Format for the radial chart
  const progressData = [
    {
      name: 'Progress',
      value: calculateProgress(),
      fill: '#8884d8',
    },
  ];

  // Format for the pie chart
  const habitCompletionData = [
    {
      name: 'Completed',
      value: habits.filter((habit) => habit.completed).length,
      fill: '#82ca9d',
    },
    {
      name: 'Remaining',
      value: habits.filter((habit) => !habit.completed).length,
      fill: '#ffc658',
    },
  ];

  // Animation variants for framer-motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: 'spring', damping: 25, stiffness: 300 },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.2 },
    },
  };

  // Get the most consistent habit
  const getMostConsistentHabit = (): Habit | null => {
    if (habits.length === 0) return null;

    return habits.reduce((best: Habit | null, habit) => {
      if (!best) return habit;

      const currentRate =
        habit.data.filter((d) => d.value >= habit.target).length /
        habit.data.length;
      const bestRate =
        best.data.filter((d) => d.value >= best.target).length /
        best.data.length;

      return currentRate > bestRate ? habit : best;
    }, null);
  };

  // Get the most improved habit
  const getMostImprovedHabit = (): Habit | null => {
    if (habits.length === 0) return null;

    return habits.reduce((best: Habit | null, habit) => {
      if (!best) return habit;

      const improvement =
        habit.data[habit.data.length - 1].value - habit.data[0].value;
      const bestImprovement =
        best.data[best.data.length - 1].value - best.data[0].value;

      return improvement > bestImprovement ? habit : best;
    }, null);
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${inter.className} ${
        settings.darkMode
          ? 'bg-gray-900 text-white'
          : 'bg-gray-50 text-gray-900'
      }`}
    >
      {/* Navbar */}
      <nav
        className={`sticky top-0 z-10 ${
          settings.darkMode ? 'bg-gray-800' : 'bg-white'
        } shadow-md`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16'>
            <div className='flex items-center'>
              <motion.div
                className='flex-shrink-0 flex items-center'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <CheckCircle2 className='h-8 w-8 text-indigo-600' />
                <span className='ml-2 text-xl font-bold'>HabitTrack</span>
              </motion.div>
            </div>
            <div className='flex items-center space-x-4'>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700'
                onClick={() => setShowReminderModal(true)}
              >
                <Bell className='h-5 w-5' />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700'
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className='h-5 w-5' />
              </motion.button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className='flex items-center'
              >
                <div className='h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white'>
                  <User className='h-5 w-5' />
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className='flex-grow'>
        {/* Hero Section */}
        {activeTab === 'dashboard' && (
          <section
            className={`py-10 ${
              settings.darkMode ? 'bg-gray-800' : 'bg-indigo-50'
            }`}
          >
            <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
              <motion.div
                className=''
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h1 className='text-2xl font-extrabold sm:text-2xl'>
                  <span
                    className={`block ${
                      settings.darkMode ? 'text-indigo-400' : 'text-indigo-600'
                    }`}
                  >
                    Build Better Routines & Track Progress
                  </span>
                </h1>
              </motion.div>
            </div>
          </section>
        )}

        {/* Dashboard */}
        <section className='py-6'>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
            {/* Tabs */}
            <div className='border-b border-gray-200 dark:border-gray-700 mb-6'>
              <nav className='flex space-x-8'>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'dashboard'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('habits')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'habits'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  My Habits
                </button>
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'stats'
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Statistics
                </button>
              </nav>
            </div>

            {/* Week Selector */}
            <div className='flex justify-between items-center mb-6'>
              <div className='text-center'>
                <h3 className='text-lg font-medium'>
                  {habits.length > 0 && habits[0].data.length > 0 ? (
                    <>
                      {new Date(habits[0].data[0].date).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric' }
                      )}{' '}
                      -{' '}
                      {new Date(habits[0].data[6].date).toLocaleDateString(
                        'en-US',
                        { month: 'short', day: 'numeric' }
                      )}
                    </>
                  ) : (
                    'Current Week'
                  )}
                </h3>
              </div>
            </div>

            {/* Dashboard Content */}
            {activeTab === 'dashboard' && (
              <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'
              >
                {/* Progress Overview */}
                <motion.div
                  variants={itemVariants}
                  className={`p-6 rounded-lg shadow-md ${
                    settings.darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h2 className='text-lg font-semibold mb-4'>
                    Today's Progress
                  </h2>
                  <div className='h-64'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <RadialBarChart
                        cx='50%'
                        cy='50%'
                        innerRadius='60%'
                        outerRadius='80%'
                        barSize={10}
                        data={progressData}
                        startAngle={90}
                        endAngle={-270}
                      >
                        <RadialBar
                          background
                          dataKey='value'
                          cornerRadius={10}
                        />
                        <text
                          x='50%'
                          y='50%'
                          textAnchor='middle'
                          dominantBaseline='middle'
                          className='text-xl font-bold'
                          fill={settings.darkMode ? 'white' : 'black'}
                        >
                          {Math.round(calculateProgress())}%
                        </text>
                      </RadialBarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='mt-4 flex items-center justify-between'>
                    <div>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Habits Completed
                      </p>
                      <p className='text-lg font-semibold'>
                        {habits.filter((habit) => habit.completed).length}/
                        {habits.length}
                      </p>
                    </div>
                    <div>
                      <p className='text-sm text-gray-500 dark:text-gray-400'>
                        Longest Streak
                      </p>
                      <p className='text-lg font-semibold'>
                        {getLongestStreak()} days
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* Habit Completion */}
                <motion.div
                  variants={itemVariants}
                  className={`p-6 rounded-lg shadow-md ${
                    settings.darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h2 className='text-lg font-semibold mb-4'>
                    Habit Completion
                  </h2>
                  <div className='h-64'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <PieChart>
                        <Pie
                          data={habitCompletionData}
                          cx='50%'
                          cy='50%'
                          labelLine={false}
                          outerRadius={80}
                          fill='#8884d8'
                          dataKey='value'
                        >
                          {habitCompletionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className='mt-4'>
                    <p className='text-sm text-gray-500 dark:text-gray-400'>
                      {habits.filter((habit) => habit.completed).length > 0
                        ? `Great job! You've completed ${
                            habits.filter((habit) => habit.completed).length
                          } habits today.`
                        : 'No habits completed yet today. You can do it!'}
                    </p>
                  </div>
                </motion.div>

                {/* Quick Check-in */}
                <motion.div
                  variants={itemVariants}
                  className={`p-6 rounded-lg shadow-md ${
                    settings.darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h2 className='text-lg font-semibold mb-4'>
                    Today's Check-in (
                    {new Date().toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    )
                  </h2>
                  <div className='space-y-4'>
                    {habits.map((habit) => (
                      <div
                        key={habit.id}
                        className='flex items-center justify-between'
                      >
                        <div className='flex items-center'>
                          <div
                            className='p-2 rounded-full'
                            style={{ backgroundColor: `${habit.color}20` }}
                          >
                            {renderIcon(habit.iconName)}
                          </div>
                          <div className='flex gap-1.5'>
                            <span className='ml-2'>{habit.name} </span>
                            <span className='text-sm text-gray-500 dark:text-gray-400'>
                              ({habit.unit})
                            </span>
                          </div>
                        </div>
                        <div className='flex items-center'>
                          <input
                            type='number'
                            min='0'
                            step='0.5'
                            value={checkInValues[habit.id] || 0}
                            onChange={(e) =>
                              handleCheckIn(
                                habit.id,
                                Number.parseFloat(e.target.value)
                              )
                            }
                            className={`w-16 p-1 border rounded mr-2 ${
                              settings.darkMode
                                ? 'bg-gray-700 border-gray-600'
                                : 'bg-white border-gray-300'
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className='mt-6'>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className='w-full py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center'
                      onClick={() => setShowAddHabitModal(true)}
                    >
                      <Plus className='mr-2 h-4 w-4' />
                      Add New Habit
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* Habits Content */}
            {activeTab === 'habits' && (
              <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='space-y-6'
              >
                {habits.map((habit) => (
                  <motion.div
                    key={habit.id}
                    variants={itemVariants}
                    className={`p-6 rounded-lg shadow-md ${
                      settings.darkMode ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex items-center'>
                        <div
                          className='p-3 rounded-full'
                          style={{ backgroundColor: `${habit.color}20` }}
                        >
                          {renderIcon(habit.iconName)}
                        </div>
                        <div className='ml-4'>
                          <h3 className='text-lg font-semibold'>
                            {habit.name}
                          </h3>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            Target: {habit.target} {habit.unit} per day
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center'>
                        <div className='flex items-center mr-4'>
                          <Award className='h-5 w-5 text-yellow-500 mr-1' />
                          <span className='font-semibold'>
                            {habit.streak} day streak
                          </span>
                        </div>
                        {habit.completed ? (
                          <div className='bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 py-1 px-3 rounded-full text-sm'>
                            Completed
                          </div>
                        ) : (
                          <div className='bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 py-1 px-3 rounded-full text-sm'>
                            Pending
                          </div>
                        )}
                      </div>
                    </div>

                    <div className='mt-6 h-64'>
                      <ResponsiveContainer width='100%' height='100%'>
                        <BarChart data={habit.data}>
                          <CartesianGrid strokeDasharray='3 3' />
                          <XAxis
                            dataKey='day'
                            tickFormatter={(value, index) => {
                              const item = habit.data[index];
                              return item.isToday ? `${value} (Today)` : value;
                            }}
                          />
                          <YAxis />
                          <Tooltip
                            labelFormatter={(label, items) => {
                              const index = items[0]?.payload?.displayDate;
                              return index ? `${label} - ${index}` : label;
                            }}
                          />
                          <Bar
                            dataKey='value'
                            fill={habit.color}
                            radius={[4, 4, 0, 0]}
                          >
                            {habit.data.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  entry.isToday
                                    ? habit.color
                                    : `${habit.color}CC`
                                }
                                stroke={entry.isToday ? '#000' : undefined}
                                strokeWidth={entry.isToday ? 1 : 0}
                              />
                            ))}
                          </Bar>
                          <ReferenceLine
                            y={habit.target}
                            stroke='red'
                            strokeDasharray='3 3'
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className='mt-6'>
                      <h4 className='font-medium mb-2'>
                        Today's Check-in (
                        {new Date().toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                        )
                      </h4>
                      <div className='flex items-center'>
                        <input
                          type='range'
                          min='0'
                          max={habit.target * 2}
                          step='0.5'
                          value={checkInValues[habit.id] || 0}
                          onChange={(e) =>
                            handleCheckIn(
                              habit.id,
                              Number.parseFloat(e.target.value)
                            )
                          }
                          className='w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700'
                        />
                        <span className='ml-4 min-w-[80px]'>
                          {checkInValues[habit.id] || 0} / {habit.target}{' '}
                          {habit.unit}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <motion.div
                  variants={itemVariants}
                  className='flex justify-center mt-6'
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className='inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700'
                    onClick={() => setShowAddHabitModal(true)}
                  >
                    <Plus className='mr-2 h-5 w-5' />
                    Add New Habit
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {/* Stats Content */}
            {activeTab === 'stats' && (
              <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='grid grid-cols-1 gap-6 lg:grid-cols-2'
              >
                {/* Weekly Overview */}
                <motion.div
                  variants={itemVariants}
                  className={`p-6 rounded-lg shadow-md ${
                    settings.darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h2 className='text-lg font-semibold mb-4'>
                    Weekly Overview
                  </h2>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <LineChart>
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis
                          dataKey='day'
                          allowDuplicatedCategory={false}
                          tickFormatter={(value, index) => {
                            // Find the corresponding data point across all habits
                            const dataPoint = habits[0]?.data[index];
                            return dataPoint?.isToday
                              ? `${value} (Today)`
                              : value;
                          }}
                        />
                        <YAxis />
                        <Tooltip
                          labelFormatter={(label) => {
                            // Find the corresponding data point
                            const dataPoint = habits[0]?.data.find(
                              (d) => d.day === label
                            );
                            return dataPoint?.displayDate
                              ? `${label} - ${dataPoint.displayDate}`
                              : label;
                          }}
                        />
                        <Legend />
                        {habits.map((habit) => (
                          <Line
                            key={habit.id}
                            type='monotone'
                            data={habit.data}
                            dataKey='value'
                            name={habit.name}
                            stroke={habit.color}
                            activeDot={{ r: 8 }}
                            dot={(props) => {
                              const { cx, cy, payload } = props;
                              return (
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={payload.isToday ? 6 : 4}
                                  fill={payload.isToday ? habit.color : 'white'}
                                  stroke={habit.color}
                                  strokeWidth={payload.isToday ? 2 : 1}
                                />
                              );
                            }}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Streak Stats */}
                <motion.div
                  variants={itemVariants}
                  className={`p-6 rounded-lg shadow-md ${
                    settings.darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h2 className='text-lg font-semibold mb-4'>
                    Streak Statistics
                  </h2>
                  <div className='h-80'>
                    <ResponsiveContainer width='100%' height='100%'>
                      <BarChart
                        data={habits.map((habit) => ({
                          name: habit.name,
                          streak: habit.streak,
                          fill: habit.color,
                        }))}
                      >
                        <CartesianGrid strokeDasharray='3 3' />
                        <XAxis dataKey='name' />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey='streak' name='Current Streak (days)'>
                          {habits.map((habit, index) => (
                            <Cell key={`cell-${index}`} fill={habit.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </motion.div>

                {/* Completion Rate */}
                <motion.div
                  variants={itemVariants}
                  className={`p-6 rounded-lg shadow-md ${
                    settings.darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h2 className='text-lg font-semibold mb-4'>
                    Completion Rate
                  </h2>
                  <div className='space-y-4'>
                    {habits.map((habit) => {
                      const completionRate =
                        (habit.data.filter((d) => d.value >= habit.target)
                          .length /
                          habit.data.length) *
                        100;

                      return (
                        <div key={habit.id} className='mb-2'>
                          <div className='flex justify-between mb-1'>
                            <span>{habit.name}</span>
                            <span>{Math.round(completionRate)}%</span>
                          </div>
                          <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
                            <div
                              className='h-2.5 rounded-full'
                              style={{
                                width: `${completionRate}%`,
                                backgroundColor: habit.color,
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Achievement Summary */}
                <motion.div
                  variants={itemVariants}
                  className={`p-6 rounded-lg shadow-md ${
                    settings.darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <h2 className='text-lg font-semibold mb-4'>
                    Achievement Summary
                  </h2>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between p-4 rounded-lg bg-indigo-50 dark:bg-indigo-900'>
                      <div className='flex items-center'>
                        <Award className='h-8 w-8 text-indigo-600 dark:text-indigo-400' />
                        <div className='ml-4'>
                          <h3 className='font-medium'>Longest Streak</h3>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {habits.length > 0
                              ? `${habits.reduce(
                                  (max, habit) => Math.max(max, habit.streak),
                                  0
                                )} days with ${
                                  habits.find(
                                    (h) => h.streak === getLongestStreak()
                                  )?.name
                                }`
                              : 'No habits tracked yet'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className='h-5 w-5 text-gray-400' />
                    </div>

                    <div className='flex items-center justify-between p-4 rounded-lg bg-green-50 dark:bg-green-900'>
                      <div className='flex items-center'>
                        <CheckCircle2 className='h-8 w-8 text-green-600 dark:text-green-400' />
                        <div className='ml-4'>
                          <h3 className='font-medium'>Most Consistent</h3>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {habits.length > 0
                              ? `${getMostConsistentHabit()?.name || 'None'}`
                              : 'No habits tracked yet'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className='h-5 w-5 text-gray-400' />
                    </div>

                    <div className='flex items-center justify-between p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900'>
                      <div className='flex items-center'>
                        <TrendingUp className='h-8 w-8 text-yellow-600 dark:text-yellow-400' />
                        <div className='ml-4'>
                          <h3 className='font-medium'>Most Improved</h3>
                          <p className='text-sm text-gray-500 dark:text-gray-400'>
                            {habits.length > 0
                              ? `${getMostImprovedHabit()?.name || 'None'}`
                              : 'No habits tracked yet'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className='h-5 w-5 text-gray-400' />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className={`py-6 ${settings.darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='md:flex md:items-center md:justify-between'>
            <div className='flex justify-center md:order-2 space-x-6'>
              <a href='#' className='text-gray-400 hover:text-gray-500'>
                <span className='sr-only'>Twitter</span>
                <svg
                  className='h-6 w-6'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path d='M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84' />
                </svg>
              </a>
              <a href='#' className='text-gray-400 hover:text-gray-500'>
                <span className='sr-only'>GitHub</span>
                <svg
                  className='h-6 w-6'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                  aria-hidden='true'
                >
                  <path
                    fillRule='evenodd'
                    d='M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z'
                    clipRule='evenodd'
                  />
                </svg>
              </a>
            </div>
            <div className='mt-8 md:mt-0 md:order-1'>
              <p className='text-center text-base text-gray-400'>
                &copy; {new Date().getFullYear()} HabitTrack. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50'>
            <motion.div
              variants={modalVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              className={`w-full max-w-md rounded-lg shadow-lg ${
                settings.darkMode ? 'bg-gray-800' : 'bg-white'
              } p-6`}
            >
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold'>Settings</h2>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className='p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>Name</label>
                  <input
                    type='text'
                    value={settings.name}
                    onChange={(e) =>
                      setSettings({ ...settings, name: e.target.value })
                    }
                    className={`w-full p-2 border rounded ${
                      settings.darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Email
                  </label>
                  <input
                    type='email'
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    className={`w-full p-2 border rounded ${
                      settings.darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>
                    Enable Notifications
                  </span>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={settings.notifications}
                      onChange={() =>
                        setSettings({
                          ...settings,
                          notifications: !settings.notifications,
                        })
                      }
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className='flex items-center justify-between'>
                  <span className='text-sm font-medium'>Dark Mode</span>
                  <label className='relative inline-flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={settings.darkMode}
                      onChange={() =>
                        setSettings({
                          ...settings,
                          darkMode: !settings.darkMode,
                        })
                      }
                      className='sr-only peer'
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Reminder Time
                  </label>
                  <input
                    type='time'
                    value={settings.reminderTime}
                    onChange={(e) =>
                      setSettings({ ...settings, reminderTime: e.target.value })
                    }
                    className={`w-full p-2 border rounded ${
                      settings.darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>
              </div>

              <div className='mt-6 flex justify-end'>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Habit Modal */}
      <AnimatePresence>
        {showAddHabitModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50'>
            <motion.div
              variants={modalVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              className={`w-full max-w-md rounded-lg shadow-lg ${
                settings.darkMode ? 'bg-gray-800' : 'bg-white'
              } p-6`}
            >
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold'>Add New Habit</h2>
                <button
                  onClick={() => setShowAddHabitModal(false)}
                  className='p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>

              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Habit Name
                  </label>
                  <input
                    type='text'
                    value={newHabit.name}
                    onChange={(e) =>
                      setNewHabit({ ...newHabit, name: e.target.value })
                    }
                    placeholder='e.g., Meditation, Reading, Exercise'
                    className={`w-full p-2 border rounded ${
                      settings.darkMode
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-white border-gray-300'
                    }`}
                  />
                </div>

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Target Value
                    </label>
                    <input
                      type='number'
                      min='0'
                      step='0.5'
                      value={newHabit.target}
                      onChange={(e) =>
                        setNewHabit({
                          ...newHabit,
                          target: Number.parseFloat(e.target.value),
                        })
                      }
                      className={`w-full p-2 border rounded ${
                        settings.darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>

                  <div>
                    <label className='block text-sm font-medium mb-1'>
                      Unit
                    </label>
                    <select
                      value={newHabit.unit}
                      onChange={(e) =>
                        setNewHabit({ ...newHabit, unit: e.target.value })
                      }
                      className={`w-full p-2 border rounded ${
                        settings.darkMode
                          ? 'bg-gray-700 border-gray-600'
                          : 'bg-white border-gray-300'
                      }`}
                    >
                      <option value='times'>times</option>
                      <option value='hours'>hours</option>
                      <option value='minutes'>minutes</option>
                      <option value='glasses'>glasses</option>
                      <option value='liters'>liters</option>
                      <option value='pages'>pages</option>
                      <option value='steps'>steps</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Color
                  </label>
                  <div className='flex space-x-2'>
                    {[
                      '#8884d8',
                      '#82ca9d',
                      '#ffc658',
                      '#ff8042',
                      '#0088fe',
                      '#00C49F',
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setNewHabit({ ...newHabit, color })}
                        className={`w-8 h-8 rounded-full ${
                          newHabit.color === color
                            ? 'ring-2 ring-offset-2 ring-indigo-500'
                            : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>Icon</label>
                  <div className='flex space-x-2'>
                    <button
                      onClick={() =>
                        setNewHabit({ ...newHabit, iconName: 'Moon' })
                      }
                      className={`p-2 rounded-full ${
                        newHabit.iconName === 'Moon'
                          ? 'bg-indigo-100 dark:bg-indigo-900'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Moon className='h-5 w-5' />
                    </button>
                    <button
                      onClick={() =>
                        setNewHabit({ ...newHabit, iconName: 'Droplets' })
                      }
                      className={`p-2 rounded-full ${
                        newHabit.iconName === 'Droplets'
                          ? 'bg-indigo-100 dark:bg-indigo-900'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Droplets className='h-5 w-5' />
                    </button>
                    <button
                      onClick={() =>
                        setNewHabit({ ...newHabit, iconName: 'Smartphone' })
                      }
                      className={`p-2 rounded-full ${
                        newHabit.iconName === 'Smartphone'
                          ? 'bg-indigo-100 dark:bg-indigo-900'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Smartphone className='h-5 w-5' />
                    </button>
                    <button
                      onClick={() =>
                        setNewHabit({ ...newHabit, iconName: 'Info' })
                      }
                      className={`p-2 rounded-full ${
                        newHabit.iconName === 'Info'
                          ? 'bg-indigo-100 dark:bg-indigo-900'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      <Info className='h-5 w-5' />
                    </button>
                  </div>
                </div>
              </div>

              <div className='mt-6 flex justify-end space-x-2'>
                <button
                  onClick={() => setShowAddHabitModal(false)}
                  className={`px-4 py-2 border rounded-md ${
                    settings.darkMode
                      ? 'border-gray-600 hover:bg-gray-700'
                      : 'border-gray-300 hover:bg-gray-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddHabit}
                  className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
                >
                  Add Habit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reminder Modal */}
      <AnimatePresence>
        {showReminderModal && (
          <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50'>
            <motion.div
              variants={modalVariants}
              initial='hidden'
              animate='visible'
              exit='exit'
              className={`w-full max-w-md rounded-lg shadow-lg ${
                settings.darkMode ? 'bg-gray-800' : 'bg-white'
              } p-6`}
            >
              <div className='flex justify-between items-center mb-4'>
                <h2 className='text-xl font-bold'>Habit Reminder</h2>
                <button
                  onClick={() => setShowReminderModal(false)}
                  className='p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>

              <div className='mb-4'>
                <AlertCircle className='h-12 w-12 text-yellow-500 mx-auto mb-4' />
                <p className='text-center'>
                  You still have{' '}
                  {habits.filter((habit) => !habit.completed).length} habits to
                  complete today!
                </p>
              </div>

              <div className='space-y-2'>
                {habits
                  .filter((habit) => !habit.completed)
                  .map((habit) => (
                    <div
                      key={habit.id}
                      className='flex items-center justify-between p-3 rounded-lg bg-gray-100 dark:bg-gray-700'
                    >
                      <div className='flex items-center'>
                        <div
                          className='p-2 rounded-full'
                          style={{ backgroundColor: `${habit.color}20` }}
                        >
                          {renderIcon(habit.iconName)}
                        </div>
                        <span className='ml-2'>{habit.name}</span>
                      </div>
                      <span>
                        {checkInValues[habit.id] || 0}/{habit.target}{' '}
                        {habit.unit}
                      </span>
                    </div>
                  ))}
              </div>

              <div className='mt-6 flex justify-center'>
                <button
                  onClick={() => {
                    setShowReminderModal(false);
                    setActiveTab('habits');
                  }}
                  className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700'
                >
                  Check In Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper component for ReferenceLine in charts
interface ReferenceLineProps {
  y: number;
  stroke: string;
  strokeDasharray: string;
}

function ReferenceLine({ y, stroke, strokeDasharray }: ReferenceLineProps) {
  return (
    <g>
      <line
        x1='0%'
        x2='100%'
        y1={y}
        y2={y}
        stroke={stroke}
        strokeDasharray={strokeDasharray}
      />
    </g>
  );
}

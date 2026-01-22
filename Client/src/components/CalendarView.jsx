import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';

const CalendarView = ({ tasks, onTaskClick }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-50 rounded-xl transition-colors text-gray-400 hover:text-gray-900">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-2xl overflow-hidden border border-gray-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-gray-50 p-4 text-center text-xs font-black text-gray-400 uppercase tracking-widest">
                        {day}
                    </div>
                ))}

                {days.map(day => {
                    const dayTasks = tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), day));
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                        <div
                            key={day.toString()}
                            className={`min-h-[140px] bg-white p-3 transition-colors hover:bg-gray-50/50 ${!isCurrentMonth ? 'bg-gray-50/30' : ''}`}
                        >
                            <div className={`text-sm font-bold mb-3 ${isSameDay(day, new Date()) ? 'w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center -ml-1' : isCurrentMonth ? 'text-gray-700' : 'text-gray-300'}`}>
                                {format(day, 'd')}
                            </div>

                            <div className="space-y-2">
                                {dayTasks.map(task => (
                                    <button
                                        key={task._id}
                                        onClick={() => onTaskClick(task)}
                                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold truncate transition-all flex items-center gap-2 ${task.status === 'done' ? 'bg-gray-100 text-gray-400 line-through' :
                                                task.priority === 'high' ? 'bg-red-50 text-red-600' :
                                                    'bg-indigo-50 text-indigo-600'
                                            }`}
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${task.status === 'done' ? 'bg-gray-400' :
                                                task.priority === 'high' ? 'bg-red-500' : 'bg-indigo-500'
                                            }`} />
                                        {task.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;

import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import '../styles/CalendarView.css';

const CalendarView = ({ tasks, onTaskClick }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
        <div className="calendar-view">
            {/* Header */}
            <div className="calendar-header">
                <h2>
                    {format(currentMonth, 'MMMM yyyy')}
                </h2>
                <div className="calendar-nav">
                    <button onClick={prevMonth} className="calendar-nav-btn">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={nextMonth} className="calendar-nav-btn">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="calendar-grid">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="weekday-header">
                        {day}
                    </div>
                ))}

                {days.map(day => {
                    const dayTasks = tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), day));
                    const isCurrentMonth = isSameMonth(day, currentMonth);

                    return (
                        <div
                            key={day.toString()}
                            className={`calendar-day ${!isCurrentMonth ? 'other-month' : ''}`}
                        >
                            <div className={`day-number ${isSameDay(day, new Date()) ? 'today' : ''}`}>
                                {format(day, 'd')}
                            </div>

                            <div className="day-tasks">
                                {dayTasks.map(task => (
                                    <button
                                        key={task._id}
                                        onClick={() => onTaskClick(task)}
                                        className={`calendar-task ${task.status === 'done' ? 'done' : task.priority}`}
                                    >
                                        <div className={`task-dot ${task.status === 'done' ? 'done' : task.priority}`} />
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

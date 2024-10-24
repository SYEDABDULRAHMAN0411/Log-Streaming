import React, { useEffect, useState, useRef } from 'react';
import '../App.css';

const LogStreaming = () => {
    const [logs, setLogs] = useState([]);
    const [filterLevel, setFilterLevel] = useState('ALL');
    const [filterStartDate, setFilterStartDate] = useState('');
    const [filterEndDate, setFilterEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [logLevels, setLogLevels] = useState(['ALL']);
    const logContainerRef = useRef(null); // Ref to log container

    useEffect(() => {
        const eventSource = new EventSource('https://log-backend-0out.onrender.com/logs/stream');

        eventSource.onmessage = (event) => {
            try {
                const logEntry = JSON.parse(event.data);

                // Handle service-status message
                if (logEntry.type === 'service-status') {
                    const serviceMessage = {
                        timestamp: new Date(logEntry.timestamp),
                        level: 'SERVICE',
                        message: logEntry.message,
                    };
                    setLogs((prevLogs) => [...prevLogs, serviceMessage]);
                    return;
                }

                const newLog = {
                    timestamp: new Date(logEntry.timestamp), // Ensure this is a Date object
                    level: logEntry.level,
                    method: logEntry.method,
                    url: logEntry.url,
                    client: logEntry.client,
                    responseTime: logEntry.responseTime,
                    bytes: logEntry.bytes,
                    statusCode: logEntry.statusCode,
                };


                setLogLevels((prevLevels) => {
                    if (!prevLevels.includes(logEntry.level)) {
                        return [...prevLevels, logEntry.level];
                    }
                    return prevLevels;
                });

                setLogs((prevLogs) => [...prevLogs, newLog]);
            } catch (error) {
                console.error('Error parsing log entry:', error);
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error);
            eventSource.close();
        };

        return () => {
            eventSource.close();
        };
    }, []);

    // Filter logs based on selected level and date
    const filteredLogs = logs.filter((log) => {
        const logDateTime = new Date(log.timestamp); // Convert to Date object
        const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel;

        // Check for valid timestamp
        if (isNaN(logDateTime.getTime())) {
            console.error('Invalid timestamp:', log.timestamp);
            return false; // Skip this log if the timestamp is invalid
        }

        // Match logs within the selected date range
        const matchesStartDate = !filterStartDate || logDateTime >= new Date(filterStartDate);
        const matchesEndDate = !filterEndDate || logDateTime <= new Date(filterEndDate);

        // Match logs based on the search query
        const matchesSearch = !searchQuery || JSON.stringify(log).toLowerCase().includes(searchQuery.toLowerCase());

        // Return true if the log matches all filters
        return matchesLevel && matchesStartDate && matchesEndDate && matchesSearch;
    });

    useEffect(() => {
        const logContainer = logContainerRef.current;
        if (logContainer) {
            logContainer.scrollTop = logContainer.scrollHeight; // Scroll to the bottom
        }
    }, [filteredLogs]);
    const highlightText = (text) => {
        if (!searchQuery) return text; // No highlight if no search query
        const parts = text.split(new RegExp(`(${searchQuery})`, 'gi')); // Split by search query
        return parts.map((part, index) =>
            part.toLowerCase() === searchQuery.toLowerCase() ? (
                <span key={index} style={{ backgroundColor: 'black' }}>{part}</span>
            ) : part
        );
    };


    return (
        <div className="page-container">
            <header className="header">
                <h1 className="title">Real-time Log Streaming Dashboard</h1>
            </header>
           
            <section className="filter-section">
                <div className="filter-container">
                    {/* Dropdown in the left corner */}
                    <div className="filter-dropdown">
                        <label htmlFor="filterSelect">Filter Level:</label>
                        <select 
                            id="filterSelect"
                            className="filter-select" 
                            value={filterLevel} 
                            onChange={(e) => setFilterLevel(e.target.value)}
                        >
                            {logLevels.map((level) => (
                                <option key={level} value={level}>
                                    {level}
                                </option>
                            ))}
                        </select>
                    </div>
    
                    {/* Search bar in the center */}
                    <div className="search-container">
                        <label htmlFor="searchBar">Search:</label>
                        <input
                            type="search"
                            id="searchBar"
                            className="search-bar"
                            placeholder="Search logs..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
    
                    {/* Date filters */}
                    <div className="date-filters">
                        <div>
                            <label htmlFor="startDate">Start Date:</label>
                            <input
                                type="datetime-local"
                                id="startDate"
                                className="filter-datetime"
                                value={filterStartDate}
                                onChange={(e) => setFilterStartDate(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="endDate">End Date:</label>
                            <input
                                type="datetime-local"
                                id="endDate"
                                className="filter-datetime"
                                value={filterEndDate}
                                onChange={(e) => {
                                    const selectedDate = new Date(e.target.value);
                                    // If today is selected, set time to 11:59:59 PM
                                    if (selectedDate.toDateString() === new Date().toDateString()) {
                                        selectedDate.setHours(23, 59, 59, 999);
                                        setFilterEndDate(selectedDate.toISOString().slice(0, 19)); // Convert to string for input
                                    } else {
                                        setFilterEndDate(e.target.value);
                                    }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </section>
    
            <section className="log-section">
                <div className="log-box">
                    <div className="log-container" ref={logContainerRef}>
                        {filteredLogs.length === 0 ? (
                            <div className="no-logs">No logs available.</div>
                        ) : (
                            filteredLogs.map((log, index) => (
                                <div key={index} className={`log ${log.level.toLowerCase()}`}>
                                    <span className="log-timestamp">[{log.timestamp.toLocaleString()}]</span>
                                    <span className={`log-level log-${log.level.toLowerCase()}`}>{log.level}:</span>
                                    {log.level === 'SERVICE' ? (
                                        <span className="log-message service-message">{highlightText(log.message)}</span>
                                    ) : (
                                        <span className="log-message">
                                            {highlightText(`${log.method} ${log.url} (Client: ${log.client}) - ${log.responseTime}s, ${log.bytes} bytes, Status: ${log.statusCode}`)}
                                        </span>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
    
    
}

export default LogStreaming;

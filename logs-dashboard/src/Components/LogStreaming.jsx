import React, { useEffect, useState } from 'react';
import '../App.css';

const LogStreaming = () => {
    const [logs, setLogs] = useState([])
    const [filterLevel, setFilterLevel] = useState('ALL')
    const [filterDate, setFilterDate] = useState('')

    useEffect(() => {
        const eventSource = new EventSource('https://log-backend-10090320385.development.catalystappsail.com/logs/stream')
        // const eventSource = new EventSource('http://localhost:3001/logs/stream')
        console.log("Event Source Created:", eventSource)

        eventSource.onmessage = (event) => {
            console.log("Raw event data:", event.data) 
            try {
                const logEntry = JSON.parse(event.data)
                console.log("Parsed log entry:", logEntry) 

                const newLog = {
                    timestamp: new Date(logEntry.timestamp * 1000),
                    level: logEntry.level,
                    message: logEntry.log,
                }
                setLogs(prevLogs => {
                    const updatedLogs = [...prevLogs, newLog]
                    console.log("Updated logs state:", updatedLogs)
                    return updatedLogs;
                });
            } catch (error) {
                console.error("Error parsing log entry:", error)
            }
        };

        eventSource.onerror = (error) => {
            console.error('EventSource failed:', error)
            eventSource.close()
        };

        return () => {
            eventSource.close() 
        };
    }, []);
    const filteredLogs = logs.filter(log => {
        const logDate = log.timestamp.toISOString().split('T')[0]
        const matchesLevel = filterLevel === 'ALL' || log.level === filterLevel
        const matchesDate = !filterDate || logDate === filterDate

        console.log("Filtering Logs - Matches Level:", matchesLevel, "Matches Date:", matchesDate)
        return matchesLevel && matchesDate
    });

    console.log("Filtered logs:", filteredLogs)
    return (
      <div className="page-container">
          <header className="header">
              <h1 className="title">Real-time Log Streaming Dashboard</h1>
          </header>
  
          <section className="filter-section">
              <div className="filter-container">
                  <select className="filter-select" value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)}>
                      <option value="ALL">All Levels</option>
                      <option value="INFO">INFO</option>
                      <option value="DEBUG">DEBUG</option>
                      <option value="WARN">WARN</option>
                      <option value="ERROR">ERROR</option>
                  </select>
                  <input 
                      type="date" 
                      className="filter-date" 
                      value={filterDate} 
                      onChange={(e) => setFilterDate(e.target.value)} 
                  />
              </div>
          </section>
  
          <section className="log-section">
              <div className="log-container">
                  {filteredLogs.length === 0 ? (
                      <div className="no-logs">No logs available.</div>
                  ) : (
                      filteredLogs.map((log, index) => (
                          <div key={index} className={`log ${log.level.toLowerCase()}`}>
                              <span className="log-timestamp">[{log.timestamp.toLocaleString()}]</span> 
                              <span className="log-level">{log.level}:</span> 
                              <span className="log-message">{log.message}</span>
                          </div>
                      ))
                  )}
              </div>
          </section>
      </div>
  )
  
  
  
}

export default LogStreaming

'use client';

import { useState, useMemo } from 'react';
import data from '../data.json';
import './styles.css';

type Task = {
  id: string;
  title: string;
  category: string;
  description: string;
  details: string[];
  links?: { label: string; url: string }[];
  completedDate?: string;
  priority?: string;
  blockers?: string[];
  estimatedHours?: number;
  status?: string;
  statusNote?: string;
  testingStatus?: string;
  testingNote?: string;
};

export default function ProgressBoard() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [mobileView, setMobileView] = useState<'done' | 'testing' | 'progress' | 'todo'>('testing');

  const allCategories = useMemo(() => {
    const categories = new Set<string>();
    [...data.done, ...(data as any).testing || [], ...data.inProgress, ...data.todo].forEach((task: any) => {
      categories.add(task.category);
    });
    return Array.from(categories).sort();
  }, []);

  const filterTasks = (tasks: any[]) => {
    return tasks.filter((task: Task) => {
      const matchesSearch =
        searchQuery === '' ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(task.category);
      return matchesSearch && matchesCategory;
    });
  };

  const filteredDone = filterTasks(data.done);
  const filteredTesting = filterTasks((data as any).testing || []);
  const filteredInProgress = filterTasks(data.inProgress);
  const filteredTodo = filterTasks(data.todo);

  const getPriorityEmoji = (priority?: string) => {
    return { high: '🔥', medium: '⚡', low: '💤' }[priority || ''] || '';
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="task-card" onClick={() => setSelectedTask(task)}>
      <div className="task-header">
        <div className="task-title">{task.title}</div>
        {task.priority && <div className="priority-emoji">{getPriorityEmoji(task.priority)}</div>}
      </div>
      <div className="task-description">{task.description}</div>
      <div className="task-footer">
        <div className={`category-badge category-${task.category.replace(/\//g, '\\/')}`}>
          {task.category}
        </div>
        <div className="task-meta">
          {task.completedDate && <span>✅ {task.completedDate}</span>}
          {task.estimatedHours !== undefined && <span>⏱️ {task.estimatedHours}h</span>}
        </div>
      </div>
      {task.blockers && task.blockers.length > 0 && (
        <div className="blocker-badge">
          <span>🚧</span>
          <span>{task.blockers.length} blocker{task.blockers.length > 1 ? 's' : ''}</span>
        </div>
      )}
      {task.status === 'waiting-for-team' && (
        <div className="status-badge waiting">
          <span>⏳</span>
          <span>Waiting for team</span>
        </div>
      )}
      {task.testingStatus === 'needs-validation' && (
        <div className="status-badge testing">
          <span>🧪</span>
          <span>Needs validation</span>
        </div>
      )}
    </div>
  );

  const Column = ({ title, tasks, icon, count, type }: {
    title: string;
    tasks: Task[];
    icon: string;
    count: number;
    type: 'done' | 'testing' | 'progress' | 'todo';
  }) => (
    <div className={`column ${type}`}>
      <div className="column-header">
        <div className="column-title">
          <span>{icon}</span>
          <span>{title}</span>
        </div>
        <div className="column-count">{count}</div>
      </div>
      <div className="tasks">
        {tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <div className="empty-text">No tasks here</div>
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </div>
  );

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Max Command Center</h1>
        <p className="description">{data.project.description}</p>

        <input
          type="text"
          placeholder="🔍 Search tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />

        <div className="filters">
          {allCategories.map((category) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              className={`filter-btn ${selectedCategories.includes(category) ? 'active' : ''}`}
            >
              {category}
            </button>
          ))}
          {selectedCategories.length > 0 && (
            <button onClick={() => setSelectedCategories([])} className="filter-btn active">
              Clear
            </button>
          )}
        </div>

        <div className="meta-info">
          <div className="meta-badge">
            <span>Started:</span> <strong>{data.project.startDate}</strong>
          </div>
          <div className="meta-badge">
            <span>Updated:</span> <strong>{data.project.lastUpdated}</strong>
          </div>
          <div className="meta-badge">
            <span>Hours:</span> <strong>{data.stats.hoursInvested}h</strong>
          </div>
          <div className="meta-badge">
            <span>Remaining:</span> <strong>{data.stats.estimatedHoursRemaining}h</strong>
          </div>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card completed">
          <div className="stat-number">{data.stats.tasksCompleted}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card testing">
          <div className="stat-number">{(data as any).stats.tasksTesting || 0}</div>
          <div className="stat-label">Testing</div>
        </div>
        <div className="stat-card progress">
          <div className="stat-number">{data.stats.tasksInProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card todo">
          <div className="stat-number">{data.stats.tasksTodo}</div>
          <div className="stat-label">To Do</div>
        </div>
        <div className="stat-card cost">
          <div className="stat-number">${data.stats.deploymentsCost.commander}</div>
          <div className="stat-label">Commander/mo</div>
        </div>
      </div>

      <div className="mobile-selector">
        <button
          onClick={() => setMobileView('done')}
          className={`mobile-tab done ${mobileView === 'done' ? 'active' : ''}`}
        >
          <div className="tab-icon">✅</div>
          <div className="tab-label">Done</div>
          <div className="tab-count">{filteredDone.length}</div>
        </button>
        <button
          onClick={() => setMobileView('testing')}
          className={`mobile-tab testing ${mobileView === 'testing' ? 'active' : ''}`}
        >
          <div className="tab-icon">🧪</div>
          <div className="tab-label">Testing</div>
          <div className="tab-count">{filteredTesting.length}</div>
        </button>
        <button
          onClick={() => setMobileView('progress')}
          className={`mobile-tab progress ${mobileView === 'progress' ? 'active' : ''}`}
        >
          <div className="tab-icon">🚧</div>
          <div className="tab-label">In Progress</div>
          <div className="tab-count">{filteredInProgress.length}</div>
        </button>
        <button
          onClick={() => setMobileView('todo')}
          className={`mobile-tab todo ${mobileView === 'todo' ? 'active' : ''}`}
        >
          <div className="tab-icon">📋</div>
          <div className="tab-label">To Do</div>
          <div className="tab-count">{filteredTodo.length}</div>
        </button>
      </div>

      <div className="board">
        <Column title="Done" tasks={filteredDone} icon="✅" count={filteredDone.length} type="done" />
        <Column title="Testing" tasks={filteredTesting} icon="🧪" count={filteredTesting.length} type="testing" />
        <Column title="In Progress" tasks={filteredInProgress} icon="🚧" count={filteredInProgress.length} type="progress" />
        <Column title="To Do" tasks={filteredTodo} icon="📋" count={filteredTodo.length} type="todo" />
      </div>

      <div className="mobile-board">
        {mobileView === 'done' && (
          <Column title="Done" tasks={filteredDone} icon="✅" count={filteredDone.length} type="done" />
        )}
        {mobileView === 'testing' && (
          <Column title="Testing" tasks={filteredTesting} icon="🧪" count={filteredTesting.length} type="testing" />
        )}
        {mobileView === 'progress' && (
          <Column title="In Progress" tasks={filteredInProgress} icon="🚧" count={filteredInProgress.length} type="progress" />
        )}
        {mobileView === 'todo' && (
          <Column title="To Do" tasks={filteredTodo} icon="📋" count={filteredTodo.length} type="todo" />
        )}
      </div>

      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-handle"></div>

            <div className="modal-header">
              <div>
                <h2 className="modal-title">{selectedTask.title}</h2>
                <div className="modal-badges">
                  <div className={`category-badge category-${selectedTask.category.replace(/\//g, '\\/')}`}>
                    {selectedTask.category}
                  </div>
                  {selectedTask.priority && (
                    <span className="priority-emoji">{getPriorityEmoji(selectedTask.priority)}</span>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedTask(null)} className="close-btn">×</button>
            </div>

            <p className="modal-description">{selectedTask.description}</p>

            {selectedTask.details && selectedTask.details.length > 0 && (
              <div className="modal-section">
                <h3 className="section-title">Details</h3>
                <ul className="detail-list">
                  {selectedTask.details.map((detail, i) => (
                    <li key={i} className="detail-item">{detail}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedTask.blockers && selectedTask.blockers.length > 0 && (
              <div className="modal-section blockers-section">
                <h3 className="section-title">
                  <span>🚧</span>
                  <span>Blockers</span>
                </h3>
                <ul className="blockers-list">
                  {selectedTask.blockers.map((blocker, i) => (
                    <li key={i} className="blocker-item">{blocker}</li>
                  ))}
                </ul>
              </div>
            )}

            {selectedTask.links && selectedTask.links.length > 0 && (
              <div className="modal-section">
                <h3 className="section-title">Links</h3>
                <div className="links-list">
                  {selectedTask.links.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="link-btn"
                    >
                      {link.label} →
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer">
              {selectedTask.completedDate && (
                <div className="footer-item">
                  <span>✅</span>
                  <span>Completed: {selectedTask.completedDate}</span>
                </div>
              )}
              {selectedTask.estimatedHours !== undefined && (
                <div className="footer-item">
                  <span>⏱️</span>
                  <span>Estimated: {selectedTask.estimatedHours} hours</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

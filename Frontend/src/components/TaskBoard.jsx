import TaskCard from './TaskCard';

function TaskBoard({ tasks }) {
  const todo = tasks.filter((task) => task.status === 'todo');
  const inProgress = tasks.filter((task) => task.status === 'in_progress');
  const review = tasks.filter((task) => task.status === 'review');
  const done = tasks.filter((task) => task.status === 'completed');

  const columns = [
    { title: 'Todo', items: todo },
    { title: 'In Progress', items: inProgress },
    { title: 'Review', items: review },
    { title: 'Completed', items: done },
  ];

  const visibleColumns = columns.filter(
    (column) => column.items.length > 0
  );

  return (
    <div className="taskboard-grid">
      {visibleColumns.map((column) => (
        <div key={column.title} className="taskboard-column workspace-card">
          <div className="workspace-card__header">
            <h3>{column.title}</h3>
          </div>
          <div className="taskboard-column__list">
            {column.items.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TaskBoard;
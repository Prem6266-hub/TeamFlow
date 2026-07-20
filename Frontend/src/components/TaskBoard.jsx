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

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
      {columns.map((column) => (
        <div key={column.title} className="workspace-card">
          <div className="workspace-card__header">
            <h3>{column.title}</h3>
          </div>
          {column.items.length ? column.items.map((task) => <TaskCard key={task._id} task={task} />) : <div className="empty-state">No tasks here yet.</div>}
        </div>
      ))}
    </div>
  );
}

export default TaskBoard;
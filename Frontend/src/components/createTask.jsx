import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addAttachment, createNewTask } from '../features/task/taskSlice';

function CreateTask({ projectId, members = [], onSuccess, canUploadAttachments = false, canManageTasks = true }) {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const fallbackUserId = user?._id || user?.id || '';
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    assignedTo: fallbackUserId,
  });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  useEffect(() => {
    if (fallbackUserId && !formData.assignedTo) {
      setFormData((prev) => ({ ...prev, assignedTo: fallbackUserId }));
    }
  }, [fallbackUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: '',
      assignedTo: fallbackUserId,
    });
    setAttachmentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canManageTasks) {
      setFeedback({ type: 'error', message: 'Only the workspace owner can create tasks.' });
      return;
    }

    if (!formData.title.trim() || !projectId) return;

    if (attachmentFile && !canUploadAttachments) {
      setFeedback({ type: 'error', message: 'Only the workspace owner can upload attachments.' });
      return;
    }

    const taskData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      assignedTo: formData.assignedTo || fallbackUserId,
      priority: formData.priority,
    };

    if (formData.dueDate) {
      taskData.dueDate = formData.dueDate;
    }

    const result = await dispatch(
      createNewTask({
        projectId,
        taskData,
      }),
    );

    if (createNewTask.fulfilled.match(result)) {
      const createdTask = result.payload?.task;

      if (attachmentFile && createdTask?._id && canUploadAttachments) {
        const uploadFormData = new FormData();
        uploadFormData.append('file', attachmentFile);
        const uploadResult = await dispatch(addAttachment({ taskId: createdTask._id, formData: uploadFormData }));
        if (addAttachment.fulfilled.match(uploadResult)) {
          setFeedback({ type: 'success', message: 'Task created and attachment uploaded.' });
        } else {
          setFeedback({ type: 'error', message: uploadResult.payload || 'Task created, but the attachment could not be uploaded.' });
        }
      } else if (!attachmentFile) {
        setFeedback({ type: 'success', message: 'Task created successfully.' });
      }

      resetForm();
      if (onSuccess) {
        onSuccess(createdTask);
      }
    } else {
      setFeedback({ type: 'error', message: result.payload || 'Could not create the task.' });
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label>Task title</label>
        <input className="input" name="title" placeholder="Task title" value={formData.title} onChange={handleChange} />
      </div>

      <div className="input-group">
        <label>Description</label>
        <textarea className="textarea" name="description" placeholder="What needs to be done?" value={formData.description} onChange={handleChange} />
      </div>

      <div className="form-row">
        <div className="input-group" style={{ flex: 1 }}>
          <label>Assign to</label>
          <select className="select" name="assignedTo" onChange={handleChange} value={formData.assignedTo || fallbackUserId}>
            <option value={fallbackUserId}>Me</option>
            {members.map((member) => (
              <option key={member._id} value={member._id}>
                {member.name || member.email || 'Member'}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group" style={{ flex: 1 }}>
          <label>Priority</label>
          <select className="select" name="priority" onChange={handleChange} value={formData.priority}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="input-group">
        <label>Due date</label>
        <input className="input" type="date" name="dueDate" value={formData.dueDate} onChange={handleChange} />
      </div>

      <div className="input-group">
        <label>Attachment</label>
        <input
          ref={fileInputRef}
          className="input"
          type="file"
          onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
        />
        {canUploadAttachments ? (
          <small style={{ color: 'var(--app-muted)' }}>Workspace owners can attach a file.</small>
        ) : (
          <small style={{ color: 'var(--app-muted)' }}>Only the workspace owner can attach files.</small>
        )}
      </div>

      {feedback.message ? (
        <div className={`form-feedback ${feedback.type === 'error' ? 'error' : 'success'}`}>{feedback.message}</div>
      ) : null}

      <button className="btn btn-primary" type="submit" disabled={!projectId || !canManageTasks}>
        {projectId ? 'Create task' : 'Select a project first'}
      </button>

      {!canManageTasks ? (
        <small style={{ color: 'var(--app-muted)', display: 'block', marginTop: '0.65rem' }}>
          Only the workspace owner can create tasks.
        </small>
      ) : null}
    </form>
  );
}

export default CreateTask;
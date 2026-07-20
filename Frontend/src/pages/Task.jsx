// import { useEffect } from "react";
// import { useParams } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";

// import { fetchTask, fetchTasks, fetchAttachments, fetchComments } from "../features/task/taskSlice";

// function Task() {
//   const { taskId } = useParams();

//   const dispatch = useDispatch();

//   const {
//     currentTask,
//     comments,
//     attachments,
//     loading,
//   } = useSelector(
//     (state) => state.task
//   );

//   useEffect(() => {
//     dispatch(fetchTask(taskId));
//     dispatch(fetchComments(taskId));
//     dispatch(fetchAttachments(taskId));
//   }, [taskId]);

//   if (loading) {
//     return <h2>Loading...</h2>;
//   }

//   return (
//     <div>
//       <h1>{currentTask?.title}</h1>

//       <p>
//         {currentTask?.description}
//       </p>

//       <hr />

//       <h3>Status</h3>

//       <p>
//         {currentTask?.status}
//       </p>

//       <h3>Priority</h3>

//       <p>
//         {currentTask?.priority}
//       </p>

//       <h3>Assigned To</h3>

//       <p>
//         {currentTask?.assignedTo?.name}
//       </p>

//       <h3>Created By</h3>

//       <p>
//         {currentTask?.createdBy?.name}
//       </p>

//       <h3>Due Date</h3>

//       <p>
//         {currentTask?.dueDate
//           ? new Date(
//               currentTask.dueDate
//             ).toLocaleDateString()
//           : "No Due Date"}
//       </p>

//       <hr />

//       <h2>Comments</h2>

//       {comments?.map(
//         (comment, index) => (
//           <div key={index}>
//             <strong>
//               {
//                 comment.user
//                   ?.name
//               }
//             </strong>

//             <p>
//               {comment.text}
//             </p>
//           </div>
//         )
//       )}

//       <hr />

//       <h2>Attachments</h2>

//       {attachments?.map(
//         (
//           attachment,
//           index
//         ) => (
//           <div key={index}>
//             <a
//               href={
//                 attachment.fileUrl
//               }
//               target="_blank"
//               rel="noreferrer"
//             >
//               {
//                 attachment.fileName
//               }
//             </a>
//           </div>
//         )
//       )}
//     </div>
//   );
// }

// export default Task;




































import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import "../styles/Task.css";

import {
  fetchTask,
  fetchComments,
  fetchAttachments,
  createComment,
  addAttachment,
  changeTaskStatus,
  editTask,
  removeTask,
  removeAttachment,
  removeComment,
  appendComment,
  setComments,
} from "../features/task/taskSlice";
import { getSocket, joinWorkspaceRoom } from "../socket/socket";

function Task() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentTask,
    comments,
    attachments,
    loading,
  } = useSelector((state) => state.task);
  const { user } = useSelector((state) => state.auth);

  const [comment, setComment] = useState("");

  const [file, setFile] = useState(null);

  const [editMode, setEditMode] =
    useState(false);

  const [editData, setEditData] =
    useState({
      title: "",
      description: "",
      priority: "medium",
      dueDate: "",
    });

  const isPdfAttachment = (fileName = "") =>
    /\.pdf$/i.test(fileName);

  const isTaskCreator = currentTask?.createdBy?._id
    ? currentTask.createdBy._id === user?._id || currentTask.createdBy._id === user?.id
    : currentTask?.createdBy === user?._id || currentTask?.createdBy === user?.id;
  const isWorkspaceOwner = Boolean(
    currentTask?.workspace?.owner &&
      (typeof currentTask.workspace.owner === 'object'
        ? currentTask.workspace.owner._id
        : currentTask.workspace.owner) === (user?._id || user?.id)
  );
  const getIdString = (val) => {
    if (!val && val !== 0) return null;
    if (typeof val === "string") return val;
    if (typeof val === "object") {
      if (val._id) return String(val._id);
      if (val.id) return String(val.id);
    }
    return String(val);
  };

  const assignedId = getIdString(currentTask?.assignedTo);
  const currentUserId = getIdString(user?._id || user?.id || user);

  const isAssignedUser = Boolean(assignedId && currentUserId && assignedId === currentUserId);

  const canManageTasks = isAssignedUser || isWorkspaceOwner;

  const formatDateForInput = (value) => {
    if (!value) return "";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0];
  };

  useEffect(() => {
    dispatch(fetchTask(taskId));
    dispatch(fetchComments(taskId));
    dispatch(fetchAttachments(taskId));
  }, [taskId]);

  useEffect(() => {
    if (currentTask?.workspace?._id || currentTask?.workspace) {
      joinWorkspaceRoom(currentTask.workspace._id || currentTask.workspace);
    }
  }, [currentTask]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !taskId) return;

    const handleCommentAdded = (payload) => {
      if (payload?.taskId?.toString() !== taskId.toString()) return;
      if (payload?.comment) {
        dispatch(appendComment(payload.comment));
      }
    };

    const handleCommentDeleted = (payload) => {
      if (payload?.taskId?.toString() !== taskId.toString()) return;
      const commentId = payload?.commentId;
      if (commentId) {
        dispatch({ type: 'task/removeCommentLocal', payload: commentId });
      }
    };

    socket.on("commentAdded", handleCommentAdded);
    socket.on("commentDeleted", handleCommentDeleted);

    return () => {
      socket.off("commentAdded", handleCommentAdded);
      socket.off("commentDeleted", handleCommentDeleted);
    };
  }, [dispatch, taskId]);

  useEffect(() => {
    const syncTaskData = () => {
      if (taskId) {
        dispatch(fetchTask(taskId));
        dispatch(fetchComments(taskId));
        dispatch(fetchAttachments(taskId));
      }
    };

    window.addEventListener('focus', syncTaskData);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        syncTaskData();
      }
    });

    return () => {
      window.removeEventListener('focus', syncTaskData);
      document.removeEventListener('visibilitychange', syncTaskData);
    };
  }, [dispatch, taskId]);

  useEffect(() => {
    if (currentTask) {
      setEditData({
        title: currentTask.title || "",
        description:
          currentTask.description || "",
        priority:
          currentTask.priority ||
          "medium",
        dueDate: formatDateForInput(currentTask.dueDate),
      });
    }
  }, [currentTask]);

  useEffect(() => {
    if (!currentTask?._id) return;
    dispatch(setComments([]));
  }, [currentTask?._id, dispatch]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    if (!comment.trim()) return;

    dispatch(
      createComment({
        taskId,
        comment,
      })
    );

    setComment("");
  };

  const handleStatusChange = (e) => {
    dispatch(
      changeTaskStatus({
        taskId,
        status: e.target.value,
      })
    );
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();

    const taskPayload = {
      ...editData,
      dueDate: editData.dueDate ? editData.dueDate : undefined,
    };

    dispatch(
      editTask({
        taskId,
        taskData: taskPayload,
      })
    );

    setEditMode(false);
  };

  const handleDelete = async () => {
    const confirmed =
      window.confirm(
        "Delete this task?"
      );

    if (!confirmed) return;

    await dispatch(
      removeTask(taskId)
    );

    navigate(-1);
  };

  const handleRemoveAttachment = async (
    attachmentId
  ) => {
    // const confirmed =
    //   window.confirm(
    //     "Remove this attachment?"
    //   );

    // if (!confirmed) return;

    try {
      const resultAction = await dispatch(
        removeAttachment({
          taskId,
          attachmentId,
        })
      );

      if (removeAttachment.fulfilled.match(resultAction)) {
        await dispatch(fetchAttachments(taskId));
      } else {
        window.alert(
          resultAction.payload ||
            "Failed to remove attachment"
        );
      }
    } catch (error) {
      console.error("Remove attachment failed", error);
      window.alert("Failed to remove attachment");
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const resultAction = await dispatch(
      addAttachment({
        taskId,
        formData,
      })
    );

    if (addAttachment.fulfilled.match(resultAction)) {
      await dispatch(fetchAttachments(taskId));
    }

    e.target.reset();
    setFile(null);
  };

  if (loading && !currentTask) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="task-page"
    >
      <div className="task-topbar">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate(-1)}
        >
          <span aria-hidden="true">←</span>
          Back
        </button>
      </div>

      <div className="task-header">
         <h1 className="task-title">
        {currentTask?.title}
      </h1>

      <p className="task-description">
        {
          currentTask?.description
        }
      </p>

      </div>
     
      <hr />

      <div className="task-meta">

  <div className="meta-card">
    <h4>Status</h4>

    <select
      className="status-select"
      value={currentTask?.status}
      onChange={handleStatusChange}
      disabled={!canManageTasks}
    >
      <option value="todo">Todo</option>
      <option value="in_progress">In Progress</option>
      <option value="review">Review</option>
      <option value="completed">Completed</option>
    </select>
  </div>

  <div className="meta-card">
    <h4>Priority</h4>
    <p>{currentTask?.priority}</p>
  </div>

  <div className="meta-card">
    <h4>Assigned To</h4>
    <p>{currentTask?.assignedTo?.name}</p>
  </div>

  <div className="meta-card">
    <h4>Created By</h4>
    <p>{currentTask?.createdBy?.name}</p>
  </div>

  <div className="meta-card">
    <h4>Due Date</h4>
    <p>
      {currentTask?.dueDate
        ? new Date(
            currentTask.dueDate
          ).toLocaleDateString()
        : "No Due Date"}
    </p>
  </div>

</div>

      {canManageTasks ? (
        <div className="task-actions">
          <button
            className="btn btn-secondary"
            onClick={() => setEditMode(!editMode)}
          >
            {editMode ? "Cancel" : "Edit Task"}
          </button>

          <button
            className="btn btn-danger"
            onClick={handleDelete}
          >
            Delete Task
          </button>
        </div>
      ) : null}

      {!canManageTasks ? (
        <p className="task-description" style={{ marginTop: '0.75rem', color: 'var(--app-muted)' }}>
          Only the assigned user or workspace owner can edit or delete this task.
        </p>
      ) : null}

      {editMode && (
        <form className="edit-form"
          onSubmit={
            handleEditSubmit
          }
        >
          <input
            value={
              editData.title
            }
            onChange={(e) =>
              setEditData({
                ...editData,
                title:
                  e.target
                    .value,
              })
            }
          />

          <textarea
            value={
              editData.description
            }
            onChange={(e) =>
              setEditData({
                ...editData,
                description:
                  e.target
                    .value,
              })
            }
          />

          <select
            value={
              editData.priority
            }
            onChange={(e) =>
              setEditData({
                ...editData,
                priority:
                  e.target
                    .value,
              })
            }
          >
            <option value="low">
              Low
            </option>

            <option value="medium">
              Medium
            </option>

            <option value="high">
              High
            </option>
          </select>

          <input
            type="date"
            value={editData.dueDate}
            onChange={(e) =>
              setEditData({
                ...editData,
                dueDate: e.target.value,
              })
            }
          />

          <button className="btn btn-primary"
            type="submit"
          >
            Save
          </button>
        </form>
      )}

      <hr />


<div className="section">
  <h2>Comments</h2>

      <form className="comment-form"
        onSubmit={
          handleCommentSubmit
        }
      >
        <input
          value={comment}
          placeholder="Add comment..."
          onChange={(e) =>
            setComment(
              e.target.value
            )
          }
        />

        <button className="btn btn-primary"
          type="submit"
        >
          Add
        </button>
      </form>

      {comments?.map(
        (
          comment,
          index
        ) => (
          <div className="comment-card"
            key={index}
          >
            <div className="comment-user">
              <strong>
              {
                comment.user
                  ?.name
              }
            </strong>
            </div>
            
            
            <p>
              {
                comment.text
              }
            </p>

            {(isWorkspaceOwner || (comment.user && (comment.user._id === user?._id || comment.user._id === user?.id) || comment.user === user?._id)) ? (
              <button className="btn btn-danger" onClick={async () => {
                const confirmed = window.confirm('Delete this comment?');
                if (!confirmed) return;
                await dispatch(removeComment({ taskId, commentId: comment._id || comment.id }));
              }}>
                Delete
              </button>
            ) : null}
          </div>
        )
      )}

</div>
      
      <hr />

      <div className="section">
        <h2>Attachments</h2>

      {isWorkspaceOwner ? (
        <form className="attachment-form"
          onSubmit={
            handleFileUpload
          }
        >
          <input
            type="file"
            name="file"
            onChange={(e) =>
              setFile(
                e.target
                  .files[0]
              )
            }
          />

          <button
            className="btn btn-primary"
            type="submit"
          >
            Upload
          </button>
        </form>
      ) : (
        <p className="attachment-note">Only the workspace owner can upload attachments.</p>
      )}

      {/* {attachments?.map(
        (
          attachment,
          index
        ) => (
          <div className="attachment-item"
            key={index}
          >
            <a
              href={
                attachment.fileUrl
              }
              target="_blank"
              rel="noreferrer"
            >
              {
                attachment.fileName
              }
            </a>
          </div>
        )
      )} */}
       
       {attachments?.map((attachment, index) => (
  <div
    className="attachment-item"
    key={index}
  >
    <div>
      <strong>{attachment.fileName}</strong>
    </div>

    <div>
      Uploaded by:
      {" "}
      {attachment.uploadedBy?.name || "Unknown"}
    </div>

    {attachment.fileUrl ? (
      <div className="attachment-actions">
        {isPdfAttachment(attachment.fileName) ? (
          <a
            className="btn btn-secondary btn-link"
            href={attachment.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open PDF
          </a>
        ) : (
          <>
            <a
              className="btn btn-secondary btn-link"
              href={attachment.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open
            </a>

            <a
              className="btn btn-secondary btn-link"
              href={attachment.fileUrl}
              download={attachment.fileName}
            >
              Download
            </a>
          </>
        )}
      </div>
    ) : (
      <span>No file URL available</span>
    )}

    {isPdfAttachment(attachment.fileName) && attachment.fileUrl && (
      <iframe
        src={attachment.fileUrl}
        title={attachment.fileName}
        style={{ width: "100%", height: "500px", marginTop: "8px", border: "1px solid #ddd" }}
      />
    )}

    {isTaskCreator && (
      <button
        className="btn btn-danger"
        type="button"
        onClick={() =>
          handleRemoveAttachment(
            attachment._id
          )
        }
      >
        Remove
      </button>
    )}
  </div>
))}


      </div>

      
    </div>
  );
}

export default Task;